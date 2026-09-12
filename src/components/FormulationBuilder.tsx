"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { COUNTRIES, DOSAGE_FORMS, MARKET_CODES, VERIFICATION, formatLead, formatMoq } from "@/lib/constants";
import { UNITS, type FormulationInput, type Report, type Level } from "@/lib/formulation";
import { saveFormulation, suggestFormulation } from "@/lib/actions/formulation";
import type { AiSuggestion } from "@/lib/ai";

export type PickerIngredient = { slug: string; nameKo: string; nameEn: string; category: string; functionality: string[]; intakeMin: number | null; intakeMax: number | null; intakeUnit: string | null };
type Item = { slug: string; amount: number; unit: string };
type Saved = { slug: string; name: string; note: string; items: Item[]; dosageForm: string; markets: string[] } | null;

const LEVEL: Record<Level, { label: string; cls: string; dot: string }> = {
  ok: { label: "사용 가능", cls: "border-blue text-blue", dot: "bg-blue" },
  warn: { label: "검토 필요", cls: "border-amber text-amber", dot: "bg-amber" },
  blocked: { label: "불가", cls: "border-red text-red", dot: "bg-red" },
  unknown: { label: "정보 없음", cls: "border-line text-muted-2", dot: "bg-line" },
};
const INTAKE: Record<string, { label: string; cls: string }> = {
  ok: { label: "범위 내", cls: "text-blue" }, low: { label: "하한 미만", cls: "text-amber" }, high: { label: "상한 초과", cls: "text-red" }, unknown: { label: "기준 없음", cls: "text-muted-2" }, unit: { label: "단위 확인", cls: "text-amber" },
};

export function FormulationBuilder({ ingredients, saved, initialAdd }: { ingredients: PickerIngredient[]; saved: Saved; initialAdd?: string }) {
  const router = useRouter();
  const [name, setName] = useState(saved?.name ?? "");
  const [note, setNote] = useState(saved?.note ?? "");
  const [items, setItems] = useState<Item[]>(() => {
    if (saved) return saved.items;
    const first = initialAdd ? ingredients.find((i) => i.slug === initialAdd) : null;
    return first ? [{ slug: first.slug, amount: first.intakeMin ?? 0, unit: first.intakeUnit ?? "mg" }] : [];
  });
  const [dosageForm, setDosageForm] = useState(saved?.dosageForm ?? "캡슐");
  const [markets, setMarkets] = useState<string[]>(saved?.markets?.length ? saved.markets : ["KR"]);
  const [filter, setFilter] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [checking, setChecking] = useState(false);
  const [pending, start] = useTransition();
  const [savedSlug, setSavedSlug] = useState<string | null>(saved?.slug ?? null);
  const [flash, setFlash] = useState<string | null>(null);
  const [goal, setGoal] = useState("");
  const [ai, setAi] = useState<{ status: "idle" | "loading" | "done" | "error"; suggestion?: AiSuggestion; error?: string }>({ status: "idle" });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bySlug = useMemo(() => new Map(ingredients.map((i) => [i.slug, i])), [ingredients]);
  const input: FormulationInput = useMemo(() => ({ items, dosageForm, markets }), [items, dosageForm, markets]);

  // 변경 시 250ms 디바운스로 체크
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setChecking(true);
      try { const res = await fetch("/api/formulation/check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }); setReport(await res.json()); }
      finally { setChecking(false); }
    }, 250);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [input]);

  const add = (ing: PickerIngredient) => { if (items.some((i) => i.slug === ing.slug) || items.length >= 20) return; setItems([...items, { slug: ing.slug, amount: ing.intakeMin ?? 0, unit: ing.intakeUnit ?? "mg" }]); };
  const update = (slug: string, patch: Partial<Item>) => setItems(items.map((i) => (i.slug === slug ? { ...i, ...patch } : i)));
  const remove = (slug: string) => setItems(items.filter((i) => i.slug !== slug));
  const toggleMarket = (c: string) => setMarkets(markets.includes(c) ? markets.filter((m) => m !== c) : [...markets, c]);
  const visible = ingredients.filter((i) => !filter || [i.nameKo, i.nameEn, i.category, ...i.functionality].some((s) => s.toLowerCase().includes(filter.toLowerCase())));

  function save() {
    start(async () => {
      const { slug } = await saveFormulation(savedSlug, name, note, input);
      setSavedSlug(slug); setFlash("저장했습니다. 이 주소를 공유하면 같은 배합이 열립니다."); setTimeout(() => setFlash(null), 3000);
      if (slug !== saved?.slug) router.replace(`/formulate/${slug}`);
    });
  }
  // AI 배합 추천: 목표 문장 → 원료·함량·제형·국가를 한 번에 채운다. 이후 체크는 기존 디바운스 로직이 처리
  async function askAi() {
    if (!goal.trim() || ai.status === "loading") return;
    setAi({ status: "loading" });
    const r = await suggestFormulation(goal, { markets, dosageForm });
    if (!r.ok) { setAi({ status: "error", error: r.error }); return; }
    const s = r.suggestion;
    setItems(s.items.map(({ slug, amount, unit }) => ({ slug, amount, unit })).filter((i) => bySlug.has(i.slug)));
    setDosageForm(s.dosageForm); setMarkets(s.markets);
    if (!name.trim()) setName(s.name);
    setAi({ status: "done", suggestion: s });
  }
  const summaryText = items.map((i) => `${bySlug.get(i.slug)?.nameKo ?? i.slug} ${i.amount}${i.unit}`).join(" + ");
  const matched = report?.suppliers.filter((s) => s.coversAll && s.formOk !== false) ?? [];
  const quoteHref = savedSlug && matched.length ? `/?contact=${matched.slice(0, 5).map((s) => s.id).join(",")}&f=${savedSlug}#suppliers` : null;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)_360px]">
      {/* ① 원료 선택 */}
      <aside className="border-2 border-ink bg-panel">
        <div className="border-b-2 border-ink px-4 py-3"><div className="eyebrow mb-2">① 원료 선택</div><input id="f-filter" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="이름·기능성으로 찾기" className="input-sm" /></div>
        <ul className="max-h-[70vh] divide-y divide-line-soft overflow-y-auto">
          {visible.map((ing) => { const on = items.some((i) => i.slug === ing.slug); return (
            <li key={ing.slug}>
              <button type="button" onClick={() => add(ing)} disabled={on} className={`flex w-full flex-col items-start gap-0.5 border-0 px-4 py-2.5 text-left cursor-pointer ${on ? "bg-alt text-muted-2" : "bg-transparent hover:bg-alt"}`}>
                <span className="text-[13.5px] font-medium">{ing.nameKo} <span className="font-normal text-muted-2">{ing.nameEn}</span></span>
                <span className="text-[11px] text-muted-2">{ing.category} · {ing.functionality.slice(0, 3).join(" · ")}{on ? " · 추가됨" : ""}</span>
              </button>
            </li>
          ); })}
          {visible.length === 0 && <li className="px-4 py-6 text-center text-[12.5px] text-muted-2">없음 — <Link href="/?request=1#explore">원료 정보 요청</Link></li>}
        </ul>
      </aside>

      {/* ② 배합표 */}
      <section className="space-y-4">
        <div className="border-2 border-ink bg-panel">
          <div className="flex flex-wrap items-center gap-3 border-b-2 border-ink px-5 py-3"><div className="eyebrow">AI 배합 추천</div><span className="text-[11.5px] text-muted-2">목표를 적으면 카탈로그 안에서 원료·함량·제형·국가를 골라 채웁니다</span></div>
          <div className="space-y-2 px-5 py-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <textarea id="f-goal" value={goal} onChange={(e) => setGoal(e.target.value)} rows={2} maxLength={1000} placeholder="예: 30~40대 직장인 수면·스트레스 케어, 캡슐, 한국·미국 판매 예정. 마그네슘은 꼭 넣고 싶음" className="input-sm flex-1" onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) askAi(); }} />
              <button type="button" onClick={askAi} disabled={!goal.trim() || ai.status === "loading"} className="btn-primary shrink-0 self-start sm:self-stretch">{ai.status === "loading" ? "설계 중…" : items.length ? "AI로 다시 설계" : "AI로 배합 만들기"}</button>
            </div>
            {ai.status === "error" && <div className="text-[12.5px] text-red">{ai.error}</div>}
            {ai.status === "done" && ai.suggestion && (
              <div className="border-2 border-line bg-alt px-4 py-3 text-[12.5px] leading-[1.7]">
                <div className="mb-1 font-medium">{ai.suggestion.name} — <span className="font-normal text-muted">{ai.suggestion.rationale}</span></div>
                <ul className="space-y-0.5">{ai.suggestion.items.map((it) => <li key={it.slug}><span className="font-medium">{bySlug.get(it.slug)?.nameKo ?? it.slug}</span> <span className="font-mono text-[11.5px] text-muted-2">{it.amount}{it.unit}</span> — {it.reason}</li>)}</ul>
                {ai.suggestion.cautions.length > 0 && <ul className="mt-2 space-y-0.5 text-amber">{ai.suggestion.cautions.map((c, i) => <li key={i}>⚠ {c}</li>)}</ul>}
                <div className="mt-2 text-[11px] text-faint">AI 제안은 참고용입니다. 아래 배합표에서 함량을 조정하면 규제·함량 체크가 다시 실행됩니다.</div>
              </div>
            )}
          </div>
        </div>
        <div className="border-2 border-ink bg-panel">
          <div className="flex flex-wrap items-center gap-3 border-b-2 border-ink px-5 py-3">
            <div className="eyebrow">② 배합표</div>
            <input id="f-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="배합 이름 (예: 수면 케어 3종)" className="input-sm ml-auto max-w-xs" />
          </div>
          {items.length === 0 ? <div className="px-5 py-12 text-center text-[13.5px] text-muted-2">왼쪽에서 원료를 눌러 추가하거나, 위에 목표를 적고 AI에게 맡기세요. 함량은 KR 일일섭취량 하한으로 채워집니다.</div> : (
            <table className="w-full text-[13px]">
              <thead><tr><th className="th">원료</th><th className="th">1일 함량</th><th className="th">함량 체크</th><th className="th" /></tr></thead>
              <tbody>
                {items.map((it) => { const ing = bySlug.get(it.slug); const r = report?.ingredients.find((x) => x.slug === it.slug); const ik = r ? INTAKE[r.intake.status] : null; return (
                  <tr key={it.slug}>
                    <td className="td"><div className="font-medium">{ing?.nameKo}</div><div className="text-[11.5px] text-muted-2">{ing?.nameEn}{r?.intake.basis ? ` · ${r.intake.basis} 기준` : ""}</div></td>
                    <td className="td"><div className="flex gap-1"><input type="number" min={0} step="any" value={it.amount} onChange={(e) => update(it.slug, { amount: Number(e.target.value) })} aria-label={`${ing?.nameKo} 함량`} className="input-sm w-24 font-mono text-right" /><select value={it.unit} onChange={(e) => update(it.slug, { unit: e.target.value })} aria-label="단위" className="input-sm w-20">{UNITS.map((u) => <option key={u}>{u}</option>)}</select></div></td>
                    <td className="td">{ik ? <><span className={`font-medium ${ik.cls}`}>{ik.label}</span><div className="text-[11.5px] text-muted-2">{r!.intake.note}</div></> : <span className="text-muted-2">…</span>}</td>
                    <td className="td"><button type="button" onClick={() => remove(it.slug)} aria-label="제거" className="border-0 bg-transparent text-muted-2 cursor-pointer hover:text-red">×</button></td>
                  </tr>
                ); })}
              </tbody>
            </table>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="border-2 border-ink bg-panel p-4"><div className="eyebrow mb-2">제형</div><div className="flex flex-wrap gap-1.5">{DOSAGE_FORMS.map((f) => <button key={f} type="button" onClick={() => setDosageForm(f)} className={dosageForm === f ? "chip-on" : "chip"}>{f}</button>)}</div></div>
          <div className="border-2 border-ink bg-panel p-4"><div className="eyebrow mb-2">판매 예정 국가</div><div className="flex flex-wrap gap-1.5">{MARKET_CODES.map((c) => <button key={c} type="button" onClick={() => toggleMarket(c)} className={markets.includes(c) ? "chip-on" : "chip"}>{COUNTRIES[c].flag} {COUNTRIES[c].name}</button>)}</div></div>
        </div>
        <div className="border-2 border-ink bg-panel p-4">
          <label className="flex flex-col gap-1 text-[11.5px] text-muted-2">메모 (목표 소비자, 참고 제품, 예산 등)<textarea id="f-note" value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="input-sm" /></label>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" onClick={save} disabled={pending || items.length === 0} className="btn-primary">{pending ? "저장 중…" : savedSlug ? "변경 저장" : "저장하고 공유 링크 만들기"}</button>
            {savedSlug && <span className="font-mono text-[12px] text-muted-2">/formulate/{savedSlug}</span>}
            {flash && <span className="text-[12.5px] text-blue">{flash}</span>}
          </div>
        </div>
      </section>

      {/* ③ 리포트 */}
      <aside className="space-y-4 lg:sticky lg:top-20">
        <div className={`border-2 p-4 ${report ? { ok: "border-blue bg-blue-soft", warn: "border-amber bg-amber-soft", blocked: "border-red bg-[#f6e6e4]", unknown: "border-ink bg-panel" }[report.summary.level] : "border-ink bg-panel"}`}>
          <div className="eyebrow mb-1">③ 종합 판정 {checking && <span className="normal-case tracking-normal text-faint">확인 중…</span>}</div>
          <div className="mb-1 flex items-center gap-2 text-[15px] font-semibold">{report && <span className={`inline-block h-2.5 w-2.5 ${LEVEL[report.summary.level].dot}`} />}{report ? LEVEL[report.summary.level].label : "—"}</div>
          <p className="text-[12.5px] leading-[1.7] text-muted">{report?.summary.text ?? "원료를 추가하면 규제·함량·공급사 체크가 시작됩니다."}</p>
        </div>

        {report && report.ingredients.length > 0 && (
          <div className="border-2 border-ink bg-panel">
            <div className="border-b-2 border-ink px-4 py-2.5 eyebrow">국가별 사용 가능 여부</div>
            <div className="overflow-x-auto"><table className="w-full text-[12.5px]"><thead><tr><th className="th">원료</th>{report.markets.map((m) => <th key={m.code} className="th text-center">{COUNTRIES[m.code]?.flag}</th>)}</tr></thead><tbody>
              {report.ingredients.map((r) => <tr key={r.slug}><td className="td whitespace-nowrap">{r.nameKo}</td>{r.markets.map((m) => <td key={m.code} className="td text-center" title={`${m.label}: ${m.note}`}><span className={`badge ${LEVEL[m.status].cls}`}>{m.label}</span></td>)}</tr>)}
            </tbody></table></div>
            <ul className="divide-y divide-line-soft">
              {report.ingredients.flatMap((r) => r.markets.filter((m) => m.status !== "ok").map((m) => <li key={r.slug + m.code} className="px-4 py-2 text-[12px] leading-[1.6]"><span className={`font-medium ${m.status === "blocked" ? "text-red" : m.status === "warn" ? "text-amber" : "text-muted-2"}`}>{COUNTRIES[m.code]?.flag} {r.nameKo}</span> — {m.note}</li>))}
            </ul>
          </div>
        )}

        {report && report.ingredients.length > 0 && (
          <details className="border-2 border-ink bg-panel">
            <summary className="cursor-pointer px-4 py-2.5 eyebrow">사용 가능한 기능성 표현 문구</summary>
            <div className="divide-y divide-line-soft">
              {report.markets.map((m) => <div key={m.code} className="px-4 py-2.5">
                <div className="mb-1 text-[12.5px] font-medium">{COUNTRIES[m.code]?.flag} {COUNTRIES[m.code]?.name}</div>
                <ul className="space-y-1.5">{report.ingredients.flatMap((r) => (r.markets.find((x) => x.code === m.code)?.claims ?? []).map((c, i) => <li key={r.slug + i} className="text-[12px] leading-[1.6]"><span className="text-muted-2">{r.nameKo}:</span> {c.translated}<div className="font-mono text-[11px] text-faint">&ldquo;{c.original}&rdquo;</div></li>))}
                  {report.ingredients.every((r) => (r.markets.find((x) => x.code === m.code)?.claims ?? []).length === 0) && <li className="text-[12px] text-faint">허용 표현 정보 없음</li>}</ul>
              </div>)}
            </div>
          </details>
        )}

        {report && report.ingredients.length > 0 && (
          <div className="border-2 border-ink bg-panel">
            <div className="flex items-baseline justify-between border-b-2 border-ink px-4 py-2.5"><span className="eyebrow">④ 공급사 매칭</span><span className="font-mono text-[11px] text-muted-2">{matched.length} 전체 취급</span></div>
            <ul className="divide-y divide-line-soft">
              {report.suppliers.slice(0, 8).map((s) => { const v = VERIFICATION[s.verificationStatus] ?? VERIFICATION.unverified; return (
                <li key={s.id} className={`px-4 py-2.5 text-[12.5px] ${s.coversAll ? "" : "opacity-60"}`}>
                  <div className="flex items-center justify-between gap-2"><Link href={`/supplier/${s.slug}`} className="font-medium text-ink no-underline hover:text-blue">{s.nameKo}</Link><span className={`badge ${v.cls}`}>{v.label}</span></div>
                  <div className="text-[11.5px] text-muted-2">{COUNTRIES[s.countryCode]?.flag} {s.supplierTypes.join("/")} · MOQ {formatMoq(s.moqMin, s.moqUnit)} · {formatLead(s.leadWeeksMin, s.leadWeeksMax)}</div>
                  <div className="text-[11.5px]">{s.coversAll ? <span className="text-blue">전 원료 취급</span> : <span className="text-amber">미취급: {s.missing.join(", ")}</span>}{s.formOk === false && <span className="text-amber"> · {dosageForm} 제형 미확인</span>}</div>
                </li>
              ); })}
              {report.suppliers.length === 0 && <li className="px-4 py-5 text-center text-[12.5px] text-muted-2">취급 공급사가 없습니다. <Link href={`/?contact=sourcing#explore`}>소싱 지원 요청</Link></li>}
            </ul>
            <div className="border-t-2 border-ink p-3">
              {quoteHref ? <Link href={quoteHref} className="btn-primary block w-full py-3 text-center no-underline">매칭된 {Math.min(5, matched.length)}곳에 견적 요청</Link>
                : <div className="text-center text-[12px] text-muted-2">{!savedSlug ? "견적 요청은 배합을 저장한 뒤 가능합니다" : "전 원료를 취급하는 공급사가 없습니다 — 원료사 여러 곳에 나눠 문의하세요"}</div>}
              {summaryText && <div className="mt-2 text-[11px] text-faint">문의에 자동 첨부: {summaryText} / {dosageForm} / {markets.map((m) => COUNTRIES[m]?.name).join(", ")}</div>}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
