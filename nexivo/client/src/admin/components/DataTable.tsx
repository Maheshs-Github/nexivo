import { useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { cn } from "@/lib/utils";

export interface Column<T> { key: string; header: string; cell: (row: T) => ReactNode; sortable?: boolean; className?: string; hideOnMobile?: boolean }

/** Table state (page, search, sort, filters) lives in the URL so views are shareable and survive refresh. */
export function useTableState(defaults: { sort?: string; limit?: number } = {}) {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get("page")) || 1);
  const q = params.get("q") ?? "";
  const sort = params.get("sort") ?? defaults.sort ?? "";
  const set = (patch: Record<string, string | number | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) if (v === null || v === "") next.delete(k); else next.set(k, String(v));
    if (!("page" in patch)) next.delete("page");
    setParams(next, { replace: true });
  };
  const filter = (key: string) => params.get(key) ?? "";
  return { page, q, sort, limit: defaults.limit ?? 20, set, filter };
}

interface Props<T> {
  rows: T[] | undefined;
  columns: Column<T>[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  state?: ReturnType<typeof useTableState>;
  pages?: number;
  total?: number;
  searchPlaceholder?: string;
  toolbar?: ReactNode;
  actions?: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  empty?: { title: string; text?: string; action?: ReactNode };
}

export function DataTable<T>({ rows, columns, rowKey, loading, error, onRetry, state, pages = 1, total, searchPlaceholder = "Search", toolbar, actions, onRowClick, empty }: Props<T>) {
  const [search, setSearch] = useState(state?.q ?? "");
  useEffect(() => { setSearch(state?.q ?? ""); }, [state?.q]);
  useEffect(() => {
    if (!state || search === state.q) return;
    const t = setTimeout(() => state.set({ q: search.trim() || null }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const sortBy = (key: string) => {
    if (!state) return;
    const cur = state.sort;
    state.set({ sort: cur === key ? `-${key}` : cur === `-${key}` ? null : key });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface/30">
      {(state || toolbar) && (
        <div className="flex flex-col gap-2 border-b border-line p-2.5 sm:flex-row sm:items-center">
          {state && (
            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" aria-hidden />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={searchPlaceholder} aria-label={searchPlaceholder} className="h-8 pl-8" />
            </div>
          )}
          <div className="flex flex-1 flex-wrap items-center gap-2 sm:justify-end">{toolbar}</div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-text-muted">
              {columns.map((c) => {
                const active = state?.sort.replace(/^-/, "") === c.key;
                const dir = state?.sort.startsWith("-") ? "desc" : "asc";
                return (
                  <th key={c.key} scope="col" aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : undefined}
                    className={cn("h-9 whitespace-nowrap px-3 font-medium", c.hideOnMobile && "hidden md:table-cell", c.className)}>
                    {c.sortable && state ? (
                      <button type="button" onClick={() => sortBy(c.key)} className="inline-flex items-center gap-1 hover:text-text">
                        {c.header}
                        {active ? (dir === "asc" ? <ArrowUp className="size-3" aria-hidden /> : <ArrowDown className="size-3" aria-hidden />) : <ArrowUpDown className="size-3 opacity-50" aria-hidden />}
                      </button>
                    ) : c.header}
                  </th>
                );
              })}
              {actions && <th className="w-12 px-3"><span className="sr-only">Actions</span></th>}
            </tr>
          </thead>
          <tbody>
            {loading && !rows ? (
              Array.from({ length: 6 }, (_, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  {columns.map((c) => <td key={c.key} className={cn("px-3 py-3", c.hideOnMobile && "hidden md:table-cell")}><Skeleton className="h-4 w-full max-w-40" /></td>)}
                  {actions && <td />}
                </tr>
              ))
            ) : rows?.map((row) => (
              <tr key={rowKey(row)} onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn("border-b border-line transition-colors last:border-0 hover:bg-surface-2/40", onRowClick && "cursor-pointer")}>
                {columns.map((c) => <td key={c.key} className={cn("px-3 py-2.5 align-middle", c.hideOnMobile && "hidden md:table-cell", c.className)}>{c.cell(row)}</td>)}
                {actions && <td className="px-2 py-1.5 text-right" onClick={(e) => e.stopPropagation()}>{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <div className="p-4"><ErrorState onRetry={onRetry} /></div>}
      {!error && !loading && rows && rows.length === 0 && (
        <div className="p-4"><EmptyState title={state?.q ? "No matches" : empty?.title ?? "Nothing here yet"} text={state?.q ? `No results for "${state.q}".` : empty?.text} action={!state?.q ? empty?.action : undefined} className="border-none" /></div>
      )}

      {state && (pages > 1 || (total ?? 0) > 0) && (
        <div className="flex items-center justify-between border-t border-line px-3 py-2 text-xs text-text-muted">
          <span>{total !== undefined ? `${total} total` : ""}</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" disabled={state.page <= 1} onClick={() => state.set({ page: state.page - 1 })} aria-label="Previous page"><ChevronLeft /></Button>
            <span className="tabular-nums">Page {state.page} of {pages}</span>
            <Button variant="ghost" size="icon-sm" disabled={state.page >= pages} onClick={() => state.set({ page: state.page + 1 })} aria-label="Next page"><ChevronRight /></Button>
          </div>
        </div>
      )}
    </div>
  );
}
