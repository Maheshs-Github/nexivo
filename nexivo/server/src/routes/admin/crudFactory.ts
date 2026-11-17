import { Router } from "express";
import { z, type ZodType } from "zod";
import { prisma } from "../../lib/prisma.js";
import { validate } from "../../middleware/validate.js";
import { idParam, listQuery, reorderBody, type ListQuery } from "../../schemas/common.js";
import { done, notFound, ok } from "../../utils/http.js";
import { uniqueSlug } from "../../utils/slug.js";
import { sanitizeRich } from "../../utils/sanitize.js";

type Row = Record<string, unknown>;
/** Minimal structural view of a Prisma model delegate (all generated delegates satisfy it). */
interface Delegate {
  findMany(args: unknown): Promise<Row[]>;
  findUnique(args: unknown): Promise<Row | null>;
  findFirst(args: unknown): Promise<Row | null>;
  count(args?: unknown): Promise<number>;
  create(args: unknown): Promise<Row>;
  update(args: unknown): Promise<Row>;
  delete(args: unknown): Promise<Row>;
}

export interface CrudConfig {
  /** Prisma delegate name, e.g. "teamMember". */
  model: "service" | "testimonial" | "teamMember" | "clientLogo" | "project" | "category" | "tag" | "job" | "navItem" | "section" | "pageSEO";
  label: string;
  schema: ZodType<Row>;
  /** Schema for partial PATCH updates (defaults to visibility/order toggles). */
  patchSchema?: ZodType<Row>;
  searchFields?: string[];
  sortable?: string[];
  defaultSort?: string;
  /** Query keys that become exact-match filters. "bool" values are parsed from "true"/"false". */
  filters?: Record<string, "string" | "bool">;
  /** Maps a query-param name to a different Prisma field name (e.g. "pageKey" → "page"). */
  filterAlias?: Record<string, string>;
  orderable?: boolean;
  slugFrom?: string;
  richFields?: string[];
  include?: Row;
  /** Extra per-model clean-up before saving (e.g. sanitising HTML nested in JSON). */
  transform?: (data: Row) => Row;
}

const defaultPatch = z.object({ isVisible: z.boolean().optional(), order: z.number().int().min(0).optional() });

export function crudRouter(cfg: CrudConfig) {
  const db = (prisma as unknown as Record<string, Delegate>)[cfg.model];
  const router = Router();
  const sortable = new Set(cfg.sortable ?? ["createdAt", "updatedAt", ...(cfg.orderable ? ["order"] : [])]);
  const defaultSort = cfg.defaultSort ?? (cfg.orderable ? "order" : "-createdAt");

  async function prepare(data: Row, selfId?: number) {
    const out = cfg.transform ? cfg.transform({ ...data }) : { ...data };
    for (const f of cfg.richFields ?? []) if (typeof out[f] === "string") out[f] = sanitizeRich(out[f] as string);
    if (cfg.slugFrom) {
      const base = (out.slug as string) || (out[cfg.slugFrom] as string);
      if (base) {
        out.slug = await uniqueSlug(base, async (slug) => !!(await db.findFirst({ where: { slug, ...(selfId ? { NOT: { id: selfId } } : {}) }, select: { id: true } })));
      } else delete out.slug;
    }
    return out;
  }

  function buildWhere(q: ListQuery) {
    const where: Row = {};
    if (q.q && cfg.searchFields?.length) where.OR = cfg.searchFields.map((f) => ({ [f]: { contains: q.q } }));
    for (const [key, kind] of Object.entries(cfg.filters ?? {})) {
      const raw = q[key];
      if (typeof raw !== "string" || raw === "") continue;
      const dbField = cfg.filterAlias?.[key] ?? key;
      where[dbField] = kind === "bool" ? raw === "true" : raw;
    }
    return where;
  }

  router.get("/", validate(listQuery, "query"), async (req, res) => {
    const q = req.query as unknown as ListQuery;
    const sortKey = q.sort && sortable.has(q.sort.replace(/^-/, "")) ? q.sort : defaultSort;
    const orderBy = { [sortKey.replace(/^-/, "")]: sortKey.startsWith("-") ? "desc" : "asc" };
    const where = buildWhere(q);
    const [items, total] = await Promise.all([
      db.findMany({ where, orderBy: [orderBy, { id: "asc" }], skip: (q.page - 1) * q.limit, take: q.limit, ...(cfg.include ? { include: cfg.include } : {}) }),
      db.count({ where }),
    ]);
    ok(res, { items, total, page: q.page, pages: Math.max(1, Math.ceil(total / q.limit)) });
  });

  if (cfg.orderable) {
    router.patch("/reorder", validate(reorderBody), async (req, res) => {
      const { ids } = req.body as z.infer<typeof reorderBody>;
      await prisma.$transaction(ids.map((id, index) => db.update({ where: { id }, data: { order: index } }) as never));
      done(res, `${cfg.label} order saved`);
    });
  }

  router.get("/:id", validate(idParam, "params"), async (req, res) => {
    const row = await db.findUnique({ where: { id: Number(req.params.id) }, ...(cfg.include ? { include: cfg.include } : {}) });
    if (!row) throw notFound(cfg.label);
    ok(res, row);
  });

  router.post("/", validate(cfg.schema), async (req, res) => {
    const data = await prepare(req.body as Row);
    if (cfg.orderable && data.order === undefined) data.order = await db.count();
    ok(res, await db.create({ data }), 201, `${cfg.label} created`);
  });

  router.put("/:id", validate(idParam, "params"), validate(cfg.schema), async (req, res) => {
    const id = Number(req.params.id);
    ok(res, await db.update({ where: { id }, data: await prepare(req.body as Row, id) }), 200, `${cfg.label} saved`);
  });

  router.patch("/:id", validate(idParam, "params"), validate(cfg.patchSchema ?? defaultPatch), async (req, res) => {
    const id = Number(req.params.id);
    ok(res, await db.update({ where: { id }, data: await prepare(req.body as Row, id) }), 200, `${cfg.label} updated`);
  });

  router.delete("/:id", validate(idParam, "params"), async (req, res) => {
    await db.delete({ where: { id: Number(req.params.id) } });
    done(res, `${cfg.label} deleted`);
  });

  return router;
}
