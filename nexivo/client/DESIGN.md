# Nexivo — Design System

A premium engineering studio, dark-first. The reference bar is Linear, Vercel and Stripe: confident type,
hairline structure, one memorable hero moment, restraint everywhere else.
Every value below exists as a CSS variable or Tailwind token in `src/index.css`. Components never use raw hex
values or one-off spacing.

## 1. Principles

1. **One hero moment.** The aurora and the cursor glow only appear in the hero. Every other section stays quiet.
2. **Structure over decoration.** Hairline borders, a 12-column grid and section indices (`01 — Services`)
   carry the layout. Gradients are rare: the hero highlight words, the CTA banner border and focus glows.
3. **Asymmetry.** Section intros sit left-aligned in a 5/7 split. Services use a bento grid, case studies alternate
   large and small, and the process is a vertical rail. Nothing is "three identical cards, centred".
4. **Content is data.** Every heading, list, image and CTA comes from the API. Components handle missing fields
   gracefully: no field, no element.
5. **Motion explains, never decorates.** Short reveals (≤ 600 ms), no bounce, and nothing loops except the
   aurora and the marquee. All of it switches off under `prefers-reduced-motion`.

## 2. Colour tokens

| Token | Dark (default) | Light | Use |
|---|---|---|---|
| `--bg` | `#0B1020` | `#F8FAFF` | Page background |
| `--bg-elevated` | `#0E1428` | `#FFFFFF` | Alternate section band |
| `--surface` | `#121936` | `#FFFFFF` | Cards, inputs |
| `--surface-2` | `#18204A` | `#EEF1FB` | Hover, chips |
| `--line` | `rgb(255 255 255 / 0.08)` | `rgb(11 16 32 / 0.09)` | Hairlines |
| `--line-strong` | `rgb(255 255 255 / 0.14)` | `rgb(11 16 32 / 0.16)` | Inputs, hover borders |
| `--text` | `#E6E9F5` | `#0B1020` | Body copy |
| `--text-muted` | `#8B93B5` | `#4A5275` | Secondary copy (≥ 4.5:1 in both themes) |
| `--brand` | `#6366F1` (from Settings → Theme) | same | Primary actions, focus |
| `--brand-2` | `#22D3EE` | `#0891B2` | Accent: gradient end, live dots |
| `--brand-text` | brand mixed 55% with white | brand mixed 80% with black | Brand-coloured text that passes contrast |
| `--brand-strong` | brand mixed 88% with black | same | Button fill (white label ≥ 4.5:1) |

The accent colour is editable in the admin. It is written to `--brand` at runtime, and every derived token uses
`color-mix()`, so the whole site follows it.

## 3. Typography

- **Display:** Sora 600/700, tracking `-0.035em` at display sizes and `-0.02em` at headings.
- **Body:** Inter 400/500, 1.65 line height. Numbers use `tabular-nums`.
- Loaded from Google Fonts with `display=swap` and preconnect hints.

| Step | Size (fluid) | Line height | Use |
|---|---|---|---|
| `display` | `clamp(2.75rem, 1.6rem + 5.2vw, 5.75rem)` | 1.02 | Hero headline only |
| `h1` | `clamp(2.25rem, 1.6rem + 2.8vw, 3.75rem)` | 1.08 | Page headers |
| `h2` | `clamp(1.875rem, 1.4rem + 1.9vw, 3rem)` | 1.1 | Section headings |
| `h3` | `1.375rem` | 1.25 | Card titles |
| `h3-lg` | `clamp(1.5rem, 1.2rem + 1vw, 2.125rem)` | 1.2 | Feature card and case-study titles |
| `quote` | `clamp(1.25rem, 1.05rem + 1vw, 2rem)` | 1.35 | Testimonials, mission statements |
| `stat` | `clamp(2.25rem, 1.6rem + 2.4vw, 3.5rem)` | 1 | Counters and metrics |
| `mega` | `clamp(6rem, 4rem + 12vw, 12rem)` | 1 | 404 numeral only |
| `lead` | `clamp(1.0625rem, 1rem + 0.35vw, 1.25rem)` | 1.6 | Intros |
| `body` | `1rem` | 1.65 | Default |
| `small` | `0.875rem` | 1.5 | Meta |
| `eyebrow` | `0.75rem`, uppercase, tracking `0.14em`, 500 | 1 | Section labels |

## 4. Space, containers, radius

- 4 px base scale (Tailwind spacing). Section rhythm is `--section-y: clamp(4.5rem, 3rem + 5vw, 7.5rem)`.
- Containers: `.container-x` has a max width of `76rem` with a fluid gutter of `clamp(1rem, 4vw, 2rem)` (16 px at 360 px).
  `.container-prose` is `44rem` (articles).
- Grid: 12 columns, `gap-6` on mobile and `gap-8` on desktop. Section intros span 5 columns (heading) + 7 (text).
- Radius: `--radius` = 1rem (cards: rounded-2xl). Buttons are fully rounded (`rounded-full`). Inputs are `rounded-xl`.

## 5. Elevation, glass and glow

- **Glass card** (`.glass`): `--surface` at 55% + `backdrop-blur(16px)`, a 1 px `--line` border, and an inner top
  highlight `inset 0 1px 0 rgb(255 255 255 / .05)`. Light mode drops the blur and uses a solid surface with a soft shadow.
- **Spotlight card** (`.spotlight`): a radial glow follows the cursor via `--mx/--my`. Used only on the services bento.
- **Shadows:** `--shadow-sm` for inputs, `--shadow-lg: 0 30px 60px -30px rgb(0 0 0 / .6)` for floating panels.
- **Glow:** `--glow: 0 0 0 1px color-mix(brand 40%), 0 10px 40px -10px color-mix(brand 60%)` on the primary button hover.

## 6. Gradient recipes (use only here)

- `.text-gradient`: `linear-gradient(100deg, --brand-text 10%, --brand-2 90%)`, for the hero highlight words.
- `.border-gradient`: a 1 px mask border from brand to brand-2, for the CTA banner and the featured case study.
- **Aurora** (hero only): three blurred radial blobs (brand, brand-2, violet) drifting on 18–26 s loops, under a
  masked 64 px grid and a 3% SVG noise layer.

## 7. Motion rules

- Easing: `--ease-out: cubic-bezier(.16, 1, .3, 1)`. Durations: 150 ms (hover), 300 ms (UI), 600 ms (reveals).
- Reveal: fade + 12 px rise, staggered 60 ms, triggered once at 15% visibility.
- Hero headline: word-by-word reveal (blur 8px → 0, y 24 → 0), 70 ms stagger.
- Count-up stats: 1.4 s ease-out, triggered once in view.
- Route transition: 200 ms fade + 6 px rise. The scroll position resets to the top.
- Lenis smooth scroll with `lerp 0.1`. Disabled, together with the aurora drift, the marquee and the reveals, under `prefers-reduced-motion`.

## 8. Components

- **Buttons:** `primary` (brand-strong fill, white label, glow on hover), `secondary` (surface fill, line
  border) and `ghost`. Height 44 px (touch target). An arrow icon nudges 2 px on hover.
- **Focus:** `outline: 2px solid var(--brand-2); outline-offset: 3px` on every interactive element.
- **Chips:** height 32 px, `--surface-2`, rounded-full. The active chip is brand-tinted.
- **Section intro:** an eyebrow with an index (`01`) and a short line, the h2 at 5 columns, the lead at 7 columns, aligned to the bottom.
- **Navbar:** 64 px tall, sticky, `bg` at 70% + blur once scrolled, with a hairline bottom border. The mobile drawer is a
  full-height sheet with a focus trap and Esc to close.
- **Images:** always `width`/`height`, `loading="lazy"` except in the hero, `decoding="async"`.

## 9. Admin

The admin panel shares the same tokens. It is quieter and denser: 14 px base, a 56 px topbar, a 248 px sidebar,
1 px borders and no glass or aurora. Its look follows Linear and Vercel dashboards.
