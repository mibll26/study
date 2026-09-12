"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Suggestion } from "@/lib/queries";

const RECENT_KEY = "gns-recent";

export function SearchBox({ initial = "", nearest }: { initial?: string; nearest?: { slug: string; nameKo: string } | null }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>(() => { if (typeof window === "undefined") return []; try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"); } catch { return []; } });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (!boxRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc); return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function onInput(v: string) {
    setQ(v); setOpen(true);
    if (timer.current) clearTimeout(timer.current);
    if (v.trim().length < 2) { setItems([]); return; }
    timer.current = setTimeout(async () => {
      const res = await fetch(`/api/suggest?q=${encodeURIComponent(v)}`);
      const json = await res.json(); setItems(json.items ?? []);
    }, 300);
  }
  function remember(v: string) {
    try { const next = [v, ...recent.filter((r) => r !== v)].slice(0, 5); localStorage.setItem(RECENT_KEY, JSON.stringify(next)); setRecent(next); } catch {}
  }
  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const v = q.trim(); if (!v) return;
    remember(v); setOpen(false);
    router.push(`/?q=${encodeURIComponent(v)}#explore`);
  }

  const showRecent = open && q.trim().length < 2 && recent.length > 0;
  const noMatch = open && q.trim().length >= 2 && items.length === 0;

  return (
    <div ref={boxRef} className="relative max-w-[740px]">
      <form onSubmit={submit} className="flex border-2 border-ink bg-panel" role="search">
        <input id="search" value={q} onChange={(e) => onInput(e.target.value)} onFocus={() => setOpen(true)} placeholder="성분, 제품, 공급사를 검색하세요 (예: 마그네슘, NMN, 루테인)" autoComplete="off" aria-label="통합 검색"
          className="min-w-0 flex-1 border-0 bg-transparent px-5 py-[18px] text-[15px] text-ink outline-none" />
        <button type="submit" className="border-0 bg-ink px-8 text-[14px] tracking-[0.02em] text-paper cursor-pointer hover:bg-blue">검색</button>
      </form>
      {(items.length > 0 || showRecent || noMatch) && (
        <div className="absolute left-0 right-0 top-[calc(100%+5px)] z-30 border-2 border-ink bg-panel text-ink" role="listbox">
          {showRecent && <>
            <div className="eyebrow px-[18px] pt-3 pb-1">최근 검색</div>
            {recent.map((r) => <button key={r} type="button" onClick={() => { setQ(r); remember(r); setOpen(false); router.push(`/?q=${encodeURIComponent(r)}#explore`); }} className="flex w-full items-center gap-3.5 border-0 border-b border-line-soft bg-transparent px-[18px] py-3 text-left text-[14px] cursor-pointer hover:bg-alt">{r}</button>)}
          </>}
          {items.map((s, i) => (
            <Link key={i} href={s.href} onClick={() => { remember(s.label); setOpen(false); }} className="flex w-full items-center gap-3.5 border-b border-line-soft px-[18px] py-3 text-left text-ink no-underline hover:bg-alt">
              <span className="w-[84px] flex-none font-mono text-[10px] tracking-[0.12em] text-muted-2">{s.type}</span>
              <span className="text-[14px]">{s.label}</span>
              {s.sub && <span className="text-[12.5px] text-muted-2">{s.sub}</span>}
            </Link>
          ))}
          {noMatch && (
            <div className="px-[18px] py-[18px] text-[13px] leading-[1.7] text-muted">
              일치하는 항목이 없습니다.{nearest && <> 가장 가까운 항목: <Link href={`/?ingredient=${nearest.slug}#explore`} className="text-blue">{nearest.nameKo}</Link></>}
              <Link href={`/?q=${encodeURIComponent(q)}&request=1#explore`} onClick={() => setOpen(false)} className="mt-3 block w-fit border border-blue px-3.5 py-2 text-[12.5px] text-blue no-underline hover:bg-blue-soft">이 원료 정보 요청하기</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
