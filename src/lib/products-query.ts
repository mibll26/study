import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export type ProductQuery = {
  q?: string; category?: string; ingredient?: string; keyword?: string;
  priceMin?: number; priceMax?: number; scoreMin?: number; candidate?: boolean;
  sort?: "score" | "price" | "recent"; page?: number; pageSize?: number;
};

export function parseQuery(sp: Record<string, string | string[] | undefined>): ProductQuery {
  const g = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const n = (k: string) => { const v = Number(g(k)); return g(k) && Number.isFinite(v) ? v : undefined; };
  const sort = g("sort");
  return {
    q: g("q") || undefined, category: g("category") || undefined, ingredient: g("ingredient") || undefined, keyword: g("keyword") || undefined,
    priceMin: n("priceMin"), priceMax: n("priceMax"), scoreMin: n("scoreMin"),
    candidate: g("candidate") === "1",
    sort: sort === "price" || sort === "recent" ? sort : "score",
    page: Math.max(1, n("page") ?? 1),
    pageSize: 20,
  };
}

export function buildWhere(q: ProductQuery): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};
  if (q.q) where.OR = [{ name: { contains: q.q } }, { brand: { contains: q.q } }, { maker: { contains: q.q } }, { mfdsCompany: { contains: q.q } }, { ingredient: { contains: q.q } }];
  if (q.category) where.category = { contains: q.category };
  if (q.ingredient) where.ingredient = { contains: q.ingredient };
  if (q.keyword) where.keyword = q.keyword;
  if (q.priceMin != null || q.priceMax != null) where.lowestPrice = { gte: q.priceMin ?? undefined, lte: q.priceMax ?? undefined };
  if (q.scoreMin != null) where.score = { gte: q.scoreMin };
  if (q.candidate) where.isCandidate = true;
  return where;
}

export function buildOrder(q: ProductQuery): Prisma.ProductOrderByWithRelationInput[] {
  if (q.sort === "price") return [{ lowestPrice: { sort: "asc", nulls: "last" } }];
  if (q.sort === "recent") return [{ collectedAt: "desc" }];
  return [{ score: { sort: "desc", nulls: "last" } }, { id: "asc" }];
}

export async function queryProducts(q: ProductQuery) {
  const where = buildWhere(q);
  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({ where, orderBy: buildOrder(q), skip: ((q.page ?? 1) - 1) * (q.pageSize ?? 20), take: q.pageSize ?? 20 }),
  ]);
  return { total, items, page: q.page ?? 1, pageSize: q.pageSize ?? 20 };
}

export async function facetOptions() {
  const [keywords, ingredients] = await Promise.all([
    prisma.product.groupBy({ by: ["keyword"], _count: true, orderBy: { keyword: "asc" } }),
    prisma.product.groupBy({ by: ["ingredient"], _count: true, where: { ingredient: { not: null } }, orderBy: { _count: { ingredient: "desc" } }, take: 30 }),
  ]);
  return { keywords: keywords.map((k) => k.keyword), ingredients: ingredients.map((i) => i.ingredient!).filter(Boolean) };
}
