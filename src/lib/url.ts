import type { SP } from "@/lib/queries";

/** 현재 searchParams에 patch를 적용한 URL. 값이 undefined면 제거. hash로 섹션 앵커 유지. */
export function href(sp: SP, patch: Record<string, string | undefined>, hash?: string): string {
  const out = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) { const s = Array.isArray(v) ? v[0] : v; if (s) out.set(k, s); }
  for (const [k, v] of Object.entries(patch)) { if (v == null || v === "") out.delete(k); else out.set(k, v); }
  const qs = out.toString();
  return `/${qs ? `?${qs}` : ""}${hash ? `#${hash}` : ""}`;
}

/** 콤마 구분 다중 선택 토글 */
export function toggleHref(sp: SP, key: string, value: string, hash?: string): string {
  const cur = (typeof sp[key] === "string" ? (sp[key] as string) : "").split(",").filter(Boolean);
  const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
  return href(sp, { [key]: next.join(",") || undefined }, hash);
}

export function isOn(sp: SP, key: string, value: string): boolean {
  return (typeof sp[key] === "string" ? (sp[key] as string) : "").split(",").includes(value);
}

/** 패널·모달 관련 파라미터를 뺀 sp (패널 닫기용) */
export const OVERLAY_KEYS = ["ingredient", "supplier", "contact", "apply", "tab"];
export function closeOverlays(sp: SP, hash?: string): string {
  return href(sp, Object.fromEntries(OVERLAY_KEYS.map((k) => [k, undefined])), hash);
}
