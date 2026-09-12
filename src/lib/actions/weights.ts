"use server";

import { prisma } from "@/lib/db";
import { recalculateAll } from "@/lib/scoring/score";
import { revalidatePath } from "next/cache";

export async function saveWeights(formData: FormData) {
  const weights = await prisma.scoreWeight.findMany();
  for (const w of weights) {
    const v = Number(formData.get(`weight:${w.key}`));
    if (Number.isFinite(v)) await prisma.scoreWeight.update({ where: { key: w.key }, data: { weight: Math.min(100, Math.max(0, Math.round(v))) } });
  }
  for (const key of ["targetPriceMin", "targetPriceMax", "naverMaxPages"]) {
    const v = formData.get(key);
    if (typeof v === "string" && v !== "" && Number.isFinite(Number(v))) {
      await prisma.setting.upsert({ where: { key }, update: { value: String(Number(v)) }, create: { key, value: String(Number(v)) } });
    }
  }
  // 원료 관심도: trend:<ingredient> = 1~5
  for (const [k, v] of formData.entries()) {
    if (!k.startsWith("trend:")) continue;
    const ingredient = k.slice(6);
    const level = Math.min(5, Math.max(1, Math.round(Number(v)) || 3));
    await prisma.ingredientTrend.upsert({ where: { ingredient }, update: { level }, create: { ingredient, level } });
  }
  const newIngredient = formData.get("newIngredient");
  if (typeof newIngredient === "string" && newIngredient.trim()) {
    const level = Math.min(5, Math.max(1, Number(formData.get("newLevel")) || 3));
    await prisma.ingredientTrend.upsert({ where: { ingredient: newIngredient.trim() }, update: { level }, create: { ingredient: newIngredient.trim(), level } });
  }
  await recalculateAll();
  revalidatePath("/");
  revalidatePath("/admin/weights");
}

export async function deleteTrend(ingredient: string) {
  await prisma.ingredientTrend.delete({ where: { ingredient } }).catch(() => {});
  await recalculateAll();
  revalidatePath("/admin/weights");
}
