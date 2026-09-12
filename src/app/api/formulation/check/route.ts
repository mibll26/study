import { NextResponse } from "next/server";
import { checkFormulation, parseFormulationInput } from "@/lib/formulation";

export async function POST(req: Request) {
  const input = parseFormulationInput(await req.json().catch(() => null));
  return NextResponse.json(await checkFormulation(input));
}
