import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { getCredentials } from "@/lib/credentials";
import { fetchMfds } from "./mfds";
import { fetchNaver } from "./naver";
import { recalculateAll } from "@/lib/scoring/score";

export type Source = "mfds" | "naver";
export type CollectResult = { jobId: number; keyword: string; status: string; mfdsCount: number; naverCount: number; error?: string };

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try { return await fn(); } catch { return await fn(); }
}

/** 키워드 1개 수집 → CollectJob 기록. 소스별 실패는 부분성공으로 처리 (FR-05, FR-06) */
export async function collectKeyword(keyword: string, sources: Source[]): Promise<CollectResult> {
  const job = await prisma.collectJob.create({ data: { keyword, sources: sources.join(","), status: "running" } });
  const [settings, cred] = await Promise.all([getSettings(), getCredentials()]);
  const errors: string[] = [];
  let mfdsCount = 0, naverCount = 0;

  if (sources.includes("mfds")) {
    try {
      const items = await withRetry(() => fetchMfds(keyword, cred.mfdsApiKey));
      for (const it of items) {
        await prisma.product.upsert({
          where: { mfdsReportNo: it.reportNo },
          update: { name: it.name, mfdsCompany: it.company, mfdsReportDate: it.reportDate, functionality: it.functionality, ingredient: it.ingredient, intakeMethod: it.intakeMethod, collectedAt: new Date() },
          create: { keyword, name: it.name, maker: it.company, mfdsReportNo: it.reportNo, mfdsCompany: it.company, mfdsReportDate: it.reportDate, functionality: it.functionality, ingredient: it.ingredient, intakeMethod: it.intakeMethod, source: "mfds" },
        });
        mfdsCount++;
      }
    } catch (e) { errors.push(`식약처: ${(e as Error).message}`); }
  }

  if (sources.includes("naver")) {
    try {
      const { total, items } = await withRetry(() => fetchNaver(keyword, cred.naverClientId, cred.naverClientSecret, settings.naverMaxPages));
      // 동일 상품(productId)이 여러 몰에서 나오면 판매몰 수로 집계
      const malls = new Map<string, Set<string>>();
      for (const it of items) {
        if (!malls.has(it.productId)) malls.set(it.productId, new Set());
        if (it.mallName) malls.get(it.productId)!.add(it.mallName);
      }
      for (const it of items) {
        const common = { name: it.title, brand: it.brand, maker: it.maker, category: it.category, lowestPrice: it.lprice, highestPrice: it.hprice, mallName: it.mallName, mallCount: malls.get(it.productId)?.size ?? 1, searchTotal: total, productUrl: it.link, imageUrl: it.image, collectedAt: new Date() };
        await prisma.product.upsert({
          where: { naverProductId: it.productId },
          update: common,
          create: { keyword, naverProductId: it.productId, source: "naver", ...common },
        });
        naverCount++;
      }
    } catch (e) { errors.push(`네이버: ${(e as Error).message}`); }
  }

  const attempted = sources.length;
  const failed = errors.length;
  const status = failed === 0 ? "success" : failed < attempted ? "partial" : "failed";
  await prisma.collectJob.update({ where: { id: job.id }, data: { status, mfdsCount, naverCount, error: errors.join(" | ") || null, finishedAt: new Date() } });

  if (mfdsCount + naverCount > 0) await recalculateAll(); // FR-08
  return { jobId: job.id, keyword, status, mfdsCount, naverCount, error: errors.join(" | ") || undefined };
}

export async function collectMany(keywords: string[], sources: Source[]): Promise<CollectResult[]> {
  const results: CollectResult[] = [];
  for (const k of keywords) results.push(await collectKeyword(k, sources));
  return results;
}
