import { useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { FieldShell } from "./FormKit";
import { Panel } from "./kit";

function Counter({ value, ideal, max }: { value: number; ideal: [number, number]; max: number }) {
  const tone = value === 0 ? "text-text-muted" : value > max ? "text-danger" : value >= ideal[0] && value <= ideal[1] ? "text-success" : "text-warning";
  return <span className={cn("tabular-nums", tone)}>{value}/{max}</span>;
}

/** SEO title/description with counters and a Google-style snippet preview. */
export function SeoPanel({ path }: { path: string }) {
  const { register, control, formState: { errors } } = useFormContext();
  const [title, seoTitle, excerpt, seoDescription, slug] = useWatch({ control, name: ["title", "seoTitle", "excerpt", "seoDescription", "slug"] }) as string[];
  const shownTitle = seoTitle || title || "Post title";
  const shownDesc = seoDescription || excerpt || "A short summary of the post appears here in search results.";
  const host = typeof window !== "undefined" ? window.location.host : "example.com";

  return (
    <Panel title="Search engine listing" description="Leave empty to use the title and excerpt.">
      <div className="mb-4 rounded-lg border border-line bg-bg p-3" aria-label="Search result preview">
        <p className="truncate text-xs text-text-muted">{host} › {path} › {slug || "…"}</p>
        <p className="mt-1 line-clamp-1 text-[15px] text-brand-text">{shownTitle}</p>
        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-text-muted">{shownDesc}</p>
      </div>
      <div className="space-y-3">
        <FieldShell id="seoTitle" label="SEO title" error={errors.seoTitle?.message as string | undefined}>
          <Input id="seoTitle" {...register("seoTitle")} placeholder={title} className="h-8" />
          <span className="text-right text-[11px]"><Counter value={(seoTitle || "").length} ideal={[30, 60]} max={70} /></span>
        </FieldShell>
        <FieldShell id="seoDescription" label="Meta description" error={errors.seoDescription?.message as string | undefined}>
          <Textarea id="seoDescription" rows={3} {...register("seoDescription")} placeholder={excerpt} />
          <span className="text-right text-[11px]"><Counter value={(seoDescription || "").length} ideal={[120, 160]} max={170} /></span>
        </FieldShell>
      </div>
    </Panel>
  );
}
