import { Link } from "react-router";
import type { BlogPost } from "@/lib/types";
import { Img } from "@/components/ui/img";
import { Shimmer } from "@/components/ui/states";
import { cn } from "@/lib/utils";

export const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";

export function PostCard({ post, className, wide }: { post: BlogPost; className?: string; wide?: boolean }) {
  return (
    <article className={cn("group relative flex flex-col", wide && "md:grid md:grid-cols-2 md:items-center md:gap-10", className)}>
      <div className="overflow-hidden rounded-2xl border border-line">
        <Img src={post.coverImage} alt="" width={1600} height={900} className="aspect-[16/10] w-full transition duration-700 ease-out-expo group-hover:scale-[1.03]" />
      </div>
      <div className={cn("flex flex-1 flex-col pt-5", wide && "md:pt-0")}>
        <div className="flex items-center gap-3 text-xs text-text-muted">
          {post.category && <span className="rounded-full bg-brand-soft px-2.5 py-1 font-medium text-brand-text">{post.category.name}</span>}
          <time dateTime={post.publishedAt ?? undefined}>{formatDate(post.publishedAt)}</time>
          <span aria-hidden>·</span>
          <span>{post.readTime} min read</span>
        </div>
        <h3 className={cn("mt-3 font-semibold leading-snug tracking-tight", wide ? "text-h3-lg" : "text-lg")}>
          <Link to={`/blog/${post.slug}`} className="after:absolute after:inset-0 group-hover:text-brand-text">{post.title}</Link>
        </h3>
        <p className={cn("mt-2 text-sm leading-relaxed text-text-muted", !wide && "line-clamp-2", wide && "md:text-base")}>{post.excerpt}</p>
        {wide && post.author && <p className="mt-6 text-sm text-text-muted">By <span className="text-text">{post.author.name}</span></p>}
      </div>
    </article>
  );
}

export function PostCardSkeleton() {
  return (
    <div aria-hidden>
      <Shimmer className="aspect-[16/10] w-full rounded-2xl" />
      <Shimmer className="mt-5 h-4 w-40" />
      <Shimmer className="mt-3 h-5 w-full" />
      <Shimmer className="mt-2 h-5 w-2/3" />
    </div>
  );
}
