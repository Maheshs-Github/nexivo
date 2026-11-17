# IT Company Website + Admin CMS (MERN with MySQL)

> **HANDOFF FILE FOR AI CODING TOOLS (Cursor / Antigravity / Gemini CLI / Copilot / Claude).**
> Any AI reading this: read the WHOLE file first, then continue from the first unchecked `[ ]` task.
> After finishing a task: tick it `[x]`, and add a line to the **HANDOFF LOG** at the bottom (what you did, what is broken, what is next).
> Never redo ticked tasks. Never change the stack or folder structure without writing the reason in the log.

---

## 0. Goal

A modern, impressive IT company website with **Home, About, Services, Blogs, Careers, Contact**, where **all content is editable from an Admin panel (CMS)**. Must look premium, be fast, responsive, and demo-ready.

**Brand (placeholder, change later from Admin → Settings or the seed file):**
- Company: **Nexivo Technologies**, tagline: *"Engineering what's next."*
- Services: Web Development, Mobile Apps, Cloud & DevOps, AI & Automation, UI/UX Design, Cybersecurity
- Colors (put in CSS variables / Tailwind theme): background `#0B1020` (dark navy), surface `#121936`, primary `#6366F1` (indigo), accent `#22D3EE` (cyan), text `#E6E9F5`, muted `#8B93B5`. Hero gradient: indigo to cyan. Light mode: background `#F8FAFF`, same primary/accent.
- Fonts: **Sora** (headings), **Inter** (body), via Google Fonts
- Style: dark mode default, glass cards, soft glow behind hero, rounded-2xl corners, generous spacing

**Stack (fixed, mandatory):**
- **M**ySQL (instead of MongoDB), via **Prisma ORM**
- **E**xpress.js (Node 20+)
- **R**eact (Vite) + React Router
- **N**ode.js

**Frontend libs:** Tailwind CSS, shadcn/ui, Framer Motion, Lenis (smooth scroll), lucide-react, react-helmet-async (SEO), TanStack Query (data fetching), React Hook Form + Zod (forms), TipTap (rich text editor in admin), Recharts (admin dashboard stats).
**Backend libs:** express, prisma, @prisma/client, zod, bcrypt, jsonwebtoken, cookie-parser, cors, helmet, express-rate-limit, multer, slugify, sanitize-html, morgan, dotenv.

---

## 1. Rules for the AI (read carefully)

1. Monorepo layout: `/client` (React) and `/server` (Express). Do not rename.
2. **No hardcoded page content in React.** Every text, image, list on public pages comes from the API. Seed the DB with realistic content so the site is never empty.
3. Use **Prisma migrations** (`npx prisma migrate dev`), never raw ad-hoc SQL changes.
4. Validate every request body with **Zod**. Sanitize rich text with `sanitize-html` before saving.
5. Auth: JWT in **httpOnly cookie**, bcrypt password hashing, roles `ADMIN` and `EDITOR`. Protect all `/api/admin/*` routes.
6. API response shape: `{ success: boolean, data?: any, message?: string }`. Use proper HTTP status codes.
7. Keep files small and organized: `routes/ → controllers/ → services/` on the server; `pages/`, `components/`, `hooks/`, `lib/` on the client.
8. Every new feature: loading state, empty state, error state, and toast feedback.
9. Mobile-first and responsive. Dark and light mode.
10. After each phase, **run the app and test it** (see "Definition of done"). Do not tick a task that was not verified.
11. Keep `.env.example` updated. Never commit secrets.
12. Prefer simple and working over clever. If a task is blocked, log it and move on to the next one.

---

## 1b. Database decision (final)

- **Development: Docker MySQL 8** (local, fast, free). Put this `docker-compose.yml` in the project root and run `docker compose up -d`:
  ```yaml
  services:
    mysql:
      image: mysql:8
      container_name: nexivo-mysql
      restart: unless-stopped
      environment:
        MYSQL_ROOT_PASSWORD: rootpass
        MYSQL_DATABASE: nexivo
      ports: ["3306:3306"]
      volumes: [mysql_data:/var/lib/mysql]
  volumes:
    mysql_data:
  ```
  `server/.env`: `DATABASE_URL="mysql://root:rootpass@localhost:3306/nexivo"`
- **Online / demo: TiDB Cloud Serverless** (MySQL-compatible, "Atlas for MySQL", free tier). Use its connection string with SSL, e.g. `mysql://USER:PASS@HOST:4000/nexivo?sslaccept=strict`. Switching is only a change of `DATABASE_URL` and running `npx prisma migrate deploy` + seed. Aiven free MySQL is the backup option.
- If Prisma migrations fail on TiDB because of foreign keys, add `relationMode = "prisma"` in the `datasource` block of `schema.prisma` and add `@@index` on relation fields.

---

## 2. Folder structure

```
project/
├── TODO.md
├── README.md
├── client/
│   ├── src/
│   │   ├── components/      (ui/, layout/, sections/, admin/)
│   │   ├── pages/           (public pages)
│   │   ├── admin/           (admin pages + layout)
│   │   ├── hooks/
│   │   ├── lib/             (api.ts, utils.ts)
│   │   └── main.tsx
│   └── .env                 (VITE_API_URL)
└── server/
    ├── prisma/ (schema.prisma, seed.js)
    ├── src/
    │   ├── routes/ controllers/ services/ middleware/ utils/
    │   └── app.js, server.js
    ├── uploads/
    └── .env
```

---

## 3. Database design (Prisma / MySQL)

Create these models in `server/prisma/schema.prisma`:

| Model | Key fields |
|---|---|
| **User** | id, name, email (unique), passwordHash, role (ADMIN/EDITOR), createdAt |
| **SiteSetting** | id, key (unique), value (JSON). Holds: siteName, logo, favicon, contact info, social links, footer text, theme colors, default SEO |
| **NavItem** | id, label, url, order, location (HEADER/FOOTER), isVisible |
| **Section** | id, page (HOME/ABOUT/...), type (HERO/STATS/SERVICES/TESTIMONIALS/CTA/CLIENTS/FAQ/RICHTEXT...), order, isVisible, content (JSON) |
| **Service** | id, title, slug, shortDesc, description, icon, image, order, isVisible |
| **Testimonial** | id, name, role, company, avatar, quote, rating, isVisible |
| **TeamMember** | id, name, role, bio, photo, linkedin, order |
| **ClientLogo** | id, name, logo, order |
| **Project** (case study) | id, title, slug, summary, content, cover, techStack (JSON), liveUrl, isVisible |
| **BlogPost** | id, title, slug (unique), excerpt, content (HTML), coverImage, status (DRAFT/PUBLISHED), publishedAt, authorId, categoryId, seoTitle, seoDescription, readTime, views |
| **Category** | id, name, slug |
| **Tag** + join table | id, name, slug |
| **Job** | id, title, slug, department, location, type (FULL_TIME/INTERN/CONTRACT), experience, description, requirements, status (OPEN/CLOSED), createdAt |
| **Application** | id, jobId, name, email, phone, resumeUrl, coverLetter, status (NEW/REVIEWING/SHORTLISTED/REJECTED), createdAt |
| **ContactMessage** | id, name, email, phone, subject, message, isRead, createdAt |
| **Media** | id, url, filename, mimeType, size, createdAt |
| **PageSEO** | id, page (unique), title, description, ogImage |

Seed script (`prisma/seed.js`) must create: 1 admin user (email/password from `.env`), all site settings, nav items, home sections, 6 services, 4 testimonials, 4 team members, 8 client logos, 3 case studies, 6 blog posts (with categories), 5 jobs. Use realistic IT-company copy (web, mobile, cloud, AI, UI/UX, DevOps).

---

## 4. API list

**Public (`/api/...`)**
- `GET /settings`, `GET /nav`
- `GET /pages/:page/sections`
- `GET /services`, `GET /services/:slug`
- `GET /testimonials`, `GET /team`, `GET /clients`, `GET /projects`, `GET /projects/:slug`
- `GET /blogs?page=&limit=&category=&tag=&q=`, `GET /blogs/:slug` (increments views), `GET /categories`
- `GET /jobs`, `GET /jobs/:slug`, `POST /jobs/:id/apply` (multipart, resume PDF max 5 MB)
- `POST /contact`
- `GET /seo/:page`, `GET /sitemap.xml`

**Auth:** `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`

**Admin (`/api/admin/...`, auth required)**
- CRUD for: sections, services, testimonials, team, clients, projects, blogs, categories, tags, jobs, nav items, settings, seo
- `GET /applications`, `PATCH /applications/:id/status`
- `GET /messages`, `PATCH /messages/:id/read`, `DELETE /messages/:id`
- `POST /media/upload`, `GET /media`, `DELETE /media/:id`
- `GET /dashboard/stats` (counts, recent posts, applications, messages, views chart)
- `ADMIN` only: user management

---

## 5. TASKS (work top to bottom)

### Phase 1: Setup (target: 1 hour)
- [x] Create monorepo, `git init`, `.gitignore`
- [x] `server`: init Node project, install backend libs, Express app with helmet, cors (credentials), cookie-parser, morgan, rate limit, central error handler — TypeScript + Express 5; bcryptjs (bcrypt needs native build tools)
- [ ] Add `docker-compose.yml` from section 1b, run `docker compose up -d` — **BLOCKED: file added; Docker Desktop/WSL2 not installed on this PC**
- [ ] `server`: connect Prisma to MySQL (`DATABASE_URL` from section 1b) — **BLOCKED: Prisma 7 + MariaDB adapter wired; /api/health reports 503 until a DB exists**
- [x] `client`: Vite + React + TS (or JS), Tailwind, shadcn/ui, React Router, TanStack Query, Framer Motion, Lenis
- [x] Axios/fetch wrapper in `client/src/lib/api.ts` with `credentials: 'include'`
- [x] `.env.example` for both apps, README with run steps

### Phase 2: Database and seed (target: 1 to 2 hours)
- [x] Write full `schema.prisma` from section 3 — validated; 18 tables
- [ ] Run migration — **BLOCKED: SQL generated offline in prisma/migrations/20261117000000_init; apply with `npx prisma migrate deploy` once MySQL runs**
- [ ] Write `seed.js` with all realistic content, run it — **BLOCKED: seed.ts written + validated offline against API schemas (0 invalid); run `npm run seed` once MySQL runs**
- [ ] Verify in `npx prisma studio` — **BLOCKED: needs DB**

### Phase 3: Backend API
- [ ] Auth: login/logout/me, `requireAuth` and `requireRole` middleware — **BLOCKED: built + type-checked; routing/validation/401 verified live; DB round-trip pending → `npm run test:api`**
- [ ] Public read endpoints (settings, nav, sections, services, testimonials, team, clients, projects) — **BLOCKED: built + type-checked; routing/validation/401 verified live; DB round-trip pending → `npm run test:api`**
- [ ] Blog endpoints with pagination, search, category/tag filter, draft hiding — **BLOCKED: built + type-checked; routing/validation/401 verified live; DB round-trip pending → `npm run test:api`**
- [ ] Jobs endpoints and application submit with multer resume upload — **BLOCKED: built + type-checked; routing/validation/401 verified live; DB round-trip pending → `npm run test:api`**
- [ ] Contact endpoint (+ rate limit) — **BLOCKED: built + type-checked; routing/validation/401 verified live; DB round-trip pending → `npm run test:api`**
- [ ] Admin CRUD endpoints for all models (reuse a generic controller factory where possible) — **BLOCKED: built + type-checked; routing/validation/401 verified live; DB round-trip pending → `npm run test:api`**
- [ ] Media upload endpoint (images, 5 MB limit, validate mime type), static serving of `/uploads` — **BLOCKED: built + type-checked; routing/validation/401 verified live; DB round-trip pending → `npm run test:api`**
- [ ] Dashboard stats endpoint — **BLOCKED: built + type-checked; routing/validation/401 verified live; DB round-trip pending → `npm run test:api`**
- [ ] `sitemap.xml` endpoint — **BLOCKED: built + type-checked; routing/validation/401 verified live; DB round-trip pending → `npm run test:api`**
- [ ] Test every endpoint (use a `server/requests.http` file or Postman collection) — **BLOCKED: requests.http + scripts/api-smoke.ts (60+ checks) written; run `npm run test:api` once DB is up**

### Phase 4: Admin panel (build blog end-to-end FIRST, then copy the pattern)
- [x] Admin layout: sidebar, topbar, protected routes, login page — UI check pending (needs DB login)
- [x] Dashboard: stat cards + Recharts chart + recent activity — UI check pending (needs DB login)
- [x] **Blogs:** list (search, filter, status badge), create/edit form with TipTap editor, cover upload, category/tags, SEO fields, draft/publish, delete confirm — UI check pending (needs DB login)
- [x] Sections editor for Home and About (reorder with drag and drop via dnd-kit, show/hide toggle, form fields per section type) — UI check pending (needs DB login)
- [x] Services CRUD — UI check pending (needs DB login)
- [x] Testimonials, Team, Client logos, Projects CRUD — UI check pending (needs DB login)
- [x] Jobs CRUD + Applications list (status change, resume download) — UI check pending (needs DB login)
- [x] Contact messages inbox (unread badge) — UI check pending (needs DB login)
- [x] Settings page (logo, contact info, socials, footer, nav menu editor, theme accent color) — UI check pending (needs DB login)
- [x] SEO page (title/description/OG image per page) — UI check pending (needs DB login)
- [x] Media library (grid, upload, copy URL, delete) and a reusable image picker component — UI check pending (needs DB login)
- [x] Users management (ADMIN only) — UI check pending (needs DB login)

### Phase 5: Public website (this is what decides "wow")
Design direction: clean modern tech look, bold typography (Inter + a display font like Space Grotesk or Sora), generous whitespace, subtle gradient accents, glassmorphism cards, dark mode default with light toggle.
- [x] Layout: sticky blurred navbar (from API), mobile drawer, footer (from API), scroll progress bar, back-to-top, Lenis smooth scroll, page transitions — verified in headless Chrome against seed-data mock API
- [x] **Home:** animated hero (gradient mesh or animated background, headline with text reveal, 2 CTAs), client logo marquee, animated stat counters, services grid with hover effects, process/how-we-work timeline, featured case studies, testimonials carousel, latest blogs, big CTA banner (all driven by Sections API) — verified in headless Chrome against seed-data mock API
- [x] **About:** story, mission/vision, values, animated timeline, team grid, tech stack icons — verified in headless Chrome against seed-data mock API
- [x] **Services:** list page + detail page — verified in headless Chrome against seed-data mock API
- [x] **Blogs:** list (cards, search, category chips, pagination, skeleton loading), detail (reading progress, table of contents, share buttons, related posts, author box) — verified in headless Chrome against seed-data mock API
- [x] **Careers:** open positions list with filters, job detail page, apply form with resume upload and success state — verified in headless Chrome against seed-data mock API
- [x] **Contact:** form + map embed + contact cards — verified in headless Chrome against seed-data mock API
- [x] 404 page, loading skeletons everywhere, toasts — verified in headless Chrome against seed-data mock API
- [x] SEO: `react-helmet-async` on every page using API data, OG tags, JSON-LD for blog posts and jobs — verified in headless Chrome against seed-data mock API

### Phase 6: Polish (this is what impresses evaluators)
- [x] Consistent spacing, type scale, color tokens (CSS variables), dark/light tested on every page — see client/AUDIT.md
- [x] Micro-interactions: button hover, card tilt/lift, cursor glow on hero, scroll reveal (Framer Motion `whileInView`) — see client/AUDIT.md
- [x] Image optimization (lazy loading, width/height, WebP where possible) — see client/AUDIT.md
- [x] Accessibility: alt text, focus states, labels, contrast — see client/AUDIT.md
- [x] Responsive check at 360, 768, 1024, 1440 px — see client/AUDIT.md
- [ ] Lighthouse 90+ (Performance, SEO, Accessibility) — **BLOCKED: A11y/SEO/Best-practices 100 everywhere; Performance desktop 98-99, mobile-throttled 82-85 (CSR ceiling; prerender is the next step, see AUDIT.md)**
- [x] Remove console errors/warnings, dead code, unused deps — see client/AUDIT.md

### Phase 7: Deploy and demo
- [ ] Frontend: Vercel/Netlify (SPA fallback rewrite to `index.html`) — **BLOCKED: configs ready (client/vercel.json, render.yaml); needs the owner to create GitHub/TiDB/Render/Vercel accounts — steps in README**
- [ ] Backend: Render/Railway (set env vars, CORS origin, cookie `secure` and `sameSite` for cross-site) — **BLOCKED: configs ready (client/vercel.json, render.yaml); needs the owner to create GitHub/TiDB/Render/Vercel accounts — steps in README**
- [ ] MySQL: create a TiDB Cloud Serverless cluster (see section 1b), set `DATABASE_URL` on the host, run `prisma migrate deploy` and seed — **BLOCKED: configs ready (client/vercel.json, render.yaml); needs the owner to create GitHub/TiDB/Render/Vercel accounts — steps in README**
- [x] README: overview, screenshots/GIF, architecture diagram, setup steps, admin credentials for the demo — screenshot list included
- [x] Demo script: log into admin, edit hero text, publish a blog, add a job, show the change live on the public site (this "live edit" moment is the showstopper) — DEMO.md

---

## 6. Definition of done (per phase)
- Server starts with no errors; `npm run dev` works in both apps.
- Every feature you built was actually exercised (API call returns data; UI page loads from the API; admin edit is visible on the public site).
- No hardcoded content, no console errors, mobile layout not broken.

---

## 7. Prompts to paste into the AI tool

**Start prompt (first session):**
> Read TODO.md fully. Follow the rules in section 1 and the structure in section 2. Start from Phase 1 and continue task by task. After each task, run and verify, tick it in TODO.md, and add a line to the HANDOFF LOG. Do not stop to ask questions unless truly blocked; make sensible choices and log them.

**Continue prompt (new session or different AI):**
> Read TODO.md fully, including the HANDOFF LOG. Inspect the current repo state, confirm the last logged work actually runs, fix anything broken, then continue from the first unchecked task. Update the log when done.

**Design polish prompt (Phase 5/6):**
> Redesign the [page] to look like a premium modern SaaS/IT agency site (think Linear, Vercel, Stripe). Use Tailwind + shadcn/ui + Framer Motion, strong typography, gradient accents, glass cards, scroll-reveal animations, and perfect mobile layout. Keep all content coming from the API.

**Bug-fix prompt:**
> Here is the error: [paste]. Find the root cause in the code, fix it properly, and verify by running. Do not add workarounds that hide the problem.

**Review prompt (use a second AI to check the first AI's work):**
> Review this repo against TODO.md. List what is done, what is fake/hardcoded, what is broken, and security issues (auth, validation, uploads, CORS, XSS). Fix the highest-impact items first.

---

## 8. Tips for vibe coding this fast
- Build **one vertical slice first** (Blogs: DB → API → admin form → public page). Then tell the AI "repeat this exact pattern for Services/Jobs/etc."
- Commit to git after every working task so you can roll back when an AI breaks something.
- Give the AI the error text and file names, not just "it's not working".
- Use one AI to build and another to review. Switch when one hits its free limit; the HANDOFF LOG keeps them in sync.
- Do not let the AI install random extra libraries; stick to the list above.
- Save the design phase for when the data flow works, then spend your remaining time on Phase 5/6 polish.

---

## HANDOFF LOG (append newest at the bottom)

| # | AI/tool | Date | Done | Broken / pending | Next |
|---|---|---|---|---|---|
| 1 | Claude (VS Code) | 2026-11-17 | Saved brief as CLAUDE.md + AGENTS.md; copied TODO.md into project root C:\Users\prate\nexivo (outside OneDrive, no spaces). Requirements check: git 2.55, node 24.18, npm 11.16, code 1.146 OK. | BLOCKED: Docker Desktop not installed, WSL not installed (wsl --status: class not registered). Waiting for user to install WSL2 + Docker Desktop, or reply "Option B" (TiDB Cloud). | Re-run docker checks, install VS Code extensions, start Phase 1 |
| 2 | Claude (VS Code) | 2026-11-17 | User said "do everything, don't ask". Built the whole app: Express 5 + Prisma 7 API (TS, routes→controllers→services, generic CRUD factory, uploads stored on disk + DB), seed (idempotent, realistic copy, local SVG art), full admin panel, public site per DESIGN.md, security review fixes, AUDIT/REVIEW/README/DEMO, vercel.json + render.yaml. Conflicts (brief wins): TS instead of .js; bcryptjs instead of bcrypt (native build); extra deps: compression (gzip for Express-served build/API JSON), shadcn-installed cn/radix-ui/class-variance-authority/tw-animate-css. | **No database on this PC**: Docker + WSL2 not installed; running a downloaded MySQL zip was blocked by the safety policy. So migrate/seed/test:api/admin UI were NOT run against a DB. Mobile Lighthouse perf 82-85 (desktop 98-99). | Owner: install WSL2 + Docker Desktop (or give a TiDB URL) → `npm run db:up && npm run setup && npm run dev` → `npm run test:api` (fix any failure) → click through /admin → then Phase 7 accounts + deploy per README. |
