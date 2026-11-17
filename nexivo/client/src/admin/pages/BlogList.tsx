import { Link, useNavigate } from "react-router";
import { ExternalLink, MoreHorizontal, Pencil, Plus, Send, Trash2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BlogPost, Category } from "@/lib/types";
import { ConfirmDialog, PageHeader, StatusBadge } from "../components/kit";
import { DataTable, useTableState, type Column } from "../components/DataTable";
import { useList, usePatch, useRemove, timeAgo } from "../lib/resource";

const columns: Column<BlogPost>[] = [
  { key: "title", header: "Title", sortable: true, cell: (p) => (
    <div className="flex items-center gap-3">
      {p.coverImage ? <img src={p.coverImage} alt="" className="h-9 w-14 shrink-0 rounded object-cover" loading="lazy" /> : <span className="h-9 w-14 shrink-0 rounded bg-surface-2" />}
      <div className="min-w-0"><p className="line-clamp-1 font-medium">{p.title}</p><p className="truncate text-xs text-text-muted">{p.category?.name ?? "Uncategorised"} · {p.readTime} min</p></div>
    </div>
  ) },
  { key: "status", header: "Status", cell: (p) => <StatusBadge status={p.status} /> },
  { key: "author", header: "Author", hideOnMobile: true, cell: (p) => <span className="text-text-muted">{p.author?.name ?? "-"}</span> },
  { key: "views", header: "Views", sortable: true, hideOnMobile: true, className: "text-right", cell: (p) => <span className="tabular-nums">{p.views.toLocaleString()}</span> },
  { key: "updatedAt", header: "Updated", sortable: true, hideOnMobile: true, cell: (p) => <span className="whitespace-nowrap text-text-muted">{timeAgo(p.updatedAt)}</span> },
];

export default function BlogList() {
  const navigate = useNavigate();
  const state = useTableState({ sort: "-updatedAt" });
  const status = state.filter("status");
  const category = state.filter("category");
  const { data, isLoading, isError, refetch } = useList<BlogPost>("blogs", { page: state.page, limit: state.limit, q: state.q || undefined, sort: state.sort, status: status || undefined, category: category || undefined });
  const { data: cats } = useList<Category>("categories", { limit: 100 });
  const remove = useRemove("blogs");
  const publish = usePatch("blogs", "/publish");
  const unpublish = usePatch("blogs", "/unpublish");

  const actions = (p: BlogPost) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label="Post actions"><MoreHorizontal /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => navigate(`/admin/blogs/${p.id}`)}><Pencil />Edit</DropdownMenuItem>
        {p.status === "DRAFT"
          ? <DropdownMenuItem onSelect={() => publish.mutate({ id: p.id })}><Send />Publish</DropdownMenuItem>
          : <DropdownMenuItem onSelect={() => unpublish.mutate({ id: p.id })}><Undo2 />Unpublish</DropdownMenuItem>}
        {p.status === "PUBLISHED" && <DropdownMenuItem onSelect={() => window.open(`/blog/${p.slug}`, "_blank", "noopener")}><ExternalLink />View on site</DropdownMenuItem>}
        <DropdownMenuSeparator />
        <ConfirmDialog title="Delete this post?" description={`"${p.title}" will be permanently removed.`} onConfirm={() => remove.mutateAsync(p.id)}
          trigger={<DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}><Trash2 />Delete</DropdownMenuItem>} />
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <PageHeader title="Blog posts" description="Write, schedule and publish articles." actions={<Button asChild><Link to="/admin/blogs/new"><Plus />New post</Link></Button>} />
      <DataTable rows={data?.items} columns={columns} rowKey={(p) => p.id} loading={isLoading} error={isError} onRetry={() => refetch()} state={state}
        pages={data?.pages} total={data?.total} actions={actions} onRowClick={(p) => navigate(`/admin/blogs/${p.id}`)} searchPlaceholder="Search posts"
        empty={{ title: "No posts yet", text: "Your first article is a click away.", action: <Button asChild><Link to="/admin/blogs/new"><Plus />New post</Link></Button> }}
        toolbar={
          <>
            <Select value={status || "all"} onValueChange={(v) => state.set({ status: v === "all" ? null : v })}>
              <SelectTrigger size="sm" className="w-32" aria-label="Status"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="PUBLISHED">Published</SelectItem><SelectItem value="DRAFT">Drafts</SelectItem></SelectContent>
            </Select>
            <Select value={category || "all"} onValueChange={(v) => state.set({ category: v === "all" ? null : v })}>
              <SelectTrigger size="sm" className="w-40" aria-label="Category"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All categories</SelectItem>{cats?.items.map((c) => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </>
        } />
    </>
  );
}
