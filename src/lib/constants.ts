export const COUNTRIES: Record<string, { name: string; flag: string }> = {
  KR: { name: "한국", flag: "🇰🇷" }, US: { name: "미국", flag: "🇺🇸" }, EU: { name: "EU", flag: "🇪🇺" }, JP: { name: "일본", flag: "🇯🇵" }, CN: { name: "중국", flag: "🇨🇳" }, IN: { name: "인도", flag: "🇮🇳" }, OTHER: { name: "기타", flag: "🌐" },
};
export const MARKET_CODES = ["KR", "US", "EU", "JP", "CN"] as const;
export const SUPPLIER_COUNTRY_CODES = ["KR", "CN", "IN", "US", "EU", "JP", "OTHER"] as const;
export const FUNCTIONALITIES = ["수면", "스트레스", "면역", "관절", "눈건강", "장건강", "체지방", "혈당", "간건강", "기억력", "피부", "뼈건강", "혈행", "항산화", "피로개선", "에너지", "근육", "전립선", "콜레스테롤", "혈압"];
export const CATEGORIES = ["비타민·미네랄", "식물추출물", "프로바이오틱스", "단백질·아미노산", "지방산", "기타"];
export const APPROVAL_TYPES_KR = ["고시형", "개별인정형"];
export const DOSAGE_FORMS = ["정제", "캡슐", "연질캡슐", "분말", "스틱", "구미", "액상", "RTD", "젤리"];
export const SUPPLIER_TYPES = ["OEM", "ODM", "OBM", "원료공급", "부자재", "수입에이전시"];
export const CERTIFICATIONS = ["GMP", "HACCP", "ISO22000", "FSSC22000", "cGMP", "유기농", "할랄", "코셔"];
export const MOQ_BANDS: { key: string; label: string; max?: number; min?: number }[] = [
  { key: "lt1000", label: "~1,000", max: 1000 }, { key: "1000-5000", label: "1,000~5,000", min: 1000, max: 5000 }, { key: "5000-10000", label: "5,000~10,000", min: 5000, max: 10000 }, { key: "gt10000", label: "10,000+", min: 10000 },
];
export const LEAD_BANDS: { key: string; label: string; max?: number; min?: number }[] = [
  { key: "lt4", label: "~4주", max: 4 }, { key: "4-8", label: "4~8주", min: 4, max: 8 }, { key: "8-12", label: "8~12주", min: 8, max: 12 }, { key: "gt12", label: "12주+", min: 12 },
];
export const QUANTITY_RANGES = ["미정", "~1,000", "1,000~3,000", "3,000~10,000", "10,000~50,000", "50,000+"];
export const VERIFICATION: Record<string, { label: string; cls: string }> = {
  verified: { label: "검증됨", cls: "border-blue text-blue" },
  unverified: { label: "미검증", cls: "border-line text-muted-2" },
  self_registered: { label: "공식 등록", cls: "border-ink text-ink" },
};
export const CONTACT_STATUS: Record<string, string> = { submitted: "접수", reviewed: "검토됨", sent: "공급사 전달", responded: "응답 완료", closed: "종료" };
export const DISCLAIMER = "본 정보는 참고용이며 법적 효력이 없습니다. 최종 확인은 관할 기관 또는 전문 기관을 통해 진행하시기 바랍니다.";
export const SUPPLIER_DISCLAIMER = "플랫폼은 공급사 정보의 정확성을 보증하지 않으며, 거래는 당사자 간 책임입니다. '검증됨' 배지는 운영팀이 사업자등록증·인증서 원본을 확인한 경우에만 부여됩니다.";
export const DAILY_CONTACT_LIMIT = 10;

export function parseList(s: string | null | undefined): string[] {
  if (!s) return [];
  try { const v = JSON.parse(s); return Array.isArray(v) ? v.map(String) : []; } catch { return []; }
}
export function parseClaims(s: string | null | undefined): { original: string; translated: string }[] {
  if (!s) return [];
  try { const v = JSON.parse(s); return Array.isArray(v) ? v : []; } catch { return []; }
}
export function formatMoq(min: number | null, unit: string | null): string {
  if (min == null) return "협의";
  return `${min.toLocaleString()}${unit ?? "개"}~`;
}
export function formatLead(min: number | null, max: number | null): string {
  if (min == null && max == null) return "정보 없음";
  if (min != null && max != null) return `${min}~${max}주`;
  return `${min ?? max}주`;
}
