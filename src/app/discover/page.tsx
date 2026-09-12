import type { Metadata } from "next";
import Link from "next/link";
import { discover, INTERACTION_LABEL, LEVEL_LABEL } from "@/lib/discover";
import { FUNCTIONALITIES } from "@/lib/constants";
import { many, one, type SP } from "@/lib/queries";
import { href } from "@/lib/url";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "조합 탐색" };

const KR_CLS = { ok: "border-blue text-blue", warn: "border-amber text-amber", blocked: "border-red text-red", unknown: "border-line text-muted-2" };
const LV_CLS = { ok: "border-blue", warn: "border-amber", blocked: "border-red" };

function h(sp: SP, patch: Record<string, string | undefined>) { return href(sp, patch).replace(/^\//, "/discover"); }

export default async function DiscoverPage(props: { searchParams: Promise<SP> }) {
  const sp = await props.searchParams;
  const goal = one(sp, "goal") ?? "";
  const secondary = one(sp, "goal2") || undefined;
  const pin = many(sp, "pin"), exclude = many(sp, "exclude");
  const krOnly = one(sp, "kr") !== "0";
  const size = Number(one(sp, "size") ?? 3) || 3;
  const result = goal ? await discover({ goal, secondary, pin, exclude, krOnly, size }) : null;
  const toggle = (key: string, v: string) => { const cur = many(sp, key); const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]; return h(sp, { [key]: next.join(",") || undefined }); };

  return (
    <div className="mx-auto max-w-[1260px] px-6 py-10 md:px-8">
      <div className="mb-6"><div className="eyebrow mb-1">Formulation discovery</div><h1 className="text-[26px] font-semibold tracking-[-0.025em]">목표 → 조합 탐색</h1>
        <p className="mt-1 max-w-[72ch] text-[13px] text-muted">목표 기능성을 고르면 근거가 있는 원료를 기전·근거 등급·규제 상태와 함께 펼치고, 조합을 자동 생성해 근거·기전 상보성·상호작용·규제·공급 가능성으로 점수화합니다. 마음에 드는 조합은 배합 설계로 보내 함량·국가별 체크를 이어갑니다.</p></div>
      <div className="callout mb-6 max-w-[80ch]">건강기능식품은 원료별로 인정된 기능성만 표시할 수 있습니다. 조합 자체의 새로운 효능은 주장할 수 없으며, 여기의 점수는 근거·규제·시장 관점의 설계 우선순위일 뿐 효능 판정이 아닙니다. 근거 등급과 참고 링크는 운영팀 큐레이션 기준입니다.</div>

      <div className="mb-6 border-2 border-ink bg-panel p-4">
        <div className="eyebrow mb-2">① 주 목표</div>
        <div className="flex flex-wrap gap-1.5">{FUNCTIONALITIES.map((f) => <Link key={f} href={h(sp, { goal: f, pin: undefined, exclude: undefined })} className={`${goal === f ? "chip-on" : "chip"} no-underline`}>{f}</Link>)}</div>
        {goal && <>
          <div className="eyebrow mb-2 mt-4">부 목표 (선택) — 함께 커버하면 가산점</div>
          <div className="flex flex-wrap gap-1.5">{FUNCTIONALITIES.filter((f) => f !== goal).map((f) => <Link key={f} href={h(sp, { goal2: secondary === f ? undefined : f })} className={`${secondary === f ? "chip-on" : "chip"} no-underline`}>{f}</Link>)}</div>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-[12.5px] text-muted">
            <span>조합 크기: {[2, 3, 4].map((n) => <Link key={n} href={h(sp, { size: String(n) })} className={`ml-1 ${size === n ? "chip-on" : "chip"} no-underline`}>최대 {n}</Link>)}</span>
            <Link href={h(sp, { kr: krOnly ? "0" : undefined })} className="flex items-center gap-2 no-underline text-muted"><span className={`inline-block h-[14px] w-[14px] border ${krOnly ? "border-blue bg-blue" : "border-line bg-panel"}`} /> 한국 사용 불가 원료 제외</Link>
            {(pin.length > 0 || exclude.length > 0) && <Link href={h(sp, { pin: undefined, exclude: undefined })} className="btn-ghost">고정·제외 초기화</Link>}
          </div>
        </>}
      </div>

      {!result ? <div className="border-2 border-ink bg-panel p-12 text-center text-[13.5px] text-muted-2">위에서 목표를 고르세요. 예: 수면 → 테아닌·감태·락티움·마그네슘 조합 탐색</div> : (
        <div className="grid items-start gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          {/* 후보 원료 */}
          <section className="border-2 border-ink bg-panel">
            <div className="flex items-baseline justify-between border-b-2 border-ink px-4 py-3"><span className="eyebrow">② 후보 원료</span><span className="font-mono text-[11px] text-muted-2">{result.candidates.length}</span></div>
            {result.candidates.length === 0 && <div className="px-4 py-8 text-center text-[13px] text-muted-2">&ldquo;{goal}&rdquo; 근거가 큐레이션된 원료가 없습니다. <Link href="/?request=1#explore">원료 정보 요청</Link></div>}
            <ul className="divide-y divide-line-soft">
              {result.candidates.map((c) => { const lv = LEVEL_LABEL[c.level]; const pinned = pin.includes(c.slug); return (
                <li key={c.slug} className="px-4 py-3 text-[12.5px]">
                  <div className="flex items-start justify-between gap-2">
                    <div><Link href={`/ingredient/${c.slug}`} className="text-[14px] font-semibold text-ink no-underline hover:text-blue">{c.nameKo}</Link><span className="ml-1.5 text-muted-2">{c.nameEn}</span></div>
                    <span className="inline-flex h-[22px] w-[22px] flex-none items-center justify-center border border-ink font-mono text-[12px] font-medium" title={`근거 ${lv.grade}: ${lv.text}`}>{lv.grade}</span>
                  </div>
                  <div className="mt-1 text-muted"><span className="text-muted-2">기전</span> {c.mechanism}</div>
                  <div className="mt-0.5 leading-[1.6] text-muted">{c.summary}</div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className={`badge ${KR_CLS[c.kr.status]}`}>🇰🇷 {c.kr.label}</span>
                    <span className="font-mono text-[11px] text-muted-2">{c.supplierCount} suppliers</span>
                    {c.otherGoals.length > 0 && <span className="text-[11px] text-faint">+ {c.otherGoals.join(" · ")}</span>}
                    {c.refUrl && <a href={c.refUrl} target="_blank" rel="noopener" className="text-[11px]">근거 ↗</a>}
                    <span className="ml-auto flex gap-1"><Link href={toggle("pin", c.slug)} className={`${pinned ? "chip-on" : "chip"} px-2 py-0.5 text-[11px] no-underline`}>{pinned ? "고정됨" : "고정"}</Link><Link href={toggle("exclude", c.slug)} className="chip px-2 py-0.5 text-[11px] no-underline">제외</Link></span>
                  </div>
                </li>
              ); })}
            </ul>
            {result.interactions.length > 0 && (
              <details className="border-t-2 border-ink"><summary className="cursor-pointer px-4 py-2.5 eyebrow">후보 간 상호작용 {result.interactions.length}</summary>
                <ul className="divide-y divide-line-soft">{result.interactions.map((i, k) => { const l = INTERACTION_LABEL[i.type]; return <li key={k} className="px-4 py-2 text-[12px] leading-[1.6]"><span className={`badge mr-1.5 ${l.tone === "good" ? "border-blue text-blue" : l.tone === "bad" ? "border-red text-red" : "border-line text-muted-2"}`}>{l.label}</span>{i.aName} + {i.bName} — <span className="text-muted">{i.note}</span></li>; })}</ul>
              </details>
            )}
          </section>

          {/* 추천 조합 */}
          <section>
            <div className="mb-3 flex items-baseline justify-between border-b-2 border-ink pb-2"><span className="eyebrow">③ 추천 조합 <span className="normal-case tracking-normal text-faint">근거 35 · 기전 상보성 20 · 상호작용 ± · 규제 ±15/−40 · 공급 5{result.hasProductData ? " · 시장 포화 −15" : ""}</span></span><span className="font-mono text-[11px] text-muted-2">{result.combos.length}</span></div>
            {!result.hasProductData && <p className="mb-3 text-[11.5px] text-faint">식약처 완제품 데이터가 아직 없어 시장 포화도(동일 조합 기출시 수)는 점수에 반영되지 않습니다. 관리자 → 데이터 동기화 후 자동 반영.</p>}
            {result.combos.length === 0 && <div className="border-2 border-ink bg-panel p-10 text-center text-[13px] text-muted-2">조합을 만들 후보가 2개 미만입니다.</div>}
            <div className="grid-ink grid-cols-1 md:grid-cols-2">
              {result.combos.map((c, i) => (
                <article key={c.slugs.join("+")} className={`flex flex-col gap-3 bg-panel p-5 border-l-4 ${LV_CLS[c.level]}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div><div className="font-mono text-[10px] tracking-[0.14em] text-muted-2">#{String(i + 1).padStart(2, "0")}</div><div className="text-[15px] font-semibold leading-snug tracking-[-0.01em]">{c.names.join(" + ")}</div></div>
                    <div className="text-right"><div className="font-mono text-[24px] font-medium leading-none tracking-[-0.02em]">{c.score}</div><div className="text-[10px] text-muted-2">/ 100</div></div>
                  </div>
                  <ul className="space-y-1 text-[12px] leading-[1.6]">
                    {c.reasons.map((r, k) => <li key={k} className={`flex gap-1.5 ${r.tone === "good" ? "text-ink" : r.tone === "bad" ? "text-red" : "text-muted"}`}><span className={`mt-[7px] h-1.5 w-1.5 flex-none ${r.tone === "good" ? "bg-blue" : r.tone === "bad" ? "bg-red" : "bg-line"}`} />{r.text}</li>)}
                  </ul>
                  <div className="mt-auto flex items-center justify-between gap-2 border-t-2 border-line-soft pt-3">
                    <span className="text-[11px] text-faint">기전 {c.mechanisms.length}종</span>
                    <Link href={`/formulate?add=${c.slugs.join(",")}`} className="btn-primary no-underline py-1.5">배합 설계로 보내기 →</Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
