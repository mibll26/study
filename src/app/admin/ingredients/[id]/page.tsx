import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { IngredientForm } from "../form";

export const dynamic = "force-dynamic";

export default async function EditIngredient(props: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await props.params; const { saved } = await props.searchParams;
  const ing = await prisma.ingredient.findUnique({ where: { id: Number(id) }, include: { statuses: true, suppliers: true } });
  if (!ing) notFound();
  const suppliers = await prisma.supplier.findMany({ orderBy: { nameKo: "asc" } });
  return <div className="space-y-4"><div><div className="eyebrow mb-1">Ingredient · {ing.slug}</div><h1 className="text-[22px] font-semibold tracking-[-0.02em]">{ing.nameKo}</h1></div><IngredientForm ing={ing} statuses={ing.statuses} suppliers={suppliers} linked={ing.suppliers.map((s) => s.supplierId)} saved={saved === "1"} /></div>;
}
