import { PrismaClient } from "@prisma/client";
import { recalculateAll } from "@/lib/scoring/score";
const prisma = new PrismaClient();
async function main() {
  await prisma.product.deleteMany({ where: { keyword: { startsWith: "[테스트]" } } });
  const kw = "[테스트] 오메가3";
  const rows = [
    { name: "테스트 rTG 오메가3 1000mg", brand: "A사", ingredient: "EPA 및 DHA 함유 유지", lowestPrice: 18900, highestPrice: 39000, mallCount: 12, searchTotal: 250000, naverProductId: "t1", source: "naver", mfdsReportNo: "T-0001", mfdsCompany: "A사", functionality: "혈중 중성지질 개선" },
    { name: "테스트 초임계 오메가3", brand: "B사", ingredient: "EPA 및 DHA 함유 유지", lowestPrice: 62000, highestPrice: 65000, mallCount: 2, searchTotal: 250000, naverProductId: "t2", source: "naver" },
    { name: "테스트 알티지 오메가3 (식약처만)", ingredient: "EPA 및 DHA 함유 유지", source: "mfds", mfdsReportNo: "T-0003", mfdsCompany: "C사", functionality: "혈행 개선" },
    { name: "테스트 저가 오메가3", brand: "D사", ingredient: "EPA 및 DHA 함유 유지", lowestPrice: 4900, highestPrice: 5200, mallCount: 30, searchTotal: 250000, naverProductId: "t4", source: "naver" },
  ];
  for (const r of rows) await prisma.product.create({ data: { keyword: kw, ...r } });
  const n = await recalculateAll();
  const out = await prisma.product.findMany({ where: { keyword: kw }, orderBy: { score: "desc" }, select: { name: true, score: true, scoreDetail: true } });
  console.log("recalculated", n);
  for (const o of out) {
    const d = JSON.parse(o.scoreDetail!);
    console.log(o.score, o.name, "|", d.metrics.map((m: { key: string; contribution: number }) => `${m.key}=${m.contribution.toFixed(1)}`).join(" "));
  }
}
main().finally(() => prisma.$disconnect());
