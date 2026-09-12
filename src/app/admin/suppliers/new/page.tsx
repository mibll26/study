import { prisma } from "@/lib/db";
import { SupplierForm } from "../form";

export const dynamic = "force-dynamic";

export default async function NewSupplier() {
  const ingredients = await prisma.ingredient.findMany({ orderBy: { nameKo: "asc" } });
  return <div className="space-y-4"><div><div className="eyebrow mb-1">Supplier</div><h1 className="text-[22px] font-semibold tracking-[-0.02em]">공급사 추가</h1></div><SupplierForm s={null} ingredients={ingredients} linked={[]} /></div>;
}
