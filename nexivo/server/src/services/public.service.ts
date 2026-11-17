import { prisma } from "../lib/prisma.js";
import type { Page } from "../generated/prisma/enums.js";
import { listPosts } from "./blog.service.js";

const visible = { isVisible: true } as const;
const byOrder = [{ order: "asc" as const }, { id: "asc" as const }];

export const publicServices = () => prisma.service.findMany({ where: visible, orderBy: byOrder });
export const publicTestimonials = () => prisma.testimonial.findMany({ where: visible, orderBy: byOrder });
export const publicTeam = () => prisma.teamMember.findMany({ where: visible, orderBy: byOrder });
export const publicClients = () => prisma.clientLogo.findMany({ where: visible, orderBy: byOrder });
export const publicProjects = () => prisma.project.findMany({ where: visible, orderBy: byOrder, omit: { content: true } });

export const publicNav = () =>
  prisma.navItem.findMany({ where: visible, orderBy: byOrder, select: { id: true, label: true, url: true, location: true, group: true } });

/** Loads the data a data-driven section needs, so a page renders from a single request. */
async function sectionData(type: string) {
  switch (type) {
    case "CLIENTS": return publicClients();
    case "SERVICES": return publicServices();
    case "CASE_STUDIES": return publicProjects();
    case "TESTIMONIALS": return publicTestimonials();
    case "TEAM": return publicTeam();
    case "BLOGS": return (await listPosts({ page: 1, limit: 3 }, true)).items;
    default: return undefined;
  }
}

export async function pageSections(page: Page) {
  const sections = await prisma.section.findMany({
    where: { page, ...visible }, orderBy: byOrder, select: { id: true, type: true, label: true, content: true },
  });
  const cache = new Map<string, Promise<unknown>>();
  return Promise.all(sections.map(async (s) => {
    if (!cache.has(s.type)) cache.set(s.type, sectionData(s.type));
    const data = await cache.get(s.type);
    return data === undefined ? s : { ...s, data };
  }));
}

export const pageSeo = (page: Page) => prisma.pageSEO.findUnique({ where: { page } });

export const openJobs = () =>
  prisma.job.findMany({ where: { status: "OPEN" }, orderBy: { createdAt: "desc" }, omit: { description: true, requirements: true } });
