import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { ExternalLink, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { sectionMeta, PAGES, type PageKey, type SectionType } from "@shared/sections";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { ConfirmDialog, PageHeader, StatusBadge } from "../components/kit";
import { SortableList } from "../components/SortableList";
import { SectionForm } from "../components/SectionForm";
import { useList, usePatch, useRemove, useReorder } from "../lib/resource";

export interface SectionRow { id: number; page: PageKey; type: SectionType; label: string | null; order: number; isVisible: boolean; content: Record<string, unknown> }

const PAGE_LABEL: Record<PageKey, string> = { HOME: "Home", ABOUT: "About", SERVICES: "Services", BLOG: "Blog", CAREERS: "Careers", CONTACT: "Contact" };
const PAGE_URL: Record<PageKey, string> = { HOME: "/", ABOUT: "/about", SERVICES: "/services", BLOG: "/blog", CAREERS: "/careers", CONTACT: "/contact" };

/** A one-line summary of a section's content, so the list is scannable. */
const summary = (s: SectionRow) => String(s.content.heading ?? s.content.headline ?? s.content.eyebrow ?? "").slice(0, 90);

export default function Sections() {
  const [params, setParams] = useSearchParams();
  const page = (PAGES.includes(params.get("page") as PageKey) ? params.get("page") : "HOME") as PageKey;
  const { data, isLoading, isError, refetch } = useList<SectionRow>("sections", { pageKey: page, limit: 100, sort: "order" });
  const reorder = useReorder("sections");
  const toggle = usePatch("sections");
  const remove = useRemove("sections");
  const [items, setItems] = useState<SectionRow[]>([]);
  const [editing, setEditing] = useState<SectionRow | { type: SectionType } | null>(null);
  const [dirty, setDirty] = useState(false);
  useEffect(() => { if (data) setItems(data.items); }, [data]);

  const allowed = (Object.keys(sectionMeta) as SectionType[]).filter((t) => sectionMeta[t].pages.includes(page));
  const close = (open: boolean) => {
    if (open) return;
    if (dirty && !window.confirm("You have unsaved changes. Discard them?")) return;
    setEditing(null); setDirty(false);
  };

  return (
    <>
      <PageHeader title="Pages & sections" description="Every heading, list and button on the public pages lives here. Drag to reorder; changes go live instantly."
        actions={
          <>
            <Button variant="outline" asChild><a href={PAGE_URL[page]} target="_blank" rel="noopener"><ExternalLink />Preview {PAGE_LABEL[page]}</a></Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button><Plus />Add section</Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel className="text-xs text-text-muted">Available on {PAGE_LABEL[page]}</DropdownMenuLabel>
                {allowed.map((t) => (
                  <DropdownMenuItem key={t} onSelect={() => setEditing({ type: t })} className="flex-col items-start gap-0">
                    <span className="font-medium">{sectionMeta[t].label}</span><span className="text-xs text-text-muted">{sectionMeta[t].description}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        } />

      <Tabs value={page} onValueChange={(v) => setParams({ page: v }, { replace: true })} className="mb-5">
        <TabsList className="flex-wrap">{PAGES.map((p) => <TabsTrigger key={p} value={p}>{PAGE_LABEL[p]}</TabsTrigger>)}</TabsList>
      </Tabs>

      {isLoading ? <div className="space-y-2">{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14" />)}</div>
        : isError ? <ErrorState onRetry={() => refetch()} />
        : items.length === 0 ? <EmptyState title={`No sections on ${PAGE_LABEL[page]} yet`} text="Add a section to start building this page." />
        : (
          <div className="max-w-3xl">
            <SortableList items={items} onReorder={(next) => { setItems(next); reorder.mutate(next.map((s) => s.id)); }} render={(s, i) => (
              <div className="flex items-center gap-3">
                <span className="w-5 font-mono text-xs text-text-muted">{String(i + 1).padStart(2, "0")}</span>
                <button type="button" onClick={() => setEditing(s)} className="min-w-0 flex-1 text-left">
                  <p className="flex items-center gap-2 font-medium">{s.label || sectionMeta[s.type]?.label || s.type}{!s.isVisible && <StatusBadge status="HIDDEN" />}</p>
                  <p className="truncate text-xs text-text-muted">{summary(s) || sectionMeta[s.type]?.description}</p>
                </button>
                <Button variant="ghost" size="icon-sm" aria-label={s.isVisible ? "Hide section" : "Show section"} onClick={() => toggle.mutate({ id: s.id, body: { isVisible: !s.isVisible } })}>{s.isVisible ? <Eye /> : <EyeOff />}</Button>
                <Button variant="ghost" size="icon-sm" aria-label="Edit section" onClick={() => setEditing(s)}><Pencil /></Button>
                <ConfirmDialog title="Delete this section?" description="It will disappear from the page. You can hide it instead to keep the content."
                  onConfirm={() => remove.mutateAsync(s.id)} trigger={<Button variant="ghost" size="icon-sm" aria-label="Delete section"><Trash2 /></Button>} />
              </div>
            )} />
          </div>
        )}

      <Sheet open={!!editing} onOpenChange={close}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl">
          {editing && (
            <>
              <SheetHeader className="border-b border-line">
                <SheetTitle>{"id" in editing ? "Edit" : "Add"} {sectionMeta[editing.type]?.label} section</SheetTitle>
                <SheetDescription>{sectionMeta[editing.type]?.description}</SheetDescription>
              </SheetHeader>
              <SectionForm key={"id" in editing ? editing.id : `new-${editing.type}`} page={page} section={editing} onDirtyChange={setDirty}
                onCancel={() => close(false)} onDone={() => { setDirty(false); setEditing(null); }} />
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
