import Link from "next/link";
import { prisma } from "@/lib/db";
import { COUNTRIES, parseList } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminIngredients(props: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await props.searchParams;
  const rows = await prisma.ingredient.findMany({ where: q ? { OR: [{ nameKo: { contains: q } }, { nameEn: { contains: q } }, { aliases: { contains: q } }] } : undefined, orderBy: { nameKo: "asc" }, include: { statuses: { select: { countryCode: true, published: true } }, _count: { select: { suppliers: true, products: true } } } });
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><div className="eyebrow mb-1">Ingredients</div><h1 className="text-[22px] font-semibold tracking-[-0.02em]">원료 큐레이션 <span className="font-mono text-[14px] text-muted-2">{rows.length}</span></h1></div>
        <div className="flex gap-2"><form method="get" className="flex gap-1"><input id="q" name="q" defaultValue={q ?? ""} placeholder="검색" className="input-sm w-48" /><button className="btn py-1" type="submit">검색</button></form><Link href="/admin/ingredients/new" className="btn-primary no-underline py-1">+ 원료 추가</Link></div>
      </div>
      <p className="text-[12.5px] text-muted-2">공공 DB 원본은 덮어쓰지 않고 이 화면에서 오버레이 편집합니다. 규제 문구는 &lsquo;공개&rsquo; 체크 전까지 사용자에게 노출되지 않습니다.</p>
      <div className="overflow-x-auto border-2 border-ink bg-panel">
        <table className="w-full text-[13px]">
          <thead><tr><th className="th">원료</th><th className="th">분류</th><th className="th">기능성</th><th className="th">국가별 상태</th><th className="th text-right">공급사</th><th className="th text-right">완제품</th><th className="th">큐레이션</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="td"><Link href={`/admin/ingredients/${r.id}`} className="font-medium text-ink">{r.nameKo}</Link><div className="text-[11.5px] text-muted-2">{r.nameEn} · {r.slug}</div></td>
                <td className="td text-muted">{r.category}</td>
                <td className="td text-muted">{parseList(r.functionality).join(", ")}</td>
                <td className="td">{r.statuses.map((s) => <span key={s.countryCode} className={`mr-1 ${s.published ? "" : "opacity-40"}`} title={s.published ? "공개" : "비공개"}>{COUNTRIES[s.countryCode]?.flag}</span>)}</td>
                <td className="td text-right font-mono">{r._count.suppliers}</td>
                <td className="td text-right font-mono">{r._count.products}</td>
                <td className="td">{r.curated ? <span className="badge border-blue text-blue">완료</span> : <span className="badge border-line text-muted-2">대기</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
