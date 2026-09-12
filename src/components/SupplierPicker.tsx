"use client";

import { useState } from "react";
import Link from "next/link";

/** 원료 상세 → 취급 공급사 다중 선택 → 일괄 문의 (FR-3 ④) */
export function SupplierPicker({ suppliers, baseHref, children }: { ingredient: string; suppliers: { id: number; nameKo: string }[]; baseHref: string; children: React.ReactNode }) {
  const [sel, setSel] = useState<number[]>([]);
  const toggle = (id: number) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= 5 ? s : [...s, id]));
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {suppliers.map((s) => (
          <label key={s.id} className={`flex cursor-pointer items-center gap-1.5 border px-2.5 py-1 text-[12.5px] ${sel.includes(s.id) ? "border-ink bg-ink text-paper" : "border-line bg-panel text-muted"}`}>
            <input type="checkbox" className="sr-only" checked={sel.includes(s.id)} onChange={() => toggle(s.id)} /> {s.nameKo}
          </label>
        ))}
      </div>
      {children}
      <div className="mt-3.5">
        {sel.length > 0
          ? <Link href={baseHref.replace("__IDS__", sel.join(","))} scroll={false} className="btn-primary block w-full text-center no-underline py-3.5">선택한 {sel.length}개 공급사에 문의하기</Link>
          : <div className="w-full border-2 border-line px-3 py-3.5 text-center text-[13.5px] text-muted-2">위에서 공급사를 선택하면 한 번에 문의할 수 있습니다 (최대 5개)</div>}
      </div>
    </div>
  );
}
