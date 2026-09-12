import { prisma } from "@/lib/db";
import { CONTACT_STATUS, COUNTRIES, parseList } from "@/lib/constants";
import { setContactStatus } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";
const NEXT: Record<string, string[]> = { submitted: ["reviewed", "closed"], reviewed: ["sent", "closed"], sent: ["responded", "closed"], responded: ["closed"], closed: [] };

export default async function AdminContacts() {
  const rows = await prisma.contactRequest.findMany({ orderBy: { createdAt: "desc" } });
  const responded = rows.filter((r) => r.respondedAt && r.sentAt);
  const within48 = responded.filter((r) => r.respondedAt!.getTime() - r.sentAt!.getTime() <= 48 * 3600 * 1000).length;
  return (
    <div className="space-y-4">
      <div><div className="eyebrow mb-1">Contact requests</div><h1 className="text-[22px] font-semibold tracking-[-0.02em]">컨택 요청 <span className="font-mono text-[14px] text-muted-2">{rows.length}</span></h1></div>
      <div className="grid-ink grid-cols-3 max-w-xl"><div className="bg-panel px-4 py-3"><div className="text-[11px] text-muted-2">처리 대기</div><div className="font-mono text-[20px]">{rows.filter((r) => r.status === "submitted" || r.status === "reviewed").length}</div></div><div className="bg-panel px-4 py-3"><div className="text-[11px] text-muted-2">응답 완료</div><div className="font-mono text-[20px]">{responded.length}</div></div><div className="bg-panel px-4 py-3"><div className="text-[11px] text-muted-2">48h 내 응답 (NSM)</div><div className="font-mono text-[20px]">{within48}</div></div></div>
      <p className="text-[12.5px] text-muted-2">흐름: 접수 → 검토됨(스팸·유효성) → 공급사 전달(이메일 수동 발송) → 응답 완료 → 종료. MVP는 운영팀 경유(BRD Q3).</p>
      <div className="space-y-2">
        {rows.map((c) => {
          const suppliers = parseList(c.supplierNames), markets = parseList(c.targetMarkets);
          return (
            <details key={c.id} className="border-2 border-ink bg-panel">
              <summary className="flex cursor-pointer flex-wrap items-center gap-3 px-4 py-3 text-[13px]">
                <span className="font-mono text-[12px]">{c.refNo}</span><span className="font-medium">{c.company}</span><span className="text-muted">{c.ingredient} · {c.dosageForm} · {c.quantityRange}</span>
                <span className="text-muted-2">→ {suppliers.join(", ")}</span>
                <span className={`badge ml-auto ${c.status === "responded" ? "border-blue text-blue" : c.status === "closed" ? "border-line text-muted-2" : "border-ink text-ink"}`}>{CONTACT_STATUS[c.status]}</span>
                <span className="text-[11.5px] text-muted-2">{c.createdAt.toLocaleString("ko-KR")}</span>
              </summary>
              <div className="grid gap-3 border-t border-line px-4 py-3 text-[13px] sm:grid-cols-2">
                <dl className="space-y-1"><div><span className="text-muted-2">담당자</span> {c.contactName}{c.title ? ` (${c.title})` : ""}</div><div><span className="text-muted-2">이메일</span> {c.email}</div><div><span className="text-muted-2">연락처</span> {c.phone}</div><div><span className="text-muted-2">희망 납기</span> {c.targetDate ?? "—"}</div><div><span className="text-muted-2">판매 국가</span> {markets.map((m) => COUNTRIES[m]?.flag).join(" ") || "—"}</div></dl>
                <div><div className="text-muted-2">요청사항</div><p className="whitespace-pre-wrap">{c.message ?? "—"}</p>{c.adminNote && <p className="mt-2 text-muted"><span className="text-muted-2">메모</span> {c.adminNote}</p>}</div>
                <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
                  {NEXT[c.status].map((nx) => <form key={nx} action={setContactStatus.bind(null, c.id, nx, undefined)}><button type="submit" className={nx === "closed" ? "btn py-1" : "btn-primary py-1"}>{CONTACT_STATUS[nx]}로 변경</button></form>)}
                  <form action={async (fd) => { "use server"; await setContactStatus(c.id, c.status, String(fd.get("note") ?? "")); }} className="flex gap-1"><input name="note" defaultValue={c.adminNote ?? ""} placeholder="운영 메모" className="input-sm w-56" /><button type="submit" className="btn py-1">메모 저장</button></form>
                </div>
              </div>
            </details>
          );
        })}
        {rows.length === 0 && <div className="border-2 border-ink bg-panel p-10 text-center text-[13px] text-muted-2">아직 컨택 요청이 없습니다.</div>}
      </div>
    </div>
  );
}
