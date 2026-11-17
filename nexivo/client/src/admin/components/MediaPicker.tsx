import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, ImageIcon, LoaderCircle, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { upload, type ApiError } from "@/lib/api";
import type { Media } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { cn } from "@/lib/utils";
import { useList } from "../lib/resource";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const MAX = 5 * 1024 * 1024;

/** Uploads one image (client-side type/size check, server re-checks magic bytes and converts to WebP). */
export function useImageUpload() {
  const qc = useQueryClient();
  const [progress, setProgress] = useState<number | null>(null);
  const run = async (file: File) => {
    if (!ACCEPT.split(",").includes(file.type)) { toast.error("Use a JPEG, PNG, WebP or GIF image"); return null; }
    if (file.size > MAX) { toast.error("Images must be 5 MB or smaller"); return null; }
    const form = new FormData();
    form.append("file", file);
    form.append("alt", file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
    try {
      setProgress(0);
      const res = await upload<Media>("/admin/media/upload", form, setProgress);
      toast.success(res.message ?? "Image uploaded");
      qc.invalidateQueries({ queryKey: ["admin", "media"] });
      return res.data;
    } catch (e) {
      toast.error((e as ApiError).message);
      return null;
    } finally {
      setProgress(null);
    }
  };
  return { upload: run, progress };
}

export function MediaPicker({ open, onOpenChange, onSelect }: { open: boolean; onOpenChange: (o: boolean) => void; onSelect: (url: string, media?: Media) => void }) {
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<Media | null>(null);
  const { data, isLoading, isError, refetch } = useList<Media>("media", { limit: 60, q: q || undefined }, open);
  const { upload: doUpload, progress } = useImageUpload();
  const fileRef = useRef<HTMLInputElement>(null);

  const choose = (m: Media | null) => { if (!m) return; onSelect(m.url, m); onOpenChange(false); setPicked(null); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Media library</DialogTitle>
          <DialogDescription>Choose an image or upload a new one. Uploads are converted to WebP automatically.</DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by file name or alt text" className="h-8" aria-label="Search media" />
          <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={progress !== null}>
            {progress !== null ? <LoaderCircle className="animate-spin" /> : <Upload />}{progress !== null ? `${progress}%` : "Upload"}
          </Button>
          <input ref={fileRef} type="file" accept={ACCEPT} className="sr-only" onChange={async (e) => {
            const f = e.target.files?.[0]; e.target.value = "";
            if (f) { const m = await doUpload(f); if (m) setPicked(m); }
          }} />
        </div>
        <div className="max-h-[52vh] min-h-48 overflow-y-auto">
          {isLoading ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">{Array.from({ length: 10 }, (_, i) => <Skeleton key={i} className="aspect-square" />)}</div>
          ) : isError ? <ErrorState onRetry={() => refetch()} /> : !data?.items.length ? (
            <EmptyState icon={<ImageIcon className="size-5" />} title="No images yet" text="Upload your first image to start the library." />
          ) : (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {data.items.map((m) => (
                <li key={m.id}>
                  <button type="button" onClick={() => setPicked(m)} onDoubleClick={() => choose(m)} aria-pressed={picked?.id === m.id}
                    className={cn("relative block aspect-square w-full overflow-hidden rounded-lg border bg-surface-2 transition", picked?.id === m.id ? "border-brand ring-2 ring-brand/40" : "border-line hover:border-line-strong")}>
                    <img src={m.url} alt={m.alt ?? ""} loading="lazy" className="size-full object-cover" />
                    {picked?.id === m.id && <span className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-brand text-white"><Check className="size-3" /></span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" disabled={!picked} onClick={() => choose(picked)}>Use image</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Image input used by every form: preview, pick from library, upload, or paste a URL. */
export function ImageField({ value, onChange, aspect = "aspect-video", id }: { value?: string | null; onChange: (v: string) => void; aspect?: string; id?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-2">
      <div className={cn("group relative overflow-hidden rounded-lg border border-dashed border-line-strong bg-surface-2/40", aspect, "max-h-48 w-full max-w-sm")}>
        {value ? (
          <>
            <img src={value} alt="" className="size-full object-cover" />
            <button type="button" onClick={() => onChange("")} aria-label="Remove image" className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-bg/80 text-text opacity-0 backdrop-blur transition group-hover:opacity-100 focus:opacity-100">
              <X className="size-3.5" />
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setOpen(true)} className="flex size-full flex-col items-center justify-center gap-1.5 text-xs text-text-muted hover:text-text">
            <ImageIcon className="size-5" aria-hidden />Choose image
          </button>
        )}
      </div>
      <div className="flex max-w-sm gap-2">
        <Input id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="/uploads/... or https://" className="h-8 text-xs" />
        <Button type="button" variant="outline" onClick={() => setOpen(true)}>Library</Button>
      </div>
      <MediaPicker open={open} onOpenChange={setOpen} onSelect={(url) => onChange(url)} />
    </div>
  );
}
