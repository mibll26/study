import { prisma } from "./db";

/** API 키: DB(관리자 화면 입력) 우선, 없으면 환경변수 */
export type Credentials = { mfdsApiKey: string; naverClientId: string; naverClientSecret: string };

export async function getCredentials(): Promise<Credentials> {
  const rows = await prisma.setting.findMany({ where: { key: { in: ["mfdsApiKey", "naverClientId", "naverClientSecret"] } } });
  const m = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    mfdsApiKey: (m.mfdsApiKey || process.env.MFDS_API_KEY || "").trim(),
    naverClientId: (m.naverClientId || process.env.NAVER_CLIENT_ID || "").trim(),
    naverClientSecret: (m.naverClientSecret || process.env.NAVER_CLIENT_SECRET || "").trim(),
  };
}
