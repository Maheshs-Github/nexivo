import { z } from "zod";
import type { CrudConfig } from "./crudFactory.js";
import { sanitizeRich } from "../../utils/sanitize.js";
import {
  categorySchema, clientSchema, jobSchema, navSchema, projectSchema, sectionSchema, seoSchema,
  serviceSchema, tagSchema, teamSchema, testimonialSchema,
} from "../../schemas/models.js";

type Schema = CrudConfig["schema"];
const s = (schema: unknown) => schema as Schema;

/** Every content model that uses the generic admin CRUD (list/get/create/update/patch/delete/reorder). */
export const resources: Record<string, CrudConfig> = {
  services: { model: "service", label: "Service", schema: s(serviceSchema), searchFields: ["title", "shortDesc"], orderable: true, slugFrom: "title", richFields: ["description"], sortable: ["order", "title", "updatedAt"], filters: { isVisible: "bool" } },
  testimonials: { model: "testimonial", label: "Testimonial", schema: s(testimonialSchema), searchFields: ["name", "company", "quote"], orderable: true, sortable: ["order", "name", "company", "updatedAt"], filters: { isVisible: "bool" } },
  team: { model: "teamMember", label: "Team member", schema: s(teamSchema), searchFields: ["name", "role"], orderable: true, sortable: ["order", "name", "updatedAt"], filters: { isVisible: "bool" } },
  clients: { model: "clientLogo", label: "Client", schema: s(clientSchema), searchFields: ["name"], orderable: true, sortable: ["order", "name"], filters: { isVisible: "bool" } },
  projects: { model: "project", label: "Project", schema: s(projectSchema), searchFields: ["title", "client", "summary"], orderable: true, slugFrom: "title", richFields: ["content"], sortable: ["order", "title", "updatedAt"], filters: { isVisible: "bool" } },
  categories: { model: "category", label: "Category", schema: s(categorySchema), searchFields: ["name"], slugFrom: "name", sortable: ["name", "createdAt"], defaultSort: "name", include: { _count: { select: { posts: true } } } },
  tags: { model: "tag", label: "Tag", schema: s(tagSchema), searchFields: ["name"], slugFrom: "name", sortable: ["name", "createdAt"], defaultSort: "name", include: { _count: { select: { posts: true } } } },
  jobs: {
    model: "job", label: "Job", schema: s(jobSchema), searchFields: ["title", "department", "location"], slugFrom: "title",
    richFields: ["description", "requirements"], sortable: ["title", "createdAt", "updatedAt"], defaultSort: "-createdAt",
    filters: { status: "string", type: "string", department: "string" }, include: { _count: { select: { applications: true } } },
    patchSchema: s(z.object({ status: z.enum(["OPEN", "CLOSED"]) })),
  },
  nav: { model: "navItem", label: "Menu item", schema: s(navSchema), searchFields: ["label", "url"], orderable: true, sortable: ["order", "label"], filters: { location: "string", isVisible: "bool" } },
  sections: {
    model: "section", label: "Section", schema: s(sectionSchema), searchFields: ["label"], orderable: true, sortable: ["order", "updatedAt"],
    filters: { pageKey: "string", type: "string", isVisible: "bool" },
    filterAlias: { pageKey: "page" },
    patchSchema: s(z.object({ isVisible: z.boolean().optional(), label: z.string().trim().max(120).optional() })),
    // RICHTEXT sections carry HTML inside their JSON content: sanitise it like every other rich field.
    transform: (data) => {
      const content = data.content as Record<string, unknown> | undefined;
      if (content && typeof content.html === "string") data.content = { ...content, html: sanitizeRich(content.html) };
      return data;
    },
  },
  seo: { model: "pageSEO", label: "Page SEO", schema: s(seoSchema), searchFields: ["title"], sortable: ["page", "updatedAt"], defaultSort: "page" },
};
