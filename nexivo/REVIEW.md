# Review pass (before deploy)

Reviewed against TODO.md and the security musts in CLAUDE.md §5. **Top-10 fixes applied in this pass are marked ✅.**

## 1. Ticked-but-broken tasks

None of the ticked items are known to be broken. Items that need a live MySQL database (migration run, seed run, Prisma Studio, live CRUD round-trips) are **not ticked**. Docker/MySQL was not available on the build machine; they are verified by `npm run test:api` once a database is up (see the HANDOFF LOG).

## 2. Hardcoded content

Public pages read all headings, text, lists, images, CTAs, nav, footer, SEO, 404 and success copy from the API. What remains in code is generic UI microcopy (form labels, "Read more", "Keep reading", pagination, "On this page"), as allowed by the brief. ✅ The apply-form intro moved to settings.

## 3. Auth on every `/api/admin` route

`routes/admin/index.ts` applies `requireAuth` to the whole router before any route. `requireAuth` re-reads the user from the DB on every request (deleted users lose access instantly; the role comes from the DB, not the token). ADMIN-only areas: `/users/*` (`requireRole("ADMIN")`) and all settings groups except `pages` (checked in the controller). The smoke test asserts 401 without a cookie and 403 for EDITOR.

## 4. Validation

Zod validates body, query and params everywhere (`validate(schema, source)`); multipart apply fields are parsed with Zod after multer. Section content is validated against its type's schema. Settings groups have their own schemas. Errors return 400 with field errors.

## 5. Mass assignment

Zod objects strip unknown keys, and controllers build Prisma `data` from parsed values only (users and blog posts pick fields explicitly). PATCH endpoints have narrow schemas (`isVisible`/`order`, job `status`). The smoke test sends `isAdmin: true` and asserts it is dropped.

## 6. Uploads

Images: magic bytes (JPEG/PNG/WebP/GIF only, SVG rejected), 5 MB, re-encoded to WebP with sharp (which also strips metadata), random names, `nosniff`. Resumes: real PDF signature, 5 MB, stored in `server/private/resumes` + DB, served only by `GET /api/admin/applications/:id/resume` as an attachment. `/uploads/:file` restores from the DB only for names matching `^[a-z0-9-]+\.(webp|gif|jpg|png|pdf)$` (no traversal).

## 7. CORS and cookies

CORS is restricted to `CLIENT_URL` (comma list) with credentials. In production the browser talks to the Vercel origin only (rewrites), so the cookie is first-party: `httpOnly; SameSite=Lax; Secure; Path=/`. Lax blocks cross-site POSTs carrying the session (CSRF). `trust proxy` = `TRUST_PROXY` (2 on Render behind Vercel) so rate limits see the real client IP.

## 8. XSS

All rich HTML goes through `sanitize-html` (allow-list, http/https/mailto/tel only, external links get `rel="noopener noreferrer"`): blog content, service descriptions, case studies and job descriptions. ✅ **Fixed:** RICHTEXT section HTML (inside JSON content) was not sanitized; the CRUD factory now has a per-model `transform`, and sections sanitize `content.html`. Plain-text fields (contact, applications, titles) go through `stripTags`. React escapes everything else. ✅ **Fixed:** logo/favicon/OG image settings now only accept `/path` or `https://` URLs.

## 9. Rate limits and abuse

Global 1000/15 min per IP on `/api`; login 5/min (successful logins not counted) with the generic "Invalid email or password" and a timing-safe dummy hash; contact and apply have separate 5/10 min budgets (✅ split so one form cannot block the other) and honeypot fields. JSON body limit 1 MB; DB pool timeouts 5–8 s (✅ added so a DB outage fails fast instead of hanging).

## 10. Secrets in git history

`git log -p --all` contains only the `.env.example` placeholder (`change-me-…`). ✅ The server now refuses to start in production with that placeholder secret. `.env` files, `server/private/` and user uploads are git-ignored; the seed artwork in `uploads/seed/` is intentionally committed.

## Other fixes from this pass

- ✅ `compression` middleware (smaller JSON and assets when Express serves the build).
- ✅ Health endpoint returns 503 `{database:"down"}` instead of a generic 500.
- ✅ Vercel security headers (nosniff, frame options, referrer policy, permissions policy, HSTS) in `client/vercel.json`.

## Production test

- `npm run build` passes (API type-check + client build). The client also builds with `server/node_modules` absent (as on Vercel).
- `NODE_ENV=production npm start` serves the built client from Express with CSP enabled. The full live-edit flow against a real DB is pending a database (see HANDOFF LOG); the identical flow is scripted in `npm run test:api` and DEMO.md.
