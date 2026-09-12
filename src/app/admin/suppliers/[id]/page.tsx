import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { SupplierForm } from "../form";

export const dynamic = "force-dynamic";

export default async function EditSupplier(props: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await props.params; const { saved } = await props.searchParams;
  const s = await prisma.supplier.findUnique({ where: { id: Number(id) }, include: { ingredients: true } });
  if (!s) notFound();
  const ingredients = await prisma.ingredient.findMany({ orderBy: { nameKo: "asc" } });
  return <div className="space-y-4"><div><div className="eyebrow mb-1">Supplier · {s.slug}</div><h1 className="text-[22px] font-semibold tracking-[-0.02em]">{s.nameKo}</h1></div><SupplierForm s={s} ingredients={ingredients} linked={s.ingredients.map((x) => x.ingredientId)} saved={saved === "1"} /></div>;
}
