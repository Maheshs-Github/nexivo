import type { ReactNode } from "react";
import {
  DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

function Row({ id, children }: { id: number; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex items-center gap-2 rounded-lg border border-line bg-surface/60 px-2 py-2", isDragging && "relative z-10 border-brand shadow-float")}>
      <button type="button" ref={setActivatorNodeRef} {...attributes} {...listeners} aria-label="Drag to reorder (Space to lift, arrows to move)"
        className="grid size-7 shrink-0 cursor-grab touch-none place-items-center rounded-md text-text-muted hover:bg-surface-2 hover:text-text active:cursor-grabbing">
        <GripVertical className="size-4" aria-hidden />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </li>
  );
}

/** Drag-and-drop list (mouse, touch and keyboard). Calls onReorder with the new id order. */
export function SortableList<T extends { id: number }>({ items, onReorder, render }: { items: T[]; onReorder: (items: T[]) => void; render: (item: T, index: number) => ReactNode }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    onReorder(arrayMove(items, from, to));
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-1.5">{items.map((item, i) => <Row key={item.id} id={item.id}>{render(item, i)}</Row>)}</ul>
      </SortableContext>
    </DndContext>
  );
}
