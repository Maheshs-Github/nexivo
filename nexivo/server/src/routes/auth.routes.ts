import { Router } from "express";
import * as c from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { loginLimiter } from "../middleware/rateLimits.js";
import { validate } from "../middleware/validate.js";
import { loginBody, profileBody } from "../schemas/forms.js";

const r = Router();
r.use((_req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
r.post("/login", loginLimiter, validate(loginBody), c.login);
r.post("/logout", c.logout);
r.get("/me", requireAuth, c.me);
r.put("/me", requireAuth, validate(profileBody), c.updateProfile);
export default r;
