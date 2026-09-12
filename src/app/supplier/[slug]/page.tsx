import type { Metadata } from "next";
import { OnePage } from "@/app/page";
import { prisma } from "@/lib/db";
import type { SP } from "@/lib/queries";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<SP> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = await prisma.supplier.findUnique({ where: { slug }, select: { nameKo: true, description: true } });
  return s ? { title: `${s.nameKo} — 공급사 프로필`, description: s.description ?? undefined } : { title: "공급사를 찾을 수 없습니다" };
}
export default async function SupplierPage({ params, searchParams }: Props) {
  const { slug } = await params;
  return <OnePage sp={{ ...(await searchParams), supplier: slug }} />;
}
