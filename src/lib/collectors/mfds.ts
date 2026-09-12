/**
 * 식품안전나라 Open API — C003 건강기능식품 품목제조신고사항
 * https://openapi.foodsafetykorea.go.kr/api/{KEY}/C003/json/{start}/{end}/PRDLST_NM={키워드}
 *
 * 응답 필드명은 이 파일 한 곳에서만 매핑한다. (PRD 6.1)
 */

export type MfdsItem = {
  reportNo: string;
  name: string;
  company: string;
  reportDate?: string;
  functionality?: string;
  ingredient?: string;
  intakeMethod?: string;
};

type RawRow = Record<string, string | undefined>;

const TIMEOUT_MS = 10_000;
const PAGE_SIZE = 100;

function pick(row: RawRow, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = row[k];
    if (v && v.trim()) return v.trim();
  }
  return undefined;
}

export function mapMfdsRow(row: RawRow): MfdsItem | null {
  const reportNo = pick(row, "PRDLST_REPORT_NO", "STTEMNT_NO");
  const name = pick(row, "PRDLST_NM", "PRDUCT");
  if (!reportNo || !name) return null;
  return {
    reportNo,
    name,
    company: pick(row, "BSSH_NM", "ENTRPS") ?? "",
    reportDate: pick(row, "PRMS_DT", "REGIST_DT"),
    functionality: pick(row, "PRIMARY_FNCLTY", "MAIN_FNCTN"),
    ingredient: pick(row, "RAWMTRL_NM", "INDIV_RAWMTRL_NM"),
    intakeMethod: pick(row, "NTK_MTHD", "SRV_USE"),
  };
}

export async function fetchMfds(keyword: string, maxPages = 2): Promise<MfdsItem[]> {
  const key = process.env.MFDS_API_KEY;
  if (!key) throw new Error("MFDS_API_KEY 환경변수가 설정되지 않았습니다");

  const items: MfdsItem[] = [];
  for (let page = 0; page < maxPages; page++) {
    const start = page * PAGE_SIZE + 1;
    const end = start + PAGE_SIZE - 1;
    const url = `https://openapi.foodsafetykorea.go.kr/api/${key}/C003/json/${start}/${end}/PRDLST_NM=${encodeURIComponent(keyword)}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" });
    if (!res.ok) throw new Error(`식약처 API HTTP ${res.status}`);
    const json = (await res.json()) as { C003?: { RESULT?: { CODE?: string; MSG?: string }; row?: RawRow[]; total_count?: string } };
    const body = json.C003;
    if (!body) throw new Error("식약처 API 응답 형식이 예상과 다릅니다 (C003 없음)");

    const code = body.RESULT?.CODE ?? "";
    // INFO-000 정상, INFO-200 데이터 없음
    if (code === "INFO-200") break;
    if (code && code !== "INFO-000") throw new Error(`식약처 API 오류 ${code}: ${body.RESULT?.MSG ?? ""}`);

    const rows = body.row ?? [];
    for (const r of rows) {
      const m = mapMfdsRow(r);
      if (m) items.push(m);
    }
    const total = Number(body.total_count ?? 0);
    if (rows.length < PAGE_SIZE || end >= total) break;
  }
  return items;
}
