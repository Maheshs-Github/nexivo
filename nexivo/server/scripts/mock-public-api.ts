/**
 * DEV-ONLY: read-only mock of the public API built from the seed content, for UI checks and Lighthouse
 * on machines without a database. Same response shapes as the real API. Never used in production.
 *   npx tsx scripts/mock-public-api.ts   (listens on :4000)
 */
import express from "express";
import compression from "compression";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { nav, pageSeo, sections, settings } from "../prisma/seed/site.js";
import * as catalog from "../prisma/seed/catalog.js";
import { postsA } from "../prisma/seed/posts-a.js";
import { postsB } from "../prisma/seed/posts-b.js";
import { jobs } from "../prisma/seed/careers.js";
import { cover } from "../prisma/seed/assets.js";
import { settingsSchemas } from "../src/schemas/settings.js";
import { readTimeOf } from "../src/utils/sanitize.js";
import { toSlug } from "../src/utils/slug.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const now = Date.now();
const iso = (daysAgo: number) => new Date(now - daysAgo * 86_400_000).toISOString();
const withIds = <T extends object>(rows: T[]) => rows.map((r, i) => ({ id: i + 1, order: i, isVisible: true, updatedAt: iso(1), ...r }));

const S = Object.fromEntries(Object.entries(settings()).map(([k, v]) => [k, settingsSchemas[k as keyof typeof settingsSchemas].parse(v)]));
const services = withIds(catalog.services());
const projects = withIds(catalog.projects());
const testimonials = withIds(catalog.testimonials());
const team = withIds(catalog.team());
const clients = withIds(catalog.clients());
const authors = { admin: { id: 1, name: "Aarav Mehta", title: "Co-founder & CEO", bio: "Writes about engineering leadership and AI.", avatar: null }, editor: { id: 2, name: "Sara Kapoor", title: "Head of Design", bio: "Writes about design systems and UX.", avatar: null } };
const cats = new Map<string, { id: number; name: string; slug: string }>();
const posts = [...postsA, ...postsB].map((p, i) => {
  const slug = toSlug(p.category);
  if (!cats.has(slug)) cats.set(slug, { id: cats.size + 1, name: p.category, slug });
  return {
    id: i + 1, title: p.title, slug: p.slug, excerpt: p.excerpt, content: p.content.trim(), status: "PUBLISHED", publishedAt: iso(p.daysAgo), createdAt: iso(p.daysAgo), updatedAt: iso(p.daysAgo),
    coverImage: cover(`blog-${p.slug}.svg`, i, (["orbits", "bars", "nodes"] as const)[i % 3]), readTime: readTimeOf(p.content), views: 200 + i * 37, featured: !!p.featured,
    seoTitle: null, seoDescription: null, categoryId: cats.get(slug)!.id, category: cats.get(slug)!, author: authors[p.author], tags: p.tags.map((t, j) => ({ id: i * 10 + j, name: t, slug: toSlug(t) })),
  };
}).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
const jobRows = jobs().map(({ daysAgo, ...j }, i) => ({ id: i + 1, ...j, createdAt: iso(daysAgo), updatedAt: iso(daysAgo) }));
const strip = <T extends { content?: string }>(p: T) => { const { content: _c, ...rest } = p; return rest; };

const app = express();
app.use(compression());
const ok = (res: express.Response, data: unknown) => res.json({ success: true, data });
const nf = (res: express.Response) => res.status(404).json({ success: false, message: "Not found" });

app.use("/uploads", express.static(path.resolve(here, "../uploads")));
app.get("/robots.txt", (_q, r) => r.type("text/plain").send(["User-agent: *", "Allow: /", "Disallow: /admin", "", "Sitemap: http://localhost:4173/sitemap.xml", ""].join(String.fromCharCode(10))));
app.get("/api/health", (_q, r) => ok(r, { status: "ok", database: "mock" }));
app.get("/api/settings", (_q, r) => ok(r, S));
app.get("/api/nav", (_q, r) => { const n = nav.map((x, i) => ({ id: i + 1, group: null, ...x })); ok(r, { header: n.filter((x) => x.location === "HEADER"), footer: n.filter((x) => x.location === "FOOTER") }); });
app.get("/api/seo/:page", (q, r) => ok(r, pageSeo().map((s, i) => ({ id: i + 1, ogImage: null, ...s })).find((s) => s.page === q.params.page.toUpperCase()) ?? null));
app.get("/api/pages/:page/sections", (q, r) => {
  const list = sections[q.params.page.toUpperCase() as keyof typeof sections];
  if (!list) return r.status(400).json({ success: false, message: "Bad page" });
  const data: Record<string, unknown> = { CLIENTS: clients, SERVICES: services, CASE_STUDIES: projects.map(strip), TESTIMONIALS: testimonials, TEAM: team, BLOGS: posts.slice(0, 3).map(strip) };
  ok(r, list.map((s, i) => ({ id: i + 1, type: s.type, label: null, content: s.content, ...(data[s.type] ? { data: data[s.type] } : {}) })));
});
app.get("/api/services", (_q, r) => ok(r, services));
app.get("/api/services/:slug", (q, r) => { const s = services.find((x) => x.slug === q.params.slug); return s ? ok(r, { ...s, others: services.filter((x) => x !== s) }) : nf(r); });
app.get("/api/projects", (_q, r) => ok(r, projects.map(strip)));
app.get("/api/projects/:slug", (q, r) => { const p = projects.find((x) => x.slug === q.params.slug); return p ? ok(r, p) : nf(r); });
app.get("/api/testimonials", (_q, r) => ok(r, testimonials));
app.get("/api/team", (_q, r) => ok(r, team));
app.get("/api/clients", (_q, r) => ok(r, clients));
app.get("/api/categories", (_q, r) => ok(r, [...cats.values()].map((c) => ({ ...c, _count: { posts: posts.filter((p) => p.categoryId === c.id).length } }))));
app.get("/api/blogs", (q, r) => {
  const page = Number(q.query.page) || 1, limit = Math.min(50, Number(q.query.limit) || 9);
  const term = String(q.query.q ?? "").toLowerCase(), cat = String(q.query.category ?? ""), tag = String(q.query.tag ?? "");
  const all = posts.filter((p) => (!term || p.title.toLowerCase().includes(term) || p.excerpt.toLowerCase().includes(term)) && (!cat || p.category.slug === cat) && (!tag || p.tags.some((t) => t.slug === tag)));
  ok(r, { items: all.slice((page - 1) * limit, page * limit).map(strip), total: all.length, page, pages: Math.max(1, Math.ceil(all.length / limit)) });
});
app.get("/api/blogs/:slug", (q, r) => { const p = posts.find((x) => x.slug === q.params.slug); return p ? ok(r, { post: p, related: posts.filter((x) => x !== p).slice(0, 3).map(strip) }) : nf(r); });
app.get("/api/jobs", (_q, r) => ok(r, jobRows.filter((j) => j.status === "OPEN").map(({ description: _d, requirements: _r, ...j }) => j)));
app.get("/api/jobs/:slug", (q, r) => { const j = jobRows.find((x) => x.slug === q.params.slug); return j ? ok(r, j) : nf(r); });
app.get("/api/auth/me", (_q, r) => r.status(401).json({ success: false, message: "Please sign in to continue" }));
app.use("/api", (_q, r) => r.status(404).json({ success: false, message: "Mock: route not available" }));
// Optional: serve the built client (compressed, like Vercel) so Lighthouse sees real transfer sizes.
const dist = path.resolve(here, "../../client/dist");
app.use(express.static(dist, { index: false, maxAge: "1y" }));
app.get(/^\/(?!api\/|uploads\/).*/, (_q, r) => r.sendFile(path.join(dist, "index.html")));

app.listen(4000, () => console.log("[mock] public API on http://localhost:4000 (seed data, read-only)"));
