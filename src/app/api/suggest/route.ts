import { NextResponse } from "next/server";
import { suggest } from "@/lib/queries";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  if (q.trim().length < 1) return NextResponse.json({ items: [] });
  return NextResponse.json({ items: await suggest(q) });
}
