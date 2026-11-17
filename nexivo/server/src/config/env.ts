import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CLIENT_URL: z.string().default("http://localhost:5173"),
  SITE_URL: z.string().default("http://localhost:5173"),
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  SERVE_CLIENT: z.enum(["true", "false"]).optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration:");
  for (const issue of parsed.error.issues) console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  process.exit(1);
}

export const env = parsed.data;
if (env.NODE_ENV === "production" && /change-me/i.test(env.JWT_SECRET)) {
  console.error("JWT_SECRET is still the example placeholder. Set a long random secret before running in production.");
  process.exit(1);
}
export const isProd = env.NODE_ENV === "production";
/** CLIENT_URL may hold a comma separated list (e.g. Vercel preview + production). */
export const clientOrigins = env.CLIENT_URL.split(",").map((s) => s.trim().replace(/\/$/, "")).filter(Boolean);
export const siteUrl = env.SITE_URL.replace(/\/$/, "");
