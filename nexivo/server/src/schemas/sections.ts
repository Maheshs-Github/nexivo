/**
 * Section content contracts. Shared by the API (validation), the admin (forms) and the public site (rendering).
 * Only depends on zod so the client can import it through the "@shared" alias.
 */
import { z } from "zod";

const text = (max = 300) => z.string().trim().max(max);
const req = (max = 300) => z.string().trim().min(1, "Required").max(max);
const href = z.string().trim().max(300).regex(/^(\/|https?:\/\/|mailto:|tel:|#)/, "Use a path like /contact or a full URL");
const cta = z.object({ label: req(40), href });
const optCta = z.object({ label: text(40), href: z.union([href, z.literal("")]) }).partial();
const image = z.string().trim().max(500);

const intro = { eyebrow: text(60).optional(), heading: req(160), subheading: text(400).optional() };

export const sectionSchemas = {
  HERO: z.object({
    eyebrow: text(80).optional(),
    headline: req(160),
    highlight: text(60).optional(),
    subheadline: req(400),
    primaryCta: cta,
    secondaryCta: optCta.optional(),
    trustNote: text(140).optional(),
    badges: z.array(text(40)).max(6).optional(),
  }),
  CLIENTS: z.object({ heading: req(160) }),
  STATS: z.object({
    ...intro, heading: text(160).optional(),
    items: z.array(z.object({ value: z.coerce.number().min(0).max(1e9), prefix: text(4).optional(), suffix: text(6).optional(), label: req(60) })).min(1).max(6),
  }),
  SERVICES: z.object({ ...intro, cta: optCta.optional() }),
  PROCESS: z.object({ ...intro, steps: z.array(z.object({ title: req(80), description: req(300), duration: text(40).optional() })).min(1).max(8) }),
  CASE_STUDIES: z.object({ ...intro, cta: optCta.optional() }),
  TESTIMONIALS: z.object({ ...intro }),
  BLOGS: z.object({ ...intro, cta: optCta.optional() }),
  CTA: z.object({ eyebrow: text(60).optional(), heading: req(160), subheading: text(400).optional(), primaryCta: cta, secondaryCta: optCta.optional() }),
  FAQ: z.object({ ...intro, items: z.array(z.object({ question: req(200), answer: req(1200) })).min(1).max(20) }),
  RICHTEXT: z.object({ eyebrow: text(60).optional(), heading: text(160).optional(), html: req(20000) }),
  STORY: z.object({
    ...intro, image: image.optional(), imageAlt: text(200).optional(),
    paragraphs: z.array(req(1200)).min(1).max(6),
    highlights: z.array(z.object({ value: req(20), label: req(60) })).max(4).optional(),
  }),
  MISSION_VISION: z.object({ ...intro, mission: req(600), vision: req(600) }),
  VALUES: z.object({ ...intro, items: z.array(z.object({ icon: text(40).optional(), title: req(80), description: req(300) })).min(1).max(8) }),
  TIMELINE: z.object({ ...intro, items: z.array(z.object({ year: req(12), title: req(100), description: req(300) })).min(1).max(12) }),
  TEAM: z.object({ ...intro }),
  TECH_STACK: z.object({ ...intro, groups: z.array(z.object({ name: req(60), items: z.array(req(40)).min(1).max(16) })).min(1).max(8) }),
  PAGE_HEADER: z.object({ ...intro }),
} as const;

export type SectionType = keyof typeof sectionSchemas;
export type SectionContent<T extends SectionType> = z.infer<(typeof sectionSchemas)[T]>;
export const SECTION_TYPES = Object.keys(sectionSchemas) as SectionType[];
export const PAGES = ["HOME", "ABOUT", "SERVICES", "BLOG", "CAREERS", "CONTACT"] as const;
export type PageKey = (typeof PAGES)[number];

/* ---------- Form description used by the admin to render one editor per type ---------- */

export type FieldSpec =
  | { name: string; label: string; kind: "text" | "textarea" | "image" | "icon" | "richtext" | "number" | "href"; hint?: string }
  | { name: string; label: string; kind: "cta"; hint?: string }
  | { name: string; label: string; kind: "strings"; itemLabel: string; hint?: string }
  | { name: string; label: string; kind: "list"; itemLabel: string; fields: FieldSpec[]; hint?: string };

const introFields: FieldSpec[] = [
  { name: "eyebrow", label: "Eyebrow", kind: "text", hint: "Small label above the heading" },
  { name: "heading", label: "Heading", kind: "text" },
  { name: "subheading", label: "Subheading", kind: "textarea" },
];

export const sectionMeta: Record<SectionType, { label: string; description: string; pages: PageKey[]; fields: FieldSpec[] }> = {
  HERO: { label: "Hero", description: "The first screen: headline, intro and two calls to action.", pages: ["HOME"], fields: [
    { name: "eyebrow", label: "Eyebrow", kind: "text" },
    { name: "headline", label: "Headline", kind: "text" },
    { name: "highlight", label: "Highlighted words", kind: "text", hint: "Words from the headline to render with the gradient" },
    { name: "subheadline", label: "Subheadline", kind: "textarea" },
    { name: "primaryCta", label: "Primary button", kind: "cta" },
    { name: "secondaryCta", label: "Secondary button", kind: "cta" },
    { name: "trustNote", label: "Trust note", kind: "text" },
    { name: "badges", label: "Capability badges", kind: "strings", itemLabel: "Badge" },
  ] },
  CLIENTS: { label: "Client logos", description: "Marquee of client logos (managed under Clients).", pages: ["HOME", "ABOUT"], fields: [{ name: "heading", label: "Heading", kind: "text" }] },
  STATS: { label: "Stats", description: "Animated counters.", pages: ["HOME", "ABOUT"], fields: [...introFields, { name: "items", label: "Stats", kind: "list", itemLabel: "Stat", fields: [
    { name: "value", label: "Value", kind: "number" }, { name: "prefix", label: "Prefix", kind: "text" },
    { name: "suffix", label: "Suffix", kind: "text", hint: "e.g. + or %" }, { name: "label", label: "Label", kind: "text" },
  ] }] },
  SERVICES: { label: "Services", description: "Bento grid of services (managed under Services).", pages: ["HOME", "SERVICES"], fields: [...introFields, { name: "cta", label: "Link", kind: "cta" }] },
  PROCESS: { label: "Process", description: "How we work, step by step.", pages: ["HOME", "SERVICES", "ABOUT"], fields: [...introFields, { name: "steps", label: "Steps", kind: "list", itemLabel: "Step", fields: [
    { name: "title", label: "Title", kind: "text" }, { name: "description", label: "Description", kind: "textarea" }, { name: "duration", label: "Duration", kind: "text" },
  ] }] },
  CASE_STUDIES: { label: "Case studies", description: "Featured projects (managed under Projects).", pages: ["HOME", "SERVICES"], fields: [...introFields, { name: "cta", label: "Link", kind: "cta" }] },
  TESTIMONIALS: { label: "Testimonials", description: "Carousel of client quotes.", pages: ["HOME", "ABOUT", "SERVICES"], fields: introFields },
  BLOGS: { label: "Latest posts", description: "The three most recent blog posts.", pages: ["HOME"], fields: [...introFields, { name: "cta", label: "Link", kind: "cta" }] },
  CTA: { label: "Call to action", description: "Large closing banner.", pages: ["HOME", "ABOUT", "SERVICES", "CAREERS"], fields: [
    { name: "eyebrow", label: "Eyebrow", kind: "text" }, { name: "heading", label: "Heading", kind: "text" }, { name: "subheading", label: "Subheading", kind: "textarea" },
    { name: "primaryCta", label: "Primary button", kind: "cta" }, { name: "secondaryCta", label: "Secondary button", kind: "cta" },
  ] },
  FAQ: { label: "FAQ", description: "Questions and answers (accordion).", pages: ["HOME", "SERVICES", "CAREERS", "CONTACT"], fields: [...introFields, { name: "items", label: "Questions", kind: "list", itemLabel: "Question", fields: [
    { name: "question", label: "Question", kind: "text" }, { name: "answer", label: "Answer", kind: "textarea" },
  ] }] },
  RICHTEXT: { label: "Rich text", description: "Free-form formatted content.", pages: ["HOME", "ABOUT", "SERVICES", "CAREERS", "CONTACT"], fields: [
    { name: "eyebrow", label: "Eyebrow", kind: "text" }, { name: "heading", label: "Heading", kind: "text" }, { name: "html", label: "Content", kind: "richtext" },
  ] },
  STORY: { label: "Our story", description: "Company story with an image and highlights.", pages: ["ABOUT"], fields: [...introFields,
    { name: "image", label: "Image", kind: "image" }, { name: "imageAlt", label: "Image alt text", kind: "text" },
    { name: "paragraphs", label: "Paragraphs", kind: "strings", itemLabel: "Paragraph" },
    { name: "highlights", label: "Highlights", kind: "list", itemLabel: "Highlight", fields: [{ name: "value", label: "Value", kind: "text" }, { name: "label", label: "Label", kind: "text" }] },
  ] },
  MISSION_VISION: { label: "Mission & vision", description: "Two statements side by side.", pages: ["ABOUT"], fields: [...introFields,
    { name: "mission", label: "Mission", kind: "textarea" }, { name: "vision", label: "Vision", kind: "textarea" }] },
  VALUES: { label: "Values", description: "What the team believes in.", pages: ["ABOUT", "CAREERS"], fields: [...introFields, { name: "items", label: "Values", kind: "list", itemLabel: "Value", fields: [
    { name: "icon", label: "Icon", kind: "icon" }, { name: "title", label: "Title", kind: "text" }, { name: "description", label: "Description", kind: "textarea" },
  ] }] },
  TIMELINE: { label: "Timeline", description: "Milestones by year.", pages: ["ABOUT"], fields: [...introFields, { name: "items", label: "Milestones", kind: "list", itemLabel: "Milestone", fields: [
    { name: "year", label: "Year", kind: "text" }, { name: "title", label: "Title", kind: "text" }, { name: "description", label: "Description", kind: "textarea" },
  ] }] },
  TEAM: { label: "Team", description: "Team grid (managed under Team).", pages: ["ABOUT", "CAREERS"], fields: introFields },
  TECH_STACK: { label: "Tech stack", description: "Technologies grouped by area.", pages: ["ABOUT", "SERVICES"], fields: [...introFields, { name: "groups", label: "Groups", kind: "list", itemLabel: "Group", fields: [
    { name: "name", label: "Group name", kind: "text" }, { name: "items", label: "Technologies", kind: "strings", itemLabel: "Technology" },
  ] }] },
  PAGE_HEADER: { label: "Page header", description: "Title block at the top of an inner page.", pages: ["SERVICES", "BLOG", "CAREERS", "CONTACT", "ABOUT"], fields: introFields },
};
