import type { QueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { publicKeys } from "@/hooks/usePublic";
import type { PageKey } from "./types";

const PAGE_BY_PATH: Record<string, PageKey> = { "/": "HOME", "/about": "ABOUT", "/services": "SERVICES", "/blog": "BLOG", "/careers": "CAREERS", "/contact": "CONTACT" };

/**
 * Kicks off the shared public requests (settings, nav, this page's sections) before React mounts,
 * so data arrives while the route chunk is still downloading. Admin routes are skipped.
 */
export function prefetchForPath(qc: QueryClient, pathname: string) {
  if (pathname.startsWith("/admin")) return;
  void qc.prefetchQuery({ queryKey: publicKeys.settings, queryFn: () => api.get("/settings"), staleTime: 5 * 60_000 });
  void qc.prefetchQuery({ queryKey: publicKeys.nav, queryFn: () => api.get("/nav"), staleTime: 5 * 60_000 });
  const page = PAGE_BY_PATH[pathname.replace(/\/$/, "") || "/"] ?? (pathname.startsWith("/services/") ? "SERVICES" : undefined);
  // Home: fetch the hero chunk (and motion) in parallel with the data instead of after it.
  if (page === "HOME") void import("@/components/sections/Hero");
  if (page) void qc.prefetchQuery({ queryKey: publicKeys.sections(page), queryFn: () => api.get(`/pages/${page.toLowerCase()}/sections`), staleTime: 60_000 });
}
