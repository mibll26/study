import Link from "next/link";
import { exploreIngredients, exploreProducts, parseExplore, type SP } from "@/lib/queries";
import { href, isOn, toggleHref } from "@/lib/url";
import { APPROVAL_TYPES_KR, COUNTRIES, DOSAGE_FORMS, FUNCTIONALITIES, MARKET_CODES, parseList } from "@/lib/constants";
import { InfoRequestForm } from "@/components/Forms";

function Chip({ on, to, children }: { on: boolean; to: string; children: React.ReactNode }) {
  return <Link href={to} scroll={false} className={`${on ? "chip-on" : "chip"} no-underline leading-[1.35]`}>{children}</Link>;
}
function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div className="eyebrow mb-[13px] border-b-2 border-ink pb-[9px]">{label}</div><div className="flex flex-wrap gap-1.5">{children}</div></div>;
}

export async function Explore({ sp }: { sp: SP }) {
  const q = parseExplore(sp);
  const [ingredients, products] = await Promise.all([q.type === "product" ? [] : exploreIngredients(q), exploreProducts(q)]);
  const H = "explore";
  const total = ingredients.length + products.length;
  const hasFilter = Boolean(q.q || q.countries.length || q.functionality.length || q.approval.length || q.forms.length || q.withSupplier || q.type !== "all");
  const sorts = [["relevance", "관련도"], ["recent", "최신 등록"], ["suppliers", "공급사 많은 순"]] as const;
  const showRequest = sp.request === "1" || (total === 0 && q.q);

  return (
    <section id="explore" className="scroll-mt-16 border-t border-line bg-alt">
      <div className="mx-auto max-w-[1260px] px-6 py-[76px] md:px-8">
        <div className="mb-[34px] flex items-baseline gap-4"><h2 className="text-[25px] font-semibold tracking-[-0.025em]">원료·제품 탐색</h2><span className="font-mono text-[11px] tracking-[0.14em] text-muted-2">01</span></div>
        <div className="grid items-start gap-11 md:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="flex flex-col gap-[26px]">
            <Group label="국가 / 시장">{MARKET_CODES.map((c) => <Chip key={c} on={isOn(sp, "country", c)} to={toggleHref(sp, "country", c, H)}>{COUNTRIES[c].flag} {COUNTRIES[c].name}</Chip>)}</Group>
            <Group label="기능성">{FUNCTIONALITIES.map((f) => <Chip key={f} on={isOn(sp, "fn", f)} to={toggleHref(sp, "fn", f, H)}>{f}</Chip>)}</Group>
            <Group label="유형">{([["all", "전체"], ["ingredient", "원료"], ["product", "완제품"]] as const).map(([k, l]) => <Chip key={k} on={q.type === k} to={href(sp, { type: k === "all" ? undefined : k }, H)}>{l}</Chip>)}</Group>
            <Group label="인정 구분 (한국)">{APPROVAL_TYPES_KR.map((a) => <Chip key={a} on={isOn(sp, "approval", a)} to={toggleHref(sp, "approval", a, H)}>{a}</Chip>)}</Group>
            <Group label="제형">{DOSAGE_FORMS.map((f) => <Chip key={f} on={isOn(sp, "form", f)} to={toggleHref(sp, "form", f, H)}>{f}</Chip>)}</Group>
            <Link href={href(sp, { supplier_only: q.withSupplier ? undefined : "1" }, H)} scroll={false} className="flex items-center gap-[9px] text-[12.5px] text-muted no-underline">
              <span className={`inline-block h-[14px] w-[14px] border ${q.withSupplier ? "border-blue bg-blue" : "border-line bg-panel"}`} aria-hidden="true" /> 컨택 가능한 공급사 있음만
            </Link>
            {hasFilter && <Link href={href(sp, { q: undefined, country: undefined, fn: undefined, type: undefined, approval: undefined, form: undefined, supplier_only: undefined, sort: undefined, request: undefined }, H)} scroll={false} className="btn-ghost self-start">필터 모두 해제</Link>}
          </aside>

          <div>
            <div className="mb-[26px] flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink pb-[13px]">
              <span className="text-[13px] text-muted">{q.q && <>&ldquo;{q.q}&rdquo; · </>}<span className="font-mono text-ink">{total.toLocaleString()}</span> results{products.length > 0 && <span className="text-muted-2"> (원료 {ingredients.length} · 완제품 {products.length})</span>}</span>
              <div className="flex gap-4">{sorts.map(([k, l]) => <Link key={k} href={href(sp, { sort: k === "relevance" ? undefined : k }, H)} scroll={false} className={`pb-[3px] text-[12.5px] no-underline ${q.sort === k ? "border-b border-ink text-ink" : "border-b border-transparent text-muted-2 hover:text-ink"}`}>{l}</Link>)}</div>
            </div>

            {total === 0 ? (
              <div className="panel p-12 text-center">
                <p className="mb-2 text-[15px]">{q.q ? `"${q.q}"에 해당하는 원료·제품이 없습니다.` : "조건에 맞는 원료가 없습니다."}</p>
                <p className="mb-[22px] text-[13px] text-muted-2">필터를 완화하거나, 찾으시는 원료를 알려주시면 큐레이션 우선순위에 반영합니다.</p>
                <div className="flex justify-center"><Link href={href(sp, { q: undefined, country: undefined, fn: undefined, type: undefined, approval: undefined, form: undefined, supplier_only: undefined }, H)} scroll={false} className="btn no-underline">필터 해제</Link></div>
              </div>
            ) : (
              <div className="grid-ink grid-cols-[repeat(auto-fill,minmax(238px,1fr))]">
                {ingredients.map((r) => {
                  const kr = r.statuses.find((s) => s.countryCode === "KR");
                  return (
                    <Link key={r.id} href={href(sp, { ingredient: r.slug }, H)} scroll={false} className="flex min-h-[190px] flex-col gap-[13px] bg-panel p-[22px] text-left text-ink no-underline hover:bg-white">
                      <div><div className="text-[17px] font-semibold tracking-[-0.015em]">{r.nameKo}</div><div className="mt-1 text-[12px] text-muted-2">{r.nameEn}{r.nameScientific ? ` · ${r.nameScientific}` : ""}</div></div>
                      <div className="flex flex-wrap gap-[5px]">{parseList(r.functionality).slice(0, 3).map((t) => <span key={t} className="tag">{t}</span>)}</div>
                      <div className="flex flex-wrap gap-1">{r.statuses.map((s) => <span key={s.countryCode} title={`${COUNTRIES[s.countryCode]?.name}: ${s.legalityStatus}`} className={`text-[11px] ${s.usable ? "" : "opacity-50"}`}>{COUNTRIES[s.countryCode]?.flag}</span>)}</div>
                      <div className="mt-auto flex w-full items-center justify-between gap-2 border-t-2 border-line-soft pt-[13px]">
                        <span className={`badge ${kr ? (kr.usable ? "border-blue text-blue" : "border-amber text-amber") : "border-line text-muted-2"}`}>{kr?.legalityStatus ?? "KR 정보 없음"}</span>
                        <span className="font-mono text-[11.5px] text-muted-2">{r._count.suppliers} suppliers</span>
                      </div>
                    </Link>
                  );
                })}
                {products.map((p) => (
                  <div key={`p${p.id}`} className="flex min-h-[190px] flex-col gap-[13px] bg-panel p-[22px]">
                    <div><div className="eyebrow mb-1.5">완제품 · 식약처 품목신고</div><div className="text-[15px] font-semibold leading-snug tracking-[-0.015em]">{p.name}</div><div className="mt-1 text-[12px] text-muted-2">{p.company}</div></div>
                    {p.functionality && <p className="line-clamp-2 text-[12px] text-muted">{p.functionality}</p>}
                    <div className="mt-auto flex w-full items-center justify-between gap-2 border-t-2 border-line-soft pt-[13px]">
                      <span className="font-mono text-[11px] text-muted-2">{p.reportNo}</span>
                      {p.ingredient && <Link href={href(sp, { ingredient: p.ingredient.slug }, H)} scroll={false} className="text-[12px]">{p.ingredient.nameKo} →</Link>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showRequest && <div className="panel mt-6 p-5"><div className="eyebrow mb-3">원료 정보 요청</div><InfoRequestForm query={q.q ?? ""} /></div>}
          </div>
        </div>
      </div>
    </section>
  );
}
