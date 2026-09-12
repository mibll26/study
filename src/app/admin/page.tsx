import Link from "next/link";
import { prisma } from "@/lib/db";
import { CONTACT_STATUS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [ingredients, curated, suppliers, verified, contacts, openContacts, responded, apps, info, issues, recent] = await Promise.all([
    prisma.ingredient.count(), prisma.ingredient.count({ where: { curated: true } }), prisma.supplier.count(), prisma.supplier.count({ where: { verificationStatus: "verified" } }),
    prisma.contactRequest.count(), prisma.contactRequest.count({ where: { status: { in: ["submitted", "reviewed"] } } }), prisma.contactRequest.count({ where: { status: "responded" } }),
    prisma.supplierApplication.count({ where: { status: "pending" } }), prisma.infoRequest.count({ where: { status: "open" } }), prisma.issueReport.count({ where: { status: "open" } }),
    prisma.contactRequest.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);
  const kpis = [
    ["원료 (큐레이션)", `${ingredients} (${curated})`, "/admin/ingredients"], ["공급사 (검증)", `${suppliers} (${verified})`, "/admin/suppliers"],
    ["컨택 요청 · 처리 대기", `${contacts} · ${openContacts}`, "/admin/contacts"], ["응답 완료 (NSM)", String(responded), "/admin/contacts"],
    ["공급사 신청 대기", String(apps), "/admin/applications"], ["정보 요청 · 오류 신고", `${info} · ${issues}`, "/admin/requests"],
  ];
  return (
    <div className="space-y-6">
      <div><div className="eyebrow mb-1">Dashboard</div><h1 className="text-[22px] font-semibold tracking-[-0.02em]">운영 현황</h1></div>
      <div className="grid-ink grid-cols-2 lg:grid-cols-3">
        {kpis.map(([k, v, h]) => <Link key={k} href={h} className="bg-panel px-5 py-4 text-ink no-underline hover:bg-white"><div className="text-[11.5px] text-muted-2">{k}</div><div className="font-mono text-[22px] font-medium tracking-[-0.02em]">{v}</div></Link>)}
      </div>
      <section>
        <div className="mb-2 flex items-baseline justify-between"><h2 className="font-semibold">최근 컨택 요청</h2><Link href="/admin/contacts" className="text-[12.5px]">전체 보기</Link></div>
        <div className="overflow-x-auto border-2 border-ink bg-panel">
          <table className="w-full text-[13px]">
            <thead><tr><th className="th">접수번호</th><th className="th">회사</th><th className="th">원료</th><th className="th">공급사</th><th className="th">상태</th><th className="th">시각</th></tr></thead>
            <tbody>
              {recent.map((c) => <tr key={c.id}><td className="td font-mono text-[12px]">{c.refNo}</td><td className="td">{c.company}</td><td className="td">{c.ingredient}</td><td className="td text-muted">{JSON.parse(c.supplierNames).join(", ")}</td><td className="td">{CONTACT_STATUS[c.status] ?? c.status}</td><td className="td whitespace-nowrap text-muted-2">{c.createdAt.toLocaleString("ko-KR")}</td></tr>)}
              {recent.length === 0 && <tr><td className="td py-8 text-center text-muted-2" colSpan={6}>아직 컨택 요청이 없습니다.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
