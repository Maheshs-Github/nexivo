import { useState } from "react";
import { ArrowUpDown, Eye, EyeOff, ExternalLink, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { ResourceConfig } from "../resources";
import { ConfirmDialog, PageHeader } from "../components/kit";
import { DataTable, useTableState } from "../components/DataTable";
import { ResourceForm } from "../components/ResourceForm";
import { SortableList } from "../components/SortableList";
import { useList, usePatch, useRemove, useReorder } from "../lib/resource";

type Row = Record<string, unknown> & { id: number };

export default function ResourcePage({ config }: { config: ResourceConfig }) {
  const state = useTableState({ sort: config.orderable ? "order" : undefined });
  const filterValues = Object.fromEntries((config.filters ?? []).map((f) => [f.key, state.filter(f.key) || undefined]));
  const list = useList<Row>(config.path, { page: state.page, limit: state.limit, q: state.q || undefined, sort: state.sort || undefined, ...filterValues });
  const all = useList<Row>(config.path, { limit: 100, sort: "order" }, !!config.orderable);
  const remove = useRemove(config.path);
  const toggle = usePatch(config.path);
  const reorder = useReorder(config.path);
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [dirty, setDirty] = useState(false);
  const [sorting, setSorting] = useState(false);

  const close = (open: boolean) => {
    if (open) return;
    if (dirty && !window.confirm("You have unsaved changes. Discard them?")) return;
    setEditing(null); setDirty(false);
  };

  const actions = (row: Row) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label="Row actions"><MoreHorizontal /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => setEditing(row)}><Pencil />Edit</DropdownMenuItem>
        {"isVisible" in row && (
          <DropdownMenuItem onSelect={() => toggle.mutate({ id: row.id, body: { isVisible: !row.isVisible } })}>{row.isVisible ? <EyeOff /> : <Eye />}{row.isVisible ? "Hide from site" : "Show on site"}</DropdownMenuItem>
        )}
        {config.publicPath?.(row) && <DropdownMenuItem onSelect={() => window.open(config.publicPath!(row)!, "_blank", "noopener")}><ExternalLink />View on site</DropdownMenuItem>}
        <DropdownMenuSeparator />
        <ConfirmDialog title={`Delete this ${config.singular.toLowerCase()}?`} description="This cannot be undone." onConfirm={() => remove.mutateAsync(row.id)}
          trigger={<DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}><Trash2 />Delete</DropdownMenuItem>} />
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const toolbar = (
    <>
      {config.filters?.map((f) => (
        <Select key={f.key} value={state.filter(f.key) || "all"} onValueChange={(v) => state.set({ [f.key]: v === "all" ? null : v })}>
          <SelectTrigger size="sm" className="w-36" aria-label={f.label}><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All {f.label.toLowerCase()}</SelectItem>{f.options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
        </Select>
      ))}
    </>
  );

  return (
    <>
      <PageHeader title={config.title} description={config.description} actions={
        <>
          {config.orderable && <Button variant="outline" onClick={() => setSorting((v) => !v)}><ArrowUpDown />{sorting ? "Done reordering" : "Reorder"}</Button>}
          <Button onClick={() => setEditing("new")}><Plus />New {config.singular.toLowerCase()}</Button>
        </>
      } />

      {sorting ? (
        all.isLoading ? <div className="space-y-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div> : (
          <div className="max-w-2xl">
            <p className="mb-3 text-xs text-text-muted">Drag items (or focus the handle and use Space + arrow keys). The order is saved instantly and used on the website.</p>
            <SortableList items={all.data?.items ?? []} onReorder={(items) => reorder.mutate(items.map((i) => i.id))}
              render={(row) => <div className="flex items-center justify-between gap-3">{config.columns[0].cell(row)}{"isVisible" in row && !row.isVisible && <span className="text-xs text-text-muted">Hidden</span>}</div>} />
          </div>
        )
      ) : (
        <DataTable<Row> rows={list.data?.items} columns={config.columns} rowKey={(r) => r.id} loading={list.isLoading} error={list.isError} onRetry={() => list.refetch()}
          state={state} pages={list.data?.pages} total={list.data?.total} toolbar={toolbar} actions={actions} onRowClick={(r) => setEditing(r)}
          searchPlaceholder={`Search ${config.title.toLowerCase()}`}
          empty={{ title: `No ${config.title.toLowerCase()} yet`, text: config.description, action: <Button onClick={() => setEditing("new")}><Plus />New {config.singular.toLowerCase()}</Button> }} />
      )}

      <Sheet open={!!editing} onOpenChange={close}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl">
          <SheetHeader className="border-b border-line">
            <SheetTitle>{editing === "new" ? `New ${config.singular.toLowerCase()}` : `Edit ${config.singular.toLowerCase()}`}</SheetTitle>
            <SheetDescription>{config.description}</SheetDescription>
          </SheetHeader>
          {editing && (
            <ResourceForm key={editing === "new" ? "new" : editing.id} config={config} row={editing === "new" ? null : editing}
              onDirtyChange={setDirty} onCancel={() => close(false)} onDone={() => { setDirty(false); setEditing(null); }} />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
