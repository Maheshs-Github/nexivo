import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import type { Paged } from "@/lib/types";

export type ListParams = Record<string, string | number | boolean | undefined>;

export const adminKey = (resource: string, ...rest: unknown[]) => ["admin", resource, ...rest] as const;

/** Paged list for any admin resource (GET /admin/:resource). */
export function useList<T>(resource: string, params: ListParams = {}, enabled = true) {
  return useQuery({
    queryKey: adminKey(resource, "list", params),
    queryFn: () => api.get<Paged<T>>(`/admin/${resource}`, params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useItem<T>(resource: string, id: number | null | undefined) {
  return useQuery({
    queryKey: adminKey(resource, "item", id),
    queryFn: () => api.get<T>(`/admin/${resource}/${id}`),
    enabled: !!id,
  });
}

const invalidateAll = (qc: ReturnType<typeof useQueryClient>, resource: string) => {
  qc.invalidateQueries({ queryKey: ["admin", resource], refetchType: "all" });
  qc.invalidateQueries({ queryKey: ["admin", "badges"] });
  qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
  // Public caches too, so "View site" shows the change immediately.
  qc.invalidateQueries({ queryKey: ["public"], refetchType: "all" });
};

const onError = (e: unknown) => {
  if (e instanceof ApiError && e.errors) toast.error(e.message, { description: Object.entries(e.errors).slice(0, 3).map(([k, v]) => `${k}: ${v[0]}`).join("\n") });
  else toast.error(e instanceof Error ? e.message : "Something went wrong");
};

/** Create (no id) or update (PUT) with toast feedback and cache invalidation. */
export function useSave<T, B = unknown>(resource: string, opts?: { silent?: boolean }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id?: number | null; body: B }) =>
      id ? api.put<T>(`/admin/${resource}/${id}`, body) : api.post<T>(`/admin/${resource}`, body),
    onSuccess: (res) => { if (!opts?.silent) toast.success(res.message ?? "Saved"); invalidateAll(qc, resource); },
    onError,
  });
}

export function usePatch<T, B = unknown>(resource: string, suffix = "") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body?: B }) => api.patch<T>(`/admin/${resource}/${id}${suffix}`, body),
    onSuccess: (res) => { toast.success(res.message ?? "Updated"); invalidateAll(qc, resource); },
    onError,
  });
}

export function useRemove(resource: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/admin/${resource}/${id}`),
    onSuccess: (res) => { toast.success(res.message ?? "Deleted"); invalidateAll(qc, resource); },
    onError,
  });
}

export function useReorder(resource: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => api.patch(`/admin/${resource}/reorder`, { ids }),
    onSuccess: (res) => { toast.success(res.message ?? "Order saved"); invalidateAll(qc, resource); },
    onError: (e) => { onError(e); qc.invalidateQueries({ queryKey: ["admin", resource] }); },
  });
}

export const useBadges = () =>
  useQuery({ queryKey: ["admin", "badges"], queryFn: () => api.get<{ unread: number; newApplications: number }>("/admin/badges"), refetchInterval: 60_000 });

export const timeAgo = (iso: string) => {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const units: [number, string][] = [[60, "minute"], [3600, "hour"], [86400, "day"], [604800, "week"], [2629800, "month"], [31557600, "year"]];
  let pick = units[0];
  for (const u of units) if (s >= u[0]) pick = u;
  const n = Math.floor(s / pick[0]);
  return `${n} ${pick[1]}${n > 1 ? "s" : ""} ago`;
};
