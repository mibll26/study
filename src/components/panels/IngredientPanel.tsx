import Link from "next/link";
import { Overlay } from "@/components/Overlay";
import { Tabs } from "@/components/Tabs";
import { getIngredient, type SP } from "@/lib/queries";
import { closeOverlays, href } from "@/lib/url";
import { COUNTRIES, DISCLAIMER, parseClaims, parseList } from "@/lib/constants";
import { SupplierCard } from "@/components/SupplierCard";
import { IssueReportForm } from "@/components/Forms";
import { SupplierPicker } from "@/components/SupplierPicker";

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="grid grid-cols-[110px_1fr] gap-3 border-b border-line-soft py-2.5 text-[13px] last:border-0"><dt className="text-muted-2">{k}</dt><dd className="m-0 leading-[1.7]">{v ?? <span className="text-faint">정보 없음</span>}</dd></div>;
}
function Src({ name, url, at }: { name?: string | null; url?: string | null; at?: string | null }) {
  if (!name && !url) return <span className="text-[11px] text-faint">출처 정보 없음</span>;
  return <span className="text-[11px] text-muted-2">출처: {url ? <a href={url} target="_blank" rel="noopener">{name ?? url}</a> : name}{at && <> · 확인 {at}</>}</span>;
}

export async function IngredientPanel({ slug, sp }: { slug: string; sp: SP }) {
  const ing = await getIngredient(slug);
  const closeHref = closeOverlays(sp, "explore");
  if (!ing) return <Overlay closeHref={closeHref} kind="panel" title="원료를 찾을 수 없습니다"><p className="text-[13px] text-muted">삭제되었거나 주소가 잘못되었습니다.</p></Overlay>;
  const aliases = parseList(ing.aliases), fns = parseList(ing.functionality), forms = parseList(ing.dosageForms);
  const suppliers = ing.suppliers.map((x) => x.supplier);
  const initialTab = sp.tab === "status" ? 1 : sp.tab === "suppliers" ? 2 : 0;

  const basic = (
    <div>
      {ing.descriptionKo && <p className="mb-4 text-[13.5px] leading-[1.75] text-muted" style={{ textWrap: "pretty" }}>{ing.descriptionKo}</p>}
      <dl>
        <Row k="명칭" v={<>{ing.nameKo} / {ing.nameEn}{ing.nameScientific && <> / <i>{ing.nameScientific}</i></>}</>} />
        <Row k="별칭" v={aliases.length ? aliases.join(", ") : null} />
        <Row k="분류" v={ing.category} />
        <Row k="기능성" v={fns.length ? <span className="flex flex-wrap gap-1">{fns.map((f) => <Link key={f} href={`/?fn=${encodeURIComponent(f)}#explore`} scroll={false} className="tag no-underline">{f}</Link>)}</span> : null} />
        <Row k="일반 제형" v={forms.length ? forms.join(" · ") : null} />
        <Row k="일일섭취량" v={ing.dailyIntake} />
        <Row k="주의사항" v={ing.caution} />
      </dl>
      <div className="mt-3"><Src name={ing.sourceName ?? "식품안전나라 (MFDS)"} url={ing.sourceUrl ?? "https://various.foodsafetykorea.go.kr"} at={ing.verifiedAt ?? "2026-09-01"} /></div>
      {ing.products.length > 0 && (
        <div className="mt-6">
          <div className="eyebrow mb-2">이 원료를 쓴 식약처 신고 완제품 <span className="font-mono">{ing.products.length}</span></div>
          <ul className="divide-y divide-line-soft border-2 border-ink bg-panel text-[12.5px]">{ing.products.map((p) => <li key={p.id} className="flex justify-between gap-3 px-3 py-2"><span>{p.name}</span><span className="text-muted-2 whitespace-nowrap">{p.company}</span></li>)}</ul>
        </div>
      )}
    </div>
  );

  const status = (
    <div>
      <div className="callout mb-4">{DISCLAIMER}</div>
      {ing.statuses.length === 0 && <p className="text-[13px] text-muted">등록된 국가별 규제 정보가 없습니다.</p>}
      <div className="grid-ink grid-cols-1">
        {ing.statuses.map((s) => {
          const c = COUNTRIES[s.countryCode]; const claims = parseClaims(s.allowedClaims);
          return (
            <div key={s.id} className="bg-panel p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="text-[15px] font-semibold">{c?.flag} {c?.name ?? s.countryCode}</div>
                <span className={`badge ${s.usable ? "border-blue text-blue" : "border-amber text-amber"}`}>{s.legalityStatus}</span>
              </div>
              <dl>
                <Row k="사용 적법성" v={<>{s.approvalType && <b className="font-medium">{s.approvalType}</b>}{s.approvalType && s.legality && " — "}{s.legality}</>} />
                {s.approvalHolder && <Row k="인정권자" v={<span className="text-amber">{s.approvalHolder}</span>} />}
                <Row k="허용 표현" v={claims.length ? <ul className="m-0 list-none p-0 space-y-2">{claims.map((cl, i) => <li key={i}><div className="font-mono text-[12px] text-muted">&ldquo;{cl.original}&rdquo;</div><div>{cl.translated}</div></li>)}</ul> : null} />
                <Row k="시설 요건" v={s.facilityRequirements} />
                <Row k="소요 · 비용" v={[s.registrationDuration, s.registrationCost].filter(Boolean).join(" · ") || null} />
                {s.alternativeChannels && <Row k="우회 채널" v={s.alternativeChannels} />}
              </dl>
              <div className="mt-2"><Src name={s.sourceName} url={s.sourceUrl} at={s.verifiedAt} /></div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const supplierTab = (
    <div>
      {suppliers.length === 0 ? (
        <div className="panel p-9 text-center">
          <p className="mb-2 text-[14.5px]">아직 등록된 공급사가 없습니다.</p>
          <p className="mb-5 text-[12.5px] text-muted-2">운영팀이 대신 소싱을 도와드릴 수 있습니다.</p>
          <Link href={href(sp, { contact: "sourcing", ingredient: ing.slug }, "explore")} scroll={false} className="btn-blue no-underline">소싱 지원 요청</Link>
        </div>
      ) : (
        <SupplierPicker ingredient={ing.nameKo} suppliers={suppliers.map((s) => ({ id: s.id, nameKo: s.nameKo }))} baseHref={href(sp, { contact: "__IDS__", ingredient: ing.slug }, "explore")}>
          <div className="grid-ink grid-cols-1">
            {suppliers.map((s) => <SupplierCard key={s.id} s={s} compact openHref={href(sp, { supplier: s.slug, ingredient: undefined }, "suppliers")} contactHref={href(sp, { contact: String(s.id), ingredient: ing.slug }, "explore")} />)}
          </div>
        </SupplierPicker>
      )}
      <div className="mt-4 text-[12.5px]"><Link href={href(sp, { ingredient: undefined, s_ingredient: ing.slug }, "suppliers")} scroll={false}>디렉터리에서 이 원료 취급 공급사 필터로 보기 →</Link></div>
    </div>
  );

  return (
    <Overlay closeHref={closeHref} kind="panel" kicker={`${ing.category} · ${ing.nameEn}`} title={ing.nameKo}>
      <Tabs initial={initialTab} tabs={[{ label: "기본 정보", content: basic }, { label: "국가별 상태", content: status, count: ing.statuses.length }, { label: "취급 공급사", content: supplierTab, count: suppliers.length }]} />
      <IssueReportForm entityType="ingredient" entityId={ing.id} />
    </Overlay>
  );
}
