# Nexivo Technologies: website + CMS

A premium IT-company website (Home, About, Services, Blog, Careers, Contact) where **every word, image and menu is editable from an admin panel**. Built as a monorepo with React 19 + Vite on the front end and Express 5 + Prisma 7 + MySQL on the back end.

> Tagline: *Engineering what's next.* All copy, people and client logos are fictional placeholders you can change in **Admin → Settings / Pages & sections**.

## Highlights

- **Fully content-managed:** page sections (hero, stats, services bento, process, case studies, testimonials, FAQ, CTA, about-page blocks) are JSON documents validated by shared Zod schemas. The admin forms and the public site use the same contracts.
- **Admin panel** (`/admin`): dashboard with charts, a TipTap blog editor (SEO preview, tags, drafts), a drag-and-drop page builder, services, case studies, team, testimonials, client logos, jobs and applications (private resume download), an inbox, a media library (WebP conversion), navigation, theme colour with live preview, SEO, and users and roles.
- **Design:** a dark-first studio aesthetic (Sora + Inter, glass, hairline grids, one aurora hero moment), plus light mode, reduced motion support and a mobile-first layout. See [`client/DESIGN.md`](client/DESIGN.md).
- **Security:** httpOnly JWT cookie, bcrypt, roles (ADMIN / EDITOR), Zod on body, query and params, sanitize-html, magic-byte upload checks, private resumes, rate limits, honeypots and helmet.
- **Quality:** every route is lazy-loaded, the admin is a separate bundle, and SEO comes from the API (OG/Twitter, JSON-LD for Organization, BlogPosting, JobPosting and BreadcrumbList, sitemap.xml, robots.txt). Lighthouse (production build): **Desktop 98–99 Performance, 100 Accessibility, Best Practices and SEO**; **Mobile (throttled) 82–85 Performance, 100 for the rest**.

## Architecture

```mermaid
flowchart LR
  subgraph Browser
    P[Public site<br/>React 19 + Vite]:::fe
    A[Admin /admin<br/>lazy bundle]:::fe
  end
  subgraph Vercel
    V[Static build<br/>+ rewrites /api, /uploads]:::host
  end
  subgraph Render
    E[Express 5 API<br/>helmet · cors · rate limits]:::be
    D[(Disk cache<br/>/uploads)]:::store
  end
  T[(TiDB Cloud / MySQL 8<br/>Prisma 7)]:::db
  P -- same-origin /api --> V
  A -- cookie auth --> V
  V -- rewrite --> E
  E -- Prisma + MariaDB adapter --> T
  E --- D
  classDef fe fill:#6366F1,color:#fff,stroke:none
  classDef be fill:#0E1428,color:#E6E9F5,stroke:#22D3EE
  classDef host fill:#121936,color:#E6E9F5,stroke:#8B93B5
  classDef db fill:#22D3EE,color:#0B1020,stroke:none
  classDef store fill:#18204A,color:#E6E9F5,stroke:none
```

- The browser only ever talks to the Vercel domain. `client/vercel.json` rewrites `/api/*`, `/uploads/*`, `/sitemap.xml` and `/robots.txt` to Render, so cookies stay first-party (`SameSite=Lax; Secure`), which also works in Safari.
- Uploaded images and resumes are stored **in the database** as well as on disk. Render's free disk is wiped on redeploy; files are restored from the DB on first request.

```
nexivo/
├── client/   React app (pages/, components/, admin/, hooks/, lib/) · DESIGN.md · AUDIT.md · vercel.json
├── server/   Express API (src/routes → controllers → services, schemas/, middleware/) · prisma/ · requests.http
├── docker-compose.yml   MySQL 8 for local development
├── render.yaml          Render Blueprint for the API
├── DEMO.md · REVIEW.md · TODO.md
```

## Requirements

| Tool | Version | Windows | macOS |
|---|---|---|---|
| Node.js | 22.12+ (24 LTS recommended) | https://nodejs.org | `brew install node@24` or nodejs.org |
| Git | any recent | https://git-scm.com/download/win | `xcode-select --install` |
| Docker Desktop | latest | https://www.docker.com/products/docker-desktop/ (needs WSL2: `wsl --install` in an **admin** PowerShell, then restart) | https://www.docker.com/products/docker-desktop/ |
| VS Code (optional) | latest | recommended extensions are listed in `.vscode/extensions.json` | |

No Docker? Any MySQL 8 server works (XAMPP/MySQL Installer on port 3306 or 3307), or a free **TiDB Cloud** cluster. Put its URL in `server/.env` as `DATABASE_URL`.

> If PowerShell says "running scripts is disabled": `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.
> Keep the project out of OneDrive and out of paths with spaces.

## Run locally

```bash
git clone <your-repo-url> nexivo && cd nexivo
cp server/.env.example server/.env        # Windows PowerShell: Copy-Item server/.env.example server/.env
cp client/.env.example client/.env        #                     Copy-Item client/.env.example client/.env
# set a random JWT_SECRET in server/.env:
node -e "console.log(require('crypto').randomBytes(36).toString('base64url'))"

npm run db:up      # starts MySQL 8 in Docker and waits until it is healthy
npm run setup      # installs everything, generates Prisma client, migrates and seeds
npm run dev        # API on :4000 + web on :5173
```

Open **http://localhost:5173** (site) and **http://localhost:5173/admin** (admin).

| Role | Email | Password (local) |
|---|---|---|
| Admin | admin@nexivo.dev | Admin@12345 |
| Editor | editor@nexivo.dev | Editor@12345 |

Stop with `Ctrl+C`, then `npm run db:down`.

### Scripts (repo root)

| Script | What it does |
|---|---|
| `npm run dev` | API (tsx watch) + Vite dev server together |
| `npm run setup` | install, `prisma generate`, `migrate deploy`, seed |
| `npm run seed` | idempotent seed (safe to run again; never overwrites admin edits) |
| `npm run db:up` / `db:down` | start / stop the MySQL container |
| `npm run db:studio` | Prisma Studio |
| `npm run db:migrate` | create a new migration after editing `schema.prisma` |
| `npm run build` | type-check the API + production build of the web app |
| `npm start` | API in production mode; serves `client/dist` too if it exists (open http://localhost:4000) |
| `npm run test:api` | end-to-end API smoke test (60+ checks, including security negatives) against a running API |

### Testing

- `npm run test:api` exercises every endpoint group and the negative cases: no cookie → 401, EDITOR on users → 403, bad body → 400, resume over 5 MB → 413, `.exe` renamed to `.pdf` → 400, SVG disguised as PNG → 400, draft blog hidden, closed job → 410, `<script>` stripped, duplicate slug → `-2`.
- `server/requests.http`: every endpoint, runnable from VS Code's REST Client.
- `server/scripts/mock-public-api.ts`: a read-only mock of the public API built from the seed content, for UI checks and Lighthouse without a database.

## Deploy (free tiers)

Order: **GitHub → TiDB Cloud → Render (API) → Vercel (web)**.

1. **GitHub:** in VS Code open the Source Control panel → **Publish to GitHub** → choose **Private**.
2. **TiDB Cloud** (https://tidbcloud.com): create a free **Serverless** cluster → *Connect* → choose "Prisma" or "General" → create a password → copy the connection string. Make sure it ends with `/nexivo?sslaccept=strict` (create the `nexivo` database in the SQL editor with `CREATE DATABASE nexivo;`).
3. **Seed TiDB once from your computer** with a NEW demo password:
   - PowerShell
     ```powershell
     cd server
     $env:DATABASE_URL="mysql://USER:PASS@HOST:4000/nexivo?sslaccept=strict"
     $env:ADMIN_PASSWORD="Showcase-Nexivo-26"; $env:EDITOR_PASSWORD="Editor-Nexivo-26"
     npx prisma migrate deploy; npm run seed
     ```
   - bash / zsh
     ```bash
     cd server
     DATABASE_URL="mysql://USER:PASS@HOST:4000/nexivo?sslaccept=strict" ADMIN_PASSWORD="Showcase-Nexivo-26" EDITOR_PASSWORD="Editor-Nexivo-26" \
       sh -c 'npx prisma migrate deploy && npm run seed'
     ```
   If a foreign-key migration fails on TiDB, add `relationMode = "prisma"` to the `datasource` block in `schema.prisma` (the `@@index`es already exist) and run again.
4. **Render** (https://render.com): *New → Blueprint* → pick the repo (it reads `render.yaml`). Then fill in:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | TiDB string from step 2 |
   | `CLIENT_URL` | your Vercel URL, e.g. `https://nexivo.vercel.app` |
   | `SITE_URL` | same Vercel URL |
   | `JWT_SECRET` | generated automatically by the Blueprint |
   | `NODE_VERSION`, `NODE_ENV`, `TRUST_PROXY`, `JWT_EXPIRES_IN` | pre-filled (24, production, 2, 7d) |

   Build: `npm ci --include=dev && npx prisma generate && npx prisma migrate deploy`. Start: `npm start`. Health check: `/api/health`. Copy the service URL (e.g. `https://nexivo-api.onrender.com`).
5. **Vercel** (https://vercel.com): *Add New → Project* → import the repo → **Root Directory: `client`** → Framework preset **Vite** → Deploy. If your Render URL is not `https://nexivo-api.onrender.com`, replace it in `client/vercel.json` and push.
6. Put the final Vercel URL into Render's `CLIENT_URL` and `SITE_URL` → *Manual Deploy*.

**Free-tier notes:** Render sleeps after ~15 minutes idle (the first request takes 30–60 s). Open `/api/health` a minute before a demo. Media survive redeploys because they are restored from the database.

### Demo credentials (live site)

`/admin` → **admin@nexivo.dev** / **Showcase-Nexivo-26** (demo-only; change it in *Profile* after the demo).

## Screenshots to take

1. Home hero (dark) on desktop, 2. services bento + process, 3. home on a phone (390 px), 4. blog article with table of contents (light mode), 5. careers apply form with a PDF attached, 6. admin dashboard, 7. blog editor with SEO preview, 8. Pages & sections drag-and-drop, 9. Settings → Theme with accent preview, 10. the inbox.

## Environment variables (server)

| Name | Purpose |
|---|---|
| `DATABASE_URL` | MySQL/TiDB URL (`?sslaccept=strict` enables TLS) |
| `JWT_SECRET` | 32+ random characters (the server refuses the example value in production) |
| `JWT_EXPIRES_IN` | session length, default `7d` |
| `CLIENT_URL` | allowed CORS origin(s), comma-separated |
| `SITE_URL` | public site URL for sitemap and robots |
| `TRUST_PROXY` | proxy hops in front of Express (0 local, 2 on Render behind Vercel) |
| `ADMIN_*`, `EDITOR_*` | seeded accounts (seed only) |
