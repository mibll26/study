import { prisma } from "@/lib/db";
import { COUNTRIES, parseList } from "@/lib/constants";
import { approveApplication, rejectApplication } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminApplications() {
  const rows = await prisma.supplierApplication.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }] });
  return (
    <div className="space-y-4">
      <div><div className="eyebrow mb-1">Supplier applications</div><h1 className="text-[22px] font-semibold tracking-[-0.02em]">공급사 등록 신청 <span className="font-mono text-[14px] text-muted-2">{rows.length}</span></h1></div>
      <p className="text-[12.5px] text-muted-2">승인하면 &lsquo;공식 등록&rsquo; 상태의 프로필이 생성됩니다. 인증서 원본 확인 후 공급사 관리에서 &lsquo;검증됨&rsquo;으로 올리세요.</p>
      <div className="space-y-2">
        {rows.map((a) => (
          <div key={a.id} className="border-2 border-ink bg-panel px-4 py-3 text-[13px]">
            <div className="flex flex-wrap items-center gap-3"><span className="font-medium">{a.company}</span><span className="text-muted-2">{COUNTRIES[a.countryCode]?.flag} {parseList(a.supplierTypes).join("/")}</span><span className="text-muted">{a.contactName} · {a.email}{a.phone ? ` · ${a.phone}` : ""}</span>
              <span className={`badge ml-auto ${a.status === "approved" ? "border-blue text-blue" : a.status === "rejected" ? "border-line text-muted-2" : "border-ink text-ink"}`}>{{ pending: "대기", approved: "승인", rejected: "반려" }[a.status]}</span></div>
            <div className="mt-1 text-muted-2">제형 {parseList(a.dosageForms).join(" · ") || "—"} · 인증 {parseList(a.certifications).join(" · ") || "—"} · MOQ {a.moq ?? "—"} · 리드타임 {a.leadTime ?? "—"}</div>
            {a.message && <p className="mt-1 whitespace-pre-wrap text-muted">{a.message}</p>}
            {a.status === "pending" && <div className="mt-2 flex gap-2"><form action={approveApplication.bind(null, a.id)}><button className="btn-primary py-1" type="submit">승인 → 프로필 생성</button></form><form action={rejectApplication.bind(null, a.id)}><button className="btn py-1" type="submit">반려</button></form></div>}
          </div>
        ))}
        {rows.length === 0 && <div className="border-2 border-ink bg-panel p-10 text-center text-[13px] text-muted-2">신청이 없습니다.</div>}
      </div>
    </div>
  );
}
