"use server";

import { prisma } from "@/lib/db";
import { recalculateAll } from "@/lib/scoring/score";
import { revalidatePath } from "next/cache";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";

export async function saveCredentials(formData: FormData) {
  for (const key of ["mfdsApiKey", "naverClientId", "naverClientSecret"]) {
    const v = formData.get(key);
    const value = typeof v === "string" ? v.trim() : "";
    await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  revalidatePath("/admin");
  revalidatePath("/admin/settings");
}

/** 키 없이 화면을 확인할 수 있는 샘플 데이터 (키워드가 "[샘플]"로 시작) */
export async function loadSampleData() {
  await prisma.product.deleteMany({ where: { keyword: { startsWith: "[샘플]" } } });
  for (const r of SAMPLE_PRODUCTS) await prisma.product.create({ data: r });
  await recalculateAll();
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
}

export async function clearSampleData() {
  await prisma.product.deleteMany({ where: { OR: [{ keyword: { startsWith: "[샘플]" } }, { keyword: { startsWith: "[테스트]" } }] } });
  await prisma.collectJob.deleteMany({ where: { status: "failed", mfdsCount: 0, naverCount: 0 } });
  await recalculateAll();
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/admin/jobs");
}
