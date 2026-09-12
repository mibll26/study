import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { parseList } from "@/lib/constants";
import { FormulationBuilder } from "@/components/FormulationBuilder";
import { FormulateShell, loadPicker } from "../shared";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const f = await prisma.formulation.findUnique({ where: { slug }, select: { name: true } });
  return { title: f ? `${f.name} — 배합 설계` : "배합 설계" };
}

export default async function SavedFormulation({ params }: Props) {
  const { slug } = await params;
  const f = await prisma.formulation.findUnique({ where: { slug }, include: { items: { orderBy: { order: "asc" }, include: { ingredient: { select: { slug: true } } } } } });
  if (!f) notFound();
  const saved = { slug: f.slug, name: f.name, note: f.note ?? "", dosageForm: f.dosageForm, markets: parseList(f.targetMarkets), items: f.items.map((i) => ({ slug: i.ingredient.slug, amount: i.amount, unit: i.unit })) };
  return <FormulateShell subtitle={`저장된 배합 "${f.name}" · ${f.updatedAt.toLocaleString("ko-KR")} 갱신. 수정 후 저장하면 같은 링크에 반영됩니다.`}><FormulationBuilder ingredients={await loadPicker()} saved={saved} /></FormulateShell>;
}
