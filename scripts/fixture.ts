/** 샘플 데이터 적재: npx tsx scripts/fixture.ts  (관리자 → API 키 설정 화면의 버튼과 동일) */
import { PrismaClient } from "@prisma/client";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";
import { recalculateAll } from "@/lib/scoring/score";
const prisma = new PrismaClient();
async function main() {
  await prisma.product.deleteMany({ where: { OR: [{ keyword: { startsWith: "[샘플]" } }, { keyword: { startsWith: "[테스트]" } }] } });
  await prisma.collectJob.deleteMany({ where: { status: "failed", mfdsCount: 0, naverCount: 0 } });
  for (const r of SAMPLE_PRODUCTS) await prisma.product.create({ data: r });
  const n = await recalculateAll();
  const top = await prisma.product.findMany({ orderBy: { score: "desc" }, take: 5, select: { score: true, name: true } });
  console.log(`샘플 ${SAMPLE_PRODUCTS.length}건 적재, ${n}건 재계산`);
  for (const t of top) console.log(` ${t.score}\t${t.name}`);
}
main().finally(() => prisma.$disconnect());
