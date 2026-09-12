/** FR-6 트렌드 — MVP는 정적 콘텐츠. 출처: 한국건강기능식품협회 / 식약처 생산실적, 기준연도 2025, 확인 2026-09-01 */
export const TREND_SOURCE = "한국건강기능식품협회 · 식약처 생산실적 · 기준연도 2025 · 확인 2026-09-01";
export type TrendItem = { slug?: string; name: string; pct: number; note: string };
export const TRENDS: { label: string; tone: "up" | "down"; items: TrendItem[] }[] = [
  {
    label: "성장 원료", tone: "up", items: [
      { slug: "magnesium", name: "마그네슘", pct: 58.3, note: "3,000 → 4,750억 원. 수면·근육 소구" },
      { slug: "vitamin-d", name: "비타민D", pct: 53.4, note: "1,760 → 2,700억 원. 면역·뼈" },
      { slug: "omega-3", name: "오메가3", pct: 45.7, note: "rTG·식물성 원료 등급 경쟁" },
    ],
  },
  {
    label: "쇠퇴 원료", tone: "down", items: [
      { slug: "collagen-peptide", name: "저분자콜라겐", pct: -62.7, note: "개별인정형 · 재고 리스크" },
      { slug: "glucosamine", name: "글루코사민", pct: -55, note: "관절 소구가 MSM·보스웰리아로 이동" },
      { slug: "red-ginseng", name: "홍삼", pct: -14.2, note: "9,536억 원, 여전히 단일 원료 1위" },
    ],
  },
];
export const MARKET_FACTS = [
  { k: "국내 시장 규모 (2025)", v: "5조 9,626억 원", note: "소비자 구매액 기준 · 전년비 +0.2%" },
  { k: "국내 생산액 (2025)", v: "4조 910억 원", note: "식약처 생산실적 · 출하 기준 (시장 규모와 혼용 금지)" },
  { k: "온라인 채널 비중", v: "약 71%", note: "한국건강기능식품협회" },
  { k: "생산실적 1위", v: "노바렉스 (ODM)", note: "3,503억 원 · 점유율 12.4% — 브랜드와 제조의 분리" },
];
