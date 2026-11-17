import type { ReactNode } from "react";
import { Controller, get, useFieldArray, useFormContext } from "react-hook-form";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { FieldSpec } from "@shared/sections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icon, ICON_NAMES } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { ImageField } from "./MediaPicker";
import { RichEditor } from "./RichEditor";

export type FieldDef =
  | FieldSpec
  | { name: string; label: string; kind: "switch" | "color" | "url" | "email"; hint?: string }
  | { name: string; label: string; kind: "select"; options: { value: string; label: string }[]; hint?: string }
  | { name: string; label: string; kind: "slug"; hint?: string };

export type WithLayout = FieldDef & { half?: boolean; placeholder?: string };

export function FieldShell({ id, label, hint, error, children, className }: { id: string; label: string; hint?: string; error?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-xs font-medium text-text">{label}</label>
      {children}
      {error ? <p role="alert" className="text-xs text-danger">{error}</p> : hint ? <p className="text-xs text-text-muted">{hint}</p> : null}
    </div>
  );
}

const idOf = (path: string) => `f-${path.replace(/[^a-zA-Z0-9]/g, "-")}`;

/** Moves an array item; used by string lists. */
const move = <T,>(arr: T[], from: number, to: number) => { const a = [...arr]; const [x] = a.splice(from, 1); a.splice(to, 0, x); return a; };

function StringList({ path, itemLabel }: { path: string; itemLabel: string }) {
  const { control } = useFormContext();
  return (
    <Controller control={control} name={path} render={({ field }) => {
      const items: string[] = Array.isArray(field.value) ? field.value : [];
      const set = (next: string[]) => field.onChange(next);
      return (
        <div className="space-y-1.5">
          {items.map((v, i) => (
            <div key={i} className="flex gap-1.5">
              <Input value={v} aria-label={`${itemLabel} ${i + 1}`} onChange={(e) => set(items.map((x, j) => (j === i ? e.target.value : x)))} className="h-8" />
              <Button type="button" variant="ghost" size="icon-sm" disabled={i === 0} onClick={() => set(move(items, i, i - 1))} aria-label="Move up"><ArrowUp /></Button>
              <Button type="button" variant="ghost" size="icon-sm" disabled={i === items.length - 1} onClick={() => set(move(items, i, i + 1))} aria-label="Move down"><ArrowDown /></Button>
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => set(items.filter((_, j) => j !== i))} aria-label={`Remove ${itemLabel}`}><Trash2 /></Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set([...items, ""])}><Plus />Add {itemLabel.toLowerCase()}</Button>
        </div>
      );
    }} />
  );
}

function ObjectList({ path, itemLabel, fields }: { path: string; itemLabel: string; fields: FieldSpec[] }) {
  const { control } = useFormContext();
  const arr = useFieldArray({ control, name: path });
  const blank = Object.fromEntries(fields.map((f) => [f.name, f.kind === "strings" ? [] : f.kind === "number" ? 0 : ""]));
  return (
    <div className="space-y-2">
      {arr.fields.map((item, i) => (
        <div key={item.id} className="rounded-lg border border-line bg-bg/40">
          <div className="flex items-center justify-between border-b border-line px-3 py-1.5">
            <span className="text-xs font-medium text-text-muted">{itemLabel} {i + 1}</span>
            <div className="flex">
              <Button type="button" variant="ghost" size="icon-xs" disabled={i === 0} onClick={() => arr.move(i, i - 1)} aria-label="Move up"><ArrowUp /></Button>
              <Button type="button" variant="ghost" size="icon-xs" disabled={i === arr.fields.length - 1} onClick={() => arr.move(i, i + 1)} aria-label="Move down"><ArrowDown /></Button>
              <Button type="button" variant="ghost" size="icon-xs" onClick={() => arr.remove(i)} aria-label={`Remove ${itemLabel}`}><Trash2 /></Button>
            </div>
          </div>
          <div className="grid gap-3 p-3 sm:grid-cols-2"><FormFields fields={fields} prefix={`${path}.${i}.`} /></div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => arr.append(blank)}><Plus />Add {itemLabel.toLowerCase()}</Button>
    </div>
  );
}

function OneField({ def, path }: { def: WithLayout; path: string }) {
  const { register, control, formState: { errors } } = useFormContext();
  const id = idOf(path);
  const errAt = (p: string) => (get(errors, p) as { message?: string } | undefined)?.message;
  const error = errAt(path) ?? errAt(`${path}.root`);
  const wide = ["textarea", "richtext", "list", "strings", "cta", "image"].includes(def.kind) && !def.half;
  const shell = (child: ReactNode) => <FieldShell id={id} label={def.label} hint={def.hint} error={error} className={wide ? "sm:col-span-2" : undefined}>{child}</FieldShell>;

  switch (def.kind) {
    case "textarea": return shell(<Textarea id={id} rows={3} {...register(path)} aria-invalid={!!error} />);
    case "number": return shell(<Input id={id} type="number" step="any" {...register(path, { valueAsNumber: true })} aria-invalid={!!error} className="h-8" />);
    case "richtext": return shell(<Controller control={control} name={path} render={({ field }) => <RichEditor id={id} value={field.value ?? ""} onChange={field.onChange} minHeight="min-h-48" />} />);
    case "image": return shell(<Controller control={control} name={path} render={({ field }) => <ImageField id={id} value={field.value} onChange={field.onChange} />} />);
    case "switch": return (
      <Controller control={control} name={path} render={({ field }) => (
        <label htmlFor={id} className="flex items-center justify-between gap-4 rounded-lg border border-line px-3 py-2 sm:col-span-1">
          <span className="text-xs font-medium">{def.label}{def.hint && <span className="block font-normal text-text-muted">{def.hint}</span>}</span>
          <Switch id={id} checked={!!field.value} onCheckedChange={field.onChange} />
        </label>
      )} />
    );
    case "select": return shell(
      <Controller control={control} name={path} render={({ field }) => (
        <Select value={field.value ?? ""} onValueChange={field.onChange}>
          <SelectTrigger id={id} className="h-8 w-full"><SelectValue placeholder="Select…" /></SelectTrigger>
          <SelectContent>{def.options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
        </Select>
      )} />,
    );
    case "icon": return shell(
      <Controller control={control} name={path} render={({ field }) => (
        <Select value={field.value || "sparkles"} onValueChange={field.onChange}>
          <SelectTrigger id={id} className="h-8 w-full"><SelectValue /></SelectTrigger>
          <SelectContent className="max-h-72">{ICON_NAMES.map((n) => <SelectItem key={n} value={n}><Icon name={n} className="size-4" />{n}</SelectItem>)}</SelectContent>
        </Select>
      )} />,
    );
    case "color": return shell(
      <div className="flex items-center gap-2">
        <input type="color" aria-label={`${def.label} picker`} className="h-8 w-10 cursor-pointer rounded border border-line bg-transparent" {...register(path)} />
        <Input id={id} {...register(path)} className="h-8 font-mono" aria-invalid={!!error} />
      </div>,
    );
    case "cta": return shell(
      <div className="grid gap-2 sm:grid-cols-2">
        <Input id={id} placeholder="Label" {...register(`${path}.label`)} aria-label={`${def.label} label`} className="h-8" />
        <Input placeholder="/contact or https://" {...register(`${path}.href`)} aria-label={`${def.label} link`} className="h-8" />
      </div>,
    );
    case "strings": return shell(<StringList path={path} itemLabel={def.itemLabel} />);
    case "list": return shell(<ObjectList path={path} itemLabel={def.itemLabel} fields={def.fields} />);
    case "slug": return shell(<Input id={id} {...register(path)} placeholder="Leave empty to generate from the title" className="h-8 font-mono text-xs" aria-invalid={!!error} />);
    default: return shell(<Input id={id} type={def.kind === "email" ? "email" : "text"} placeholder={def.placeholder} {...register(path)} aria-invalid={!!error} className="h-8" />);
  }
}

/** Renders a list of field definitions bound to react-hook-form (paths are prefixed for nested objects). */
export function FormFields({ fields, prefix = "" }: { fields: readonly WithLayout[]; prefix?: string }) {
  return <>{fields.map((f) => <OneField key={f.name} def={f} path={`${prefix}${f.name}`} />)}</>;
}
