import Link from "next/link";
import { listSuppliers, parseSuppliers, type SP } from "@/lib/queries";
import { href, isOn, toggleHref } from "@/lib/url";
import { CERTIFICATIONS, COUNTRIES, DOSAGE_FORMS, LEAD_BANDS, MOQ_BANDS, SUPPLIER_COUNTRY_CODES, SUPPLIER_DISCLAIMER, SUPPLIER_TYPES } from "@/lib/constants";
import { SupplierCard } from "@/components/SupplierCard";

function Chip({ on, to, children }: { on: boolean; to: string; children: React.ReactNode }) {
  return <Link href={to} scroll={false} className={`${on ? "chip-on" : "chip"} no-underline`}>{children}</Link>;
}
function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div className="eyebrow mb-[9px]">{label}</div><div className="flex flex-wrap gap-1.5">{children}</div></div>;
}

export async function Suppliers({ sp }: { sp: SP }) {
  const q = parseSuppliers(sp);
  const rows = await listSuppliers(q);
  const H = "suppliers";
  const hasFilter = Boolean(q.countries.length || q.types.length || q.forms.length || q.certs.length || q.moq || q.lead || q.verifiedOnly || q.ingredient);
  return (
    <section id="suppliers" className="scroll-mt-16 border-t border-line">
      <div className="mx-auto max-w-[1260px] px-6 py-[76px] md:px-8">
        <div className="mb-2.5 flex items-baseline gap-4"><h2 className="text-[25px] font-semibold tracking-[-0.025em]">공급사 디렉터리</h2><span className="font-mono text-[11px] tracking-[0.14em] text-muted-2">02</span></div>
        <p className="mb-[30px] max-w-[74ch] text-[13px] leading-[1.75] text-muted-2">{SUPPLIER_DISCLAIMER}</p>
        <div className="mb-7 flex flex-wrap items-end gap-[26px] border-b-2 border-ink pb-5">
          <Group label="국가">{SUPPLIER_COUNTRY_CODES.map((c) => <Chip key={c} on={isOn(sp, "s_country", c)} to={toggleHref(sp, "s_country", c, H)}>{COUNTRIES[c].flag} {COUNTRIES[c].name}</Chip>)}</Group>
          <Group label="공급 유형">{SUPPLIER_TYPES.map((t) => <Chip key={t} on={isOn(sp, "s_type", t)} to={toggleHref(sp, "s_type", t, H)}>{t}</Chip>)}</Group>
          <Group label="제형">{DOSAGE_FORMS.map((f) => <Chip key={f} on={isOn(sp, "s_form", f)} to={toggleHref(sp, "s_form", f, H)}>{f}</Chip>)}</Group>
          <Group label="인증">{CERTIFICATIONS.map((c) => <Chip key={c} on={isOn(sp, "s_cert", c)} to={toggleHref(sp, "s_cert", c, H)}>{c}</Chip>)}</Group>
          <Group label="MOQ">{MOQ_BANDS.map((b) => <Chip key={b.key} on={q.moq === b.key} to={href(sp, { s_moq: q.moq === b.key ? undefined : b.key }, H)}>{b.label}</Chip>)}</Group>
          <Group label="리드타임">{LEAD_BANDS.map((b) => <Chip key={b.key} on={q.lead === b.key} to={href(sp, { s_lead: q.lead === b.key ? undefined : b.key }, H)}>{b.label}</Chip>)}</Group>
          <Link href={href(sp, { s_verified: q.verifiedOnly ? undefined : "1" }, H)} scroll={false} className="flex items-center gap-2 pb-[5px] text-[12.5px] text-muted no-underline">
            <span className={`inline-block h-[14px] w-[14px] border ${q.verifiedOnly ? "border-blue bg-blue" : "border-line bg-panel"}`} aria-hidden="true" /> 검증된 공급사만
          </Link>
          {q.ingredient && <span className="tag pb-[5px]">원료: {q.ingredient} <Link href={href(sp, { s_ingredient: undefined }, H)} scroll={false} className="ml-1 no-underline">×</Link></span>}
          {hasFilter && <Link href={href(sp, { s_country: undefined, s_type: undefined, s_form: undefined, s_cert: undefined, s_moq: undefined, s_lead: undefined, s_verified: undefined, s_ingredient: undefined }, H)} scroll={false} className="btn-ghost pb-[7px]">필터 해제</Link>}
        </div>
        <div className="mb-4 text-[13px] text-muted"><span className="font-mono text-ink">{rows.length}</span> suppliers</div>
        {rows.length === 0 ? (
          <div className="panel p-12 text-center"><p className="mb-2 text-[15px]">조건에 맞는 공급사가 없습니다.</p><p className="text-[13px] text-muted-2">필터를 완화하거나, 원료 상세에서 소싱 지원을 요청하세요.</p></div>
        ) : (
          <div className="grid-ink grid-cols-[repeat(auto-fill,minmax(310px,1fr))]">
            {rows.map((s) => <SupplierCard key={s.id} s={s} openHref={href(sp, { supplier: s.slug }, H)} contactHref={href(sp, { contact: String(s.id) }, H)} />)}
          </div>
        )}
      </div>
    </section>
  );
}
