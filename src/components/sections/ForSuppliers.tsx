import Link from "next/link";
import type { SP } from "@/lib/queries";
import { href } from "@/lib/url";

export function ForSuppliers({ sp }: { sp: SP }) {
  return (
    <section id="for-suppliers" className="scroll-mt-16 border-t border-line bg-dark text-paper">
      <div className="mx-auto flex max-w-[1260px] flex-wrap items-center justify-between gap-9 px-6 py-[72px] md:px-8">
        <div className="max-w-[54ch]">
          <div className="mb-4 font-mono text-[10px] tracking-[0.16em] uppercase text-[#9fb3d4]">For suppliers</div>
          <h2 className="mb-3.5 text-[27px] font-semibold tracking-[-0.02em]">공급사로 등록하고 검증된 발주 문의를 받으세요.</h2>
          <p className="text-[14px] leading-[1.8] text-[#d3d6da]">회사 정보와 인증서를 제출하면 운영팀이 영업일 3일 내 검토 후 프로필을 공개합니다. MVP 기간 동안 등록·노출·문의 수신은 무료입니다.</p>
        </div>
        <Link href={href(sp, { apply: "1" }, "for-suppliers")} scroll={false} className="border border-paper bg-paper px-8 py-4 text-[14px] text-dark no-underline hover:bg-transparent hover:text-paper">공급사 등록 신청</Link>
      </div>
    </section>
  );
}
