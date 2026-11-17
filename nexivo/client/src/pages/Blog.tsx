import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useBlogs, useCategories } from "@/hooks/usePublic";
import { Seo, breadcrumbLd } from "@/components/Seo";
import { PageSections } from "@/components/sections/PageSections";
import { PostCard, PostCardSkeleton } from "@/components/blog/PostCard";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { cn } from "@/lib/utils";

const chip = (active: boolean) => cn("inline-flex h-9 shrink-0 items-center rounded-full border px-4 text-sm transition-colors",
  active ? "border-transparent bg-text text-bg" : "border-line text-text-muted hover:border-line-strong hover:text-text");

export default function Blog() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get("page")) || 1);
  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const tag = params.get("tag") ?? "";
  const [search, setSearch] = useState(q);

  const update = (patch: Record<string, string | number | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) if (v === null || v === "" || (k === "page" && v === 1)) next.delete(k); else next.set(k, String(v));
    setParams(next, { replace: "q" in patch && Object.keys(patch).length <= 2 });
  };

  // Debounced search synced to the URL.
  useEffect(() => { setSearch(q); }, [q]);
  useEffect(() => {
    if (search === q) return;
    const t = setTimeout(() => update({ q: search.trim() || null, page: null }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const { data, isLoading, isError, isFetching, refetch } = useBlogs({ page, q, category, tag });
  const { data: categories } = useCategories();
  const featuredLayout = page === 1 && !q && !category && !tag;
  const items = data?.items ?? [];

  return (
    <>
      <Seo page="BLOG" jsonLd={[breadcrumbLd([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }])]} />
      <PageSections page="BLOG" />

      <section className="section pt-10 md:pt-14">
        <div className="container-x">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div role="group" aria-label="Filter by category" className="scrollbar-none -mx-gutter flex gap-2 overflow-x-auto px-gutter md:mx-0 md:flex-wrap md:px-0">
              <button type="button" className={chip(!category && !tag)} aria-pressed={!category && !tag} onClick={() => update({ category: null, tag: null, page: null })}>All</button>
              {tag && <button type="button" className={cn(chip(true), "gap-1.5")} onClick={() => update({ tag: null, page: null })} aria-label={`Remove tag filter ${tag}`}>#{tag}<X className="size-3.5" aria-hidden /></button>}
              {categories?.map((c) => (
                <button key={c.id} type="button" className={chip(category === c.slug)} aria-pressed={category === c.slug} onClick={() => update({ category: c.slug, tag: null, page: null })}>
                  {c.name}<span className="ml-1.5 text-xs opacity-60">{c._count?.posts}</span>
                </button>
              ))}
            </div>
            <div className="relative md:w-72">
              <label htmlFor="blog-search" className="sr-only">Search articles</label>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-text-muted" aria-hidden />
              <input id="blog-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles"
                className="h-10 w-full rounded-full border border-line-strong bg-surface/60 pl-10 pr-9 text-sm placeholder:text-text-muted focus:border-brand focus:outline-none" />
              {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-text-muted hover:text-text"><X className="size-4" aria-hidden /></button>}
            </div>
          </div>

          <div className={cn("mt-12 transition-opacity", isFetching && !isLoading && "opacity-60")} aria-busy={isFetching}>
            {isLoading ? (
              <div className="grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <PostCardSkeleton key={i} />)}</div>
            ) : isError ? (
              <ErrorState onRetry={() => refetch()} />
            ) : items.length === 0 ? (
              <EmptyState title="No articles found" text={q ? `Nothing matches "${q}". Try a different search.` : "There are no articles in this category yet."}
                action={<button type="button" className={chip(false)} onClick={() => { setSearch(""); update({ q: null, category: null, tag: null, page: null }); }}>Clear filters</button>} />
            ) : (
              <>
                {featuredLayout && <PostCard post={items[0]} wide className="mb-16 border-b border-line pb-16" />}
                <div className="grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
                  {(featuredLayout ? items.slice(1) : items).map((p) => <PostCard key={p.id} post={p} />)}
                </div>
              </>
            )}
          </div>

          {data && data.pages > 1 && (
            <nav aria-label="Pagination" className="mt-16 flex items-center justify-between border-t border-line pt-8">
              <button type="button" disabled={page <= 1} onClick={() => update({ page: page - 1 })} className={cn(chip(false), "gap-1.5 disabled:pointer-events-none disabled:opacity-40")}>
                <ChevronLeft className="size-4" aria-hidden />Previous
              </button>
              <ul className="flex items-center gap-1">
                {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
                  <li key={n}>
                    <button type="button" onClick={() => update({ page: n })} aria-current={n === page ? "page" : undefined} aria-label={`Page ${n}`}
                      className={cn("grid size-9 place-items-center rounded-full text-sm tabular-nums", n === page ? "bg-text text-bg" : "text-text-muted hover:bg-surface-2")}>{n}</button>
                  </li>
                ))}
              </ul>
              <button type="button" disabled={page >= data.pages} onClick={() => update({ page: page + 1 })} className={cn(chip(false), "gap-1.5 disabled:pointer-events-none disabled:opacity-40")}>
                Next<ChevronRight className="size-4" aria-hidden />
              </button>
            </nav>
          )}
        </div>
      </section>
    </>
  );
}
