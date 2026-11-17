import { prisma } from "../lib/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
import type { BlogBody } from "../schemas/blog.js";
import { readTimeOf, sanitizeRich, stripTags } from "../utils/sanitize.js";
import { toSlug, uniqueSlug } from "../utils/slug.js";
import { notFound } from "../utils/http.js";

const authorSelect = { select: { id: true, name: true, title: true, bio: true, avatar: true } } as const;
const listInclude = {
  author: authorSelect,
  category: { select: { id: true, name: true, slug: true } },
  tags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
} satisfies Prisma.BlogPostInclude;

type WithTags = { tags: { tag: { id: number; name: string; slug: string } }[] };
const flattenTags = <T extends WithTags>(post: T) => ({ ...post, tags: post.tags.map((t) => t.tag) });

const published = (): Prisma.BlogPostWhereInput => ({ status: "PUBLISHED", publishedAt: { lte: new Date() } });

interface ListArgs { page: number; limit: number; q?: string; category?: string; tag?: string; status?: "DRAFT" | "PUBLISHED"; sort?: string }

function whereFor(args: ListArgs, publicOnly: boolean): Prisma.BlogPostWhereInput {
  const where: Prisma.BlogPostWhereInput = publicOnly ? published() : args.status ? { status: args.status } : {};
  if (args.q) where.OR = [{ title: { contains: args.q } }, { excerpt: { contains: args.q } }];
  if (args.category) where.category = { slug: args.category };
  if (args.tag) where.tags = { some: { tag: { slug: args.tag } } };
  return where;
}

export async function listPosts(args: ListArgs, publicOnly: boolean) {
  const where = whereFor(args, publicOnly);
  const sort = args.sort ?? "-publishedAt";
  const field = sort.replace(/^-/, "") as "updatedAt" | "publishedAt" | "title" | "views";
  const [rows, total] = await Promise.all([
    prisma.blogPost.findMany({
      where, include: listInclude, omit: { content: true },
      orderBy: [{ [field]: sort.startsWith("-") ? "desc" : "asc" }, { id: "desc" }],
      skip: (args.page - 1) * args.limit, take: args.limit,
    }),
    prisma.blogPost.count({ where }),
  ]);
  return { items: rows.map(flattenTags), total, page: args.page, pages: Math.max(1, Math.ceil(total / args.limit)) };
}

/** Public detail: published only, increments views, returns up to 3 related posts (same category, then most recent). */
export async function getPublicPost(slug: string) {
  const post = await prisma.blogPost.findFirst({ where: { slug, ...published() }, include: listInclude });
  if (!post) throw notFound("Post");
  await prisma.blogPost.update({ where: { id: post.id }, data: { views: { increment: 1 } }, select: { id: true } });

  const base = { ...published(), id: { not: post.id } };
  const related = post.categoryId
    ? await prisma.blogPost.findMany({ where: { ...base, categoryId: post.categoryId }, include: listInclude, omit: { content: true }, orderBy: { publishedAt: "desc" }, take: 3 })
    : [];
  if (related.length < 3) {
    related.push(...(await prisma.blogPost.findMany({
      where: { ...base, id: { notIn: [post.id, ...related.map((r) => r.id)] } },
      include: listInclude, omit: { content: true }, orderBy: { publishedAt: "desc" }, take: 3 - related.length,
    })));
  }
  return { post: flattenTags({ ...post, views: post.views + 1 }), related: related.map(flattenTags) };
}

export async function getAdminPost(id: number) {
  const post = await prisma.blogPost.findUnique({ where: { id }, include: listInclude });
  if (!post) throw notFound("Post");
  return flattenTags(post);
}

/** Finds or creates tags by name (create-on-type in the editor). */
async function resolveTags(names: string[]) {
  const unique = [...new Map(names.map((n) => [toSlug(n), n.trim()])).entries()];
  const tags = [];
  for (const [slug, name] of unique) tags.push(await prisma.tag.upsert({ where: { slug }, update: {}, create: { name, slug } }));
  return tags;
}

async function buildData(body: BlogBody, existing?: { id: number; publishedAt: Date | null }) {
  const content = sanitizeRich(body.content);
  const slug = await uniqueSlug(body.slug || body.title, async (s) =>
    !!(await prisma.blogPost.findFirst({ where: { slug: s, ...(existing ? { NOT: { id: existing.id } } : {}) }, select: { id: true } })));
  const publishedAt = body.status === "PUBLISHED" ? existing?.publishedAt ?? new Date() : existing?.publishedAt ?? null;
  return {
    title: stripTags(body.title), slug, excerpt: stripTags(body.excerpt), content, coverImage: body.coverImage,
    status: body.status, publishedAt, categoryId: body.categoryId ?? null, seoTitle: body.seoTitle, seoDescription: body.seoDescription,
    featured: body.featured ?? false, readTime: readTimeOf(content),
  };
}

export async function createPost(body: BlogBody, authorId: number) {
  const [data, tags] = await Promise.all([buildData(body), resolveTags(body.tags)]);
  const post = await prisma.blogPost.create({
    data: { ...data, authorId, tags: { create: tags.map((t) => ({ tagId: t.id })) } }, select: { id: true },
  });
  return getAdminPost(post.id);
}

export async function updatePost(id: number, body: BlogBody) {
  const existing = await prisma.blogPost.findUnique({ where: { id }, select: { id: true, publishedAt: true } });
  if (!existing) throw notFound("Post");
  const [data, tags] = await Promise.all([buildData(body, existing), resolveTags(body.tags)]);
  await prisma.$transaction([
    prisma.postTag.deleteMany({ where: { postId: id } }),
    prisma.blogPost.update({ where: { id }, data: { ...data, tags: { create: tags.map((t) => ({ tagId: t.id })) } }, select: { id: true } }),
  ]);
  return getAdminPost(id);
}

export async function setPostStatus(id: number, status: "DRAFT" | "PUBLISHED") {
  const existing = await prisma.blogPost.findUnique({ where: { id }, select: { publishedAt: true } });
  if (!existing) throw notFound("Post");
  await prisma.blogPost.update({ where: { id }, data: { status, publishedAt: status === "PUBLISHED" ? existing.publishedAt ?? new Date() : existing.publishedAt } });
  return getAdminPost(id);
}

export const deletePost = (id: number) => prisma.blogPost.delete({ where: { id }, select: { id: true } });

export const publicCategories = () =>
  prisma.category.findMany({
    where: { posts: { some: published() } }, orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, _count: { select: { posts: { where: published() } } } },
  });
