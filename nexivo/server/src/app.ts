import fs from "node:fs";
import path from "node:path";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import morgan from "morgan";
import { clientOrigins, env, isProd, siteUrl } from "./config/env.js";
import { CLIENT_DIST, UPLOADS_DIR } from "./lib/paths.js";
import { globalLimiter } from "./middleware/rateLimits.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { restoreUpload } from "./services/storage.service.js";
import publicRoutes from "./routes/public.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin/index.js";
import { sitemap } from "./controllers/public.controller.js";

export function createApp() {
  const app = express();

  // Behind Render (and Vercel's rewrite) the client IP sits in X-Forwarded-For; trust exactly that many hops.
  app.set("trust proxy", env.TRUST_PROXY);
  app.disable("x-powered-by");

  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: isProd ? {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        frameSrc: ["https://www.google.com", "https://maps.google.com", "https://www.openstreetmap.org"],
        connectSrc: ["'self'"],
        scriptSrc: ["'self'"],
        // HTTPS is enforced by the host (Render/Vercel); upgrading would break the local http production test.
        upgradeInsecureRequests: null,
      },
    } : false,
  }));
  app.use(compression());
  app.use(cors({ origin: clientOrigins, credentials: true }));
  app.use(cookieParser());
  // Morgan's default formats never include cookies or bodies, so no secrets reach the logs.
  app.use(morgan(isProd ? "combined" : "dev", { skip: (req) => req.path === "/api/health" }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false, limit: "100kb" }));

  // Public uploads: disk first, then restore from the DB (free hosts wipe the disk on redeploy).
  const uploadHeaders = (res: express.Response) => {
    res.set("Cache-Control", "public, max-age=31536000, immutable");
    res.set("X-Content-Type-Options", "nosniff");
  };
  app.use("/uploads", express.static(UPLOADS_DIR, { index: false, dotfiles: "deny", setHeaders: uploadHeaders }));
  app.get("/uploads/:file", async (req, res, next) => {
    const restored = await restoreUpload(req.params.file).catch(() => null);
    if (!restored) return next();
    uploadHeaders(res);
    res.type(restored.mimeType).send(restored.buf);
  });

  app.use("/api", globalLimiter);
  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api", publicRoutes);
  app.get(["/sitemap.xml", "/api/sitemap.xml"], sitemap);
  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain").set("Cache-Control", "public, max-age=3600")
      .send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin

Sitemap: ${siteUrl}/sitemap.xml
`);
  });

  // Optional: serve the built React app (local production test / single-host deploys).
  const serveClient = env.SERVE_CLIENT ? env.SERVE_CLIENT === "true" : isProd && fs.existsSync(path.join(CLIENT_DIST, "index.html"));
  if (serveClient) {
    app.use(express.static(CLIENT_DIST, { index: false, maxAge: "1y", immutable: true }));
    app.get(/^\/(?!api\/|uploads\/).*/, (_req, res) => {
      res.set("Cache-Control", "no-cache");
      res.sendFile(path.join(CLIENT_DIST, "index.html"));
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
