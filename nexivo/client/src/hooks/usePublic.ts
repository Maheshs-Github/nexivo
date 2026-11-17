import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  BlogPost, Category, Job, Nav, PageKey, PageSeo, Paged, Project, Section, Service, ServiceDetail, Settings,
} from "@/lib/types";

const minute = 60_000;

export const publicKeys = {
  settings: ["public", "settings"] as const,
  nav: ["public", "nav"] as const,
  sections: (page: PageKey) => ["public", "sections", page] as const,
  seo: (page: PageKey) => ["public", "seo", page] as const,
};

export const useSettings = () => useQuery({ queryKey: publicKeys.settings, queryFn: () => api.get<Settings>("/settings"), staleTime: 5 * minute });
export const useNav = () => useQuery({ queryKey: publicKeys.nav, queryFn: () => api.get<Nav>("/nav"), staleTime: 5 * minute });

export const useSections = (page: PageKey) =>
  useQuery({ queryKey: publicKeys.sections(page), queryFn: () => api.get<Section[]>(`/pages/${page.toLowerCase()}/sections`), staleTime: minute });

export const usePageSeo = (page: PageKey) =>
  useQuery({ queryKey: publicKeys.seo(page), queryFn: () => api.get<PageSeo | null>(`/seo/${page.toLowerCase()}`), staleTime: 5 * minute });

export const useServices = () => useQuery({ queryKey: ["public", "services"], queryFn: () => api.get<Service[]>("/services"), staleTime: minute });
export const useService = (slug: string) =>
  useQuery({ queryKey: ["public", "service", slug], queryFn: () => api.get<ServiceDetail>(`/services/${slug}`), staleTime: minute });

export const useProject = (slug: string) =>
  useQuery({ queryKey: ["public", "project", slug], queryFn: () => api.get<Project>(`/projects/${slug}`), staleTime: minute });

export interface BlogFilters { page?: number; q?: string; category?: string; tag?: string; limit?: number }
export const useBlogs = (f: BlogFilters) =>
  useQuery({
    queryKey: ["public", "blogs", f],
    queryFn: () => api.get<Paged<BlogPost>>("/blogs", { page: f.page, q: f.q, category: f.category, tag: f.tag, limit: f.limit ?? 9 }),
    placeholderData: keepPreviousData, staleTime: minute,
  });
export const useBlog = (slug: string) =>
  useQuery({ queryKey: ["public", "blog", slug], queryFn: () => api.get<{ post: BlogPost; related: BlogPost[] }>(`/blogs/${slug}`), staleTime: minute });
export const useCategories = () => useQuery({ queryKey: ["public", "categories"], queryFn: () => api.get<Category[]>("/categories"), staleTime: 5 * minute });

export const useJobs = () => useQuery({ queryKey: ["public", "jobs"], queryFn: () => api.get<Job[]>("/jobs"), staleTime: minute });
export const useJob = (slug: string) => useQuery({ queryKey: ["public", "job", slug], queryFn: () => api.get<Job>(`/jobs/${slug}`), staleTime: minute });
