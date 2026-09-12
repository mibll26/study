import Link from "next/link";
import { SearchBox } from "@/components/SearchBox";
import { siteStats, nearestIngredient } from "@/lib/queries";
import { prisma } from "@/lib/db";

export async function Hero({ q }: { q?: string }) {
  const [stats, popular, nearest] = await Promise.all([
    siteStats(),
    prisma.ingredient.findMany({ where: { slug: { in: ["magnesium", "vitamin-d", "omega-3", "probiotics"] } }, select: { slug: true, nameKo: true } }),
    q ? nearestIngredient(q) : null,
  ]);
  return (
    <section id="hero" className="relative -mt-16 overflow-hidden border-b-2 border-ink bg-paper-2 pt-16">
      <div className="absolute inset-0 z-0">
        <img src="/hero.jpg" alt="" className="h-full w-full object-cover object-[70%_center]" />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1]" style={{ background: "linear-gradient(100deg, rgba(246,244,238,0.97) 0%, rgba(246,244,238,0.93) 38%, rgba(246,244,238,0.55) 68%, rgba(246,244,238,0.2) 100%)" }} />
      <div className="relative z-[2] mx-auto max-w-[1260px] px-6 pb-[92px] pt-[112px] md:px-8">
        <p className="eyebrow-lg mb-6">Global supplement ingredient &amp; sourcing database</p>
        <h1 className="mb-[22px] max-w-[19ch] text-[38px] font-bold leading-[1.08] tracking-[-0.028em] sm:text-[54px]" style={{ textWrap: "pretty" }}>전 세계 건강기능식품 원료와 공급사를 한 곳에서.</h1>
        <p className="mb-11 max-w-[58ch] text-[16px] leading-[1.78] text-muted" style={{ textWrap: "pretty" }}>한국·미국·EU·일본·중국 공공 규제 DB를 통합했습니다. 원료가 어디에서 쓸 수 있는지 확인하고, 조건에 맞는 제조사·원료사에 이 페이지에서 바로 문의하세요. 모든 항목에 출처와 확인일을 붙였습니다.</p>
        <SearchBox initial={q} nearest={nearest} />
        <div className="mt-[18px] flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-1.5">Popular</span>
          {popular.map((p) => <Link key={p.slug} href={`/?ingredient=${p.slug}#explore`} scroll={false} className="chip no-underline">{p.nameKo}</Link>)}
        </div>
        <div className="grid-ink mt-[66px] max-w-[740px] grid-cols-2 sm:grid-cols-4">
          {[["원료", stats.ingredients], ["완제품 (식약처)", stats.products], ["공급사", stats.suppliers], ["규제 커버 국가", stats.countries]].map(([k, v]) => (
            <div key={String(k)} className="bg-panel px-6 py-[22px]">
              <div className="font-mono text-[25px] font-medium tracking-[-0.02em] text-ink">{Number(v).toLocaleString()}</div>
              <div className="mt-1.5 text-[11.5px] text-muted-2">{k}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
