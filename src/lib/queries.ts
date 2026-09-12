import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { MOQ_BANDS, LEAD_BANDS, parseList } from "@/lib/constants";

// ── 공통: searchParams → 배열 ──
export type SP = Record<string, string | string[] | undefined>;
export const one = (sp: SP, k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : Array.isArray(sp[k]) ? (sp[k] as string[])[0] : undefined);
export const many = (sp: SP, k: string) => { const v = one(sp, k); return v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []; };

// ── 원료 탐색 ──
export type ExploreQuery = { q?: string; countries: string[]; functionality: string[]; type: "ingredient" | "product" | "all"; approval: string[]; forms: string[]; withSupplier: boolean; sort: "relevance" | "recent" | "suppliers" };

export function parseExplore(sp: SP): ExploreQuery {
  const type = one(sp, "type");
  const sort = one(sp, "sort");
  return {
    q: one(sp, "q")?.trim() || undefined,
    countries: many(sp, "country"), functionality: many(sp, "fn"), approval: many(sp, "approval"), forms: many(sp, "form"),
    type: type === "product" || type === "ingredient" ? type : "all",
    withSupplier: one(sp, "supplier_only") === "1",
    sort: sort === "recent" || sort === "suppliers" ? sort : "relevance",
  };
}

export async function exploreIngredients(q: ExploreQuery) {
  const AND: Prisma.IngredientWhereInput[] = [];
  if (q.q) {
    const t = q.q;
    AND.push({ OR: [{ nameKo: { contains: t, mode: "insensitive" } }, { nameEn: { contains: t, mode: "insensitive" } }, { nameScientific: { contains: t, mode: "insensitive" } }, { aliases: { contains: t, mode: "insensitive" } }, { functionality: { contains: t, mode: "insensitive" } }, { category: { contains: t, mode: "insensitive" } }] });
  }
  for (const f of q.functionality) AND.push({ functionality: { contains: `"${f}"` } });
  for (const f of q.forms) AND.push({ dosageForms: { contains: `"${f}"` } });
  if (q.countries.length) AND.push({ statuses: { some: { countryCode: { in: q.countries }, published: true } } });
  if (q.approval.length) AND.push({ statuses: { some: { countryCode: "KR", approvalType: { in: q.approval } } } });
  if (q.withSupplier) AND.push({ suppliers: { some: { supplier: { visible: true } } } });

  const rows = await prisma.ingredient.findMany({
    where: { AND },
    include: { statuses: { where: { published: true }, select: { countryCode: true, legalityStatus: true, usable: true, approvalType: true } }, _count: { select: { suppliers: true, products: true } } },
    orderBy: q.sort === "recent" ? { updatedAt: "desc" } : { nameKo: "asc" },
  });
  const sorted = q.sort === "suppliers" ? rows.sort((a, b) => b._count.suppliers - a._count.suppliers) : rows;
  // 관련도: 이름 정확 일치 우선
  if (q.sort === "relevance" && q.q) {
    const t = q.q.toLowerCase();
    sorted.sort((a, b) => Number(b.nameKo.toLowerCase().includes(t) || b.nameEn.toLowerCase().includes(t)) - Number(a.nameKo.toLowerCase().includes(t) || a.nameEn.toLowerCase().includes(t)));
  }
  return sorted;
}

export async function exploreProducts(q: ExploreQuery, take = 30) {
  if (q.type === "ingredient") return [];
  const AND: Prisma.MfdsProductWhereInput[] = [];
  if (q.q) AND.push({ OR: [{ name: { contains: q.q, mode: "insensitive" } }, { company: { contains: q.q, mode: "insensitive" } }, { ingredientRaw: { contains: q.q, mode: "insensitive" } }, { functionality: { contains: q.q, mode: "insensitive" } }] });
  if (q.functionality.length) AND.push({ OR: q.functionality.map((f) => ({ functionality: { contains: f } })) });
  return prisma.mfdsProduct.findMany({ where: { AND }, take, orderBy: { fetchedAt: "desc" }, include: { ingredient: { select: { slug: true, nameKo: true } } } });
}

// ── 공급사 디렉터리 ──
export type SupplierQuery = { countries: string[]; types: string[]; forms: string[]; certs: string[]; moq?: string; lead?: string; verifiedOnly: boolean; ingredient?: string };
export function parseSuppliers(sp: SP): SupplierQuery {
  return { countries: many(sp, "s_country"), types: many(sp, "s_type"), forms: many(sp, "s_form"), certs: many(sp, "s_cert"), moq: one(sp, "s_moq"), lead: one(sp, "s_lead"), verifiedOnly: one(sp, "s_verified") === "1", ingredient: one(sp, "s_ingredient") };
}
export async function listSuppliers(q: SupplierQuery) {
  const AND: Prisma.SupplierWhereInput[] = [{ visible: true }];
  if (q.countries.length) AND.push({ countryCode: { in: q.countries } });
  for (const t of q.types) AND.push({ supplierTypes: { contains: `"${t}"` } });
  for (const f of q.forms) AND.push({ dosageForms: { contains: `"${f}"` } });
  for (const c of q.certs) AND.push({ certifications: { contains: `"${c}"` } });
  if (q.verifiedOnly) AND.push({ verificationStatus: "verified" });
  if (q.ingredient) AND.push({ ingredients: { some: { ingredient: { slug: q.ingredient } } } });
  const band = MOQ_BANDS.find((b) => b.key === q.moq);
  if (band) AND.push({ moqMin: { gte: band.min ?? undefined, lte: band.max ?? undefined } });
  const lead = LEAD_BANDS.find((b) => b.key === q.lead);
  if (lead) AND.push({ leadWeeksMin: { gte: lead.min ?? undefined }, leadWeeksMax: { lte: lead.max ?? undefined } });
  return prisma.supplier.findMany({ where: { AND }, orderBy: [{ verificationStatus: "asc" }, { nameKo: "asc" }], include: { _count: { select: { ingredients: true } } } });
}

// ── 상세 ──
export async function getIngredient(slug: string) {
  const ing = await prisma.ingredient.findUnique({
    where: { slug },
    include: { statuses: { where: { published: true }, orderBy: { countryCode: "asc" } }, suppliers: { include: { supplier: true }, where: { supplier: { visible: true } } }, products: { take: 10, orderBy: { fetchedAt: "desc" } }, evidence: { orderBy: { level: "desc" } } },
  });
  if (!ing) return null;
  const order = ["KR", "US", "EU", "JP", "CN"];
  ing.statuses.sort((a, b) => order.indexOf(a.countryCode) - order.indexOf(b.countryCode));
  return ing;
}
export async function getSupplier(slug: string) {
  return prisma.supplier.findFirst({ where: { slug, visible: true }, include: { ingredients: { include: { ingredient: { select: { slug: true, nameKo: true, nameEn: true } } } } } });
}

// ── 자동완성 ──
export type Suggestion = { type: "원료" | "제품" | "기능성" | "공급사"; label: string; sub?: string; href: string };
export async function suggest(q: string): Promise<Suggestion[]> {
  const t = q.trim();
  if (t.length < 1) return [];
  const [ings, sups, prods] = await Promise.all([
    prisma.ingredient.findMany({ where: { OR: [{ nameKo: { contains: t, mode: "insensitive" } }, { nameEn: { contains: t, mode: "insensitive" } }, { aliases: { contains: t, mode: "insensitive" } }, { nameScientific: { contains: t, mode: "insensitive" } }] }, take: 5, select: { slug: true, nameKo: true, nameEn: true } }),
    prisma.supplier.findMany({ where: { visible: true, OR: [{ nameKo: { contains: t, mode: "insensitive" } }, { nameEn: { contains: t, mode: "insensitive" } }] }, take: 3, select: { slug: true, nameKo: true, nameEn: true } }),
    prisma.mfdsProduct.findMany({ where: { OR: [{ name: { contains: t, mode: "insensitive" } }, { company: { contains: t, mode: "insensitive" } }] }, take: 3, select: { id: true, name: true, company: true } }),
  ]);
  const fns = (await import("@/lib/constants")).FUNCTIONALITIES.filter((f) => f.includes(t)).slice(0, 3);
  return [
    ...ings.map((i) => ({ type: "원료" as const, label: i.nameKo, sub: i.nameEn, href: `/?ingredient=${i.slug}#explore` })),
    ...fns.map((f) => ({ type: "기능성" as const, label: f, href: `/?fn=${encodeURIComponent(f)}#explore` })),
    ...prods.map((p) => ({ type: "제품" as const, label: p.name, sub: p.company, href: `/?q=${encodeURIComponent(p.name)}&type=product#explore` })),
    ...sups.map((s) => ({ type: "공급사" as const, label: s.nameKo, sub: s.nameEn ?? undefined, href: `/?supplier=${s.slug}#suppliers` })),
  ];
}

/** 결과 없음 시 가장 가까운 원료 (편집거리) */
export async function nearestIngredient(q: string) {
  const all = await prisma.ingredient.findMany({ select: { slug: true, nameKo: true, nameEn: true, aliases: true } });
  const t = q.toLowerCase();
  const dist = (a: string, b: string) => {
    const m = a.length, n = b.length; const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
    for (let j = 1; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  };
  let best: { slug: string; nameKo: string; nameEn: string; score: number } | null = null;
  for (const i of all) {
    const cands = [i.nameKo, i.nameEn, ...parseList(i.aliases)].map((s) => s.toLowerCase());
    const s = Math.min(...cands.map((c) => dist(t, c) / Math.max(t.length, c.length)));
    if (!best || s < best.score) best = { slug: i.slug, nameKo: i.nameKo, nameEn: i.nameEn, score: s };
  }
  return best && best.score <= 0.6 ? best : null;
}

export async function siteStats() {
  const [ingredients, products, suppliers, countries] = await Promise.all([
    prisma.ingredient.count(), prisma.mfdsProduct.count(), prisma.supplier.count({ where: { visible: true } }),
    prisma.regulatoryStatus.groupBy({ by: ["countryCode"] }),
  ]);
  return { ingredients, products, suppliers, countries: countries.length };
}
