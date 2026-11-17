import type { RequestHandler } from "express";
import { prisma } from "../lib/prisma.js";
import { siteUrl } from "../config/env.js";
import type { Page } from "../generated/prisma/enums.js";
import * as content from "../services/public.service.js";
import * as blogs from "../services/blog.service.js";
import { getAllSettings } from "../services/settings.service.js";
import { notFound, ok } from "../utils/http.js";
import type { z } from "zod";
import type { publicBlogQuery } from "../schemas/blog.js";

/** Short public caching keeps the site fast while admin edits still show up within seconds. */
const cache = (seconds: number): RequestHandler => (_req, res, next) => {
  res.set("Cache-Control", `public, max-age=${seconds}, stale-while-revalidate=60`);
  next();
};
export const shortCache = cache(15);

export const settings: RequestHandler = async (_req, res) => {
  const all = await getAllSettings();
  // "pages" copy is public; everything else in settings is already public-facing content.
  ok(res, all);
};

export const nav: RequestHandler = async (_req, res) => {
  const items = await content.publicNav();
  ok(res, { header: items.filter((i) => i.location === "HEADER"), footer: items.filter((i) => i.location === "FOOTER") });
};

export const sections: RequestHandler = async (req, res) => ok(res, await content.pageSections(req.params.page as Page));
export const seo: RequestHandler = async (req, res) => ok(res, await content.pageSeo(req.params.page as Page));

export const services: RequestHandler = async (_req, res) => ok(res, await content.publicServices());
export const service: RequestHandler = async (req, res) => {
  const item = await prisma.service.findFirst({ where: { slug: String(req.params.slug), isVisible: true } });
  if (!item) throw notFound("Service");
  const others = await prisma.service.findMany({ where: { isVisible: true, NOT: { id: item.id } }, orderBy: { order: "asc" }, select: { id: true, title: true, slug: true, shortDesc: true, icon: true } });
  ok(res, { ...item, others });
};

export const testimonials: RequestHandler = async (_req, res) => ok(res, await content.publicTestimonials());
export const team: RequestHandler = async (_req, res) => ok(res, await content.publicTeam());
export const clients: RequestHandler = async (_req, res) => ok(res, await content.publicClients());
export const projects: RequestHandler = async (_req, res) => ok(res, await content.publicProjects());
export const project: RequestHandler = async (req, res) => {
  const item = await prisma.project.findFirst({ where: { slug: String(req.params.slug), isVisible: true } });
  if (!item) throw notFound("Project");
  ok(res, item);
};

export const blogList: RequestHandler = async (req, res) =>
  ok(res, await blogs.listPosts(req.query as unknown as z.infer<typeof publicBlogQuery>, true));
export const blogDetail: RequestHandler = async (req, res) => {
  res.set("Cache-Control", "no-store");
  ok(res, await blogs.getPublicPost(String(req.params.slug)));
};
export const categories: RequestHandler = async (_req, res) => ok(res, await blogs.publicCategories());

export const jobs: RequestHandler = async (_req, res) => ok(res, await content.openJobs());
/** Closed jobs are still returned (status CLOSED) so the site can show a friendly "position closed" page. */
export const job: RequestHandler = async (req, res) => {
  const item = await prisma.job.findUnique({ where: { slug: String(req.params.slug) } });
  if (!item) throw notFound("Job");
  ok(res, item);
};

export const health: RequestHandler = async (_req, res) => {
  const started = Date.now();
  res.set("Cache-Control", "no-store");
  const base = { uptime: Math.round(process.uptime()), time: new Date().toISOString() };
  try {
    await prisma.$queryRaw`SELECT 1`;
    ok(res, { status: "ok", database: "up", latencyMs: Date.now() - started, ...base });
  } catch {
    res.status(503).json({ success: false, message: "Database is not reachable", data: { status: "degraded", database: "down", ...base } });
  }
};

const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);

export const sitemap: RequestHandler = async (_req, res) => {
  const [posts, svc, jobList] = await Promise.all([
    prisma.blogPost.findMany({ where: { status: "PUBLISHED", publishedAt: { lte: new Date() } }, select: { slug: true, updatedAt: true } }),
    prisma.service.findMany({ where: { isVisible: true }, select: { slug: true, updatedAt: true } }),
    prisma.job.findMany({ where: { status: "OPEN" }, select: { slug: true, updatedAt: true } }),
  ]);
  const now = new Date().toISOString();
  const urls = [
    ...["", "/about", "/services", "/blog", "/careers", "/contact"].map((p) => ({ loc: p, lastmod: now, priority: p ? "0.8" : "1.0" })),
    ...svc.map((s) => ({ loc: `/services/${s.slug}`, lastmod: s.updatedAt.toISOString(), priority: "0.7" })),
    ...posts.map((p) => ({ loc: `/blog/${p.slug}`, lastmod: p.updatedAt.toISOString(), priority: "0.6" })),
    ...jobList.map((j) => ({ loc: `/careers/${j.slug}`, lastmod: j.updatedAt.toISOString(), priority: "0.5" })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${esc(siteUrl + u.loc)}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.priority}</priority></url>`).join("\n")}\n</urlset>\n`;
  res.type("application/xml").set("Cache-Control", "public, max-age=3600").send(xml);
};

export type { Page };
