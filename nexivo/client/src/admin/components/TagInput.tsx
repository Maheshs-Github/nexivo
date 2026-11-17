import { useMemo, useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import type { Tag } from "@/lib/types";
import { useList } from "../lib/resource";

/** Tags with suggestions and create-on-type (Enter or comma adds; the API creates unknown tags on save). */
export function TagInput({ value, onChange, id }: { value: string[]; onChange: (v: string[]) => void; id?: string }) {
  const [text, setText] = useState("");
  const { data } = useList<Tag>("tags", { limit: 100 });
  const suggestions = useMemo(() => {
    const t = text.trim().toLowerCase();
    return (data?.items ?? []).filter((tag) => !value.some((v) => v.toLowerCase() === tag.name.toLowerCase()) && (!t || tag.name.toLowerCase().includes(t))).slice(0, 6);
  }, [data, text, value]);

  const add = (name: string) => {
    const n = name.trim().replace(/,$/, "");
    if (!n || value.some((v) => v.toLowerCase() === n.toLowerCase()) || value.length >= 12) return;
    onChange([...value, n]);
    setText("");
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(text); }
    if (e.key === "Backspace" && !text && value.length) onChange(value.slice(0, -1));
  };

  return (
    <div>
      <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-line-strong bg-surface/40 px-2 py-1.5 focus-within:border-brand">
        {value.map((t) => (
          <span key={t} className="inline-flex h-6 items-center gap-1 rounded-md bg-surface-2 pl-2 pr-1 text-xs">
            #{t}<button type="button" onClick={() => onChange(value.filter((v) => v !== t))} aria-label={`Remove tag ${t}`} className="grid size-4 place-items-center rounded hover:bg-bg"><X className="size-3" /></button>
          </span>
        ))}
        <input id={id} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onKey} onBlur={() => text.trim() && add(text)}
          placeholder={value.length ? "" : "Type a tag and press Enter"} className="h-6 min-w-24 flex-1 bg-transparent text-sm outline-none" aria-label="Add tag" />
      </div>
      {suggestions.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {suggestions.map((s) => <button key={s.id} type="button" onClick={() => add(s.name)} className="rounded-md border border-line px-2 py-0.5 text-xs text-text-muted hover:border-line-strong hover:text-text">+ {s.name}</button>)}
        </div>
      )}
    </div>
  );
}
