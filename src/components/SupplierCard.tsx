import Link from "next/link";
import type { Supplier } from "@prisma/client";
import { COUNTRIES, VERIFICATION, formatLead, formatMoq, parseList } from "@/lib/constants";
import { CompareCheckbox } from "@/components/Compare";

export function toCompareItem(s: Supplier) {
  return { id: s.id, slug: s.slug, nameKo: s.nameKo, countryCode: s.countryCode, moqMin: s.moqMin, moqUnit: s.moqUnit, leadWeeksMin: s.leadWeeksMin, leadWeeksMax: s.leadWeeksMax, certifications: parseList(s.certifications), dosageForms: parseList(s.dosageForms), verificationStatus: s.verificationStatus };
}

export function SupplierCard({ s, openHref, contactHref, compact = false }: { s: Supplier; openHref: string; contactHref: string; compact?: boolean }) {
  const v = VERIFICATION[s.verificationStatus] ?? VERIFICATION.unverified;
  const c = COUNTRIES[s.countryCode] ?? COUNTRIES.OTHER;
  return (
    <div className={`flex flex-col gap-[15px] bg-panel ${compact ? "p-4" : "p-6"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href={openHref} scroll={false} className="text-[17px] font-semibold tracking-[-0.015em] text-ink no-underline hover:text-blue">{s.nameKo}</Link>
          <div className="mt-[5px] text-[12px] text-muted-2">{c.flag} {c.name} · {parseList(s.supplierTypes).join(" / ") || "유형 정보 없음"}{s.nameEn ? ` · ${s.nameEn}` : ""}</div>
        </div>
        <span className={`badge ${v.cls}`}>{v.label}</span>
      </div>
      <div className="grid grid-cols-[78px_minmax(0,1fr)] gap-x-3 gap-y-2 border-t-2 border-line-soft pt-[15px] text-[12.5px]">
        <span className="text-muted-2">제형</span><span>{parseList(s.dosageForms).join(" · ") || "정보 없음"}</span>
        <span className="text-muted-2">MOQ</span><span className="font-mono">{formatMoq(s.moqMin, s.moqUnit)}</span>
        <span className="text-muted-2">리드타임</span><span className="font-mono">{formatLead(s.leadWeeksMin, s.leadWeeksMax)}</span>
        <span className="text-muted-2">인증</span><span>{parseList(s.certifications).join(" · ") || "정보 없음"}</span>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2.5 border-t-2 border-line-soft pt-[13px]">
        <CompareCheckbox item={toCompareItem(s)} />
        <Link href={contactHref} scroll={false} className="btn no-underline py-[7px]">문의하기</Link>
      </div>
    </div>
  );
}
