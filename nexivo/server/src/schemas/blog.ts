import { z } from "zod";
import { optImage, optStr, reqStr } from "./common.js";

export const blogBody = z.object({
  title: reqStr(200),
  slug: z.string().trim().max(191).regex(/^[a-z0-9-]*$/, "Lowercase letters, numbers and dashes only").optional(),
  excerpt: reqStr(500),
  content: reqStr(500_000),
  coverImage: optImage,
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  categoryId: z.coerce.number().int().positive().optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(80)).max(12).default([]),
  seoTitle: optStr(200),
  seoDescription: optStr(300),
  featured: z.boolean().optional(),
});
export type BlogBody = z.infer<typeof blogBody>;

const slugish = z.string().trim().max(120).regex(/^[a-z0-9-]*$/).optional();

export const publicBlogQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(9),
  q: z.string().trim().max(100).optional(),
  category: slugish,
  tag: slugish,
});

export const adminBlogQuery = publicBlogQuery.extend({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  sort: z.enum(["updatedAt", "-updatedAt", "publishedAt", "-publishedAt", "title", "-title", "views", "-views"]).default("-updatedAt"),
});
