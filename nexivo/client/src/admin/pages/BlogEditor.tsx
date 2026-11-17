import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { ArrowLeft, ExternalLink, LoaderCircle, Send, Trash2, Undo2 } from "lucide-react";
import { blogBody } from "@shared/blog";
import type { BlogPost, Category } from "@/lib/types";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";
import { ConfirmDialog, Panel, StatusBadge } from "../components/kit";
import { FieldShell } from "../components/FormKit";
import { ImageField } from "../components/MediaPicker";
import { RichEditor } from "../components/RichEditor";
import { TagInput } from "../components/TagInput";
import { SeoPanel } from "../components/SeoPanel";
import { useItem, useList, useRemove, useSave } from "../lib/resource";

type Values = z.input<typeof blogBody>;
const empty: Values = { title: "", slug: "", excerpt: "", content: "", coverImage: "", status: "DRAFT", categoryId: null, tags: [], seoTitle: "", seoDescription: "", featured: false };
const toSlug = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 120);
const words = (html: string) => html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

export default function BlogEditor() {
  const { id: idParam } = useParams();
  const id = idParam ? Number(idParam) : null;
  const navigate = useNavigate();
  const { data: post, isLoading, isError, refetch } = useItem<BlogPost>("blogs", id);
  const { data: cats } = useList<Category>("categories", { limit: 100 });
  const save = useSave<BlogPost>("blogs");
  const remove = useRemove("blogs");

  const form = useForm<Values>({ resolver: zodResolver(blogBody), defaultValues: empty });
  const { register, control, handleSubmit, reset, setValue, formState: { errors, isDirty, dirtyFields } } = form;
  useEffect(() => {
    if (post) reset({ title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content ?? "", coverImage: post.coverImage ?? "", status: post.status,
      categoryId: post.categoryId, tags: post.tags.map((t) => t.name), seoTitle: post.seoTitle ?? "", seoDescription: post.seoDescription ?? "", featured: post.featured });
  }, [post, reset]);

  // Auto slug from the title until the editor types their own (new posts only).
  const [title, content, status] = useWatch({ control, name: ["title", "content", "status"] });
  useEffect(() => { if (!id && !dirtyFields.slug) setValue("slug", toSlug(title ?? "")); }, [title, id, dirtyFields.slug, setValue]);
  const wc = useMemo(() => words(content ?? ""), [content]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!isDirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [isDirty]);

  const submit = (nextStatus?: "DRAFT" | "PUBLISHED") => handleSubmit(async (values) => {
    try {
      const res = await save.mutateAsync({ id, body: { ...values, status: nextStatus ?? values.status } });
      reset({ ...values, status: res.data.status, slug: res.data.slug });
      if (!id) navigate(`/admin/blogs/${res.data.id}`, { replace: true });
    } catch (e) {
      if (e instanceof ApiError && e.errors) for (const [k, v] of Object.entries(e.errors)) form.setError(k as keyof Values, { message: v[0] });
    }
  });
  const back = () => { if (!isDirty || window.confirm("You have unsaved changes. Leave anyway?")) navigate("/admin/blogs"); };

  if (id && isLoading) return <div className="grid gap-6 lg:grid-cols-[1fr_320px]"><Skeleton className="h-[32rem]" /><Skeleton className="h-96" /></div>;
  if (id && isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <FormProvider {...form}>
      <form onSubmit={submit()} noValidate>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="icon" onClick={back} aria-label="Back to posts"><ArrowLeft /></Button>
            <h1 className="font-display text-lg font-semibold">{id ? "Edit post" : "New post"}</h1>
            <StatusBadge status={status ?? "DRAFT"} />
            {isDirty && <span className="text-xs text-warning">Unsaved changes</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            {post?.status === "PUBLISHED" && <Button type="button" variant="ghost" asChild><a href={`/blog/${post.slug}`} target="_blank" rel="noopener"><ExternalLink />View</a></Button>}
            {status === "PUBLISHED"
              ? <Button type="button" variant="outline" disabled={save.isPending} onClick={submit("DRAFT")}><Undo2 />Unpublish</Button>
              : <Button type="button" variant="outline" disabled={save.isPending} onClick={submit("DRAFT")}>Save draft</Button>}
            <Button type="button" disabled={save.isPending} onClick={submit("PUBLISHED")}>
              {save.isPending ? <LoaderCircle className="animate-spin" /> : <Send />}{status === "PUBLISHED" ? "Update" : "Publish"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-4">
            <div>
              <label htmlFor="title" className="sr-only">Title</label>
              <input id="title" {...register("title")} placeholder="Post title" aria-invalid={!!errors.title}
                className="w-full bg-transparent font-display text-3xl font-semibold tracking-tight outline-none placeholder:text-text-muted/50" />
              {errors.title && <p role="alert" className="mt-1 text-xs text-danger">{errors.title.message}</p>}
            </div>
            <FieldShell id="excerpt" label="Excerpt" hint="One or two sentences shown on cards and in search results." error={errors.excerpt?.message}>
              <Textarea id="excerpt" rows={2} {...register("excerpt")} aria-invalid={!!errors.excerpt} />
            </FieldShell>
            <div>
              <Controller control={control} name="content" render={({ field }) => <RichEditor value={field.value ?? ""} onChange={field.onChange} />} />
              <p className="mt-1.5 flex justify-between text-xs text-text-muted">
                <span>{errors.content ? <span className="text-danger">{errors.content.message}</span> : "Headings (H2/H3) build the article's table of contents."}</span>
                <span className="tabular-nums">{wc.toLocaleString()} words · {Math.max(1, Math.round(wc / 220))} min read</span>
              </p>
            </div>
          </div>

          <aside className="space-y-4">
            <Panel title="Cover image"><Controller control={control} name="coverImage" render={({ field }) => <ImageField value={field.value} onChange={field.onChange} />} /></Panel>
            <Panel title="Organisation">
              <div className="space-y-3">
                <FieldShell id="category" label="Category">
                  <Controller control={control} name="categoryId" render={({ field }) => (
                    <Select value={field.value ? String(field.value) : "none"} onValueChange={(v) => field.onChange(v === "none" ? null : Number(v))}>
                      <SelectTrigger id="category" className="h-8 w-full"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="none">Uncategorised</SelectItem>{cats?.items.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  )} />
                </FieldShell>
                <FieldShell id="tags" label="Tags"><Controller control={control} name="tags" render={({ field }) => <TagInput id="tags" value={field.value ?? []} onChange={field.onChange} />} /></FieldShell>
                <FieldShell id="slug" label="URL slug" error={errors.slug?.message} hint="Lowercase letters, numbers and dashes.">
                  <Input id="slug" {...register("slug")} className="h-8 font-mono text-xs" />
                </FieldShell>
                <label className="flex items-center gap-2 text-xs"><input type="checkbox" {...register("featured")} className="size-4 accent-[var(--brand)]" />Feature this post</label>
              </div>
            </Panel>
            <SeoPanel path="blog" />
            {id && (
              <ConfirmDialog title="Delete this post?" description="It will be removed from the site immediately. This cannot be undone."
                onConfirm={async () => { await remove.mutateAsync(id); reset(empty); navigate("/admin/blogs"); }}
                trigger={<Button type="button" variant="destructive" className="w-full"><Trash2 />Delete post</Button>} />
            )}
          </aside>
        </div>
      </form>
    </FormProvider>
  );
}
