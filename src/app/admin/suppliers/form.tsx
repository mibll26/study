import type { Ingredient, Supplier } from "@prisma/client";
import { CERTIFICATIONS, COUNTRIES, DOSAGE_FORMS, SUPPLIER_COUNTRY_CODES, SUPPLIER_TYPES, VERIFICATION, parseList } from "@/lib/constants";
import { deleteSupplier, saveSupplier } from "@/lib/actions/admin";

function F({ label, children, span }: { label: string; children: React.ReactNode; span?: boolean }) {
  return <label className={`flex flex-col gap-1 ${span ? "sm:col-span-2" : ""}`}><span className="text-[11.5px] text-muted-2">{label}</span>{children}</label>;
}
function Checks({ name, options, selected }: { name: string; options: string[]; selected: string[] }) {
  return <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[13px]">{options.map((o) => <label key={o} className="flex items-center gap-1"><input type="checkbox" name={name} value={o} defaultChecked={selected.includes(o)} /> {o}</label>)}</div>;
}

export function SupplierForm({ s, ingredients, linked, saved }: { s: Supplier | null; ingredients: Ingredient[]; linked: number[]; saved?: boolean }) {
  return (
    <form action={saveSupplier.bind(null, s?.id ?? null)} className="space-y-6">
      {saved && <div className="callout">저장했습니다.</div>}
      <section className="border-2 border-ink bg-panel p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <F label="회사명 (한글)"><input name="nameKo" defaultValue={s?.nameKo} required className="input-sm" /></F>
          <F label="영문명"><input name="nameEn" defaultValue={s?.nameEn ?? ""} className="input-sm" /></F>
          {!s && <F label="slug (비우면 자동)"><input name="slug" className="input-sm font-mono" /></F>}
          <F label="국가"><select name="countryCode" defaultValue={s?.countryCode ?? "KR"} className="input-sm">{SUPPLIER_COUNTRY_CODES.map((c) => <option key={c} value={c}>{COUNTRIES[c].flag} {COUNTRIES[c].name}</option>)}</select></F>
          <F label="검증 상태"><select name="verificationStatus" defaultValue={s?.verificationStatus ?? "unverified"} className="input-sm">{Object.entries(VERIFICATION).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></F>
          <F label="공급 유형" span><Checks name="supplierTypes" options={SUPPLIER_TYPES} selected={parseList(s?.supplierTypes)} /></F>
          <F label="제형" span><Checks name="dosageForms" options={DOSAGE_FORMS} selected={parseList(s?.dosageForms)} /></F>
          <F label="인증" span><Checks name="certifications" options={CERTIFICATIONS} selected={parseList(s?.certifications)} /></F>
          <F label="MOQ 최소"><input name="moqMin" type="number" defaultValue={s?.moqMin ?? ""} className="input-sm font-mono" /></F>
          <F label="MOQ 단위"><input name="moqUnit" defaultValue={s?.moqUnit ?? "개"} className="input-sm" /></F>
          <F label="리드타임 최소 (주)"><input name="leadWeeksMin" type="number" defaultValue={s?.leadWeeksMin ?? ""} className="input-sm font-mono" /></F>
          <F label="리드타임 최대 (주)"><input name="leadWeeksMax" type="number" defaultValue={s?.leadWeeksMax ?? ""} className="input-sm font-mono" /></F>
          <F label="설립연도"><input name="foundedYear" type="number" defaultValue={s?.foundedYear ?? ""} className="input-sm font-mono" /></F>
          <F label="생산능력"><input name="capacity" defaultValue={s?.capacity ?? ""} className="input-sm" /></F>
          <F label="담당자 이메일 (비공개)"><input name="contactEmail" type="email" defaultValue={s?.contactEmail ?? ""} className="input-sm" /></F>
          <label className="flex items-center gap-2 self-end pb-1 text-[13px]"><input type="checkbox" name="visible" defaultChecked={s?.visible ?? true} /> 사용자 화면에 공개</label>
          <F label="소개" span><textarea name="description" rows={3} defaultValue={s?.description ?? ""} className="input-sm" /></F>
        </div>
      </section>
      <section className="border-2 border-ink bg-panel p-5">
        <div className="eyebrow mb-3">취급 원료</div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[13px]">{ingredients.map((i) => <label key={i.id} className="flex items-center gap-1"><input type="checkbox" name="ingredientIds" value={i.id} defaultChecked={linked.includes(i.id)} /> {i.nameKo}</label>)}</div>
      </section>
      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary">저장</button>
        {s && <button type="submit" formAction={deleteSupplier.bind(null, s.id)} className="btn-ghost text-red" formNoValidate>삭제</button>}
        {s && <a href={`/supplier/${s.slug}`} target="_blank" className="ml-auto text-[12.5px]">사용자 화면에서 보기 ↗</a>}
      </div>
    </form>
  );
}
