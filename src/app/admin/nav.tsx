"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["/admin", "대시보드"], ["/admin/ingredients", "원료 큐레이션"], ["/admin/suppliers", "공급사"], ["/admin/contacts", "컨택 요청"],
  ["/admin/applications", "공급사 신청"], ["/admin/requests", "정보 요청 · 오류 신고"], ["/admin/sync", "데이터 동기화"],
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto md:sticky md:top-20 md:flex-col md:self-start" aria-label="관리자 메뉴">
      <div className="eyebrow hidden pb-2 md:block">Back office</div>
      {items.map(([href, label]) => {
        const on = href === "/admin" ? path === "/admin" : path.startsWith(href);
        return <Link key={href} href={href} className={`whitespace-nowrap border-l-2 px-3 py-1.5 text-[13px] no-underline ${on ? "border-ink text-ink" : "border-line-soft text-muted-2 hover:text-ink"}`}>{label}</Link>;
      })}
      <div className="mt-4 hidden text-[11px] text-faint md:block">인증 없음 — 로컬 전용. 외부 공개 전 2FA 적용 (PRD 6.4)</div>
    </nav>
  );
}
