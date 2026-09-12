import type { Metadata } from "next";
import { Inter_Tight, IBM_Plex_Mono, Noto_Sans_KR } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const interTight = Inter_Tight({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-inter-tight" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono" });
const noto = Noto_Sans_KR({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-noto" });

export const metadata: Metadata = {
  title: { default: "GlobalNutri Source", template: "%s · GlobalNutri Source" },
  description: "전 세계 건강기능식품 원료·완제품 정보를 통합 검색하고, 조건에 맞는 공급사를 찾아 컨택하는 B2B 소싱 플랫폼",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${interTight.variable} ${plexMono.variable} ${noto.variable}`}>
      <body className="min-h-screen">
        <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper-2/90 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-[1260px] items-center gap-8 px-8">
            <Link href="/" className="flex items-center gap-2.5 text-ink no-underline hover:text-ink">
              <span className="block h-3 w-3 bg-blue" aria-hidden="true" />
              <span className="text-[15px] font-medium tracking-[-0.01em]">GlobalNutri Source</span>
            </Link>
            <nav className="ml-auto hidden gap-6 text-[13.5px] md:flex">
              <Link href="/#explore" className="text-muted no-underline hover:text-ink hover:underline">원료 탐색</Link>
              <Link href="/#suppliers" className="text-muted no-underline hover:text-ink hover:underline">공급사</Link>
              <Link href="/#trends" className="text-muted no-underline hover:text-ink hover:underline">트렌드</Link>
              <Link href="/#regulation" className="text-muted no-underline hover:text-ink hover:underline">규제 가이드</Link>
            </nav>
            <Link href="/?apply=1#for-suppliers" scroll={false} className="ml-auto border border-ink px-[17px] py-2 text-[13px] text-ink no-underline hover:bg-ink hover:text-paper md:ml-0">공급사 등록</Link>
          </div>
        </header>
        <main>{children}</main>
        <footer id="footer" className="border-t border-line">
          <div className="mx-auto grid max-w-[1260px] gap-9 px-8 pb-24 pt-14 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2.5"><span className="block h-[11px] w-[11px] bg-blue" /><span className="text-[14px] font-medium">GlobalNutri Source</span></div>
              <p className="text-[12px] leading-[1.85] text-muted-2">건기식 브랜드를 위한 원료·공급사 인텔리전스.<br />Working name — final brand pending.</p>
            </div>
            <div>
              <div className="eyebrow mb-3">Data sources</div>
              <div className="text-[12.5px] leading-[1.95] text-muted">MFDS 식품안전나라<br />US FDA · EU Register<br />일본 소비자청 · 중국 NMPA</div>
            </div>
            <div>
              <div className="eyebrow mb-3">Policy</div>
              <div className="flex flex-col gap-2 text-[12.5px]"><Link href="/#footer">이용약관</Link><Link href="/#footer">개인정보처리방침</Link><Link href="/#footer">정보 출처 및 갱신 정책</Link><Link href="/admin">관리자</Link></div>
            </div>
            <div>
              <div className="eyebrow mb-3">Disclaimer</div>
              <p className="text-[12px] leading-[1.85] text-muted-2">본 정보는 참고용이며 법적 효력이 없습니다. 플랫폼은 공급사 정보의 정확성을 보증하지 않으며, 거래는 당사자 간 책임입니다.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
