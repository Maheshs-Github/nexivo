import { z } from "zod";
import { optImage, optStr, optUrl, reqStr, str } from "./common.js";
import { sectionSchemas, SECTION_TYPES, PAGES } from "./sections.js";

const order = z.coerce.number().int().min(0).max(10000).optional();
const visible = z.boolean().optional();
const slug = z.string().trim().max(191).regex(/^[a-z0-9-]*$/, "Lowercase letters, numbers and dashes only").optional();
const stringList = (max: number, each = 120) => z.array(str(each).min(1)).max(max);

export const serviceSchema = z.object({
  title: reqStr(150), slug, shortDesc: reqStr(400), description: reqStr(20000),
  features: stringList(12).optional().nullable(), icon: str(60).default("code"), image: optImage, order, isVisible: visible,
});

export const testimonialSchema = z.object({
  name: reqStr(120), role: reqStr(120), company: reqStr(120), avatar: optImage, quote: reqStr(1200),
  rating: z.coerce.number().int().min(1).max(5).default(5), order, isVisible: visible,
});

export const teamSchema = z.object({
  name: reqStr(120), role: reqStr(120), bio: optStr(1200), photo: optImage, linkedin: optUrl, order, isVisible: visible,
});

export const clientSchema = z.object({ name: reqStr(120), logo: reqStr(500), url: optUrl, order, isVisible: visible });

export const projectSchema = z.object({
  title: reqStr(150), slug, client: optStr(120), industry: optStr(120), summary: reqStr(500), content: reqStr(50000),
  cover: optImage, techStack: stringList(20, 40).optional().nullable(),
  metrics: z.array(z.object({ value: reqStr(20), label: reqStr(60) })).max(4).optional().nullable(),
  liveUrl: optUrl, order, isVisible: visible,
});

export const categorySchema = z.object({ name: reqStr(80), slug });
export const tagSchema = z.object({ name: reqStr(80), slug });

export const jobSchema = z.object({
  title: reqStr(150), slug, department: reqStr(80), location: reqStr(120),
  type: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"]).default("FULL_TIME"),
  experience: reqStr(80), salary: optStr(80), summary: reqStr(400), description: reqStr(20000), requirements: reqStr(20000),
  status: z.enum(["OPEN", "CLOSED"]).default("OPEN"),
});

export const navSchema = z.object({
  label: reqStr(80),
  url: z.string().trim().min(1).max(300).regex(/^(\/|https?:\/\/|mailto:|tel:|#)/, "Use /path or a full URL"),
  location: z.enum(["HEADER", "FOOTER"]).default("HEADER"), group: optStr(80), order, isVisible: visible,
});

export const seoSchema = z.object({ page: z.enum(PAGES), title: reqStr(200), description: reqStr(300), ogImage: optImage });

/** Sections: the content JSON is validated against the schema of the section's type. */
export const sectionSchema = z.object({
  page: z.enum(PAGES), type: z.enum(SECTION_TYPES as [string, ...string[]]),
  label: optStr(120), order, isVisible: visible, content: z.record(z.string(), z.unknown()),
}).superRefine((val, ctx) => {
  const result = sectionSchemas[val.type as keyof typeof sectionSchemas].safeParse(val.content);
  if (!result.success) {
    for (const issue of result.error.issues) ctx.addIssue({ code: "custom", path: ["content", ...issue.path.map(String)], message: issue.message });
  } else {
    val.content = result.data as Record<string, unknown>;
  }
});
