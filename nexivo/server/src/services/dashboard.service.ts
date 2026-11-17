import { prisma } from "../lib/prisma.js";

const DAYS = 30;

/** Buckets rows by local calendar day for the last 30 days (zero-filled). */
function perDay(rows: { createdAt: Date }[], since: Date) {
  const key = (d: Date) => d.toISOString().slice(0, 10);
  const counts = new Map<string, number>();
  for (const r of rows) counts.set(key(r.createdAt), (counts.get(key(r.createdAt)) ?? 0) + 1);
  return Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(since.getTime() + i * 86_400_000);
    return { date: key(d), count: counts.get(key(d)) ?? 0 };
  });
}

export async function dashboardStats() {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (DAYS - 1));

  const [
    posts, published, drafts, services, projects, jobsOpen, applications, newApplications, messages, unread, views,
    latestPosts, latestApplications, latestMessages, topPosts, appRows, msgRows,
  ] = await Promise.all([
    prisma.blogPost.count(),
    prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
    prisma.blogPost.count({ where: { status: "DRAFT" } }),
    prisma.service.count(),
    prisma.project.count(),
    prisma.job.count({ where: { status: "OPEN" } }),
    prisma.application.count(),
    prisma.application.count({ where: { status: "NEW" } }),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.blogPost.aggregate({ _sum: { views: true } }),
    prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" }, take: 5, select: { id: true, title: true, status: true, updatedAt: true, views: true } }),
    prisma.application.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, status: true, createdAt: true, job: { select: { title: true } } } }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, subject: true, isRead: true, createdAt: true } }),
    prisma.blogPost.findMany({ where: { status: "PUBLISHED" }, orderBy: { views: "desc" }, take: 5, select: { id: true, title: true, slug: true, views: true } }),
    prisma.application.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.contactMessage.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
  ]);

  const apps = perDay(appRows, since);
  const msgs = perDay(msgRows, since);
  return {
    counts: { posts, published, drafts, services, projects, jobsOpen, applications, newApplications, messages, unread, views: views._sum.views ?? 0 },
    latestPosts, latestApplications, latestMessages, topPosts,
    activity: apps.map((a, i) => ({ date: a.date, applications: a.count, messages: msgs[i].count })),
  };
}

/** Lightweight counts for sidebar badges. */
export async function badgeCounts() {
  const [unread, newApplications] = await Promise.all([
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.application.count({ where: { status: "NEW" } }),
  ]);
  return { unread, newApplications };
}
