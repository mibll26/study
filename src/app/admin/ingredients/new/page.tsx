import { prisma } from "@/lib/db";
import { IngredientForm } from "../form";

export const dynamic = "force-dynamic";

export default async function NewIngredient() {
  const suppliers = await prisma.supplier.findMany({ orderBy: { nameKo: "asc" } });
  return <div className="space-y-4"><div><div className="eyebrow mb-1">Ingredient</div><h1 className="text-[22px] font-semibold tracking-[-0.02em]">원료 추가</h1></div><IngredientForm ing={null} statuses={[]} suppliers={suppliers} linked={[]} /></div>;
}
