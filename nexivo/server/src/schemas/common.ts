import { z } from "zod";
import { PAGES } from "./sections.js";

export const idParam = z.object({ id: z.coerce.number().int().positive() });
export const slugParam = z.object({ slug: z.string().trim().min(1).max(191).regex(/^[a-z0-9-]+$/, "Invalid slug") });
export const pageParam = z.object({ page: z.string().transform((s) => s.toUpperCase()).pipe(z.enum(PAGES)) });

export const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(100).optional(),
  sort: z.string().trim().max(40).regex(/^-?[a-zA-Z]+$/).optional(),
}).catchall(z.string().max(100));
export type ListQuery = z.infer<typeof listQuery>;

export const reorderBody = z.object({ ids: z.array(z.number().int().positive()).min(1).max(500) });

export const str = (max: number) => z.string().trim().max(max);
export const reqStr = (max: number) => z.string().trim().min(1, "Required").max(max);
export const optStr = (max: number) => z.string().trim().max(max).optional().nullable().transform((v) => (v ? v : null));
export const urlOrPath = z.string().trim().max(500).refine((v) => v === "" || /^(\/|https?:\/\/)/.test(v), "Use /uploads/... or a full https:// URL");
export const optImage = urlOrPath.optional().nullable().transform((v) => (v ? v : null));
export const optUrl = z.string().trim().max(300).optional().nullable()
  .refine((v) => !v || /^https?:\/\//.test(v), "Must start with https://").transform((v) => (v ? v : null));
