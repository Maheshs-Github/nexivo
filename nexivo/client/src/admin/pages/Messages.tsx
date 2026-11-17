import { useEffect, useState } from "react";
import { Mail, MailOpen, Reply, Trash2 } from "lucide-react";
import type { ContactMessage } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { cn } from "@/lib/utils";
import { ConfirmDialog, PageHeader } from "../components/kit";
import { useTableState } from "../components/DataTable";
import { useList, usePatch, useRemove, timeAgo } from "../lib/resource";

/** Two-pane inbox: list on the left, message on the right. Opening an unread message marks it read. */
export default function Messages() {
  const state = useTableState({ limit: 30 });
  const filter = state.filter("filter") || "all";
  const [search, setSearch] = useState(state.q);
  useEffect(() => { const t = setTimeout(() => search !== state.q && state.set({ q: search || null }), 300); return () => clearTimeout(t); }, [search]); // eslint-disable-line react-hooks/exhaustive-deps
  const { data, isLoading, isError, refetch } = useList<ContactMessage>("messages", { page: state.page, limit: state.limit, filter, q: state.q || undefined });
  const read = usePatch("messages", "/read");
  const remove = useRemove("messages");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = data?.items.find((m) => m.id === selectedId) ?? null;

  const open = (m: ContactMessage) => {
    setSelectedId(m.id);
    if (!m.isRead) read.mutate({ id: m.id, body: { isRead: true } });
  };

  return (
    <>
      <PageHeader title="Messages" description="Enquiries from the contact form." />
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(v) => state.set({ filter: v === "all" ? null : v })}>
          <TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="unread">Unread</TabsTrigger><TabsTrigger value="read">Read</TabsTrigger></TabsList>
        </Tabs>
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search messages" aria-label="Search messages" className="h-8 sm:w-64" />
      </div>

      <div className="grid min-h-[28rem] overflow-hidden rounded-xl border border-line md:grid-cols-[minmax(0,22rem)_1fr]">
        <div className="border-b border-line md:border-b-0 md:border-r">
          {isLoading ? <div className="space-y-2 p-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
            : isError ? <div className="p-3"><ErrorState onRetry={() => refetch()} /></div>
            : !data?.items.length ? <div className="p-3"><EmptyState title={filter === "unread" ? "Inbox zero" : "No messages"} text="New enquiries from the contact form will show up here." className="border-none" /></div>
            : (
              <ul className="max-h-[36rem] divide-y divide-line overflow-y-auto">
                {data.items.map((m) => (
                  <li key={m.id}>
                    <button type="button" onClick={() => open(m)} aria-current={selectedId === m.id}
                      className={cn("block w-full px-4 py-3 text-left transition-colors hover:bg-surface-2/50", selectedId === m.id && "bg-surface-2/70")}>
                      <div className="flex items-center gap-2">
                        {!m.isRead && <span className="size-2 shrink-0 rounded-full bg-brand" aria-label="Unread" />}
                        <span className={cn("flex-1 truncate", !m.isRead && "font-semibold")}>{m.name}</span>
                        <span className="shrink-0 text-[11px] text-text-muted">{timeAgo(m.createdAt)}</span>
                      </div>
                      <p className={cn("mt-0.5 truncate text-[13px]", m.isRead ? "text-text-muted" : "text-text")}>{m.subject}</p>
                      <p className="truncate text-xs text-text-muted">{m.message}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
        </div>
        <div className="p-5">
          {!selected ? <div className="grid h-full place-items-center text-sm text-text-muted">Select a message to read it.</div> : (
            <article>
              <header className="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-display text-lg font-semibold">{selected.subject}</h2>
                  <p className="mt-1 text-sm text-text-muted">{selected.name} &lt;{selected.email}&gt;{selected.company && ` · ${selected.company}`}{selected.phone && ` · ${selected.phone}`}</p>
                  <p className="text-xs text-text-muted">{new Date(selected.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" asChild><a href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}><Reply />Reply</a></Button>
                  <Button variant="ghost" size="sm" onClick={() => read.mutate({ id: selected.id, body: { isRead: !selected.isRead } })}>{selected.isRead ? <Mail /> : <MailOpen />}{selected.isRead ? "Mark unread" : "Mark read"}</Button>
                  <ConfirmDialog title="Delete this message?" onConfirm={async () => { await remove.mutateAsync(selected.id); setSelectedId(null); }}
                    trigger={<Button variant="ghost" size="icon-sm" aria-label="Delete message"><Trash2 /></Button>} />
                </div>
              </header>
              <p className="mt-5 whitespace-pre-line text-[15px] leading-relaxed">{selected.message}</p>
            </article>
          )}
        </div>
      </div>
    </>
  );
}
