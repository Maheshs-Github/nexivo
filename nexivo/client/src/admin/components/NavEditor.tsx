import { useEffect, useState } from "react";
import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import type { NavItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "./kit";
import { SortableList } from "./SortableList";
import { useList, usePatch, useRemove, useReorder, useSave } from "../lib/resource";

type Row = NavItem & { order: number; isVisible: boolean };

function ItemRow({ item }: { item: Row }) {
  const [label, setLabel] = useState(item.label);
  const [url, setUrl] = useState(item.url);
  const [group, setGroup] = useState(item.group ?? "");
  const save = useSave("nav", { silent: true });
  const patch = usePatch("nav");
  const remove = useRemove("nav");
  const dirty = label !== item.label || url !== item.url || group !== (item.group ?? "");
  useEffect(() => { setLabel(item.label); setUrl(item.url); setGroup(item.group ?? ""); }, [item]);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input value={label} onChange={(e) => setLabel(e.target.value)} aria-label="Label" className="h-8 w-36" />
      <Input value={url} onChange={(e) => setUrl(e.target.value)} aria-label="Link" className="h-8 w-44 font-mono text-xs" />
      {item.location === "FOOTER" && <Input value={group} onChange={(e) => setGroup(e.target.value)} placeholder="Column" aria-label="Footer column" className="h-8 w-28" />}
      {dirty && <Button size="sm" disabled={save.isPending} onClick={() => save.mutate({ id: item.id, body: { label, url, location: item.location, group: group || null, order: item.order, isVisible: item.isVisible } })}>Save</Button>}
      <span className="ml-auto flex">
        <Button variant="ghost" size="icon-sm" onClick={() => patch.mutate({ id: item.id, body: { isVisible: !item.isVisible } })} aria-label={item.isVisible ? "Hide" : "Show"}>{item.isVisible ? <Eye /> : <EyeOff />}</Button>
        <ConfirmDialog title="Remove this menu item?" onConfirm={() => remove.mutateAsync(item.id)} trigger={<Button variant="ghost" size="icon-sm" aria-label="Remove"><Trash2 /></Button>} />
      </span>
    </div>
  );
}

function Menu({ location }: { location: "HEADER" | "FOOTER" }) {
  const { data, isLoading } = useList<Row>("nav", { location, limit: 100, sort: "order" });
  const reorder = useReorder("nav");
  const create = useSave("nav");
  const [items, setItems] = useState<Row[]>([]);
  useEffect(() => { if (data) setItems(data.items); }, [data]);
  if (isLoading) return <Skeleton className="h-40" />;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-medium uppercase tracking-wider text-text-muted">{location === "HEADER" ? "Header menu" : "Footer menu"}</h3>
        <Button variant="outline" size="sm" onClick={() => create.mutate({ body: { label: "New link", url: "/", location, group: location === "FOOTER" ? "Company" : null, isVisible: true } })}><Plus />Add link</Button>
      </div>
      <SortableList items={items} onReorder={(next) => { setItems(next); reorder.mutate(next.map((i) => i.id)); }} render={(item) => <ItemRow item={item} />} />
    </div>
  );
}

export function NavEditor() {
  return <div className="space-y-8"><Menu location="HEADER" /><Menu location="FOOTER" /></div>;
}
