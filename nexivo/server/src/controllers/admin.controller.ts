import type { RequestHandler } from "express";
import type { z } from "zod";
import { prisma } from "../lib/prisma.js";
import * as blogs from "../services/blog.service.js";
import { dashboardStats, badgeCounts } from "../services/dashboard.service.js";
import { getAllSettings, updateSettingsGroup } from "../services/settings.service.js";
import { readResume, removeUpload, saveImage } from "../services/storage.service.js";
import { EDITOR_GROUPS, settingsSchemas, type SettingsGroup } from "../schemas/settings.js";
import type { adminBlogQuery, BlogBody } from "../schemas/blog.js";
import type { applicationStatusBody, readBody } from "../schemas/forms.js";
import { HttpError, badRequest, done, notFound, ok } from "../utils/http.js";

const id = (req: { params: Record<string, unknown> }) => Number(req.params.id);

/* ---------- Blogs ---------- */
export const blogList: RequestHandler = async (req, res) => ok(res, await blogs.listPosts(req.query as unknown as z.infer<typeof adminBlogQuery>, false));
export const blogGet: RequestHandler = async (req, res) => ok(res, await blogs.getAdminPost(id(req)));
export const blogCreate: RequestHandler = async (req, res) => ok(res, await blogs.createPost(req.body as BlogBody, req.user!.id), 201, "Post created");
export const blogUpdate: RequestHandler = async (req, res) => ok(res, await blogs.updatePost(id(req), req.body as BlogBody), 200, "Post saved");
export const blogPublish: RequestHandler = async (req, res) => ok(res, await blogs.setPostStatus(id(req), "PUBLISHED"), 200, "Post published");
export const blogUnpublish: RequestHandler = async (req, res) => ok(res, await blogs.setPostStatus(id(req), "DRAFT"), 200, "Post moved to drafts");
export const blogDelete: RequestHandler = async (req, res) => { await blogs.deletePost(id(req)); done(res, "Post deleted"); };

/* ---------- Dashboard ---------- */
export const stats: RequestHandler = async (_req, res) => ok(res, await dashboardStats());
export const badges: RequestHandler = async (_req, res) => { res.set("Cache-Control", "no-store"); ok(res, await badgeCounts()); };

/* ---------- Settings ---------- */
export const settingsGet: RequestHandler = async (_req, res) => ok(res, await getAllSettings());
export const settingsUpdate: RequestHandler = async (req, res) => {
  const group = req.params.group as SettingsGroup;
  if (!(group in settingsSchemas)) throw notFound("Settings group");
  if (req.user!.role !== "ADMIN" && !EDITOR_GROUPS.includes(group)) throw new HttpError(403, "Only admins can change these settings");
  ok(res, await updateSettingsGroup(group, req.body ?? {}), 200, "Settings saved");
};

/* ---------- Applications ---------- */
export const applicationsList: RequestHandler = async (req, res) => {
  const { status, jobId, q } = req.query as Record<string, string | undefined>;
  const where = {
    ...(status ? { status: status as z.infer<typeof applicationStatusBody>["status"] } : {}),
    ...(jobId ? { jobId: Number(jobId) } : {}),
    ...(q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }] } : {}),
  };
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const [items, total] = await Promise.all([
    prisma.application.findMany({ where, include: { job: { select: { id: true, title: true, slug: true } } }, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
    prisma.application.count({ where }),
  ]);
  ok(res, { items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
};
export const applicationStatus: RequestHandler = async (req, res) => {
  const { status } = req.body as z.infer<typeof applicationStatusBody>;
  ok(res, await prisma.application.update({ where: { id: id(req) }, data: { status } }), 200, `Marked as ${status.toLowerCase()}`);
};
export const applicationResume: RequestHandler = async (req, res) => {
  const app = await prisma.application.findUnique({ where: { id: id(req) }, select: { name: true, resumeUrl: true, resumeData: true } });
  if (!app) throw notFound("Application");
  const buf = await readResume(app.resumeUrl, app.resumeData);
  if (!buf) throw notFound("Resume file");
  const safeName = app.name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "applicant";
  res.set({ "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${safeName}-resume.pdf"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" });
  res.send(buf);
};
export const applicationDelete: RequestHandler = async (req, res) => { await prisma.application.delete({ where: { id: id(req) } }); done(res, "Application deleted"); };

/* ---------- Messages ---------- */
export const messagesList: RequestHandler = async (req, res) => {
  const { filter, q } = req.query as Record<string, string | undefined>;
  const where = {
    ...(filter === "unread" ? { isRead: false } : filter === "read" ? { isRead: true } : {}),
    ...(q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }, { subject: { contains: q } }] } : {}),
  };
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const [items, total] = await Promise.all([
    prisma.contactMessage.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
    prisma.contactMessage.count({ where }),
  ]);
  ok(res, { items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
};
export const messageRead: RequestHandler = async (req, res) => {
  const { isRead } = req.body as z.infer<typeof readBody>;
  ok(res, await prisma.contactMessage.update({ where: { id: id(req) }, data: { isRead } }), 200, isRead ? "Marked as read" : "Marked as unread");
};
export const messageDelete: RequestHandler = async (req, res) => { await prisma.contactMessage.delete({ where: { id: id(req) } }); done(res, "Message deleted"); };

/* ---------- Media ---------- */
export const mediaList: RequestHandler = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 40));
  const q = typeof req.query.q === "string" ? req.query.q.slice(0, 100) : "";
  const where = q ? { OR: [{ filename: { contains: q } }, { alt: { contains: q } }] } : {};
  const [items, total] = await Promise.all([
    prisma.media.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
    prisma.media.count({ where }),
  ]);
  ok(res, { items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
};
export const mediaUpload: RequestHandler = async (req, res) => {
  if (!req.file) throw badRequest("Choose an image to upload");
  const alt = typeof req.body?.alt === "string" ? req.body.alt : undefined;
  ok(res, await saveImage(req.file, alt), 201, "Image uploaded");
};
export const mediaDelete: RequestHandler = async (req, res) => {
  const media = await prisma.media.delete({ where: { id: id(req) } });
  await removeUpload(media.filename);
  done(res, "Image deleted");
};
