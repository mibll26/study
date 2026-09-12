"use server";

import { prisma } from "@/lib/db";
import { parseFormulationInput, type FormulationInput } from "@/lib/formulation";
import { revalidatePath } from "next/cache";

const token = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);

/** 배합 저장 → 공유 slug 반환. slug가 있으면 갱신. */
export async function saveFormulation(prevSlug: string | null, name: string, note: string, raw: FormulationInput): Promise<{ slug: string }> {
  const input = parseFormulationInput(raw);
  const ings = await prisma.ingredient.findMany({ where: { slug: { in: input.items.map((i) => i.slug) } }, select: { id: true, slug: true } });
  const idOf = new Map(ings.map((i) => [i.slug, i.id]));
  const items = input.items.filter((i) => idOf.has(i.slug)).map((i, order) => ({ ingredientId: idOf.get(i.slug)!, amount: i.amount, unit: i.unit, order }));
  const data = { name: name.trim() || "이름 없는 배합", dosageForm: input.dosageForm, targetMarkets: JSON.stringify(input.markets), note: note.trim() || null };
  let slug = prevSlug;
  if (slug && (await prisma.formulation.findUnique({ where: { slug } }))) {
    await prisma.formulation.update({ where: { slug }, data: { ...data, items: { deleteMany: {}, create: items } } });
  } else {
    slug = token();
    await prisma.formulation.create({ data: { ...data, slug, items: { create: items } } });
  }
  revalidatePath(`/formulate/${slug}`); revalidatePath("/admin/formulations");
  return { slug };
}
