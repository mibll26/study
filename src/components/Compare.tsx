"use client";

import { createContext, useContext, useState } from "react";
import Link from "next/link";
import { formatLead, formatMoq } from "@/lib/constants";

export type CompareItem = { id: number; slug: string; nameKo: string; countryCode: string; moqMin: number | null; moqUnit: string | null; leadWeeksMin: number | null; leadWeeksMax: number | null; certifications: string[]; dosageForms: string[]; verificationStatus: string };
type Ctx = { items: CompareItem[]; toggle: (it: CompareItem) => string | null; has: (id: number) => boolean; clear: () => void };
const CompareCtx = createContext<Ctx>({ items: [], toggle: () => null, has: () => false, clear: () => {} });
export const MAX_COMPARE = 3;

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const toggle = (it: CompareItem) => {
    if (items.some((x) => x.id === it.id)) { setItems(items.filter((x) => x.id !== it.id)); return null; }
    if (items.length >= MAX_COMPARE) { const m = `비교는 최대 ${MAX_COMPARE}개까지 가능합니다.`; setNotice(m); setTimeout(() => setNotice(null), 2500); return m; }
    setItems([...items, it]); return null;
  };
  return (
    <CompareCtx.Provider value={{ items, toggle, has: (id) => items.some((x) => x.id === id), clear: () => setItems([]) }}>
      {children}
      {notice && <div role="status" className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 border-2 border-ink bg-paper px-4 py-2 text-[13px]">{notice}</div>}
      <CompareTray />
    </CompareCtx.Provider>
  );
}

export function CompareCheckbox({ item }: { item: CompareItem }) {
  const { has, toggle } = useContext(CompareCtx);
  return (
    <label className="flex cursor-pointer items-center gap-[7px] text-[12.5px] text-muted">
      <input type="checkbox" checked={has(item.id)} onChange={() => toggle(item)} aria-label={`${item.nameKo} 비교`} /> 비교
    </label>
  );
}

function CompareTray() {
  const { items, clear, toggle } = useContext(CompareCtx);
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;
  const rows: [string, (i: CompareItem) => string][] = [
    ["국가", (i) => i.countryCode], ["MOQ", (i) => formatMoq(i.moqMin, i.moqUnit)], ["리드타임", (i) => formatLead(i.leadWeeksMin, i.leadWeeksMax)],
    ["제형", (i) => i.dosageForms.join(" · ") || "정보 없음"], ["인증", (i) => i.certifications.join(" · ") || "정보 없음"], ["검증", (i) => ({ verified: "검증됨", unverified: "미검증", self_registered: "공식 등록" }[i.verificationStatus] ?? i.verificationStatus)],
  ];
  return (
    <div className="fixed inset-x-0 bottom-0 z-[50] border-t-2 border-ink bg-paper">
      <div className="mx-auto flex max-w-[1260px] flex-wrap items-center gap-3 px-6 py-3 md:px-8">
        <span className="eyebrow">Compare</span>
        <span className="text-[13px]"><span className="font-mono">{items.length}</span> / {MAX_COMPARE} 선택 — {items.map((i) => i.nameKo).join(", ")}</span>
        <div className="ml-auto flex gap-2">
          <button type="button" className="btn" onClick={() => setOpen(!open)}>{open ? "접기" : "나란히 보기"}</button>
          <Link href={`/?contact=${items.map((i) => i.id).join(",")}#suppliers`} scroll={false} className="btn-primary no-underline">선택한 {items.length}곳에 문의</Link>
          <button type="button" className="btn-ghost" onClick={clear}>비우기</button>
        </div>
      </div>
      {open && (
        <div className="mx-auto max-w-[1260px] overflow-x-auto px-6 pb-4 md:px-8">
          <table className="w-full text-[13px]">
            <thead><tr><th className="th" /> {items.map((i) => <th key={i.id} className="th normal-case tracking-normal text-[13px] text-ink">{i.nameKo} <button type="button" onClick={() => toggle(i)} className="ml-1 border-0 bg-transparent text-muted-2 cursor-pointer" aria-label={`${i.nameKo} 제외`}>×</button></th>)}</tr></thead>
            <tbody>{rows.map(([label, f]) => <tr key={label}><td className="td text-muted-2 whitespace-nowrap">{label}</td>{items.map((i) => <td key={i.id} className="td font-mono">{f(i)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
