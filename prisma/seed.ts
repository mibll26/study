import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const weights = [
  { key: "demand", label: "시장 수요", weight: 25, direction: "asc", order: 1, description: "네이버 검색 결과 총 건수 (log 스케일)" },
  { key: "competition", label: "경쟁 강도", weight: 20, direction: "desc", order: 2, description: "동일 키워드 내 상품 수 — 낮을수록 유리" },
  { key: "priceMargin", label: "가격 여지", weight: 15, direction: "asc", order: 3, description: "(최고가 − 최저가) / 최저가" },
  { key: "priceBand", label: "가격대 적정성", weight: 15, direction: "asc", order: 4, description: "최저가가 목표 가격대에 속하는 정도" },
  { key: "certified", label: "식약처 등록 신뢰도", weight: 15, direction: "asc", order: 5, description: "신고번호 존재 + 동일 원료 등록 업체 수" },
  { key: "ingredientTrend", label: "원료 관심도", weight: 10, direction: "asc", order: 6, description: "관리자가 원료별로 입력한 1~5 값" },
];

const settings = [
  { key: "targetPriceMin", value: "10000" },
  { key: "targetPriceMax", value: "50000" },
  { key: "naverMaxPages", value: "3" },
];

async function main() {
  for (const w of weights) {
    await prisma.scoreWeight.upsert({ where: { key: w.key }, update: { label: w.label, description: w.description, direction: w.direction, order: w.order }, create: w });
  }
  for (const s of settings) {
    await prisma.setting.upsert({ where: { key: s.key }, update: {}, create: s });
  }
  console.log("seeded: weights", weights.length, "settings", settings.length);
}

main().finally(() => prisma.$disconnect());
