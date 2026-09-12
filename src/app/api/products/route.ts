import { NextResponse } from "next/server";
import { parseQuery, queryProducts } from "@/lib/products-query";

export async function GET(req: Request) {
  const sp = Object.fromEntries(new URL(req.url).searchParams.entries());
  const result = await queryProducts(parseQuery(sp));
  return NextResponse.json(result);
}
