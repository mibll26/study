import type { Ingredient, RegulatoryStatus, Supplier } from "@prisma/client";
import { CATEGORIES, COUNTRIES, DOSAGE_FORMS, FUNCTIONALITIES, MARKET_CODES, parseClaims, parseList } from "@/lib/constants";
import { deleteIngredient, saveIngredient } from "@/lib/actions/admin";

function F({ label, children, span }: { label: string; children: React.ReactNode; span?: boolean }) {
  return <label className={`flex flex-col gap-1 ${span ? "sm:col-span-2" : ""}`}><span className="text-[11.5px] text-muted-2">{label}</span>{children}</label>;
}
function Checks({ name, options, selected }: { name: string; options: string[]; selected: string[] }) {
  return <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[13px]">{options.map((o) => <label key={o} className="flex items-center gap-1"><input type="checkbox" name={name} value={o} defaultChecked={selected.includes(o)} /> {o}</label>)}</div>;
}

export function IngredientForm({ ing, statuses, suppliers, linked, saved }: { ing: Ingredient | null; statuses: RegulatoryStatus[]; suppliers: Supplier[]; linked: number[]; saved?: boolean }) {
  const action = saveIngredient.bind(null, ing?.id ?? null);
  const st = (c: string) => statuses.find((s) => s.countryCode === c);
  return (
    <form action={action} className="space-y-6">
      {saved && <div className="callout">저장했습니다. 사용자 화면에 즉시 반영됩니다.</div>}
      <section className="border-2 border-ink bg-panel p-5">
        <div className="eyebrow mb-3">① 기본 정보</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <F label="한글명"><input name="nameKo" defaultValue={ing?.nameKo} required className="input-sm" /></F>
          <F label="영문명"><input name="nameEn" defaultValue={ing?.nameEn} required className="input-sm" /></F>
          <F label="학명"><input name="nameScientific" defaultValue={ing?.nameScientific ?? ""} className="input-sm" /></F>
          {!ing && <F label="slug (URL, 비우면 자동)"><input name="slug" className="input-sm font-mono" placeholder="magnesium" /></F>}
          <F label="별칭 (줄바꿈·콤마 구분 — 검색·식약처 자동 매핑에 사용)" span><textarea name="aliases" rows={2} defaultValue={parseList(ing?.aliases).join("\n")} className="input-sm" /></F>
          <F label="분류"><select name="category" defaultValue={ing?.category ?? CATEGORIES[0]} className="input-sm">{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></F>
          <F label="일일섭취량"><input name="dailyIntake" defaultValue={ing?.dailyIntake ?? ""} className="input-sm" /></F>
          <F label="기능성 태그" span><Checks name="functionality" options={FUNCTIONALITIES} selected={parseList(ing?.functionality)} /></F>
          <F label="일반 제형" span><Checks name="dosageForms" options={DOSAGE_FORMS} selected={parseList(ing?.dosageForms)} /></F>
          <F label="설명" span><textarea name="descriptionKo" rows={3} defaultValue={ing?.descriptionKo ?? ""} className="input-sm" /></F>
          <F label="주의사항" span><textarea name="caution" rows={2} defaultValue={ing?.caution ?? ""} className="input-sm" /></F>
          <F label="출처명"><input name="sourceName" defaultValue={ing?.sourceName ?? ""} className="input-sm" /></F>
          <F label="출처 URL"><input name="sourceUrl" defaultValue={ing?.sourceUrl ?? ""} className="input-sm font-mono" /></F>
          <F label="확인일"><input name="verifiedAt" type="date" defaultValue={ing?.verifiedAt ?? ""} className="input-sm font-mono" /></F>
          <label className="flex items-center gap-2 self-end pb-1 text-[13px]"><input type="checkbox" name="curated" defaultChecked={ing?.curated ?? false} /> 큐레이션 완료 (운영자 검수)</label>
        </div>
      </section>

      <section className="border-2 border-ink bg-panel p-5">
        <div className="eyebrow mb-1">② 국가별 규제 상태 — 5축</div>
        <p className="mb-4 text-[12px] text-muted-2">&lsquo;상태 요약&rsquo;이 비어 있으면 해당 국가 정보는 저장하지 않습니다. 허용 표현은 한 줄에 하나, <code>원문 || 번역</code> 형식.</p>
        <div className="space-y-3">
          {MARKET_CODES.map((c) => { const s = st(c); const p = `st_${c}_`; return (
            <details key={c} open={Boolean(s)} className="border border-line">
              <summary className="cursor-pointer bg-alt px-3 py-2 text-[13px] font-medium">{COUNTRIES[c].flag} {COUNTRIES[c].name} {s ? <span className="ml-2 font-mono text-[11px] text-muted-2">{s.legalityStatus}{s.published ? "" : " · 비공개"}</span> : <span className="ml-2 text-[11px] text-faint">정보 없음</span>}</summary>
              <div className="grid gap-3 p-3 sm:grid-cols-2">
                <F label="상태 요약 (배지)"><input name={`${p}legalityStatus`} defaultValue={s?.legalityStatus ?? ""} className="input-sm" placeholder="고시형 / NDI 불요 / 블루햇 필요" /></F>
                <div className="flex items-end gap-4 pb-1 text-[13px]"><label className="flex items-center gap-1"><input type="checkbox" name={`${p}usable`} defaultChecked={s?.usable ?? true} /> 사용 가능</label><label className="flex items-center gap-1"><input type="checkbox" name={`${p}published`} defaultChecked={s?.published ?? false} /> 공개 (검수 완료)</label></div>
                <F label="인정/승인 유형"><input name={`${p}approvalType`} defaultValue={s?.approvalType ?? ""} className="input-sm" /></F>
                <F label="인정권자 (개별인정)"><input name={`${p}approvalHolder`} defaultValue={s?.approvalHolder ?? ""} className="input-sm" /></F>
                <F label="사용 적법성 설명" span><textarea name={`${p}legality`} rows={2} defaultValue={s?.legality ?? ""} className="input-sm" /></F>
                <F label="허용 표현 (원문 || 번역)" span><textarea name={`${p}claims`} rows={2} defaultValue={parseClaims(s?.allowedClaims).map((x) => `${x.original} || ${x.translated}`).join("\n")} className="input-sm font-mono" /></F>
                <F label="시설 요건"><input name={`${p}facilityRequirements`} defaultValue={s?.facilityRequirements ?? ""} className="input-sm" /></F>
                <F label="우회 채널"><input name={`${p}alternativeChannels`} defaultValue={s?.alternativeChannels ?? ""} className="input-sm" /></F>
                <F label="등록 소요"><input name={`${p}registrationDuration`} defaultValue={s?.registrationDuration ?? ""} className="input-sm" /></F>
                <F label="등록 비용"><input name={`${p}registrationCost`} defaultValue={s?.registrationCost ?? ""} className="input-sm" /></F>
                <F label="출처명"><input name={`${p}sourceName`} defaultValue={s?.sourceName ?? ""} className="input-sm" /></F>
                <F label="출처 URL"><input name={`${p}sourceUrl`} defaultValue={s?.sourceUrl ?? ""} className="input-sm font-mono" /></F>
                <F label="확인일"><input name={`${p}verifiedAt`} type="date" defaultValue={s?.verifiedAt ?? ""} className="input-sm font-mono" /></F>
              </div>
            </details>
          ); })}
        </div>
      </section>

      <section className="border-2 border-ink bg-panel p-5">
        <div className="eyebrow mb-3">③ 취급 공급사</div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[13px]">{suppliers.map((s) => <label key={s.id} className="flex items-center gap-1"><input type="checkbox" name="supplierIds" value={s.id} defaultChecked={linked.includes(s.id)} /> {s.nameKo}</label>)}</div>
      </section>

      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary">저장</button>
        {ing && <button type="submit" formAction={deleteIngredient.bind(null, ing.id)} className="btn-ghost text-red" formNoValidate>삭제</button>}
        {ing && <a href={`/ingredient/${ing.slug}`} target="_blank" className="ml-auto text-[12.5px]">사용자 화면에서 보기 ↗</a>}
      </div>
    </form>
  );
}
