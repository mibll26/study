"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/** 우측 슬라이드 패널 / 중앙 모달 공통 셸. ESC·배경 클릭으로 닫힘(closeHref로 이동), 포커스 트랩, 스크롤 잠금. 모바일에서는 바텀시트. */
export function Overlay({ closeHref, kind, title, kicker, children }: { closeHref: string; kind: "panel" | "modal"; title: string; kicker?: string; children: React.ReactNode }) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const close = () => router.push(closeHref, { scroll: false });

  useEffect(() => {
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    const first = ref.current?.querySelector<HTMLElement>("button, [href], input, select, textarea"); first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key !== "Tab" || !ref.current) return;
      const f = Array.from(ref.current.querySelectorAll<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")).filter((el) => !el.hasAttribute("disabled"));
      if (f.length === 0) return;
      const a = document.activeElement;
      if (e.shiftKey && a === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && a === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeHref]);

  const shell = kind === "panel"
    ? "absolute inset-x-0 bottom-0 max-h-[92vh] md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[min(720px,100%)] border-t-2 md:border-t-0 md:border-l-2"
    : "relative w-[min(640px,100%)] max-h-[88vh] border-2";

  return (
    <div className={`fixed inset-0 z-[70] ${kind === "modal" ? "flex items-center justify-center p-6" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
      <div onClick={close} className="absolute inset-0 bg-[rgba(20,23,26,0.52)]" />
      <div ref={ref} className={`${shell} overflow-y-auto border-ink bg-paper`}>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b-2 border-ink bg-paper px-6 pt-5 pb-4 md:px-8">
          <div>
            {kicker && <div className="eyebrow mb-2">{kicker}</div>}
            <h2 className="text-[21px] font-medium leading-tight tracking-[-0.02em]">{title}</h2>
          </div>
          <button type="button" onClick={close} aria-label="닫기" className="h-[30px] w-[30px] flex-none border-2 border-ink bg-transparent text-[15px] leading-none cursor-pointer hover:bg-ink hover:text-paper">×</button>
        </div>
        <div className="px-6 py-5 md:px-8">{children}</div>
      </div>
    </div>
  );
}
