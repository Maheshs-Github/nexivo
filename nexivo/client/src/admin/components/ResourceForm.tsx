import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import type { ResourceConfig } from "../resources";
import { FormFields } from "./FormKit";
import { useSave } from "../lib/resource";

/** Fills API nulls with the field defaults so inputs stay controlled. */
export function toFormValues(defaults: Record<string, unknown>, row?: Record<string, unknown> | null) {
  const out: Record<string, unknown> = { ...defaults };
  if (!row) return out;
  for (const key of Object.keys(defaults)) if (row[key] !== null && row[key] !== undefined) out[key] = row[key];
  return out;
}

interface Props { config: ResourceConfig; row?: Record<string, unknown> | null; onDone: () => void; onCancel?: () => void; onDirtyChange?: (dirty: boolean) => void }

/** Generic create/edit form driven by a resource config (fields + shared Zod schema). */
export function ResourceForm({ config, row, onDone, onCancel, onDirtyChange }: Props) {
  const id = (row?.id as number | undefined) ?? null;
  const form = useForm({ resolver: zodResolver(config.schema), defaultValues: toFormValues(config.defaults, row) });
  const save = useSave(config.path);
  const dirty = form.formState.isDirty;
  useEffect(() => { onDirtyChange?.(dirty); }, [dirty, onDirtyChange]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await save.mutateAsync({ id, body: values });
      form.reset(values);
      onDone();
    } catch (e) {
      if (e instanceof ApiError && e.errors) for (const [k, v] of Object.entries(e.errors)) form.setError(k as never, { message: v[0] });
    }
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate className="flex h-full flex-col">
        <div className="grid flex-1 content-start gap-4 overflow-y-auto p-5 sm:grid-cols-2">
          <FormFields fields={config.fields} />
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-line bg-bg-elevated px-5 py-3">
          <p className="text-xs text-text-muted">{dirty ? "Unsaved changes" : id ? "All changes saved" : ""}</p>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onCancel ?? onDone}>Cancel</Button>
            <Button type="submit" disabled={save.isPending}>{save.isPending && <LoaderCircle className="animate-spin" />}{id ? "Save changes" : `Create ${config.singular.toLowerCase()}`}</Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
