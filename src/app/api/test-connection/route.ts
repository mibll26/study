import { NextResponse } from "next/server";
import { fetchMfds } from "@/lib/collectors/mfds";
import { fetchNaver } from "@/lib/collectors/naver";

/** 입력한 키로 실제 API를 1회 호출해 동작 여부 확인 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { source?: string; mfdsApiKey?: string; naverClientId?: string; naverClientSecret?: string };
  try {
    if (body.source === "mfds") {
      const items = await fetchMfds("홍삼", body.mfdsApiKey ?? "", 1);
      return NextResponse.json({ ok: true, message: `정상 — "홍삼" 검색 ${items.length}건` });
    }
    if (body.source === "naver") {
      const r = await fetchNaver("홍삼", body.naverClientId ?? "", body.naverClientSecret ?? "", 1);
      return NextResponse.json({ ok: true, message: `정상 — "홍삼" 검색 결과 ${r.total.toLocaleString()}건` });
    }
    return NextResponse.json({ ok: false, message: "source가 잘못되었습니다" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message });
  }
}
