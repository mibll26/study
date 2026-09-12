/**
 * 네이버 쇼핑 검색 API
 * GET https://openapi.naver.com/v1/search/shop.json?query=&display=100&start=&sort=sim
 */

export type NaverItem = {
  productId: string;
  title: string;
  link: string;
  image?: string;
  lprice?: number;
  hprice?: number;
  mallName?: string;
  brand?: string;
  maker?: string;
  category?: string;
};

export type NaverResult = { total: number; items: NaverItem[] };

const TIMEOUT_MS = 10_000;
const DISPLAY = 100;

export function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
}

type RawItem = {
  title: string; link: string; image?: string; lprice?: string; hprice?: string;
  mallName?: string; productId: string; productType?: string; brand?: string; maker?: string;
  category1?: string; category2?: string; category3?: string; category4?: string;
};

export async function fetchNaver(keyword: string, maxPages = 3): Promise<NaverResult> {
  const id = process.env.NAVER_CLIENT_ID;
  const secret = process.env.NAVER_CLIENT_SECRET;
  if (!id || !secret) throw new Error("NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 환경변수가 설정되지 않았습니다");

  let total = 0;
  const items: NaverItem[] = [];
  for (let page = 0; page < maxPages; page++) {
    const start = page * DISPLAY + 1;
    if (start > 1000) break; // API 한계
    const url = `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(keyword)}&display=${DISPLAY}&start=${start}&sort=sim`;
    const res = await fetch(url, {
      headers: { "X-Naver-Client-Id": id, "X-Naver-Client-Secret": secret },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`네이버 API HTTP ${res.status}`);
    const json = (await res.json()) as { total: number; items: RawItem[] };
    total = json.total ?? 0;
    for (const r of json.items ?? []) {
      const cats = [r.category1, r.category2, r.category3, r.category4].filter(Boolean);
      const lp = Number(r.lprice) || undefined;
      const hp = Number(r.hprice) || undefined;
      items.push({
        productId: String(r.productId),
        title: stripTags(r.title),
        link: r.link,
        image: r.image || undefined,
        lprice: lp,
        hprice: hp && hp > 0 ? hp : undefined,
        mallName: r.mallName || undefined,
        brand: r.brand || undefined,
        maker: r.maker || undefined,
        category: cats.length ? cats.join(" > ") : undefined,
      });
    }
    if ((json.items ?? []).length < DISPLAY || items.length >= total) break;
  }
  return { total, items };
}
