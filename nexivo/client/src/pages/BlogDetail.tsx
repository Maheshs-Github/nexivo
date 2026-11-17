import { useMemo, useRef } from "react";
import { Link, useParams } from "react-router";
import { useBlog, useSettings } from "@/hooks/usePublic";
import { ApiError } from "@/lib/api";
import { Seo, absolute, breadcrumbLd } from "@/components/Seo";
import { NotFoundView } from "@/components/NotFoundView";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Img } from "@/components/ui/img";
import { ErrorState, Shimmer } from "@/components/ui/states";
import { PostCard, formatDate } from "@/components/blog/PostCard";
import { ReadingProgress, ShareLinks, TableOfContents, useActiveHeading, useArticle } from "@/components/blog/ArticleParts";

export default function BlogDetail() {
  const { slug = "" } = useParams();
  const { data, isLoading, isError, error, refetch } = useBlog(slug);
  const { data: settings } = useSettings();
  const articleRef = useRef<HTMLElement>(null);
  const { html, toc } = useArticle(data?.post.content ?? "");
  const ids = useMemo(() => toc.map((t) => t.id), [toc]);
  const active = useActiveHeading(ids);

  if (isLoading) return <div className="container-prose py-24"><Shimmer className="h-4 w-40" /><Shimmer className="mt-6 h-12 w-full" /><Shimmer className="mt-3 h-12 w-3/4" /><Shimmer className="mt-12 aspect-[16/9] w-full" /></div>;
  if (isError && error instanceof ApiError && error.status === 404) return <NotFoundView title="This article isn't available" text="It may have been unpublished or moved." backHref="/blog" backLabel="All articles" />;
  if (isError || !data) return <div className="container-x py-24"><ErrorState onRetry={() => refetch()} /></div>;

  const { post, related } = data;
  const url = typeof window !== "undefined" ? window.location.href.split("#")[0] : "";
  const crumbs = [{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: post.title, path: `/blog/${post.slug}` }];
  const ld = {
    "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description: post.seoDescription || post.excerpt,
    image: absolute(post.coverImage), datePublished: post.publishedAt, dateModified: post.updatedAt, mainEntityOfPage: url,
    author: post.author ? { "@type": "Person", name: post.author.name, jobTitle: post.author.title ?? undefined } : undefined,
    publisher: { "@type": "Organization", name: settings?.general.siteName, logo: { "@type": "ImageObject", url: absolute("/favicon.svg") } },
    keywords: post.tags.map((t) => t.name).join(", ") || undefined, articleSection: post.category?.name,
  };

  return (
    <>
      <Seo title={post.seoTitle || post.title} description={post.seoDescription || post.excerpt} image={post.coverImage} type="article" jsonLd={[ld, breadcrumbLd(crumbs)]} />
      <ReadingProgress target={articleRef} />

      <header className="pb-10 pt-14 md:pt-20">
        <div className="container-x">
          <Breadcrumbs items={crumbs} />
          <div className="mt-10 max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
              {post.category && <Link to={`/blog?category=${post.category.slug}`} className="rounded-full bg-brand-soft px-3 py-1 font-medium text-brand-text hover:underline">{post.category.name}</Link>}
              <time dateTime={post.publishedAt ?? undefined}>{formatDate(post.publishedAt)}</time><span aria-hidden>·</span><span>{post.readTime} min read</span>
            </div>
            <h1 className="mt-6 text-h1 font-semibold">{post.title}</h1>
            <p className="lead mt-6 max-w-3xl">{post.excerpt}</p>
            {post.author && (
              <div className="mt-8 flex items-center gap-3">
                <span aria-hidden className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-2 font-display text-sm font-semibold text-white">{post.author.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}</span>
                <div className="text-sm"><p className="font-medium">{post.author.name}</p>{post.author.title && <p className="text-text-muted">{post.author.title}</p>}</div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container-x">
        <div className="overflow-hidden rounded-3xl border border-line"><Img src={post.coverImage} alt="" width={1600} height={900} priority className="aspect-[16/8] w-full" /></div>
      </div>

      <div className="container-x grid gap-12 py-16 lg:grid-cols-12 lg:gap-10">
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-[calc(var(--nav-h)+2.5rem)]"><TableOfContents toc={toc} active={active} /></div>
        </aside>
        <article ref={articleRef} className="min-w-0 lg:col-span-7 lg:col-start-5">
          {/* Sanitized on the server (sanitize-html) before it was saved. */}
          <div className="prose-nexivo" dangerouslySetInnerHTML={{ __html: html }} />
          {post.tags.length > 0 && (
            <ul className="mt-12 flex flex-wrap gap-2" aria-label="Tags">
              {post.tags.map((t) => <li key={t.id}><Link to={`/blog?tag=${t.slug}`} className="inline-flex rounded-full border border-line px-3 py-1 text-sm text-text-muted hover:text-text">#{t.name}</Link></li>)}
            </ul>
          )}
          <div className="mt-10 border-t border-line pt-8"><ShareLinks title={post.title} url={url} /></div>
          {post.author && (
            <section aria-label="About the author" className="mt-10 flex gap-5 rounded-2xl border border-line bg-surface/40 p-6">
              <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-2 font-display font-semibold text-white">{post.author.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}</span>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-text-muted">Written by</p>
                <p className="mt-1 font-display text-lg font-semibold">{post.author.name}</p>
                {post.author.title && <p className="text-sm text-brand-text">{post.author.title}</p>}
                {post.author.bio && <p className="mt-3 text-sm leading-relaxed text-text-muted">{post.author.bio}</p>}
              </div>
            </section>
          )}
        </article>
      </div>

      {related.length > 0 && (
        <section className="border-t border-line py-20">
          <div className="container-x">
            <h2 className="text-h2 font-semibold">Keep reading</h2>
            <div className="mt-10 grid gap-x-6 gap-y-12 md:grid-cols-3">{related.map((p) => <PostCard key={p.id} post={p} />)}</div>
          </div>
        </section>
      )}
    </>
  );
}
