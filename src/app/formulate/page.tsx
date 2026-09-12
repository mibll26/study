import type { Metadata } from "next";
import { FormulateShell, loadPicker } from "./shared";
import { FormulationBuilder } from "@/components/FormulationBuilder";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "배합 설계" };

export default async function FormulatePage(props: { searchParams: Promise<{ add?: string }> }) {
  const { add } = await props.searchParams;
  return <FormulateShell><FormulationBuilder ingredients={await loadPicker()} saved={null} initialAdd={add} /></FormulateShell>;
}
