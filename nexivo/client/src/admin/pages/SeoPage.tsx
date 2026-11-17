import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Pencil } from "lucide-react";
import { seoSchema } from "@shared/models";
import type { PageSeo } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PageHeader } from "../components/kit";
import { DataTable, type Column } from "../components/DataTable";
import { FormFields } from "../components/FormKit";
import { useList, useSave } from "../lib/resource";

const PATHS: Record<string, string> = { HOME: "/", ABOUT: "/about", SERVICES: "/services", BLOG: "/blog", CAREERS: "/careers", CONTACT: "/contact" };

function Preview() {
  const [title, description, page] = useWatch({ name: ["title", "description", "page"] }) as string[];
  return (
    <div className="rounded-lg border border-line bg-bg p-3 sm:col-span-2" aria-label="Search result preview">
      <p className="truncate text-xs text-text-muted">{window.location.host}{PATHS[page] ?? "/"}</p>
      <p className="mt-1 line-clamp-1 text-[15px] text-brand-text">{title || "Page title"}</p>
      <p className="mt-0.5 line-clamp-2 text-xs text-text-muted">{description || "Page description"}</p>
      <p className="mt-2 text-[11px] text-text-muted">Title {title?.length ?? 0}/60 · Description {description?.length ?? 0}/160</p>
    </div>
  );
}

function SeoForm({ row, onDone }: { row: PageSeo; onDone: () => void }) {
  const form = useForm({ resolver: zodResolver(seoSchema), defaultValues: { page: row.page, title: row.title, description: row.description, ogImage: row.ogImage ?? "" } });
  const save = useSave("seo");
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(async (v) => { await save.mutateAsync({ id: row.id, body: v }); onDone(); })} className="grid gap-4 p-5 sm:grid-cols-2">
        <Preview />
        <FormFields fields={[{ name: "title", label: "Title", kind: "text" }, { name: "description", label: "Description", kind: "textarea" }, { name: "ogImage", label: "Social share image (1200×630 works best)", kind: "image" }]} />
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="ghost" onClick={onDone}>Cancel</Button>
          <Button type="submit" disabled={save.isPending}>{save.isPending && <LoaderCircle className="animate-spin" />}Save</Button>
        </div>
      </form>
    </FormProvider>
  );
}

export default function SeoPage() {
  const { data, isLoading, isError, refetch } = useList<PageSeo>("seo", { limit: 50 });
  const [editing, setEditing] = useState<PageSeo | null>(null);
  const columns: Column<PageSeo>[] = [
    { key: "page", header: "Page", cell: (r) => <div><p className="font-medium">{r.page.charAt(0) + r.page.slice(1).toLowerCase()}</p><p className="font-mono text-xs text-text-muted">{PATHS[r.page]}</p></div> },
    { key: "title", header: "Title", cell: (r) => <p className="line-clamp-1 max-w-xs">{r.title}</p> },
    { key: "description", header: "Description", hideOnMobile: true, cell: (r) => <p className="line-clamp-1 max-w-md text-text-muted">{r.description}</p> },
  ];
  return (
    <>
      <PageHeader title="SEO" description="Search and social previews for each main page. Blog posts, services and jobs have their own SEO from their content." />
      <DataTable rows={data?.items} columns={columns} rowKey={(r) => r.id} loading={isLoading} error={isError} onRetry={() => refetch()} onRowClick={setEditing}
        actions={(r) => <Button variant="ghost" size="icon-sm" onClick={() => setEditing(r)} aria-label={`Edit SEO for ${r.page}`}><Pencil /></Button>} />
      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl">
          <SheetHeader className="border-b border-line"><SheetTitle>SEO · {editing?.page}</SheetTitle><SheetDescription>How this page appears in Google and when shared.</SheetDescription></SheetHeader>
          {editing && <SeoForm key={editing.id} row={editing} onDone={() => setEditing(null)} />}
        </SheetContent>
      </Sheet>
    </>
  );
}
