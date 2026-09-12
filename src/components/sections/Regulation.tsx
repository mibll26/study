import { Tabs } from "@/components/Tabs";
import { REGULATION } from "@/lib/content/regulation";
import { COUNTRIES, DISCLAIMER } from "@/lib/constants";

export function Regulation() {
  return (
    <section id="regulation" className="scroll-mt-16 border-t border-line">
      <div className="mx-auto max-w-[1260px] px-6 py-[76px] md:px-8">
        <div className="mb-2.5 flex items-baseline gap-4"><h2 className="text-[25px] font-semibold tracking-[-0.025em]">국가별 규제 가이드</h2><span className="font-mono text-[11px] tracking-[0.14em] text-muted-2">04</span></div>
        <div className="callout my-5 mb-[30px] max-w-[80ch]">{DISCLAIMER}</div>
        <Tabs tabs={REGULATION.map((g) => ({
          label: `${COUNTRIES[g.code]?.flag ?? ""} ${g.name}`,
          content: (
            <div>
              <div className="grid-ink grid-cols-[repeat(auto-fit,minmax(290px,1fr))]">
                {g.rows.map((r) => <div key={r.label} className="bg-panel p-6"><div className="eyebrow mb-[11px]">{r.label}</div><div className="text-[13.5px] leading-[1.8]" style={{ textWrap: "pretty" }}>{r.value}</div></div>)}
              </div>
              {g.highlight && (
                <div className="mt-6 border-2 border-ink bg-panel">
                  <div className="border-b-2 border-ink bg-blue-soft px-6 py-3 text-[14px] font-semibold">{g.highlight.title}</div>
                  <dl className="grid gap-x-6 gap-y-3 p-6 text-[13.5px] sm:grid-cols-[120px_1fr]">
                    {g.highlight.rows.map((r) => <><dt key={`${r.label}-k`} className="text-muted-2">{r.label}</dt><dd key={`${r.label}-v`} className="m-0 leading-[1.7]">{r.value}</dd></>)}
                  </dl>
                </div>
              )}
              <div className="mt-4 text-[11.5px] text-muted-2">출처: <a href={g.sourceUrl} target="_blank" rel="noopener">{g.source}</a> · 확인 {g.verifiedAt}</div>
            </div>
          ),
        }))} />
      </div>
    </section>
  );
}
