"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ScoreBadge } from "@/components/ScoreBadge";
import { CandidateButton } from "@/components/CandidateButton";
import { deleteProducts, updateProduct } from "@/lib/actions/products";

export type Row = { id: number; name: string; brand: string | null; ingredient: string | null; category: string | null; keyword: string; lowestPrice: number | null; reviewCount: number | null; rating: number | null; score: number | null; isCandidate: boolean; source: string };

export function ProductTable({ items }: { items: Row[] }) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [editing, setEditing] = useState<number | null>(null);
  const [pending, start] = useTransition();

  const toggle = (id: number) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const allOn = items.length > 0 && items.every((i) => selected.has(i.id));

  function removeSelected() {
    if (selected.size === 0) return;
    if (!confirm(`${selected.size}개 제품을 삭제할까요? 되돌릴 수 없습니다.`)) return;
    start(async () => { await deleteProducts([...selected]); setSelected(new Set()); });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <button className="btn" type="button" onClick={removeSelected} disabled={pending || selected.size === 0}>선택 삭제 ({selected.size})</button>
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="th"><input type="checkbox" checked={allOn} onChange={(e) => setSelected(e.target.checked ? new Set(items.map((i) => i.id)) : new Set())} aria-label="전체 선택" /></th>
              <th className="th"></th>
              <th className="th">제품명</th><th className="th">브랜드</th><th className="th">원료</th><th className="th">카테고리</th>
              <th className="th text-right">최저가</th><th className="th text-right">리뷰수</th><th className="th text-right">평점</th><th className="th text-right">점수</th><th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => editing === p.id ? (
              <tr key={p.id} className="bg-accent-soft/40">
                <td className="td" colSpan={11}>
                  <form action={(fd) => start(async () => { await updateProduct(p.id, fd); setEditing(null); })} className="grid grid-cols-2 gap-2 md:grid-cols-6">
                    <label className="text-xs text-muted col-span-2">제품명<input id={`name-${p.id}`} name="name" defaultValue={p.name} className="input mt-1 w-full" required /></label>
                    <label className="text-xs text-muted">브랜드<input id={`brand-${p.id}`} name="brand" defaultValue={p.brand ?? ""} className="input mt-1 w-full" /></label>
                    <label className="text-xs text-muted">원료<input id={`ingredient-${p.id}`} name="ingredient" defaultValue={p.ingredient ?? ""} className="input mt-1 w-full" /></label>
                    <label className="text-xs text-muted">카테고리<input id={`category-${p.id}`} name="category" defaultValue={p.category ?? ""} className="input mt-1 w-full" /></label>
                    <div className="flex gap-1">
                      <label className="text-xs text-muted">리뷰수<input id={`reviewCount-${p.id}`} name="reviewCount" type="number" min={0} defaultValue={p.reviewCount ?? ""} className="input mt-1 w-full" /></label>
                      <label className="text-xs text-muted">평점<input id={`rating-${p.id}`} name="rating" type="number" step="0.1" min={0} max={5} defaultValue={p.rating ?? ""} className="input mt-1 w-full" /></label>
                    </div>
                    <div className="col-span-2 md:col-span-6 flex gap-2">
                      <button className="btn-primary" type="submit" disabled={pending}>저장</button>
                      <button className="btn" type="button" onClick={() => setEditing(null)}>취소</button>
                    </div>
                  </form>
                </td>
              </tr>
            ) : (
              <tr key={p.id} className="hover:bg-accent-soft/30 cursor-pointer" onClick={() => setEditing(p.id)}>
                <td className="td" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} aria-label={`${p.name} 선택`} /></td>
                <td className="td" onClick={(e) => e.stopPropagation()}><CandidateButton id={p.id} isCandidate={p.isCandidate} compact /></td>
                <td className="td"><span className="font-medium line-clamp-2">{p.name}</span><span className="text-xs text-muted">{p.keyword} · {p.source}</span></td>
                <td className="td">{p.brand ?? "—"}</td>
                <td className="td">{p.ingredient ?? "—"}</td>
                <td className="td text-xs">{p.category ?? "—"}</td>
                <td className="td text-right tabular-nums whitespace-nowrap">{p.lowestPrice?.toLocaleString() ?? "—"}</td>
                <td className="td text-right tabular-nums">{p.reviewCount ?? "—"}</td>
                <td className="td text-right tabular-nums">{p.rating ?? "—"}</td>
                <td className="td text-right"><ScoreBadge score={p.score} /></td>
                <td className="td" onClick={(e) => e.stopPropagation()}><Link href={`/products/${p.id}`} className="text-xs text-accent underline">상세</Link></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td className="td text-center text-muted py-8" colSpan={11}>제품이 없습니다.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
