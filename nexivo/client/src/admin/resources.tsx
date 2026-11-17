import type { ReactNode } from "react";
import type { ZodType } from "zod";
import { categorySchema, clientSchema, jobSchema, projectSchema, serviceSchema, tagSchema, teamSchema, testimonialSchema } from "@shared/models";
import type { ClientLogo, Job, Project, Service, TeamMember, Testimonial, Category, Tag } from "@/lib/types";
import { Icon } from "@/components/ui/icon";
import { StatusBadge } from "./components/kit";
import type { WithLayout } from "./components/FormKit";
import type { Column } from "./components/DataTable";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ResourceConfig<T = any> {
  path: string;
  title: string;
  singular: string;
  description: string;
  schema: ZodType<any, any>;
  fields: WithLayout[];
  columns: Column<T>[];
  defaults: Record<string, unknown>;
  orderable?: boolean;
  filters?: { key: string; label: string; options: { value: string; label: string }[] }[];
  publicPath?: (row: T) => string | null;
  /** Transform a row from the API into form values. */
  toForm?: (row: T) => Record<string, unknown>;
}

const thumb = (src: string | null | undefined, round = false): ReactNode =>
  src ? <img src={src} alt="" className={round ? "size-8 rounded-full object-cover" : "h-8 w-12 rounded object-cover"} loading="lazy" /> : <span className={round ? "block size-8 rounded-full bg-surface-2" : "block h-8 w-12 rounded bg-surface-2"} />;
const vis = (v: boolean) => <StatusBadge status={v ? "VISIBLE" : "HIDDEN"} />;
const title = (main: string, sub?: string | null) => <div className="min-w-0"><p className="truncate font-medium">{main}</p>{sub && <p className="truncate text-xs text-text-muted">{sub}</p>}</div>;
const visibleFilter = { key: "isVisible", label: "Visibility", options: [{ value: "true", label: "Visible" }, { value: "false", label: "Hidden" }] };
const visibleField: WithLayout = { name: "isVisible", label: "Visible on site", kind: "switch" };

export const RESOURCES: Record<string, ResourceConfig> = {
  services: {
    path: "services", title: "Services", singular: "Service", description: "What you offer. Shown in the bento grid and on /services.", schema: serviceSchema, orderable: true,
    defaults: { title: "", slug: "", shortDesc: "", description: "", features: [], icon: "code", image: "", isVisible: true },
    fields: [
      { name: "title", label: "Title", kind: "text", half: true }, { name: "slug", label: "URL slug", kind: "slug", half: true },
      { name: "icon", label: "Icon", kind: "icon", half: true }, visibleField,
      { name: "shortDesc", label: "Short description", kind: "textarea", hint: "Shown on cards (max 400 characters)" },
      { name: "image", label: "Cover image", kind: "image" }, { name: "features", label: "Features", kind: "strings", itemLabel: "Feature" },
      { name: "description", label: "Full description", kind: "richtext" },
    ],
    columns: [
      { key: "title", header: "Service", sortable: true, cell: (r: Service) => <div className="flex items-center gap-3"><Icon name={r.icon} className="size-4 text-brand-text" />{title(r.title, `/${r.slug}`)}</div> },
      { key: "isVisible", header: "Status", cell: (r: Service) => vis(r.isVisible) },
      { key: "updatedAt", header: "Updated", sortable: true, hideOnMobile: true, cell: (r: Service) => <span className="text-text-muted">{new Date(r.updatedAt).toLocaleDateString()}</span> },
    ],
    filters: [visibleFilter], publicPath: (r: Service) => `/services/${r.slug}`,
  },
  projects: {
    path: "projects", title: "Case studies", singular: "Case study", description: "Featured work with outcomes and metrics.", schema: projectSchema, orderable: true,
    defaults: { title: "", slug: "", client: "", industry: "", summary: "", content: "", cover: "", techStack: [], metrics: [], liveUrl: "", isVisible: true },
    fields: [
      { name: "title", label: "Title", kind: "text" }, { name: "slug", label: "URL slug", kind: "slug", half: true }, visibleField,
      { name: "client", label: "Client", kind: "text", half: true }, { name: "industry", label: "Industry", kind: "text", half: true },
      { name: "summary", label: "Summary", kind: "textarea" }, { name: "cover", label: "Cover image", kind: "image" },
      { name: "metrics", label: "Key metrics", kind: "list", itemLabel: "Metric", fields: [{ name: "value", label: "Value", kind: "text" }, { name: "label", label: "Label", kind: "text" }] },
      { name: "techStack", label: "Tech stack", kind: "strings", itemLabel: "Technology" }, { name: "liveUrl", label: "Live URL", kind: "url", half: true },
      { name: "content", label: "Story", kind: "richtext" },
    ],
    columns: [
      { key: "title", header: "Case study", sortable: true, cell: (r: Project) => <div className="flex items-center gap-3">{thumb(r.cover)}{title(r.title, r.client)}</div> },
      { key: "isVisible", header: "Status", cell: (r: Project) => vis(r.isVisible) },
    ],
    filters: [visibleFilter], publicPath: (r: Project) => `/work/${r.slug}`,
  },
  testimonials: {
    path: "testimonials", title: "Testimonials", singular: "Testimonial", description: "Client quotes for the carousel.", schema: testimonialSchema, orderable: true,
    defaults: { name: "", role: "", company: "", avatar: "", quote: "", rating: 5, isVisible: true },
    fields: [
      { name: "name", label: "Name", kind: "text", half: true }, { name: "company", label: "Company", kind: "text", half: true },
      { name: "role", label: "Role", kind: "text", half: true }, { name: "rating", label: "Rating (1 to 5)", kind: "number", half: true },
      { name: "quote", label: "Quote", kind: "textarea" }, { name: "avatar", label: "Photo", kind: "image" }, visibleField,
    ],
    columns: [
      { key: "name", header: "Person", sortable: true, cell: (r: Testimonial) => <div className="flex items-center gap-3">{thumb(r.avatar, true)}{title(r.name, `${r.role}, ${r.company}`)}</div> },
      { key: "quote", header: "Quote", hideOnMobile: true, cell: (r: Testimonial) => <p className="line-clamp-1 max-w-md text-text-muted">{r.quote}</p> },
      { key: "isVisible", header: "Status", cell: (r: Testimonial) => vis(r.isVisible) },
    ],
    filters: [visibleFilter],
  },
  team: {
    path: "team", title: "Team", singular: "Team member", description: "People shown on the About page.", schema: teamSchema, orderable: true,
    defaults: { name: "", role: "", bio: "", photo: "", linkedin: "", isVisible: true },
    fields: [
      { name: "name", label: "Name", kind: "text", half: true }, { name: "role", label: "Role", kind: "text", half: true },
      { name: "bio", label: "Short bio", kind: "textarea" }, { name: "photo", label: "Photo", kind: "image" },
      { name: "linkedin", label: "LinkedIn URL", kind: "url", half: true }, visibleField,
    ],
    columns: [
      { key: "name", header: "Member", sortable: true, cell: (r: TeamMember) => <div className="flex items-center gap-3">{thumb(r.photo, true)}{title(r.name, r.role)}</div> },
      { key: "isVisible", header: "Status", cell: (r: TeamMember) => vis(r.isVisible) },
    ],
    filters: [visibleFilter],
  },
  clients: {
    path: "clients", title: "Client logos", singular: "Client", description: "Logos in the home page marquee.", schema: clientSchema, orderable: true,
    defaults: { name: "", logo: "", url: "", isVisible: true },
    fields: [{ name: "name", label: "Company name", kind: "text", half: true }, { name: "url", label: "Website", kind: "url", half: true }, { name: "logo", label: "Logo", kind: "image" }, visibleField],
    columns: [
      { key: "name", header: "Client", sortable: true, cell: (r: ClientLogo) => <div className="flex items-center gap-3"><img src={r.logo} alt="" className="h-6 w-auto max-w-28" />{title(r.name)}</div> },
      { key: "isVisible", header: "Status", cell: (r: ClientLogo) => vis(r.isVisible) },
    ],
    filters: [visibleFilter],
  },
  categories: {
    path: "categories", title: "Categories", singular: "Category", description: "Group blog posts. Shown as filter chips on /blog.", schema: categorySchema,
    defaults: { name: "", slug: "" }, fields: [{ name: "name", label: "Name", kind: "text", half: true }, { name: "slug", label: "URL slug", kind: "slug", half: true }],
    columns: [
      { key: "name", header: "Category", sortable: true, cell: (r: Category) => title(r.name, r.slug) },
      { key: "posts", header: "Posts", cell: (r: Category) => <span className="tabular-nums text-text-muted">{r._count?.posts ?? 0}</span> },
    ],
  },
  tags: {
    path: "tags", title: "Tags", singular: "Tag", description: "Free-form labels. Tags are also created from the post editor.", schema: tagSchema,
    defaults: { name: "", slug: "" }, fields: [{ name: "name", label: "Name", kind: "text", half: true }, { name: "slug", label: "URL slug", kind: "slug", half: true }],
    columns: [
      { key: "name", header: "Tag", sortable: true, cell: (r: Tag) => title(`#${r.name}`, r.slug) },
      { key: "posts", header: "Posts", cell: (r: Tag) => <span className="tabular-nums text-text-muted">{r._count?.posts ?? 0}</span> },
    ],
  },
  jobs: {
    path: "jobs", title: "Jobs", singular: "Job", description: "Open positions on /careers.", schema: jobSchema,
    defaults: { title: "", slug: "", department: "", location: "", type: "FULL_TIME", experience: "", salary: "", summary: "", description: "", requirements: "", status: "OPEN" },
    fields: [
      { name: "title", label: "Job title", kind: "text" }, { name: "slug", label: "URL slug", kind: "slug", half: true },
      { name: "status", label: "Status", kind: "select", options: [{ value: "OPEN", label: "Open" }, { value: "CLOSED", label: "Closed" }] },
      { name: "department", label: "Department", kind: "text", half: true }, { name: "location", label: "Location", kind: "text", half: true },
      { name: "type", label: "Type", kind: "select", options: [{ value: "FULL_TIME", label: "Full-time" }, { value: "PART_TIME", label: "Part-time" }, { value: "CONTRACT", label: "Contract" }, { value: "INTERN", label: "Internship" }] },
      { name: "experience", label: "Experience", kind: "text", half: true }, { name: "salary", label: "Compensation", kind: "text", half: true },
      { name: "summary", label: "Summary", kind: "textarea" }, { name: "description", label: "Description", kind: "richtext" },
      { name: "requirements", label: "Requirements", kind: "richtext" },
    ],
    columns: [
      { key: "title", header: "Role", sortable: true, cell: (r: Job) => title(r.title, `${r.department} · ${r.location}`) },
      { key: "status", header: "Status", cell: (r: Job) => <StatusBadge status={r.status} /> },
      { key: "applications", header: "Applicants", hideOnMobile: true, cell: (r: Job) => <span className="tabular-nums text-text-muted">{r._count?.applications ?? 0}</span> },
      { key: "createdAt", header: "Posted", sortable: true, hideOnMobile: true, cell: (r: Job) => <span className="text-text-muted">{new Date(r.createdAt).toLocaleDateString()}</span> },
    ],
    filters: [{ key: "status", label: "Status", options: [{ value: "OPEN", label: "Open" }, { value: "CLOSED", label: "Closed" }] }],
    publicPath: (r: Job) => `/careers/${r.slug}`,
  },
};
