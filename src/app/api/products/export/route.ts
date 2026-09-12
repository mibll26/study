import { prisma } from "@/lib/db";
import { buildOrder, buildWhere, parseQuery } from "@/lib/products-query";

function csvCell(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: Request) {
  const sp = Object.fromEntries(new URL(req.url).searchParams.entries());
  const q = parseQuery(sp);
  const items = await prisma.product.findMany({ where: buildWhere(q), orderBy: buildOrder(q) });
  const header = ["id", "점수", "후보", "키워드", "제품명", "브랜드", "업체", "기능성원료", "주된기능성", "카테고리", "최저가", "최고가", "판매몰수", "검색결과수", "신고번호", "리뷰수", "평점", "상품링크", "메모"];
  const rows = items.map((p) => [p.id, p.score ?? "", p.isCandidate ? "Y" : "", p.keyword, p.name, p.brand, p.maker ?? p.mfdsCompany, p.ingredient, p.functionality, p.category, p.lowestPrice, p.highestPrice, p.mallCount, p.searchTotal, p.mfdsReportNo, p.reviewCount, p.rating, p.productUrl, p.memo]);
  const csv = "﻿" + [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="products-${new Date().toISOString().slice(0, 10)}.csv"` },
  });
}
