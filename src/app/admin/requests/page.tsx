import Link from "next/link";
import { prisma } from "@/lib/db";
import { closeInfoRequest, closeIssue } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminRequests() {
  const [info, issues] = await Promise.all([prisma.infoRequest.findMany({ orderBy: [{ status: "desc" }, { createdAt: "desc" }] }), prisma.issueReport.findMany({ orderBy: [{ status: "desc" }, { createdAt: "desc" }] })]);
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div><div className="eyebrow mb-1">Info requests</div><h1 className="text-[22px] font-semibold tracking-[-0.02em]">원료 정보 요청 <span className="font-mono text-[14px] text-muted-2">{info.length}</span></h1><p className="text-[12.5px] text-muted-2">검색 결과가 없을 때 들어온 요청 — 큐레이션 우선순위 신호 (UF-3).</p></div>
        <div className="overflow-x-auto border-2 border-ink bg-panel"><table className="w-full text-[13px]"><thead><tr><th className="th">검색어</th><th className="th">이메일</th><th className="th">시각</th><th className="th">상태</th><th className="th"></th></tr></thead><tbody>
          {info.map((r) => <tr key={r.id}><td className="td font-medium">{r.query}</td><td className="td text-muted">{r.email ?? "—"}</td><td className="td text-muted-2 whitespace-nowrap">{r.createdAt.toLocaleString("ko-KR")}</td><td className="td">{r.status === "open" ? "대기" : "완료"}</td><td className="td">{r.status === "open" && <div className="flex gap-2"><Link href={`/admin/ingredients/new`} className="text-[12px]">원료 추가</Link><form action={closeInfoRequest.bind(null, r.id)}><button className="btn-ghost" type="submit">완료</button></form></div>}</td></tr>)}
          {info.length === 0 && <tr><td className="td py-6 text-center text-muted-2" colSpan={5}>없음</td></tr>}
        </tbody></table></div>
      </section>
      <section className="space-y-3">
        <div><div className="eyebrow mb-1">Issue reports</div><h2 className="text-[22px] font-semibold tracking-[-0.02em]">오류 신고 <span className="font-mono text-[14px] text-muted-2">{issues.length}</span></h2><p className="text-[12.5px] text-muted-2">정보 오류 신고율 KPI(&lt;1%)의 측정 수단 (FR-11).</p></div>
        <div className="overflow-x-auto border-2 border-ink bg-panel"><table className="w-full text-[13px]"><thead><tr><th className="th">대상</th><th className="th">항목</th><th className="th">내용</th><th className="th">시각</th><th className="th">상태</th><th className="th"></th></tr></thead><tbody>
          {issues.map((r) => <tr key={r.id}><td className="td"><Link href={r.entityType === "ingredient" ? `/admin/ingredients/${r.entityId}` : `/admin/suppliers/${r.entityId}`}>{r.entityType === "ingredient" ? "원료" : "공급사"} #{r.entityId}</Link></td><td className="td text-muted">{r.field ?? "—"}</td><td className="td whitespace-pre-wrap">{r.message}</td><td className="td text-muted-2 whitespace-nowrap">{r.createdAt.toLocaleString("ko-KR")}</td><td className="td">{r.status === "open" ? "대기" : "해결"}</td><td className="td">{r.status === "open" && <form action={closeIssue.bind(null, r.id)}><button className="btn-ghost" type="submit">해결</button></form>}</td></tr>)}
          {issues.length === 0 && <tr><td className="td py-6 text-center text-muted-2" colSpan={6}>없음</td></tr>}
        </tbody></table></div>
      </section>
    </div>
  );
}
