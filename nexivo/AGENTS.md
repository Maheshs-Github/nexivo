=== 1. HOW TO WORK ===
- TODO.md is the plan. This brief adds rules on top. If they conflict, this brief wins; note the conflict in the HANDOFF LOG.
- Go through TODO.md section 5 top to bottom. For every task: build it, verify it for real, tick [x] in TODO.md, add a HANDOFF LOG row (AI/tool = "Claude (VS Code)", date, done, broken/pending, next), then git commit with a message like "feat(blog): ...".
- "Verify for real" means: npx tsc --noEmit, run the app, call endpoints with curl, npm run build for the client. For UI you can't see yourself, tick it but write "UI check pending" in the log.
- At the end of each PHASE, post a short checkpoint for me: what works, exactly what to open in the browser and what I should see. Then continue straight to the next phase without waiting.
- Stop and wait for me ONLY when: a requirement is missing; you need something only I can do (create an account, click in a website, paste a URL or connection string); or an action is destructive (dropping the database, deleting work, force push) or costs money.
- If a task is blocked: log it and move on (TODO rule 12).
- When I type "continue" in a new chat: read TODO.md and the HANDOFF LOG, check git log and git status, start the database and apps, confirm the last logged work runs, fix anything broken, then continue from the first unchecked task. Skip the requirements check unless something fails.
- Before using any library API, check the installed version (npm ls <pkg>) and follow that version's docs, not memory.
- Keep files under about 250 lines.

=== 2. REQUIREMENTS CHECK (do this before writing any code) ===
Run these and show me a table: tool | needed | found | OK?
- git --version: any recent version
- node -v: 22.12 or newer (24 LTS recommended)
- npm -v: 10 or newer
- docker --version and docker compose version: installed
- docker info: the Docker engine is running
- code --version: the VS Code command line works
Detect my OS (Windows or macOS).
- If anything is missing, too old or not running: STOP, give me the exact download link or install command for my OS, and wait. Do not install Node or Docker yourself.
  Windows notes for me: Docker Desktop needs WSL2 (wsl --install in an admin PowerShell, then restart). If npm is blocked in PowerShell ("running scripts is disabled"), I run: Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
- If I reply "Option B", I have no Docker: skip Docker, ask me for a TiDB Cloud connection string and use it as DATABASE_URL.
- Warn me if the project folder is inside OneDrive or its path has spaces.
- If everything is OK, install these VS Code extensions with code --install-extension: Prisma.prisma, bradlc.vscode-tailwindcss, dbaeumer.vscode-eslint, esbenp.prettier-vscode, humao.rest-client

=== 3. LOCKED DECISIONS (these settle open points in TODO.md) ===
- TypeScript in both client/ and server/ (ESM). Server files: src/app.ts, src/server.ts, prisma/seed.ts, run with tsx (tsx watch src/server.ts). Reason: Prisma 7 generates a TypeScript client. This approved change replaces the .js names in TODO.md.
- npm. A root package.json with scripts: dev (server + client together via concurrently), setup (install both apps, prisma generate, migrate, seed), seed, db:up (docker compose up -d), db:down (docker compose stop), db:studio, build (both apps), start (server in production mode). Add "engines" (node >= 22.12) to every package.json.
- Ports: server 4000, client 5173. The Vite dev server proxies /api and /uploads to the server and the client calls relative /api, so cookies and CORS just work in dev.
- Fonts: Sora (headings) + Inter (body). Ignore the "Space Grotesk" mention in Phase 5.
- "No hardcoded content" means all page content comes from the API (headings, text, lists, images, section CTAs, nav, footer, SEO). Generic UI microcopy (form labels, "Loading...", pagination, "Read more") may stay in code.
- Roles: EDITOR manages content; ADMIN also manages users and site settings. Seed one of each.
- Toasts: sonner. Drag and drop: @dnd-kit.
- Dev .env values: a random 48-character JWT_SECRET, ADMIN_EMAIL=admin@nexivo.dev, ADMIN_PASSWORD=Admin@12345, EDITOR_EMAIL=editor@nexivo.dev, EDITOR_PASSWORD=Editor@12345, CLIENT_URL=http://localhost:5173, SITE_URL=http://localhost:5173. Keep the .env.example files updated; never commit .env.

=== 4. VERSION PINS (do not write setup code from memory of older versions) ===
- Prisma: pin to v7: npm i -D prisma@7 and npm i @prisma/client@7 @prisma/adapter-mariadb dotenv. NEVER install prisma@latest (it resolves to Prisma 8, which has a completely different API). Prisma 7 rules: the datasource URL goes in the Prisma config file (prisma.config.ts); .env is not auto-loaded (import "dotenv/config"); PrismaClient must be created with the PrismaMariaDb adapter (works for MySQL and TiDB); the generator output path is explicit; the seed command lives in the config file. Follow https://www.prisma.io/docs/v7/prisma-orm/quickstart/mysql
- Tailwind v4: CSS-first (@import "tailwindcss", tokens in @theme, @tailwindcss/vite plugin, no tailwind.config.js). Set up Tailwind first, then npx shadcn@latest init.
- React Router v7: import from "react-router". Express 5: async errors reach the error handler automatically; wildcard routes must be named (/*splat). Framer Motion is published as "motion" (import from "motion/react"). Lenis is the "lenis" package. Zod 4, TipTap 3.
- If bcrypt fails to install (common on Windows), use bcryptjs and log it.
- Extra packages allowed beyond TODO's list: typescript, tsx, @types/*, concurrently, @tailwindcss/vite, @tailwindcss/typography, sonner, @dnd-kit/*, @prisma/adapter-mariadb, dotenv, sharp. Anything else: log the reason.

=== 5. SECURITY MUSTS (on top of TODO rules 4 and 5) ===
- Resumes are private: store them in server/private/resumes/ (never under public /uploads), downloadable only through GET /api/admin/applications/:id/resume.
- Uploads: check magic bytes, not just the browser's mimetype. Images: jpeg/png/webp/gif only, no SVG. Resumes: PDF only, max 5 MB. Random file names.
- Login rate limit (about 5 per minute per IP) and a generic "Invalid email or password" message.
- JWT secret from env (32+ characters). Cookie: httpOnly, sameSite "lax", secure in production.
- Validate params and query with Zod too. Never pass req.body straight to Prisma; pick the allowed fields explicitly.
- sanitize-html on all rich text before saving. Never return passwordHash. Never log passwords, tokens or cookies.
- Contact and apply forms: honeypot field + rate limit.

=== 6. QUALITY BAR ===
- Lazy-load every route. The whole /admin tree (TipTap, Recharts, dnd-kit) is a separate chunk that public visitors never download.
- Use the design tokens from TODO section 0 as CSS variables (dark default + light). No raw hex or one-off spacing in components.
- Every data view: skeleton loading, empty state, error state with retry. Every mutation: a toast.
- Respect prefers-reduced-motion (turn off Lenis and heavy animation).
- Accessibility: semantic HTML, labels, visible focus rings, alt text from the API, keyboard-usable menus and carousels.
- Seed: realistic Nexivo copy, no lorem ipsum. No hotlinked images you haven't verified: generate local placeholders into server/uploads/seed/ (SVG gradient covers, initials avatars). Client logos are fictional companies, never real brands.

=== 7. EXTRA DETAIL PER PHASE (on top of TODO.md section 5) ===
Phase 1 (Setup):
- .gitignore: node_modules, .env files, dist, the generated Prisma client, server/uploads/* except .gitkeep and seed/, server/private/.
- Run docker compose up -d and wait until MySQL accepts connections. If port 3306 is taken (XAMPP or a local MySQL), use 3307.
- Express 5 with helmet, cors (origin CLIENT_URL, credentials true), cookie-parser, morgan, a global rate limit, a JSON size limit, a 404 handler and a central error handler returning { success: false, message } (Zod errors give 400 with field errors, Prisma not-found gives 404). GET /api/health pings the database. One shared Prisma client in src/lib/prisma.ts.
- Client: Vite + React + TS, Tailwind v4, shadcn/ui with the @ alias, Sora + Inter (font-display swap), React Router, TanStack Query, sonner, Lenis, motion, lucide-react, react-helmet-async, React Hook Form + Zod. src/lib/api.ts: a typed fetch wrapper (credentials "include") that unwraps { success, data, message } and throws a typed ApiError. A temporary page showing /api/health (replaced in Phase 5).
- README with the requirements and run steps for Windows and macOS.
Phase 2 (Database and seed):
- Enums for role, statuses, page and section type. @@index on every foreign key, BlogPost(status, publishedAt) and Section(page, order). updatedAt on editable models. BlogPost <-> Tag many-to-many. onDelete Restrict for Job to Application.
- Section types. Home: HERO, CLIENTS, STATS, SERVICES, PROCESS, CASE_STUDIES, TESTIMONIALS, BLOGS, CTA, FAQ, RICHTEXT. About: STORY, MISSION_VISION, VALUES, TIMELINE, TEAM, TECH_STACK. Write a Zod schema for each type's content JSON in server/src/schemas/sections.ts; the admin forms and the public site both use them.
- The seed is idempotent (run it twice to prove it). Blog posts are 600-900 words of real HTML with h2/h3 headings. Print row counts per table.
Phase 3 (Backend API):
- routes -> controllers -> services; schemas in src/schemas; one validate(schema, "body" | "query" | "params") middleware.
- A generic admin CRUD factory (list with page/limit/q/sort, get, create, update, delete, PATCH /reorder for models with order) for services, testimonials, team, clients, projects, categories, tags, jobs, nav, sections and seo. Custom controllers for blogs, settings, users, applications and messages.
- Public endpoints return only visible / PUBLISHED / OPEN rows. The blog list returns { items, total, page, pages } (limit max 50). Blog detail increments views and returns 3 related posts. Unique slugs (-2, -3...).
- Dashboard stats: counts, unread messages, new applications, latest 5 of each, top 5 posts by views, and applications and messages per day for the last 30 days (from createdAt).
- server/requests.http covering every endpoint. Run every request and fix the failures. Negative tests: no cookie gives 401, EDITOR on users gives 403, a bad body gives 400, a resume over 5 MB is rejected, an .exe renamed to .pdf is rejected, a draft blog is hidden, a closed job can't be applied to.
Phase 4 (Admin panel):
- Look: quiet, dense and fast, like the Linear or Vercel dashboards. shadcn components, lucide icons, the same tokens, dark/light. Sidebar groups: Overview / Content / Website / Careers / Inbox / Settings, with unread and new badges. Topbar: breadcrumbs, View site, theme toggle, user menu.
- Build reusable blocks FIRST and reuse them for every model: DataTable (search, filters, sort, pagination, row actions), a form pattern (React Hook Form + zodResolver), ImageField, ConfirmDialog, StatusBadge, PageHeader, EmptyState, and useResource hooks with toasts and query invalidation.
- Login page, AuthProvider (GET /auth/me), RequireAuth and RequireRole, redirect back after login.
- Blogs end to end first: TipTap with a sticky toolbar (H2/H3, bold, italic, lists, quote, code, link, image, undo/redo), cover, category, tags with create-on-type, auto slug, SEO fields with a snippet preview and counters, auto read time, draft/publish/unpublish, an unsaved-changes warning, delete confirm.
- Sections editor: dnd-kit reorder, show/hide, a form per section type from the Zod schemas, repeatable items.
- Then the rest: services, testimonials, team, clients, projects, jobs, applications (status dropdown, resume download), inbox (unread, mark read, delete), settings tabs (General, Contact, Social, Footer, a Navigation editor, a Theme accent colour with live preview), the SEO page, a media library with a MediaPicker used by every ImageField, and users (ADMIN only; you can't delete yourself or the last admin).
Phase 5 (Public website; this decides the "wow"):
- First write client/DESIGN.md (type scale, spacing, containers, radius, shadows/glow, glass card and gradient recipes, motion rules) and build exactly to it.
- Direction: a premium IT studio at the level of Linear, Vercel or Stripe, dark-first. Avoid the generic AI look: no emoji, no gradients on everything, not every section centred, not identical card grids everywhere. Use asymmetric layouts, a bento grid for services, and ONE big hero moment.
- PageSections renderer: fetch /pages/:page/sections and map type to component through a registry; skip unknown types; a section with missing fields never breaks the page.
- Hero: an animated gradient mesh or aurora (CSS or a light canvas, no 3D libraries), a word-by-word headline reveal, 2 CTAs, a subtle grid or noise texture, and a cursor glow on desktop only. Also: a CSS logo marquee, count-up stats, a services bento grid with a cursor-following glow, a process timeline, case studies, an accessible testimonials carousel, latest blogs and a CTA banner.
- Layout: sticky blurred navbar, focus-trapped mobile drawer, footer, scroll progress bar, back-to-top, Lenis, short route transitions, a saved theme toggle, and the accent colour from settings as a CSS variable.
- About: story, mission/vision, values, an animated timeline, a team grid, tech stack icons. Services: a list page and a detail page.
- Blog list: search, category chips and pagination synced to the URL. Blog detail: reading progress, a sticky table of contents with the active heading highlighted, typography-styled content, share links (copy, X, LinkedIn, WhatsApp), an author box, related posts.
- Careers: filters in the URL, job detail, an apply form with PDF drag-drop (type and size checked in the browser too), upload progress, success and error states, a "position closed" page.
- Contact: the form, plus contact cards and a map embed from settings. A branded 404 page and an error boundary on each route.
- One Seo component on every page: canonical, OG and Twitter tags; JSON-LD Organization, BlogPosting, JobPosting, BreadcrumbList.
- Build mobile-first from 360px. No layout shift: images have width and height, fonts are preconnected.
Phase 6 (Polish):
- Write client/AUDIT.md first, ranked by severity: hardcoded content, token violations, contrast in both themes, focus states and alt text, reduced motion, layouts at 360/768/1024/1440, console errors, bundle size (no admin code in the public chunk), unused deps (run npx depcheck once, don't install it). Then fix everything.
- Images: lazy loading, width/height, and WebP conversion on upload with sharp.
- Lighthouse: run npx lighthouse on the production preview if Chrome is available; otherwise ask me to run it and paste the scores. Target 90+ for Performance, Accessibility and SEO.
Review pass (before Phase 7):
- Write REVIEW.md: ticked-but-broken tasks, hardcoded content, auth on EVERY /api/admin route, validation, mass assignment, uploads, CORS and cookies, XSS, rate limits, secrets in git history. Fix the top 10.
- Run a local production test (build, run in production mode) and the full live-edit flow: edit the hero, publish a blog, add a job, refresh the public site; apply with a PDF; send a contact message. Make sure a fresh clone works by following only the README.
Phase 7 (Deploy and demo). Stop here and ask me to create free GitHub, TiDB Cloud, Render and Vercel accounts if I haven't. Give me click-by-click steps, one website at a time, and wait for each URL or connection string I paste back:
- Push to a PRIVATE GitHub repo using VS Code's "Publish to GitHub" button.
- Make the API same-origin: client/vercel.json rewrites /api/* and /uploads/* to the Render URL, and everything else falls back to index.html. Keep cookies sameSite "lax" and secure (sameSite "none" gets blocked by Safari). Set Express trust proxy correctly so rate limits use the real client IP.
- TiDB: DATABASE_URL with SSL. Run prisma migrate deploy in the Render build command. Seed once from my computer with the TiDB URL (give me the exact PowerShell and bash commands). If foreign-key migrations fail, use relationMode = "prisma" (TODO section 1b).
- Render: root directory, build and start commands, Node version, every env var explained, health check /api/health. Vercel: root directory client, Vite preset.
- Free-tier gotchas: the backend sleeps when idle (add a warm-up step to the demo), and the server disk may be wiped on redeploy (pick a fix for uploaded media, explain it and log it).
- README: overview, list of screenshots to take, a Mermaid architecture diagram, local setup, deploy steps, and demo admin credentials with a NEW demo-only password. DEMO.md: a 3-minute live-edit script and a pre-demo checklist.
- Then test the live site with me: public pages, admin login, live edit, apply with a PDF, contact form.

=== 8. FINAL HANDOVER ===
When every task is ticked, give me one final report:
- The live website URL and admin URL with the demo login.
- How to run it locally every day: start Docker Desktop, npm run db:up, npm run dev, then open http://localhost:5173 and http://localhost:5173/admin; stop with Ctrl+C and npm run db:down.
- Setup on a new computer: clone, copy the .env.example files to .env, npm run db:up, npm run setup, npm run dev.
- How to update: content through the live admin (no redeploy needed); code by committing and pushing (Vercel and Render redeploy automatically).
- The demo-day checklist from DEMO.md.
