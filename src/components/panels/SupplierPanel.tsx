import Link from "next/link";
import { Overlay } from "@/components/Overlay";
import { getSupplier, type SP } from "@/lib/queries";
import { closeOverlays, href } from "@/lib/url";
import { COUNTRIES, SUPPLIER_DISCLAIMER, VERIFICATION, formatLead, formatMoq, parseList } from "@/lib/constants";
import { IssueReportForm } from "@/components/Forms";

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="grid grid-cols-[110px_1fr] gap-3 border-b border-line-soft py-2.5 text-[13px] last:border-0"><dt className="text-muted-2">{k}</dt><dd className="m-0 leading-[1.7]">{v ?? <span className="text-faint">정보 없음</span>}</dd></div>;
}

export async function SupplierPanel({ slug, sp }: { slug: string; sp: SP }) {
  const s = await getSupplier(slug);
  const closeHref = closeOverlays(sp, "suppliers");
  if (!s) return <Overlay closeHref={closeHref} kind="panel" title="공급사를 찾을 수 없습니다"><p className="text-[13px] text-muted">비공개 처리되었거나 주소가 잘못되었습니다.</p></Overlay>;
  const v = VERIFICATION[s.verificationStatus] ?? VERIFICATION.unverified; const c = COUNTRIES[s.countryCode] ?? COUNTRIES.OTHER;
  const certs = parseList(s.certifications);
  return (
    <Overlay closeHref={closeHref} kind="panel" kicker={`${c.flag} ${c.name} · ${parseList(s.supplierTypes).join(" / ")}`} title={s.nameKo}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className={`badge ${v.cls}`}>{v.label}</span>
        {s.verificationStatus !== "verified" && <span className="text-[12px] text-muted-2">— 인증서·연락처가 운영팀에 의해 확인되지 않았습니다</span>}
      </div>
      {s.description && <p className="mb-4 text-[13.5px] leading-[1.75] text-muted">{s.description}</p>}
      <dl>
        <Row k="영문명" v={s.nameEn} />
        <Row k="설립" v={s.foundedYear} />
        <Row k="생산능력" v={s.capacity} />
        <Row k="주력 제형" v={parseList(s.dosageForms).join(" · ") || null} />
        <Row k="보유 인증" v={certs.length ? <span>{certs.join(" · ")} <span className="text-[11px] text-muted-2">({s.verificationStatus === "verified" ? "증빙 확인됨" : "증빙 미확인"})</span></span> : null} />
        <Row k="MOQ" v={<span className="font-mono">{formatMoq(s.moqMin, s.moqUnit)}</span>} />
        <Row k="리드타임" v={<span className="font-mono">{formatLead(s.leadWeeksMin, s.leadWeeksMax)}</span>} />
        <Row k="연락처" v={<span className="text-muted-2">문의 승인 전까지 비공개</span>} />
      </dl>
      <div className="mt-6">
        <div className="eyebrow mb-2">취급 원료 <span className="font-mono">{s.ingredients.length}</span></div>
        {s.ingredients.length === 0 ? <p className="text-[13px] text-faint">정보 없음</p> : (
          <div className="flex flex-wrap gap-1.5">{s.ingredients.map((x) => <Link key={x.ingredientId} href={href(sp, { ingredient: x.ingredient.slug, supplier: undefined }, "explore")} scroll={false} className="chip no-underline">{x.ingredient.nameKo}</Link>)}</div>
        )}
      </div>
      <Link href={href(sp, { contact: String(s.id), supplier: undefined }, "suppliers")} scroll={false} className="btn-primary mt-6 block w-full py-3.5 text-center no-underline">이 공급사에 문의하기</Link>
      <p className="mt-3 text-[11.5px] leading-[1.7] text-muted-2">{SUPPLIER_DISCLAIMER}</p>
      <IssueReportForm entityType="supplier" entityId={s.id} />
    </Overlay>
  );
}
