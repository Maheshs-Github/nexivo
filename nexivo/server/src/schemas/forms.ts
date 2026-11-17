import { z } from "zod";
import { optStr, reqStr } from "./common.js";

/** Bots fill every field; humans never see "website". */
const honeypot = { website: z.string().max(0, "Spam detected").optional() };
const phone = z.string().trim().max(40).regex(/^[0-9+()\-\s]*$/, "Use digits, spaces, +, - or ()")
  .optional().nullable().transform((v) => (v ? v : null));
const email = z.email("Enter a valid email").max(191);

export const contactBody = z.object({
  name: reqStr(120), email, phone, company: optStr(120), subject: reqStr(200),
  message: z.string().trim().min(10, "Tell us a little more (10+ characters)").max(5000), ...honeypot,
});

export const applyBody = z.object({
  name: reqStr(120), email, phone,
  linkedin: z.string().trim().max(300).optional().nullable()
    .refine((v) => !v || /^https?:\/\//.test(v), "Must start with https://").transform((v) => (v ? v : null)),
  coverLetter: z.string().trim().max(5000).optional().nullable().transform((v) => (v ? v : null)), ...honeypot,
});

export const loginBody = z.object({ email, password: z.string().min(1, "Required").max(200) });

export const applicationStatusBody = z.object({ status: z.enum(["NEW", "REVIEWING", "SHORTLISTED", "REJECTED", "HIRED"]) });
export const readBody = z.object({ isRead: z.boolean().default(true) });

const password = z.string().min(8, "At least 8 characters").max(200).regex(/[A-Za-z]/, "Include a letter").regex(/[0-9]/, "Include a number");
export const userCreateBody = z.object({
  name: reqStr(120), email, role: z.enum(["ADMIN", "EDITOR"]), password, title: optStr(120), bio: optStr(1200), avatar: optStr(500),
});
export const userUpdateBody = userCreateBody.partial().extend({ password: z.union([password, z.literal("")]).optional() });
export const profileBody = z.object({
  name: reqStr(120), title: optStr(120), bio: optStr(1200), avatar: optStr(500),
  currentPassword: z.string().max(200).optional(), newPassword: z.union([password, z.literal("")]).optional(),
});
