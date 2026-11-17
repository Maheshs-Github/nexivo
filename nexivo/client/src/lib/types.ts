import type { PageKey, SectionType } from "@shared/sections";

export type { PageKey, SectionType };

export interface Paged<T> { items: T[]; total: number; page: number; pages: number }

export interface Settings {
  general: { siteName: string; tagline: string; description: string; logo: string; favicon: string; announcement: string; announcementUrl: string };
  contact: { email: string; salesEmail: string; careersEmail: string; phone: string; whatsapp: string; address: string; city: string; hours: string; mapEmbedUrl: string };
  social: { linkedin: string; x: string; github: string; instagram: string; dribbble: string; youtube: string };
  footer: { about: string; copyright: string; ctaHeading: string; ctaText: string; ctaLabel: string; ctaUrl: string };
  theme: { accent: string; defaultMode: "dark" | "light" };
  seo: { titleTemplate: string; defaultTitle: string; defaultDescription: string; ogImage: string; twitterHandle: string; keywords: string };
  pages: {
    notFoundTitle: string; notFoundText: string; applySuccessTitle: string; applySuccessText: string; contactSuccessTitle: string;
    contactSuccessText: string; closedJobTitle: string; closedJobText: string; contactFormHeading: string; contactFormText: string; applyFormIntro: string;
  };
}

export interface NavItem { id: number; label: string; url: string; location: "HEADER" | "FOOTER"; group: string | null; order?: number; isVisible?: boolean }
export interface Nav { header: NavItem[]; footer: NavItem[] }

export interface Section<C = Record<string, unknown>> { id: number; type: SectionType; label: string | null; content: C; data?: unknown }

export interface Service {
  id: number; title: string; slug: string; shortDesc: string; description: string; features: string[] | null;
  icon: string; image: string | null; order: number; isVisible: boolean; updatedAt: string;
}
export interface ServiceDetail extends Service { others: Pick<Service, "id" | "title" | "slug" | "shortDesc" | "icon">[] }

export interface Testimonial { id: number; name: string; role: string; company: string; avatar: string | null; quote: string; rating: number; order: number; isVisible: boolean }
export interface TeamMember { id: number; name: string; role: string; bio: string | null; photo: string | null; linkedin: string | null; order: number; isVisible: boolean }
export interface ClientLogo { id: number; name: string; logo: string; url: string | null; order: number; isVisible: boolean }

export interface Project {
  id: number; title: string; slug: string; client: string | null; industry: string | null; summary: string; content?: string;
  cover: string | null; techStack: string[] | null; metrics: { value: string; label: string }[] | null; liveUrl: string | null; order: number; isVisible: boolean;
}

export interface Category { id: number; name: string; slug: string; _count?: { posts: number } }
export interface Tag { id: number; name: string; slug: string; _count?: { posts: number } }
export interface Author { id: number; name: string; title: string | null; bio: string | null; avatar: string | null }

export interface BlogPost {
  id: number; title: string; slug: string; excerpt: string; content?: string; coverImage: string | null;
  status: "DRAFT" | "PUBLISHED"; publishedAt: string | null; readTime: number; views: number; featured: boolean;
  seoTitle: string | null; seoDescription: string | null; categoryId: number | null; createdAt: string; updatedAt: string;
  author: Author | null; category: Category | null; tags: Tag[];
}

export type JobType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN";
export interface Job {
  id: number; title: string; slug: string; department: string; location: string; type: JobType; experience: string; salary: string | null;
  summary: string; description?: string; requirements?: string; status: "OPEN" | "CLOSED"; createdAt: string; updatedAt: string;
  _count?: { applications: number };
}

export type ApplicationStatus = "NEW" | "REVIEWING" | "SHORTLISTED" | "REJECTED" | "HIRED";
export interface Application {
  id: number; jobId: number; name: string; email: string; phone: string | null; linkedin: string | null; resumeUrl: string;
  coverLetter: string | null; status: ApplicationStatus; createdAt: string; job: { id: number; title: string; slug: string };
}

export interface ContactMessage { id: number; name: string; email: string; phone: string | null; company: string | null; subject: string; message: string; isRead: boolean; createdAt: string }
export interface Media { id: number; url: string; filename: string; mimeType: string; size: number; width: number | null; height: number | null; alt: string | null; createdAt: string }
export interface PageSeo { id: number; page: PageKey; title: string; description: string; ogImage: string | null }

export type Role = "ADMIN" | "EDITOR";
export interface User { id: number; name: string; email: string; role: Role; title: string | null; avatar: string | null; bio?: string | null; createdAt?: string; _count?: { posts: number } }
