/**
 * Idempotent seed: safe to run any number of times.
 * - Rows with a unique key (users, settings, slugs, SEO pages) are upserted without overwriting admin edits.
 * - Collections without a unique key (sections, nav, testimonials...) are only created when their table is empty.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma.js";
import type { Prisma } from "../src/generated/prisma/client.js";
import type { SectionType } from "../src/generated/prisma/enums.js";
import { readTimeOf } from "../src/utils/sanitize.js";
import { toSlug } from "../src/utils/slug.js";
import { cover, samplePdf } from "./seed/assets.js";
import { nav, pageSeo, sections, settings } from "./seed/site.js";
import * as catalog from "./seed/catalog.js";
import { postsA } from "./seed/posts-a.js";
import { draftPost, postsB } from "./seed/posts-b.js";
import { applicants, jobs, messages } from "./seed/careers.js";

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000 - Math.round(Math.random() * 6) * 3_600_000);

function need(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} in server/.env`);
  return v;
}

async function users() {
  const make = async (role: "ADMIN" | "EDITOR", prefix: "ADMIN" | "EDITOR", title: string) => {
    const email = need(`${prefix}_EMAIL`).toLowerCase();
    const name = process.env[`${prefix}_NAME`] ?? (role === "ADMIN" ? "Site Admin" : "Content Editor");
    return prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name, role, title, passwordHash: await bcrypt.hash(need(`${prefix}_PASSWORD`), 12), avatar: null,
        bio: role === "ADMIN" ? "Co-founder of Nexivo. Writes about engineering leadership, AI and running software at scale." : "Leads design and content at Nexivo. Writes about design systems, UX and frontend craft." },
    });
  };
  return { admin: await make("ADMIN", "ADMIN", "Co-founder & CEO"), editor: await make("EDITOR", "EDITOR", "Head of Design") };
}

async function onlyIfEmpty(count: () => Promise<number>, create: () => Promise<unknown>) {
  if ((await count()) === 0) await create();
}

async function main() {
  console.log("Seeding Nexivo...");
  const { admin, editor } = await users();

  for (const [key, value] of Object.entries(settings())) {
    await prisma.siteSetting.upsert({ where: { key }, update: {}, create: { key, value } });
  }
  await onlyIfEmpty(() => prisma.navItem.count(), () => prisma.navItem.createMany({ data: nav }));
  await onlyIfEmpty(() => prisma.section.count(), async () => {
    for (const [page, list] of Object.entries(sections)) {
      await prisma.section.createMany({ data: list.map((s, order) => ({ page: page as keyof typeof sections, type: s.type as SectionType, label: s.label ?? null, order, content: s.content as Prisma.InputJsonValue })) });
    }
  });
  for (const seo of pageSeo()) {
    await prisma.pageSEO.upsert({ where: { page: seo.page }, update: {}, create: { ...seo, ogImage: cover(`og-${seo.page.toLowerCase()}.svg`, 0, "orbits") } });
  }

  for (const [order, s] of catalog.services().entries()) await prisma.service.upsert({ where: { slug: s.slug }, update: {}, create: { ...s, order } });
  await onlyIfEmpty(() => prisma.testimonial.count(), () => prisma.testimonial.createMany({ data: catalog.testimonials().map((t, order) => ({ ...t, order })) }));
  await onlyIfEmpty(() => prisma.teamMember.count(), () => prisma.teamMember.createMany({ data: catalog.team().map((t, order) => ({ ...t, order })) }));
  await onlyIfEmpty(() => prisma.clientLogo.count(), () => prisma.clientLogo.createMany({ data: catalog.clients().map((c, order) => ({ ...c, order })) }));
  for (const [order, p] of catalog.projects().entries()) await prisma.project.upsert({ where: { slug: p.slug }, update: {}, create: { ...p, order } });

  // Blog: categories, tags, posts (+ one draft that must never appear publicly)
  const allPosts = [...postsA, ...postsB];
  for (const [i, p] of [...allPosts, draftPost].entries()) {
    const category = await prisma.category.upsert({ where: { slug: toSlug(p.category) }, update: {}, create: { name: p.category, slug: toSlug(p.category) } });
    const tags = await Promise.all(p.tags.map((name) => prisma.tag.upsert({ where: { slug: toSlug(name) }, update: {}, create: { name, slug: toSlug(name) } })));
    const isDraft = p === draftPost;
    const content = p.content.trim();
    await prisma.blogPost.upsert({
      where: { slug: p.slug }, update: {},
      create: {
        title: p.title, slug: p.slug, excerpt: p.excerpt, content, readTime: readTimeOf(content), featured: !!p.featured,
        coverImage: cover(`blog-${p.slug}.svg`, i, (["orbits", "bars", "nodes"] as const)[i % 3]),
        status: isDraft ? "DRAFT" : "PUBLISHED", publishedAt: isDraft ? null : daysAgo(p.daysAgo),
        views: isDraft ? 0 : 180 + ((i * 937) % 2400), authorId: p.author === "admin" ? admin.id : editor.id, categoryId: category.id,
        seoTitle: p.title.length > 60 ? `${p.title.slice(0, 57)}...` : p.title, seoDescription: p.excerpt.slice(0, 160),
        tags: { create: tags.map((t) => ({ tagId: t.id })) },
      },
    });
  }

  for (const j of jobs()) {
    const { daysAgo: d, ...data } = j;
    await prisma.job.upsert({ where: { slug: j.slug }, update: {}, create: { ...data, createdAt: daysAgo(d) } });
  }
  await onlyIfEmpty(() => prisma.application.count(), async () => {
    for (const a of applicants) {
      const job = await prisma.job.findUniqueOrThrow({ where: { slug: a.job }, select: { id: true } });
      await prisma.application.create({ data: {
        jobId: job.id, name: a.name, email: a.email, status: a.status, createdAt: daysAgo(a.daysAgo), phone: "+91 98450 00000",
        coverLetter: `Hi Nexivo team, I'd love to be considered for this role. I have been following your engineering blog and would enjoy working on the kind of products you build.`,
        resumeUrl: `seed-${toSlug(a.name)}.pdf`, resumeData: new Uint8Array(samplePdf(`${a.name} - Resume`)),
      } });
    }
  });
  await onlyIfEmpty(() => prisma.contactMessage.count(), () =>
    prisma.contactMessage.createMany({ data: messages.map(({ daysAgo: d, ...m }) => ({ ...m, phone: null, createdAt: daysAgo(d) })) }));

  const counts = {
    User: await prisma.user.count(), SiteSetting: await prisma.siteSetting.count(), NavItem: await prisma.navItem.count(), Section: await prisma.section.count(),
    Service: await prisma.service.count(), Testimonial: await prisma.testimonial.count(), TeamMember: await prisma.teamMember.count(),
    ClientLogo: await prisma.clientLogo.count(), Project: await prisma.project.count(), Category: await prisma.category.count(), Tag: await prisma.tag.count(),
    BlogPost: await prisma.blogPost.count(), Job: await prisma.job.count(), Application: await prisma.application.count(),
    ContactMessage: await prisma.contactMessage.count(), PageSEO: await prisma.pageSEO.count(), Media: await prisma.media.count(),
  };
  console.table(counts);
  console.log("Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
