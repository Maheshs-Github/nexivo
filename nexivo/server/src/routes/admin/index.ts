import { Router } from "express";
import { z } from "zod";
import * as c from "../../controllers/admin.controller.js";
import * as users from "../../controllers/users.controller.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { imageUpload } from "../../lib/upload.js";
import { idParam, listQuery } from "../../schemas/common.js";
import { adminBlogQuery, blogBody } from "../../schemas/blog.js";
import { applicationStatusBody, readBody, userCreateBody, userUpdateBody } from "../../schemas/forms.js";
import { SETTINGS_GROUPS } from "../../schemas/settings.js";
import { crudRouter } from "./crudFactory.js";
import { resources } from "./resources.js";

const r = Router();

// Every /api/admin route requires a signed-in user. ADMIN-only areas add requireRole below.
r.use(requireAuth);
r.use((_req, res, next) => { res.set("Cache-Control", "no-store"); next(); });

const params = validate(idParam, "params");

r.get("/dashboard/stats", c.stats);
r.get("/badges", c.badges);

r.get("/blogs", validate(adminBlogQuery, "query"), c.blogList);
r.get("/blogs/:id", params, c.blogGet);
r.post("/blogs", validate(blogBody), c.blogCreate);
r.put("/blogs/:id", params, validate(blogBody), c.blogUpdate);
r.patch("/blogs/:id/publish", params, c.blogPublish);
r.patch("/blogs/:id/unpublish", params, c.blogUnpublish);
r.delete("/blogs/:id", params, c.blogDelete);

for (const [path, cfg] of Object.entries(resources)) r.use(`/${path}`, crudRouter(cfg));

const appQuery = listQuery.extend({ status: z.enum(["NEW", "REVIEWING", "SHORTLISTED", "REJECTED", "HIRED"]).optional(), jobId: z.coerce.number().int().positive().optional() });
r.get("/applications", validate(appQuery, "query"), c.applicationsList);
r.patch("/applications/:id/status", params, validate(applicationStatusBody), c.applicationStatus);
r.get("/applications/:id/resume", params, c.applicationResume);
r.delete("/applications/:id", params, c.applicationDelete);

const msgQuery = listQuery.extend({ filter: z.enum(["all", "unread", "read"]).optional() });
r.get("/messages", validate(msgQuery, "query"), c.messagesList);
r.patch("/messages/:id/read", params, validate(readBody), c.messageRead);
r.delete("/messages/:id", params, c.messageDelete);

r.get("/media", validate(listQuery, "query"), c.mediaList);
r.post("/media/upload", imageUpload.single("file"), c.mediaUpload);
r.delete("/media/:id", params, c.mediaDelete);

r.get("/settings", c.settingsGet);
r.put("/settings/:group", validate(z.object({ group: z.enum(SETTINGS_GROUPS) }), "params"), c.settingsUpdate);

const adminOnly = requireRole("ADMIN");
r.get("/users", adminOnly, users.list);
r.post("/users", adminOnly, validate(userCreateBody), users.create);
r.put("/users/:id", adminOnly, params, validate(userUpdateBody), users.update);
r.delete("/users/:id", adminOnly, params, users.remove);

export default r;
