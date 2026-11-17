import { z } from "zod";
import { str, urlOrPath } from "./common.js";

const s = (max = 300) => str(max).optional().default("");
const link = z.string().trim().max(300).refine((v) => v === "" || /^(https?:\/\/|\/|mailto:|tel:)/.test(v), "Must be a full URL").optional().default("");
const mapUrl = z.string().trim().max(1000)
  .refine((v) => v === "" || /^https:\/\/(www\.google\.com\/maps|maps\.google\.com|www\.openstreetmap\.org)\//.test(v), "Use a Google Maps or OpenStreetMap embed URL")
  .optional().default("");

/** One schema per settings group. Every group is one SiteSetting row (key = group name). */
export const settingsSchemas = {
  general: z.object({
    siteName: str(80).min(1), tagline: s(160), description: s(400), logo: urlOrPath.optional().default(""), favicon: urlOrPath.optional().default(""), announcement: s(160), announcementUrl: link,
  }),
  contact: z.object({
    email: s(191), salesEmail: s(191), careersEmail: s(191), phone: s(40), whatsapp: s(40), address: s(300), city: s(120), hours: s(120), mapEmbedUrl: mapUrl,
  }),
  social: z.object({ linkedin: link, x: link, github: link, instagram: link, dribbble: link, youtube: link }),
  footer: z.object({ about: s(400), copyright: s(160), ctaHeading: s(120), ctaText: s(300), ctaLabel: s(40), ctaUrl: link }),
  theme: z.object({ accent: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #6366F1"), defaultMode: z.enum(["dark", "light"]).default("dark") }),
  seo: z.object({ titleTemplate: s(80), defaultTitle: s(200), defaultDescription: s(300), ogImage: urlOrPath.optional().default(""), twitterHandle: s(40), keywords: s(300) }),
  pages: z.object({
    notFoundTitle: s(120), notFoundText: s(300), applySuccessTitle: s(120), applySuccessText: s(300),
    contactSuccessTitle: s(120), contactSuccessText: s(300), closedJobTitle: s(120), closedJobText: s(300),
    contactFormHeading: s(120), contactFormText: s(300), applyFormIntro: s(200),
  }),
} as const;

export type SettingsGroup = keyof typeof settingsSchemas;
export const SETTINGS_GROUPS = Object.keys(settingsSchemas) as SettingsGroup[];
/** EDITORs may change page copy; site-wide identity, theme and SEO defaults are ADMIN-only. */
export const EDITOR_GROUPS: SettingsGroup[] = ["pages"];
