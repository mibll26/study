import Link from "next/link";
import { ScoreBadge } from "@/components/ScoreBadge";
import { CandidateButton } from "@/components/CandidateButton";
import { Pagination } from "@/components/Pagination";
import { facetOptions, parseQuery, queryProducts } from "@/lib/products-query";

export const dynamic = "force-dynamic";

const won = (n: number | null) => (n == null ? "—" : `${n.toLocaleString()}원`);

export default async function Home(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await props.searchParams;
  const q = parseQuery(sp);
  const [{ items, total, page, pageSize }, facets] = await Promise.all([queryProducts(q), facetOptions()]);
  const params: Record<string, string | undefined> = Object.fromEntries(Object.entries(sp).map(([k, v]) => [k, typeof v === "string" ? v : undefined]));
  const exportHref = `/api/products/export?${new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString()}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold">제품 목록</h1>
          <p className="text-sm text-muted">판매 유망 점수 순. 점수는 <Link href="/admin/weights" className="underline">가중치 설정</Link>에 따라 계산됩니다.</p>
        </div>
        <a className="btn" href={exportHref}>CSV 내보내기</a>
      </div>

      <form className="card grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6" method="get">
        <label className="col-span-2 text-xs text-muted">검색
          <input id="q" name="q" defaultValue={q.q ?? ""} placeholder="제품명·업체·원료" className="input mt-1 w-full" />
        </label>
        <label className="text-xs text-muted">키워드
          <select id="keyword" name="keyword" defaultValue={q.keyword ?? ""} className="input mt-1 w-full">
            <option value="">전체</option>
            {facets.keywords.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </label>
        <label className="text-xs text-muted">기능성 원료
          <select id="ingredient" name="ingredient" defaultValue={q.ingredient ?? ""} className="input mt-1 w-full">
            <option value="">전체</option>
            {facets.ingredients.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </label>
        <label className="text-xs text-muted">최저가 (원)
          <div className="mt-1 flex gap-1">
            <input id="priceMin" name="priceMin" type="number" defaultValue={q.priceMin ?? ""} placeholder="min" className="input w-full" />
            <input id="priceMax" name="priceMax" type="number" defaultValue={q.priceMax ?? ""} placeholder="max" className="input w-full" />
          </div>
        </label>
        <label className="text-xs text-muted">점수 이상
          <input id="scoreMin" name="scoreMin" type="number" min={0} max={100} defaultValue={q.scoreMin ?? ""} className="input mt-1 w-full" />
        </label>
        <label className="text-xs text-muted">정렬
          <select id="sort" name="sort" defaultValue={q.sort} className="input mt-1 w-full">
            <option value="score">점수 높은 순</option>
            <option value="price">최저가 낮은 순</option>
            <option value="recent">최근 수집 순</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm self-end pb-1">
          <input id="candidate" name="candidate" type="checkbox" value="1" defaultChecked={q.candidate} /> 후보만 보기
        </label>
        <div className="flex gap-2 self-end col-span-2 md:col-span-1">
          <button className="btn-primary" type="submit">적용</button>
          <Link className="btn" href="/">초기화</Link>
        </div>
      </form>

      {total === 0 ? (
        <div className="card text-center text-sm text-muted py-12">
          수집된 제품이 없습니다. <Link href="/admin/collect" className="underline text-accent">관리자 → 수집 실행</Link>에서 키워드를 입력해 시작하세요.
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="th w-10"></th>
                <th className="th">제품</th>
                <th className="th">브랜드 / 업체</th>
                <th className="th">기능성 원료</th>
                <th className="th text-right">최저가</th>
                <th className="th text-right">판매몰</th>
                <th className="th text-right">점수</th>
                <th className="th">출처</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-accent-soft/40">
                  <td className="td text-center"><CandidateButton id={p.id} isCandidate={p.isCandidate} compact /></td>
                  <td className="td">
                    <div className="flex items-center gap-3">
                      {/* 외부 쇼핑몰 이미지: 도메인이 고정되지 않아 next/image 대신 img 사용 */}
                      {p.imageUrl ? <img src={p.imageUrl} alt="" className="h-10 w-10 rounded object-cover border border-line" /> : <div className="h-10 w-10 rounded bg-line/40" />}
                      <div>
                        <Link href={`/products/${p.id}`} className="font-medium hover:text-accent line-clamp-2">{p.name}</Link>
                        <div className="text-xs text-muted">{p.keyword}{p.category ? ` · ${p.category}` : ""}</div>
                      </div>
                    </div>
                  </td>
                  <td className="td">{p.brand ?? p.maker ?? p.mfdsCompany ?? "—"}</td>
                  <td className="td">{p.ingredient ?? "—"}</td>
                  <td className="td text-right tabular-nums whitespace-nowrap">{won(p.lowestPrice)}</td>
                  <td className="td text-right tabular-nums">{p.mallCount ?? "—"}</td>
                  <td className="td text-right"><ScoreBadge score={p.score} /></td>
                  <td className="td text-xs text-muted">{p.source === "mfds" ? "식약처" : p.source === "naver" ? "네이버" : "통합"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} pageSize={pageSize} total={total} params={params} />
    </div>
  );
}
