import { Router } from "express";
import * as c from "../controllers/public.controller.js";
import * as forms from "../controllers/forms.controller.js";
import { validate } from "../middleware/validate.js";
import { applyLimiter, contactLimiter } from "../middleware/rateLimits.js";
import { resumeUpload } from "../lib/upload.js";
import { idParam, pageParam, slugParam } from "../schemas/common.js";
import { publicBlogQuery } from "../schemas/blog.js";
import { contactBody } from "../schemas/forms.js";

const r = Router();

r.get("/health", c.health);

r.get("/settings", c.shortCache, c.settings);
r.get("/nav", c.shortCache, c.nav);
r.get("/pages/:page/sections", validate(pageParam, "params"), c.shortCache, c.sections);
r.get("/seo/:page", validate(pageParam, "params"), c.shortCache, c.seo);

r.get("/services", c.shortCache, c.services);
r.get("/services/:slug", validate(slugParam, "params"), c.shortCache, c.service);
r.get("/testimonials", c.shortCache, c.testimonials);
r.get("/team", c.shortCache, c.team);
r.get("/clients", c.shortCache, c.clients);
r.get("/projects", c.shortCache, c.projects);
r.get("/projects/:slug", validate(slugParam, "params"), c.shortCache, c.project);

r.get("/blogs", validate(publicBlogQuery, "query"), c.shortCache, c.blogList);
r.get("/blogs/:slug", validate(slugParam, "params"), c.blogDetail);
r.get("/categories", c.shortCache, c.categories);

r.get("/jobs", c.shortCache, c.jobs);
r.get("/jobs/:slug", validate(slugParam, "params"), c.shortCache, c.job);
r.post("/jobs/:id/apply", applyLimiter, validate(idParam, "params"), resumeUpload.single("resume"), forms.apply);

r.post("/contact", contactLimiter, validate(contactBody), forms.contact);

export default r;
