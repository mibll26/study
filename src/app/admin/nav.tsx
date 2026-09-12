"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/collect", label: "수집 실행" },
  { href: "/admin/products", label: "제품 관리" },
  { href: "/admin/weights", label: "가중치 설정" },
  { href: "/admin/jobs", label: "수집 로그" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col md:sticky md:top-4 md:self-start" aria-label="관리자 메뉴">
      {items.map((it) => {
        const on = it.href === "/admin" ? path === "/admin" : path.startsWith(it.href);
        return (
          <Link key={it.href} href={it.href} className={`rounded-md px-3 py-1.5 text-sm whitespace-nowrap ${on ? "bg-accent text-white" : "hover:bg-accent-soft"}`}>
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
