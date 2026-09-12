import { NextResponse } from "next/server";
import { collectMany, type Source } from "@/lib/collectors";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { keywords?: unknown; sources?: unknown } | null;
  const keywords = Array.isArray(body?.keywords) ? body!.keywords.map(String).map((s) => s.trim()).filter(Boolean) : [];
  const sources = (Array.isArray(body?.sources) ? body!.sources : ["mfds", "naver"]).filter((s): s is Source => s === "mfds" || s === "naver");
  if (keywords.length === 0) return NextResponse.json({ error: "키워드를 1개 이상 입력하세요" }, { status: 400 });
  if (sources.length === 0) return NextResponse.json({ error: "수집 소스를 1개 이상 선택하세요" }, { status: 400 });
  const results = await collectMany(keywords.slice(0, 20), sources);
  return NextResponse.json({ results });
}
