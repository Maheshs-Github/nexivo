import { useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoaderCircle } from "lucide-react";
import { sectionMeta, sectionSchemas, type FieldSpec, type PageKey, type SectionType } from "@shared/sections";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FieldShell, FormFields } from "./FormKit";
import { useSave } from "../lib/resource";

/** Empty content for a type, so every input is controlled from the start. */
function blankFor(fields: FieldSpec[]): Record<string, unknown> {
  return Object.fromEntries(fields.map((f) => [f.name, f.kind === "strings" || f.kind === "list" ? [] : f.kind === "cta" ? { label: "", href: "" } : f.kind === "number" ? 0 : ""]));
}

/** Drops empty optional values so the Zod schema treats them as "not set". */
function clean(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      const c = clean(v);
      if (c === "" || c === undefined || (c && typeof c === "object" && !Array.isArray(c) && Object.values(c).every((x) => x === "" || x === undefined))) continue;
      out[k] = c;
    }
    return out;
  }
  return value;
}

interface Props {
  page: PageKey;
  section: { id?: number; type: SectionType; label?: string | null; isVisible?: boolean; content?: Record<string, unknown> };
  onDone: () => void; onCancel: () => void; onDirtyChange: (d: boolean) => void;
}

/** One form per section type, generated from the shared field specs and validated by the shared Zod schema. */
export function SectionForm({ page, section, onDone, onCancel, onDirtyChange }: Props) {
  const meta = sectionMeta[section.type];
  const schema = useMemo(() => z.object({
    label: z.string().max(120).optional(),
    isVisible: z.boolean(),
    content: z.preprocess(clean, sectionSchemas[section.type]),
  }), [section.type]);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { label: section.label ?? "", isVisible: section.isVisible ?? true, content: { ...blankFor(meta.fields), ...(section.content ?? {}) } },
  });
  const save = useSave("sections");
  const dirty = form.formState.isDirty;
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await save.mutateAsync({ id: section.id, body: { page, type: section.type, label: values.label || null, isVisible: values.isVisible, content: values.content } });
      onDone();
    } catch (e) {
      if (e instanceof ApiError && e.errors) for (const [k, v] of Object.entries(e.errors)) form.setError(k as never, { message: v[0] });
    }
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
        <div className="grid flex-1 content-start gap-4 overflow-y-auto p-5 sm:grid-cols-2">
          <FieldShell id="sec-label" label="Internal label" hint="Only shown here in the admin.">
            <Input id="sec-label" {...form.register("label")} placeholder={meta.label} className="h-8" />
          </FieldShell>
          <label htmlFor="sec-visible" className="flex items-center justify-between gap-4 self-end rounded-lg border border-line px-3 py-2">
            <span className="text-xs font-medium">Visible on the page</span>
            <Switch id="sec-visible" checked={form.watch("isVisible")} onCheckedChange={(v) => form.setValue("isVisible", v, { shouldDirty: true })} />
          </label>
          <div className="border-t border-line sm:col-span-2" />
          <FormFields fields={meta.fields} prefix="content." />
          {["CLIENTS", "SERVICES", "CASE_STUDIES", "TESTIMONIALS", "TEAM", "BLOGS"].includes(section.type) && (
            <p className="rounded-lg bg-surface-2/60 p-3 text-xs text-text-muted sm:col-span-2">The items in this section come from their own list in the sidebar. This form edits the headings around them.</p>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-line bg-bg-elevated px-5 py-3">
          <p className="text-xs text-text-muted">{dirty ? "Unsaved changes" : ""}</p>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button type="submit" disabled={save.isPending}>{save.isPending && <LoaderCircle className="animate-spin" />}{section.id ? "Save section" : "Add section"}</Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
