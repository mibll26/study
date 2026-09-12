import { prisma } from "@/lib/db";
import { COUNTRIES, parseList } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminFormulations() {
  const rows = await prisma.formulation.findMany({ orderBy: { updatedAt: "desc" }, include: { items: { orderBy: { order: "asc" }, include: { ingredient: { select: { nameKo: true } } } } } });
  const contacts = await prisma.contactRequest.groupBy({ by: ["formulationSlug"], _count: true, where: { formulationSlug: { not: null } } });
  const cmap = new Map(contacts.map((c) => [c.formulationSlug, c._count]));
  // 원료별 배합 등장 횟수 = 수요 신호 (BO-5)
  const demand = new Map<string, number>();
  for (const f of rows) for (const i of f.items) demand.set(i.ingredient.nameKo, (demand.get(i.ingredient.nameKo) ?? 0) + 1);
  const top = [...demand].sort((a, b) => b[1] - a[1]).slice(0, 10);
  return (
    <div className="space-y-6">
      <div><div className="eyebrow mb-1">Formulations</div><h1 className="text-[22px] font-semibold tracking-[-0.02em]">배합 설계 <span className="font-mono text-[14px] text-muted-2">{rows.length}</span></h1><p className="text-[12.5px] text-muted-2">사용자가 저장한 배합. 원료별 등장 횟수는 소싱 수요 신호로 축적됩니다 (BO-5).</p></div>
      {top.length > 0 && <div className="border-2 border-ink bg-panel p-4"><div className="eyebrow mb-2">배합에 많이 쓰인 원료</div><div className="flex flex-wrap gap-1.5">{top.map(([k, v]) => <span key={k} className="tag">{k} <span className="font-mono">{v}</span></span>)}</div></div>}
      <div className="overflow-x-auto border-2 border-ink bg-panel"><table className="w-full text-[13px]"><thead><tr><th className="th">배합</th><th className="th">구성</th><th className="th">제형</th><th className="th">국가</th><th className="th text-right">견적 요청</th><th className="th">갱신</th></tr></thead><tbody>
        {rows.map((f) => <tr key={f.id}><td className="td"><a href={`/formulate/${f.slug}`} target="_blank" className="font-medium">{f.name}</a><div className="font-mono text-[11px] text-muted-2">{f.slug}</div></td><td className="td text-muted">{f.items.map((i) => `${i.ingredient.nameKo} ${i.amount}${i.unit}`).join(" + ")}</td><td className="td">{f.dosageForm}</td><td className="td">{parseList(f.targetMarkets).map((m) => COUNTRIES[m]?.flag).join(" ")}</td><td className="td text-right font-mono">{cmap.get(f.slug) ?? 0}</td><td className="td whitespace-nowrap text-muted-2">{f.updatedAt.toLocaleString("ko-KR")}</td></tr>)}
        {rows.length === 0 && <tr><td className="td py-6 text-center text-muted-2" colSpan={6}>저장된 배합이 없습니다.</td></tr>}
      </tbody></table></div>
    </div>
  );
}
