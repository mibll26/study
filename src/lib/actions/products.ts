"use server";

import { prisma } from "@/lib/db";
import { recalculateAll } from "@/lib/scoring/score";
import { revalidatePath } from "next/cache";

function num(v: FormDataEntryValue | null): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function str(v: FormDataEntryValue | null): string | null {
  const s = typeof v === "string" ? v.trim() : "";
  return s ? s : null;
}

export async function updateProduct(id: number, formData: FormData) {
  await prisma.product.update({
    where: { id },
    data: {
      name: str(formData.get("name")) ?? undefined,
      brand: str(formData.get("brand")),
      ingredient: str(formData.get("ingredient")),
      category: str(formData.get("category")),
      reviewCount: num(formData.get("reviewCount")),
      rating: num(formData.get("rating")),
    },
  });
  await recalculateAll();
  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath(`/products/${id}`);
}

export async function deleteProducts(ids: number[]) {
  if (ids.length === 0) return;
  await prisma.product.deleteMany({ where: { id: { in: ids } } });
  await recalculateAll();
  revalidatePath("/");
  revalidatePath("/admin/products");
}

export async function toggleCandidate(id: number) {
  const p = await prisma.product.findUnique({ where: { id }, select: { isCandidate: true } });
  if (!p) return;
  await prisma.product.update({ where: { id }, data: { isCandidate: !p.isCandidate } });
  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath(`/products/${id}`);
}

export async function saveMemo(id: number, formData: FormData) {
  await prisma.product.update({ where: { id }, data: { memo: str(formData.get("memo")) } });
  revalidatePath(`/products/${id}`);
}
