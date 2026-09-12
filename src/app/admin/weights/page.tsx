import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { saveWeights, deleteTrend } from "@/lib/actions/weights";

export const dynamic = "force-dynamic";

export default async function WeightsPage() {
  const [weights, settings, trends, ingredients] = await Promise.all([
    prisma.scoreWeight.findMany({ orderBy: { order: "asc" } }),
    getSettings(),
    prisma.ingredientTrend.findMany({ orderBy: { ingredient: "asc" } }),
    prisma.product.groupBy({ by: ["ingredient"], where: { ingredient: { not: null } }, _count: true, orderBy: { _count: { ingredient: "desc" } }, take: 50 }),
  ]);
  const trendMap = new Map(trends.map((t) => [t.ingredient, t.level]));
  // 수집된 원료 + 수동 등록 원료 합집합
  const allIngredients = Array.from(new Set([...ingredients.map((i) => i.ingredient!), ...trends.map((t) => t.ingredient)]));
  const sum = weights.reduce((s, w) => s + w.weight, 0);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">가중치 설정</h1>
      <p className="text-sm text-muted">저장하면 전체 제품 점수가 즉시 재계산됩니다. 최종 점수 = Σ(가중치 × 정규화값) / Σ가중치 × 100.</p>
      <form action={saveWeights} className="space-y-5">
        <section className="card overflow-x-auto">
          <h2 className="mb-2 font-semibold">지표별 가중치 <span className="text-xs font-normal text-muted">(현재 합계 {sum})</span></h2>
          <table className="w-full text-sm">
            <thead><tr><th className="th">지표</th><th className="th">설명</th><th className="th">방향</th><th className="th text-right">가중치 (0~100)</th></tr></thead>
            <tbody>
              {weights.map((w) => (
                <tr key={w.key}>
                  <td className="td font-medium whitespace-nowrap">{w.label}</td>
                  <td className="td text-muted">{w.description}</td>
                  <td className="td text-xs whitespace-nowrap">{w.direction === "desc" ? "낮을수록 좋음" : "높을수록 좋음"}</td>
                  <td className="td text-right"><input id={`weight-${w.key}`} name={`weight:${w.key}`} type="number" min={0} max={100} defaultValue={w.weight} className="input w-24 text-right" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card grid gap-3 sm:grid-cols-3">
          <h2 className="font-semibold sm:col-span-3">수집·가격대 설정</h2>
          <label className="text-xs text-muted">목표 가격대 최소 (원)<input id="targetPriceMin" name="targetPriceMin" type="number" defaultValue={settings.targetPriceMin} className="input mt-1 w-full" /></label>
          <label className="text-xs text-muted">목표 가격대 최대 (원)<input id="targetPriceMax" name="targetPriceMax" type="number" defaultValue={settings.targetPriceMax} className="input mt-1 w-full" /></label>
          <label className="text-xs text-muted">네이버 키워드당 최대 페이지 (×100건)<input id="naverMaxPages" name="naverMaxPages" type="number" min={1} max={10} defaultValue={settings.naverMaxPages} className="input mt-1 w-full" /></label>
        </section>

        <section className="card">
          <h2 className="mb-1 font-semibold">원료 관심도 (1~5)</h2>
          <p className="mb-2 text-xs text-muted">수집된 기능성 원료가 자동으로 나열됩니다. 기본값 3. 트렌드가 강한 원료는 5, 하락세는 1.</p>
          {allIngredients.length === 0 ? <p className="text-sm text-muted">아직 원료 정보가 없습니다. 아래에서 직접 추가할 수 있습니다.</p> : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {allIngredients.map((ing) => (
                <label key={ing} className="flex items-center justify-between gap-2 rounded border border-line/60 px-2 py-1 text-sm">
                  <span className="truncate" title={ing}>{ing}</span>
                  <span className="flex items-center gap-1">
                    <select id={`trend-${ing}`} name={`trend:${ing}`} defaultValue={trendMap.get(ing) ?? 3} className="input py-0.5">
                      {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                    {trendMap.has(ing) && <button type="submit" formAction={deleteTrend.bind(null, ing)} className="text-xs text-muted hover:text-red-600" title="관심도 초기화">✕</button>}
                  </span>
                </label>
              ))}
            </div>
          )}
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <label className="text-xs text-muted">원료 직접 추가<input id="newIngredient" name="newIngredient" className="input mt-1" placeholder="예: 홍삼" /></label>
            <label className="text-xs text-muted">관심도<select id="newLevel" name="newLevel" defaultValue={3} className="input mt-1">{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
          </div>
        </section>

        <button className="btn-primary" type="submit">저장하고 재계산</button>
      </form>
    </div>
  );
}
