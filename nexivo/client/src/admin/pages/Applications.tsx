import { useState } from "react";
import { Download, Mail, Phone, Trash2, ExternalLink } from "lucide-react";
import type { Application, ApplicationStatus, Job } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ConfirmDialog, PageHeader, StatusBadge } from "../components/kit";
import { DataTable, useTableState, type Column } from "../components/DataTable";
import { useList, usePatch, useRemove, timeAgo } from "../lib/resource";

const STATUSES: ApplicationStatus[] = ["NEW", "REVIEWING", "SHORTLISTED", "REJECTED", "HIRED"];
const label = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

function StatusSelect({ app }: { app: Application }) {
  const patch = usePatch("applications", "/status");
  return (
    <Select value={app.status} onValueChange={(v) => patch.mutate({ id: app.id, body: { status: v } })}>
      <SelectTrigger size="sm" className="w-36" aria-label={`Status for ${app.name}`} onClick={(e) => e.stopPropagation()}><SelectValue /></SelectTrigger>
      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}><StatusBadge status={s} /></SelectItem>)}</SelectContent>
    </Select>
  );
}

/** Resumes are private: only served by the authenticated /admin endpoint, never from public /uploads. */
const resumeHref = (id: number) => `/api/admin/applications/${id}/resume`;

export default function Applications() {
  const state = useTableState({ limit: 20 });
  const status = state.filter("status");
  const jobId = state.filter("jobId");
  const { data, isLoading, isError, refetch } = useList<Application>("applications", { page: state.page, limit: state.limit, q: state.q || undefined, status: status || undefined, jobId: jobId || undefined });
  const { data: jobs } = useList<Job>("jobs", { limit: 100 });
  const remove = useRemove("applications");
  const [open, setOpen] = useState<Application | null>(null);

  const columns: Column<Application>[] = [
    { key: "name", header: "Applicant", cell: (a) => <div className="min-w-0"><p className="font-medium">{a.name}</p><p className="truncate text-xs text-text-muted">{a.email}</p></div> },
    { key: "job", header: "Role", hideOnMobile: true, cell: (a) => <span className="text-text-muted">{a.job.title}</span> },
    { key: "status", header: "Status", cell: (a) => <StatusSelect app={a} /> },
    { key: "createdAt", header: "Applied", hideOnMobile: true, cell: (a) => <span className="whitespace-nowrap text-text-muted">{timeAgo(a.createdAt)}</span> },
  ];

  return (
    <>
      <PageHeader title="Applications" description="Candidates who applied through the careers page." />
      <DataTable rows={data?.items} columns={columns} rowKey={(a) => a.id} loading={isLoading} error={isError} onRetry={() => refetch()} state={state}
        pages={data?.pages} total={data?.total} onRowClick={setOpen} searchPlaceholder="Search name or email"
        empty={{ title: "No applications yet", text: "When candidates apply on the careers page, they appear here." }}
        actions={(a) => <Button variant="ghost" size="icon-sm" asChild aria-label={`Download resume of ${a.name}`}><a href={resumeHref(a.id)} download><Download /></a></Button>}
        toolbar={
          <>
            <Select value={status || "all"} onValueChange={(v) => state.set({ status: v === "all" ? null : v })}>
              <SelectTrigger size="sm" className="w-36" aria-label="Status filter"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All statuses</SelectItem>{STATUSES.map((s) => <SelectItem key={s} value={s}>{label(s)}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={jobId || "all"} onValueChange={(v) => state.set({ jobId: v === "all" ? null : v })}>
              <SelectTrigger size="sm" className="w-48" aria-label="Role filter"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All roles</SelectItem>{jobs?.items.map((j) => <SelectItem key={j.id} value={String(j.id)}>{j.title}</SelectItem>)}</SelectContent>
            </Select>
          </>
        } />

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {open && (
            <>
              <SheetHeader><SheetTitle>{open.name}</SheetTitle><SheetDescription>Applied for {open.job.title} · {new Date(open.createdAt).toLocaleString()}</SheetDescription></SheetHeader>
              <div className="space-y-5 px-4 pb-6">
                <div className="flex flex-wrap gap-2">
                  <Button asChild><a href={resumeHref(open.id)} download><Download />Download resume</a></Button>
                  <Button variant="outline" asChild><a href={`mailto:${open.email}?subject=${encodeURIComponent(`Your application for ${open.job.title}`)}`}><Mail />Reply</a></Button>
                </div>
                <dl className="grid gap-3 text-sm">
                  <div><dt className="text-xs text-text-muted">Email</dt><dd>{open.email}</dd></div>
                  {open.phone && <div><dt className="text-xs text-text-muted">Phone</dt><dd className="flex items-center gap-1.5"><Phone className="size-3.5" />{open.phone}</dd></div>}
                  {open.linkedin && <div><dt className="text-xs text-text-muted">Profile</dt><dd><a href={open.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand-text hover:underline">{open.linkedin}<ExternalLink className="size-3" /></a></dd></div>}
                  <div><dt className="mb-1 text-xs text-text-muted">Status</dt><dd><StatusSelect app={open} /></dd></div>
                </dl>
                {open.coverLetter && <div><p className="text-xs text-text-muted">Cover letter</p><p className="mt-1.5 whitespace-pre-line rounded-lg border border-line bg-surface/40 p-3 text-sm leading-relaxed">{open.coverLetter}</p></div>}
                <ConfirmDialog title="Delete this application?" description="The resume and details will be permanently removed." onConfirm={async () => { await remove.mutateAsync(open.id); setOpen(null); }}
                  trigger={<Button variant="destructive"><Trash2 />Delete application</Button>} />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
