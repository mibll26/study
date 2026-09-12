import Link from "next/link";
import { prisma } from "@/lib/db";
import { COUNTRIES, VERIFICATION, formatLead, formatMoq, parseList } from "@/lib/constants";
import { setVerification } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminSuppliers() {
  const rows = await prisma.supplier.findMany({ orderBy: [{ verificationStatus: "asc" }, { nameKo: "asc" }], include: { _count: { select: { ingredients: true } } } });
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><div className="eyebrow mb-1">Suppliers</div><h1 className="text-[22px] font-semibold tracking-[-0.02em]">공급사 <span className="font-mono text-[14px] text-muted-2">{rows.length}</span></h1></div>
        <Link href="/admin/suppliers/new" className="btn-primary no-underline py-1">+ 공급사 추가</Link>
      </div>
      <p className="text-[12.5px] text-muted-2">&lsquo;검증됨&rsquo;은 사업자등록증 + 인증서 원본 확인 + 유선 확인 후에만 부여합니다 (잠정 기준, BRD Q5).</p>
      <div className="overflow-x-auto border-2 border-ink bg-panel">
        <table className="w-full text-[13px]">
          <thead><tr><th className="th">공급사</th><th className="th">유형</th><th className="th">MOQ</th><th className="th">리드타임</th><th className="th text-right">원료</th><th className="th">검증 상태</th><th className="th">공개</th></tr></thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td className="td"><Link href={`/admin/suppliers/${s.id}`} className="font-medium text-ink">{s.nameKo}</Link><div className="text-[11.5px] text-muted-2">{COUNTRIES[s.countryCode]?.flag} {s.nameEn ?? ""}</div></td>
                <td className="td text-muted">{parseList(s.supplierTypes).join(" / ")}</td>
                <td className="td font-mono">{formatMoq(s.moqMin, s.moqUnit)}</td>
                <td className="td font-mono">{formatLead(s.leadWeeksMin, s.leadWeeksMax)}</td>
                <td className="td text-right font-mono">{s._count.ingredients}</td>
                <td className="td">
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(VERIFICATION).map(([k, v]) => (
                      <form key={k} action={setVerification.bind(null, s.id, k)}><button type="submit" className={`badge cursor-pointer ${s.verificationStatus === k ? v.cls + " bg-alt" : "border-line-soft text-faint hover:text-ink"}`}>{v.label}</button></form>
                    ))}
                  </div>
                </td>
                <td className="td">{s.visible ? "공개" : <span className="text-red">비공개</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
