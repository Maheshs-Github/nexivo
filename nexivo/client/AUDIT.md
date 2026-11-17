# Phase 6 audit (public site + admin)

Method: static scans (grep for raw values, alt text, motion use), `npx depcheck`, headless Chrome renders of every route
against the seed-data mock API (`server/scripts/mock-public-api.ts`), screenshots at 1440 / 412 px in dark and light
mode, and Lighthouse 12 (mobile and desktop presets) on the production build served compressed.

Ranked by severity. **Status: all items fixed or explicitly accepted.**

| # | Severity | Area | Finding | Fix |
|---|---|---|---|---|
| 1 | High | Performance | The entry chunk carried `motion` (~45 KB gz) and the Radix dialog because the layout used them (scroll bar, route fade, mobile drawer). | Scroll progress uses a CSS scroll-driven animation; the route fade uses tw-animate classes; the drawer is lazy-loaded on first tap; sonner's Toaster is lazy. Entry 161 → 103 KB gz. |
| 2 | High | Performance | Inner-page LCP (the page header `h1`) waited on every section component and on motion. | The section registry lazy-loads each section; `PageHeader` is motion-free and bundled; motion-free primitives are split from `shared.tsx`; the contact form is lazy behind a same-size skeleton. |
| 3 | High | Performance / CLS | With the layout eager, the footer jumped as page content arrived (CLS 1.49). | `main` reserves `min-h-svh` while a route loads. CLS 0. |
| 4 | High | LCP | The hero headline and page headers started at `opacity: 0`, so Chrome ignored them as LCP candidates until animations ended. | Page headers render without a reveal; the hero reveal starts at 0.01 opacity. |
| 5 | Medium | Performance | The Google Fonts stylesheet blocked first paint (~0.9 s), and the late font swap re-triggered LCP. | Preload + async attach (`theme-init.js`, CSP-safe); metric-matched `Sora Fallback` / `Inter Fallback` faces. |
| 6 | Medium | Performance | Data requests started only after route chunks loaded. | `lib/prefetch.ts` starts settings, nav, current-page sections (and the hero chunk on `/`) before React mounts. |
| 7 | Medium | SEO | `robots.txt` had a relative `Sitemap:` line (Lighthouse SEO 92). | `robots.txt` is served by the API with an absolute URL from `SITE_URL` (proxied in dev and by the Vercel rewrite). SEO 100. |
| 8 | Medium | Hardcoded content | The apply panel intro ("It takes about three minutes…") was in code. | Moved to `Settings → Page copy → applyFormIntro`. |
| 9 | Medium | Tokens | Eight one-off `text-[clamp(...)]` sizes. | Promoted to type tokens `h3-lg`, `quote`, `stat`, `mega` (DESIGN.md §3). 0 left. |
| 10 | Low | Layout | Very tall screens stretched the hero (92 svh). | Capped at `min(92svh, 56rem)`. |
| 11 | Low | Copy | The announcement pill lowercased its first word ("our 2026…") after stripping "New:". | No stripping; the seed copy starts with a capital. |
| 12 | Low | Section numbering | Eyebrow-less STATS consumed "01", so Services showed "02". | Only sections with an eyebrow are numbered. |
| 13 | Low | Spacing | Section rhythm too airy on desktop (9 rem). | `--section-y: clamp(4.5rem, 3rem + 5vw, 7.5rem)`. |
| 14 | Low | Admin | The SEO snippet preview used raw hex colours. | Uses `text-brand-text`. |

## Checks that passed

- **Contrast:** `--text-muted` is 6.4:1 (dark) and 7.6:1 (light); brand text and buttons ≥ 4.5:1 in both themes (`--brand-text` and `--brand-strong` are derived with `color-mix`). Lighthouse Accessibility is **100** on every audited page.
- **Focus and alt text:** a global `:focus-visible` ring; every `<img>` has `alt` (decorative ones `alt=""`); team portraits and case-study covers use names and titles from the API.
- **Reduced motion:** Lenis off, Reveal/Stagger/Hero/Testimonials/Timeline/CountUp static, marquee and aurora stopped, scroll bar hidden.
- **Layouts:** 1440 and 412 px reviewed from real renders (Lighthouse mobile emulation); 768/1024 use the md/lg grid breakpoints of the same components. No horizontal overflow.
- **Console errors:** Lighthouse "errors-in-console" passes (Best Practices 100) on all audited pages.
- **Bundle:** no TipTap, Recharts or dnd-kit in public chunks (verified by grepping `dist/`).
- **depcheck:** reports `tw-animate-css`, `tailwindcss`, `@tailwindcss/typography` and `shadcn` as unused, but they are used from CSS (`@import` / `@plugin`). `@shared/*` aliases are reported as missing (a path alias). No real unused deps.

## Lighthouse (production build, compressed)

| Page | Mobile Perf | Desktop Perf | A11y | Best practices | SEO |
|---|---|---|---|---|---|
| Home | 82–83 | 99 | 100 | 100 | 100 |
| Blog article | 84–85 | 99 | 100 | 100 | 100 |
| About / Careers / Services | 83–85 | n/a | 100 | 100 | 100 |
| Contact | 82 | 98 | 100 | 100 | 100 |

Mobile Performance is capped by client-side rendering under Lighthouse's throttled profile (simulated slow 4G and 4× CPU slowdown).
Every other category is 100. **Next step for 90+ on mobile:** prerender public routes at build time (e.g. React Router
framework mode) so the first paint is HTML. Logged in TODO.md.

> QA note: Chrome `--screenshot` with `--virtual-time-budget` can capture the lazy home page before it mounts (blank main). Use Lighthouse full-page screenshots (real time) for visual checks.
