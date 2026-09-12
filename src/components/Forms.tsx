"use client";

import { useActionState } from "react";
import { submitContact, submitInfoRequest, submitIssue, submitSupplierApplication, type FormState } from "@/lib/actions/public";
import { CERTIFICATIONS, DOSAGE_FORMS, MARKET_CODES, COUNTRIES, QUANTITY_RANGES, SUPPLIER_COUNTRY_CODES, SUPPLIER_TYPES } from "@/lib/constants";

function Field({ label, error, children, required }: { label: string; error?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="flex flex-col gap-[7px]">
      <span className="text-[11.5px] text-muted-2">{label}{required && <span className="text-red"> *</span>}</span>
      {children}
      {error && <span className="text-[12px] text-red">{error}</span>}
    </label>
  );
}
function Notice({ state }: { state: FormState }) {
  if (!state?.message) return null;
  return <div className={`callout mt-[18px] ${state.ok ? "" : "border-red bg-[#f6e6e4]"}`}>{state.ok && state.refNo && <>접수번호 <span className="font-mono text-ink">{state.refNo}</span> — </>}{state.message}</div>;
}
function CheckGroup({ name, options }: { name: string; options: string[] }) {
  return <div className="flex flex-wrap gap-x-4 gap-y-2">{options.map((o) => <label key={o} className="flex items-center gap-1.5 text-[13px]"><input type="checkbox" name={name} value={o} /> {o}</label>)}</div>;
}

/** FR-5 컨택 요청 폼 */
export function ContactForm({ suppliers, ingredient, dosageForm, markets, formulationSlug, formulationHref }: { suppliers: { id: number; nameKo: string }[]; ingredient?: string; dosageForm?: string; markets?: string[]; formulationSlug?: string; formulationHref?: string }) {
  const [state, action, pending] = useActionState(submitContact, null);
  const e = state?.errors ?? {};
  if (state?.ok) return <Notice state={state} />;
  return (
    <form action={action} className="space-y-[18px]">
      <p className="text-[13px] leading-[1.75] text-muted">선택한 공급사에 한 번에 문의합니다. 운영팀이 스팸·유효성 검토 후 전달하며(영업일 1일 내), 공급사 응답은 이메일로 받습니다.</p>
      {formulationSlug && <input type="hidden" name="formulationSlug" value={formulationSlug} />}
      {formulationHref && <div className="callout">배합표가 문의에 첨부됩니다. <a href={formulationHref}>배합 보기 ↗</a></div>}
      <div className="panel p-4 text-[13px]">
        <div className="eyebrow mb-2">문의 대상 공급사</div>
        <div className="flex flex-wrap gap-1.5">{suppliers.map((s) => <span key={s.id} className="tag">{s.nameKo}<input type="hidden" name="supplierIds" value={s.id} /></span>)}</div>
        {e.supplierIds && <p className="mt-2 text-[12px] text-red">{e.supplierIds}</p>}
      </div>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="회사명" required error={e.company}><input id="c-company" name="company" className="input" /></Field>
        <Field label="담당자명 / 직함" required error={e.contactName}><div className="flex gap-1.5"><input id="c-name" name="contactName" className="input" placeholder="이름" /><input id="c-title" name="title" className="input" placeholder="직함" /></div></Field>
        <Field label="이메일" required error={e.email}><input id="c-email" name="email" type="email" className="input" /></Field>
        <Field label="연락처" required error={e.phone}><input id="c-phone" name="phone" className="input" placeholder="010-0000-0000" /></Field>
        <Field label="관심 원료/제품" required error={e.ingredient}><input id="c-ingredient" name="ingredient" defaultValue={ingredient ?? ""} className="input" /></Field>
        <Field label="희망 제형" required error={e.dosageForm}><select id="c-form" name="dosageForm" className="input" defaultValue={dosageForm ?? ""}><option value="" disabled>선택</option>{DOSAGE_FORMS.map((f) => <option key={f}>{f}</option>)}</select></Field>
        <Field label="예상 수량" required error={e.quantityRange}><select id="c-qty" name="quantityRange" className="input" defaultValue=""><option value="" disabled>선택</option>{QUANTITY_RANGES.map((f) => <option key={f}>{f}</option>)}</select></Field>
        <Field label="희망 납기"><input id="c-date" name="targetDate" type="month" className="input" /></Field>
      </div>
      <Field label="판매 예정 국가"><div className="flex flex-wrap gap-x-4 gap-y-2">{MARKET_CODES.map((c) => <label key={c} className="flex items-center gap-1.5 text-[13px]"><input type="checkbox" name="targetMarkets" value={c} defaultChecked={markets?.includes(c)} /> {COUNTRIES[c].flag} {COUNTRIES[c].name}</label>)}</div></Field>
      <Field label="추가 요청사항"><textarea id="c-message" name="message" rows={3} className="input" placeholder="원하는 규격, 참고 제품, 예산 범위 등" /></Field>
      <div className="panel space-y-2.5 p-4 text-[12px] leading-[1.75] text-muted">
        <label className="flex items-start gap-[9px] cursor-pointer"><input type="checkbox" name="consentPrivacy" className="mt-[3px]" /><span>[필수] 문의 처리를 위한 개인정보 수집·이용에 동의합니다. {e.consentPrivacy && <span className="text-red">{e.consentPrivacy}</span>}</span></label>
        <label className="flex items-start gap-[9px] cursor-pointer"><input type="checkbox" name="consentShare" className="mt-[3px]" /><span>[필수] 선택한 공급사에 다음 항목을 전달하는 데 동의합니다: <b>회사명, 담당자명, 이메일, 연락처, 관심 원료, 희망 제형, 예상 수량</b>. {e.consentShare && <span className="text-red">{e.consentShare}</span>}</span></label>
      </div>
      <Notice state={state} />
      <div className="flex justify-end gap-2.5"><button type="submit" className="btn-primary" disabled={pending}>{pending ? "전송 중…" : "문의 보내기"}</button></div>
    </form>
  );
}

/** FR-8 공급사 등록 신청 */
export function SupplierApplyForm() {
  const [state, action, pending] = useActionState(submitSupplierApplication, null);
  const e = state?.errors ?? {};
  if (state?.ok) return <Notice state={state} />;
  return (
    <form action={action} className="space-y-[18px]">
      <p className="text-[13px] leading-[1.75] text-muted">회사 정보와 보유 인증을 알려주세요. 운영팀이 영업일 3일 내 검토 후 프로필을 공개합니다. MVP 기간 동안 등록·노출·문의 수신은 무료입니다.</p>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="회사명" required error={e.company}><input id="a-company" name="company" className="input" /></Field>
        <Field label="국가" required error={e.countryCode}><select id="a-country" name="countryCode" className="input" defaultValue="KR">{SUPPLIER_COUNTRY_CODES.map((c) => <option key={c} value={c}>{COUNTRIES[c].flag} {COUNTRIES[c].name}</option>)}</select></Field>
        <Field label="담당자" required error={e.contactName}><input id="a-name" name="contactName" className="input" /></Field>
        <Field label="이메일" required error={e.email}><input id="a-email" name="email" type="email" className="input" /></Field>
        <Field label="연락처"><input id="a-phone" name="phone" className="input" /></Field>
        <Field label="MOQ"><input id="a-moq" name="moq" className="input" placeholder="예: 1,000개 / 500kg" /></Field>
        <Field label="리드타임"><input id="a-lead" name="leadTime" className="input" placeholder="예: 8~12주" /></Field>
      </div>
      <Field label="공급 유형"><CheckGroup name="supplierTypes" options={SUPPLIER_TYPES} /></Field>
      <Field label="제형"><CheckGroup name="dosageForms" options={DOSAGE_FORMS} /></Field>
      <Field label="보유 인증 (증빙은 검토 시 별도 요청)"><CheckGroup name="certifications" options={CERTIFICATIONS} /></Field>
      <Field label="소개 / 주력 원료"><textarea id="a-message" name="message" rows={3} className="input" /></Field>
      <Notice state={state} />
      <div className="flex justify-end"><button type="submit" className="btn-primary" disabled={pending}>{pending ? "전송 중…" : "등록 신청"}</button></div>
    </form>
  );
}

/** UF-3 정보 요청 */
export function InfoRequestForm({ query }: { query: string }) {
  const [state, action, pending] = useActionState(submitInfoRequest, null);
  if (state?.ok) return <Notice state={state} />;
  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <Field label="찾는 원료/제품" required error={state?.errors?.query}><input id="r-query" name="query" defaultValue={query} className="input min-w-52" /></Field>
      <Field label="알림 받을 이메일 (선택)"><input id="r-email" name="email" type="email" className="input min-w-52" /></Field>
      <button type="submit" className="btn-blue" disabled={pending}>정보 요청하기</button>
      <Notice state={state} />
    </form>
  );
}

/** FR-11 오류 신고 (패널 하단) */
export function IssueReportForm({ entityType, entityId }: { entityType: "ingredient" | "supplier"; entityId: number }) {
  const [state, action, pending] = useActionState(submitIssue, null);
  return (
    <details className="mt-6 border-t border-line pt-3 text-[12.5px]">
      <summary className="cursor-pointer text-blue">정보가 잘못되었나요?</summary>
      {state?.ok ? <Notice state={state} /> : (
        <form action={action} className="mt-3 space-y-2">
          <input type="hidden" name="entityType" value={entityType} /><input type="hidden" name="entityId" value={entityId} />
          <input id={`i-field-${entityId}`} name="field" className="input" placeholder="어느 항목인가요? (예: 미국 NDI 상태)" />
          <textarea id={`i-msg-${entityId}`} name="message" rows={2} className="input" placeholder="무엇이 잘못되었는지, 가능하면 출처와 함께" />
          {state?.errors?.message && <p className="text-red">{state.errors.message}</p>}
          <button type="submit" className="btn" disabled={pending}>신고</button>
        </form>
      )}
    </details>
  );
}
