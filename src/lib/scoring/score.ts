import { prisma } from "@/lib/db";
import { getSettings, type Settings } from "@/lib/settings";
import type { Product, ScoreWeight } from "@prisma/client";

export type MetricKey = "demand" | "competition" | "priceMargin" | "priceBand" | "certified" | "ingredientTrend";
export const METRIC_KEYS: MetricKey[] = ["demand", "competition", "priceMargin", "priceBand", "certified", "ingredientTrend"];

export type MetricDetail = {
  key: MetricKey;
  label: string;
  raw: number | null;       // 원시값 (null = 데이터 없음)
  normalized: number;       // 0~1, 방향 적용 후 (높을수록 좋음)
  weight: number;
  contribution: number;     // 0~100 스케일 기여 점수
};

export type ScoreDetail = { total: number; metrics: MetricDetail[]; computedAt: string };

type Context = {
  weights: ScoreWeight[];
  settings: Settings;
  trends: Map<string, number>;
  ingredientCompanyCount: Map<string, number>;
  keywordProductCount: Map<string, number>;
  ranges: Record<MetricKey, { min: number; max: number }>;
};

/** 제품 하나의 지표 원시값 */
function rawMetrics(p: Product, ctx: Context): Record<MetricKey, number | null> {
  const demand = p.searchTotal != null ? Math.log10(p.searchTotal + 1) : null;
  const competition = ctx.keywordProductCount.get(p.keyword) ?? null;
  const priceMargin =
    p.lowestPrice && p.highestPrice && p.lowestPrice > 0 ? (p.highestPrice - p.lowestPrice) / p.lowestPrice : null;

  let priceBand: number | null = null;
  if (p.lowestPrice != null) {
    const { targetPriceMin: lo, targetPriceMax: hi } = ctx.settings;
    if (p.lowestPrice >= lo && p.lowestPrice <= hi) priceBand = 1;
    else {
      const dist = p.lowestPrice < lo ? (lo - p.lowestPrice) / lo : (p.lowestPrice - hi) / hi;
      priceBand = Math.max(0, 1 - dist);
    }
  }

  let certified: number | null = null;
  if (p.mfdsReportNo) {
    const companies = p.ingredient ? (ctx.ingredientCompanyCount.get(p.ingredient) ?? 1) : 1;
    certified = 1 + Math.log10(companies);
  } else if (p.source === "naver") certified = 0;

  const ingredientTrend = p.ingredient ? (ctx.trends.get(p.ingredient) ?? 3) : null;

  return { demand, competition, priceMargin, priceBand, certified, ingredientTrend };
}

function normalize(v: number | null, range: { min: number; max: number }, direction: string): number {
  if (v == null) return 0.5;
  const span = range.max - range.min;
  let n = span > 0 ? (v - range.min) / span : 0.5;
  n = Math.min(1, Math.max(0, n));
  return direction === "desc" ? 1 - n : n;
}

export function computeScore(p: Product, ctx: Context): ScoreDetail {
  const raws = rawMetrics(p, ctx);
  const weightSum = ctx.weights.reduce((s, w) => s + w.weight, 0) || 1;
  const metrics: MetricDetail[] = ctx.weights.map((w) => {
    const key = w.key as MetricKey;
    const raw = raws[key];
    const normalized = normalize(raw, ctx.ranges[key], w.direction);
    return { key, label: w.label, raw, normalized, weight: w.weight, contribution: (w.weight * normalized) / weightSum * 100 };
  });
  const total = Math.round(metrics.reduce((s, m) => s + m.contribution, 0) * 10) / 10;
  return { total, metrics, computedAt: new Date().toISOString() };
}

async function buildContext(products: Product[]): Promise<Context> {
  const [weights, settings, trendRows] = await Promise.all([
    prisma.scoreWeight.findMany({ orderBy: { order: "asc" } }),
    getSettings(),
    prisma.ingredientTrend.findMany(),
  ]);
  const trends = new Map(trendRows.map((t) => [t.ingredient, t.level]));

  const keywordProductCount = new Map<string, number>();
  const ingredientCompanies = new Map<string, Set<string>>();
  for (const p of products) {
    keywordProductCount.set(p.keyword, (keywordProductCount.get(p.keyword) ?? 0) + 1);
    if (p.ingredient && p.mfdsCompany) {
      if (!ingredientCompanies.has(p.ingredient)) ingredientCompanies.set(p.ingredient, new Set());
      ingredientCompanies.get(p.ingredient)!.add(p.mfdsCompany);
    }
  }
  const ingredientCompanyCount = new Map([...ingredientCompanies].map(([k, v]) => [k, v.size]));

  const partial: Context = {
    weights, settings, trends, ingredientCompanyCount, keywordProductCount,
    ranges: Object.fromEntries(METRIC_KEYS.map((k) => [k, { min: Infinity, max: -Infinity }])) as Context["ranges"],
  };
  // 전체 제품 기준 min–max
  for (const p of products) {
    const raws = rawMetrics(p, partial);
    for (const k of METRIC_KEYS) {
      const v = raws[k];
      if (v == null) continue;
      const r = partial.ranges[k];
      r.min = Math.min(r.min, v);
      r.max = Math.max(r.max, v);
    }
  }
  for (const k of METRIC_KEYS) {
    const r = partial.ranges[k];
    if (!isFinite(r.min)) partial.ranges[k] = { min: 0, max: 1 };
  }
  // priceBand, ingredientTrend는 절대 스케일 유지
  partial.ranges.priceBand = { min: 0, max: 1 };
  partial.ranges.ingredientTrend = { min: 1, max: 5 };
  return partial;
}

/** 전체 제품 점수 재계산 (가중치 변경, 수집 완료 후 호출) */
export async function recalculateAll(): Promise<number> {
  const products = await prisma.product.findMany();
  if (products.length === 0) return 0;
  const ctx = await buildContext(products);
  await prisma.$transaction(
    products.map((p) => {
      const detail = computeScore(p, ctx);
      return prisma.product.update({ where: { id: p.id }, data: { score: detail.total, scoreDetail: JSON.stringify(detail) } });
    }),
  );
  return products.length;
}

export function parseScoreDetail(s: string | null): ScoreDetail | null {
  if (!s) return null;
  try { return JSON.parse(s) as ScoreDetail; } catch { return null; }
}
