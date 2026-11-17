# Nexivo Technologies: IT company website + admin CMS

A modern, full-stack website for a fictional IT company, where **every word, image and menu on the public site is editable from an admin panel** with no redeploy.

## Live demo

| | |
|---|---|
| **Website** | https://nexivo-gilt.vercel.app |
| **Admin panel** | https://nexivo-gilt.vercel.app/admin/ |
| **Admin login** | `admin@nexivo.dev` / `Showcase-Nexivo-26` (demo-only account) |

The API runs on a free Render instance that sleeps when idle. If the site says "We couldn't load this", wait 30 to 60 seconds and press *Try again*.

## What it does

- **Public site:** Home, About, Services (list and detail), Blog (search, categories, pagination, table of contents), Careers (job list, job detail, apply form with PDF resume upload) and Contact.
- **Admin CMS:** dashboard with charts, a rich-text blog editor with SEO preview, a drag-and-drop page builder, CRUD for services, case studies, team, testimonials, client logos and jobs, an applications inbox with private resume download, a contact-message inbox, a media library, navigation and theme settings, per-page SEO, and user and role management.
- **Live edit:** change the hero headline, publish a post or add a job in `/admin` and it shows on the public site on refresh.

## Tech stack

| Layer | Technology |
|---|---|
| Front end | React 19, Vite, TypeScript, React Router 7, Tailwind CSS 4, shadcn/ui, Motion, Lenis, TanStack Query, React Hook Form + Zod, TipTap, Recharts, dnd-kit |
| Back end | Node.js, Express 5, TypeScript, Zod, JWT (httpOnly cookie), bcrypt, multer, sharp, sanitize-html, helmet, express-rate-limit |
| Database | MySQL 8 (TiDB Cloud in production) via Prisma 7 |
| Hosting | Vercel (client), Render (API), TiDB Cloud (database) |

## Highlights

- **Security:** httpOnly JWT cookie, ADMIN and EDITOR roles, Zod validation on body, query and params, sanitized rich text, magic-byte upload checks, private resumes, rate limits, honeypot fields.
- **Quality:** lazy-loaded routes, a separate admin bundle, SEO from the API (Open Graph, JSON-LD, sitemap), accessibility and reduced-motion support. Lighthouse: desktop 98 to 99 performance, 100 for accessibility, best practices and SEO.
- **Testing:** `npm run test:api` runs more than 60 end-to-end API checks, including security negatives (no cookie, wrong role, bad body, oversized or disguised uploads).

## Repository layout

```
nexivo/
├── render.yaml          Render Blueprint (API)
└── nexivo/
    ├── client/          React app (public site + /admin)
    ├── server/          Express API + Prisma schema, migrations and seed
    ├── docker-compose.yml   Local MySQL 8
    ├── README.md        Full setup, scripts, deployment guide
    ├── DEMO.md          3-minute live-edit walkthrough
    ├── REVIEW.md        Security and quality review
    └── TODO.md          Build plan and handoff log
```

## Run it locally

```bash
cd nexivo
cp server/.env.example server/.env
cp client/.env.example client/.env
npm run db:up      # MySQL 8 in Docker
npm run setup      # install, migrate, seed
npm run dev        # API on :4000, web on :5173
```

Open http://localhost:5173 and http://localhost:5173/admin (`admin@nexivo.dev` / `Admin@12345` locally). See [`nexivo/README.md`](nexivo/README.md) for details, deployment steps and environment variables.

## Author

Built by **Mahesh**, full-stack MERN developer.
