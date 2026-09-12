import { prisma } from "@/lib/db";
import { fetchMfds } from "./mfds";
import { parseList } from "@/lib/constants";

async function apiKey() {
  const row = await prisma.setting.findUnique({ where: { key: "mfdsApiKey" } });
  return (row?.value || process.env.MFDS_API_KEY || "").trim();
}

/** 원재료 문자열에서 마스터 원료 사전(이름·별칭)으로 매핑. 미매칭은 null (운영자 큐) */
async function matchIngredient(text: string | undefined, cache: { id: number; keys: string[] }[]): Promise<number | null> {
  if (!text) return null;
  const t = text.toLowerCase();
  let best: { id: number; len: number } | null = null;
  for (const c of cache) for (const k of c.keys) if (k && t.includes(k) && (!best || k.length > best.len)) best = { id: c.id, len: k.length };
  return best?.id ?? null;
}

/** 식약처 C003 동기화 — 키워드별 품목제조신고 → MfdsProduct upsert. 원본 필드는 mfds.ts에서만 매핑. */
export async function syncMfds(keyword: string) {
  const job = await prisma.syncJob.create({ data: { source: "mfds", keyword, status: "running" } });
  try {
    const items = await fetchMfds(keyword, await apiKey());
    const ings = await prisma.ingredient.findMany({ select: { id: true, nameKo: true, nameEn: true, aliases: true } });
    const cache = ings.map((i) => ({ id: i.id, keys: [i.nameKo, i.nameEn, ...parseList(i.aliases)].map((s) => s.toLowerCase()) }));
    let count = 0;
    for (const it of items) {
      const ingredientId = await matchIngredient(it.ingredient ?? it.name, cache);
      await prisma.mfdsProduct.upsert({
        where: { reportNo: it.reportNo },
        update: { name: it.name, company: it.company, ingredientRaw: it.ingredient, functionality: it.functionality, intakeMethod: it.intakeMethod, reportDate: it.reportDate, ingredientId: ingredientId ?? undefined, fetchedAt: new Date() },
        create: { reportNo: it.reportNo, name: it.name, company: it.company, ingredientRaw: it.ingredient, functionality: it.functionality, intakeMethod: it.intakeMethod, reportDate: it.reportDate, keyword, ingredientId },
      });
      count++;
    }
    await prisma.syncJob.update({ where: { id: job.id }, data: { status: "success", count, finishedAt: new Date() } });
    return { ok: true, count };
  } catch (e) {
    const error = (e as Error).message;
    await prisma.syncJob.update({ where: { id: job.id }, data: { status: "failed", error, finishedAt: new Date() } });
    return { ok: false, count: 0, error };
  }
}
