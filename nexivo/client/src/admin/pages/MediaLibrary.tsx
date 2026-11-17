import { useRef, useState, type DragEvent } from "react";
import { Copy, ImageIcon, LoaderCircle, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import type { Media } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { cn } from "@/lib/utils";
import { ConfirmDialog, PageHeader } from "../components/kit";
import { useImageUpload } from "../components/MediaPicker";
import { useList, useRemove } from "../lib/resource";

const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

export default function MediaLibrary() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useList<Media>("media", { q: q || undefined, page, limit: 40 });
  const remove = useRemove("media");
  const { upload, progress } = useImageUpload();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const uploadMany = async (files: FileList | null) => { if (files) for (const f of Array.from(files)) await upload(f); };
  const onDrop = (e: DragEvent) => { e.preventDefault(); setDragging(false); uploadMany(e.dataTransfer.files); };
  const copy = async (url: string) => {
    try { await navigator.clipboard.writeText(new URL(url, window.location.origin).href); toast.success("URL copied"); } catch { toast.error("Couldn't copy"); }
  };

  return (
    <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={(e) => { if (e.currentTarget === e.target) setDragging(false); }} onDrop={onDrop}>
      <PageHeader title="Media library" description="JPEG, PNG, WebP or GIF up to 5 MB. Images are converted to WebP and resized on upload."
        actions={<Button onClick={() => fileRef.current?.click()} disabled={progress !== null}>{progress !== null ? <LoaderCircle className="animate-spin" /> : <Upload />}{progress !== null ? `Uploading ${progress}%` : "Upload images"}</Button>} />
      <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(e) => { uploadMany(e.target.files); e.target.value = ""; }} />
      <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search by name or alt text" aria-label="Search media" className="mb-4 h-8 max-w-xs" />

      <div className={cn("rounded-xl transition", dragging && "outline-2 outline-dashed outline-brand outline-offset-4")}>
        {isLoading ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">{Array.from({ length: 12 }, (_, i) => <Skeleton key={i} className="aspect-square" />)}</div>
          : isError ? <ErrorState onRetry={() => refetch()} />
          : !data?.items.length ? <EmptyState icon={<ImageIcon className="size-5" />} title={q ? "No matches" : "No images yet"} text="Drop images anywhere on this page to upload them." />
          : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {data.items.map((m) => (
                <li key={m.id} className="group overflow-hidden rounded-lg border border-line bg-surface/40">
                  <div className="relative aspect-square bg-surface-2">
                    <img src={m.url} alt={m.alt ?? ""} loading="lazy" className="size-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-bg/90 to-transparent p-1.5 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100">
                      <Button variant="secondary" size="icon-sm" onClick={() => copy(m.url)} aria-label="Copy URL"><Copy /></Button>
                      <ConfirmDialog title="Delete this image?" description="Pages that use it will show a placeholder instead." onConfirm={() => remove.mutateAsync(m.id)}
                        trigger={<Button variant="secondary" size="icon-sm" aria-label="Delete image"><Trash2 /></Button>} />
                    </div>
                  </div>
                  <div className="px-2 py-1.5"><p className="truncate text-xs" title={m.alt ?? m.filename}>{m.alt || m.filename}</p><p className="text-[11px] text-text-muted">{m.width && m.height ? `${m.width}×${m.height} · ` : ""}{kb(m.size)}</p></div>
                </li>
              ))}
            </ul>
          )}
      </div>
      {data && data.pages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2 text-xs text-text-muted">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span>Page {page} of {data.pages}</span>
          <Button variant="outline" size="sm" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
