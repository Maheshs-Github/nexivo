import { Link } from "react-router";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs({ items }: { items: { name: string; path?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-text-muted">
        {items.map((it, i) => (
          <li key={i} className="inline-flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="size-3.5 opacity-60" aria-hidden />}
            {it.path && i < items.length - 1 ? (
              <Link to={it.path} className="transition-colors hover:text-text">{it.name}</Link>
            ) : (
              <span aria-current="page" className="line-clamp-1 text-text">{it.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
