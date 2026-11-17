import { rateLimit } from "express-rate-limit";
import { isProd } from "../config/env.js";

const message = (text: string) => ({ success: false, message: text });

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProd ? 1000 : 10000,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: message("Too many requests. Please slow down and try again shortly."),
});

export const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: isProd ? 5 : 50,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: message("Too many sign-in attempts. Please wait a minute and try again."),
});

const formWindow = (name: string) => rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: isProd ? 10 : 200,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req) => `${name}:${req.ip ?? "unknown"}`,
  message: message("You have sent several submissions already. Please try again in a few minutes."),
});

/** Separate budgets so a burst of contact messages never blocks a job application (and vice versa). */
export const contactLimiter = formWindow("contact");
export const applyLimiter = formWindow("apply");
