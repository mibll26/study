import Link from "next/link";
import { MARKET_FACTS, TRENDS, TREND_SOURCE } from "@/lib/content/trends";

export function Trends() {
  return (
    <section id="trends" className="scroll-mt-16 border-t border-line bg-alt">
      <div className="mx-auto max-w-[1260px] px-6 py-[76px] md:px-8">
        <div className="mb-2.5 flex items-baseline gap-4"><h2 className="text-[25px] font-semibold tracking-[-0.025em]">원료 트렌드</h2><span className="font-mono text-[11px] tracking-[0.14em] text-muted-2">03</span></div>
        <p className="mb-9 text-[12.5px] text-muted-2">국내 시장 전년 대비 증감. 출처: {TREND_SOURCE}</p>
        <div className="grid-ink grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
          {TRENDS.map((col) => (
            <div key={col.label} className="bg-panel p-[30px]">
              <div className="eyebrow mb-[22px]">{col.label}</div>
              {col.items.map((t) => {
                const color = col.tone === "up" ? "var(--blue)" : "var(--red)";
                const w = Math.min(100, Math.abs(t.pct) / 70 * 100);
                return (
                  <div key={t.name} className="mb-5 last:mb-0">
                    <div className="mb-2 flex items-baseline justify-between text-[13.5px]">
                      {t.slug ? <Link href={`/?ingredient=${t.slug}#explore`} scroll={false} className="text-ink no-underline hover:text-blue">{t.name}</Link> : <span>{t.name}</span>}
                      <span className="font-mono" style={{ color }}>{t.pct > 0 ? "+" : ""}{t.pct}%</span>
                    </div>
                    <div className="h-[3px] bg-line-soft"><div className="h-[3px]" style={{ width: `${w}%`, background: color }} /></div>
                    <div className="mt-[7px] text-[11.5px] text-faint">{t.note}</div>
                  </div>
                );
              })}
            </div>
          ))}
          <div className="bg-panel p-[30px]">
            <div className="eyebrow mb-[22px]">시장 수치</div>
            {MARKET_FACTS.map((f) => (
              <div key={f.k} className="mb-4 border-b border-line-soft pb-3 last:mb-0 last:border-0 last:pb-0">
                <div className="text-[11.5px] text-muted-2">{f.k}</div>
                <div className="font-mono text-[18px] font-medium tracking-[-0.02em]">{f.v}</div>
                <div className="text-[11.5px] text-faint">{f.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
