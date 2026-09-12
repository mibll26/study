import type { Metadata } from "next";
import { OnePage } from "@/app/page";
import { prisma } from "@/lib/db";
import type { SP } from "@/lib/queries";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<SP> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ing = await prisma.ingredient.findUnique({ where: { slug }, select: { nameKo: true, nameEn: true, descriptionKo: true } });
  if (!ing) return { title: "원료를 찾을 수 없습니다" };
  return { title: `${ing.nameKo} (${ing.nameEn}) — 국가별 규제 상태 · 취급 공급사`, description: ing.descriptionKo ?? undefined };
}
export default async function IngredientPage({ params, searchParams }: Props) {
  const { slug } = await params;
  return <OnePage sp={{ ...(await searchParams), ingredient: slug }} />;
}
