# Nexivo: 3-minute live-edit demo

## Pre-demo checklist (10 minutes before)

- [ ] Open `https://nexivo-gilt.vercel.app/api/health` and wait for `"database":"up"`. This wakes the free Render API; the first request can take 30–60 s.
- [ ] Open the home page once so images are cached.
- [ ] Sign in at `/admin` in a second tab (**admin@nexivo.dev** / your demo password).
- [ ] Have a small PDF resume on the desktop (any PDF under 5 MB).
- [ ] Browser zoom 100%, dark mode, notifications off, one window with two tabs: **Site** and **Admin**.
- [ ] Optional backup: run it locally (`npm run db:up && npm run dev`).

## Script (about 3 minutes)

| Time | Do | Say |
|---|---|---|
| 0:00 | **Site tab:** scroll the home page slowly (hero, logos, counters, services bento, process, case studies). | "This is Nexivo's site. Every word and image here comes from the CMS; nothing is hardcoded." |
| 0:30 | Toggle light/dark, open the mobile menu at a narrow width. | "Dark-first design system, light mode, accessible and responsive." |
| 0:45 | **Admin tab → Pages & sections → Home → Hero.** Change the headline (e.g. "We build software that wins markets") and the highlight words. Save. | "Marketing can edit any section, with validation from the same schema the site uses." |
| 1:05 | **Site tab:** refresh. | "Live: no redeploy, no developer." |
| 1:15 | **Admin → Blog posts → New post.** Title, excerpt, two paragraphs with an H2, pick a cover from the library, add a tag, watch the SEO preview. Click **Publish**. | "A real editor: TipTap, SEO snippet, read time, drafts." |
| 1:45 | **Site → Blog:** the post is first; open it to show the table of contents and share links. | |
| 2:00 | **Admin → Jobs → New job** (title, department, location). Save. **Site → Careers:** it's listed. Open it, attach the PDF, submit. | "Applications are validated: PDF only, max 5 MB, checked by file signature." |
| 2:30 | **Admin → Applications:** the new applicant is there (badge in the sidebar). Change the status, download the resume. **Inbox:** show a message. | "Resumes are private: only signed-in staff can download them." |
| 2:50 | **Settings → Theme:** drag the accent colour and save; refresh the site. | "Even the brand colour is content." |

## If something goes wrong

- **Site shows "We couldn't load this":** the API is waking up. Wait 30 s and press *Try again*.
- **Login says "Too many sign-in attempts":** wait one minute (rate limit).
- **Upload fails:** use a JPG/PNG/WebP under 5 MB (SVG is blocked on purpose).
