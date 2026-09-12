import { parseQuery, queryProducts } from "@/lib/products-query";
import { Pagination } from "@/components/Pagination";
import { ProductTable } from "./table";

export const dynamic = "force-dynamic";

export default async function AdminProducts(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await props.searchParams;
  const q = parseQuery(sp);
  const { items, total, page, pageSize } = await queryProducts(q);
  const params: Record<string, string | undefined> = Object.fromEntries(Object.entries(sp).map(([k, v]) => [k, typeof v === "string" ? v : undefined]));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="text-xl font-bold">제품 관리</h1>
        <form method="get" className="flex gap-2">
          <input id="q" name="q" defaultValue={q.q ?? ""} placeholder="검색" className="input" />
          <button className="btn" type="submit">검색</button>
        </form>
      </div>
      <p className="text-sm text-muted">행을 클릭해 편집합니다. 리뷰 수·평점은 네이버 API가 제공하지 않아 수동 입력 항목입니다.</p>
      <ProductTable items={items.map((p) => ({ id: p.id, name: p.name, brand: p.brand, ingredient: p.ingredient, category: p.category, keyword: p.keyword, lowestPrice: p.lowestPrice, reviewCount: p.reviewCount, rating: p.rating, score: p.score, isCandidate: p.isCandidate, source: p.source }))} />
      <Pagination page={page} pageSize={pageSize} total={total} params={params} />
    </div>
  );
}
