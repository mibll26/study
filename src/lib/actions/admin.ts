"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MARKET_CODES } from "@/lib/constants";
import { syncMfds } from "@/lib/collectors/sync";

const s = (fd: FormData, k: string) => (typeof fd.get(k) === "string" ? (fd.get(k) as string).trim() : "");
const n = (fd: FormData, k: string) => { const v = s(fd, k); return v === "" ? null : Number.isFinite(Number(v)) ? Number(v) : null; };
const list = (fd: FormData, k: string) => JSON.stringify(fd.getAll(k).map(String).filter(Boolean));
const lines = (fd: FormData, k: string) => JSON.stringify(s(fd, k).split(/[\n,]/).map((x) => x.trim()).filter(Boolean));
const slugify = (v: string) => v.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-|-$/g, "") || `item-${Date.now()}`;
function revalidateAll() { revalidatePath("/"); revalidatePath("/admin", "layout"); }

// ── 원료 ──
export async function saveIngredient(id: number | null, fd: FormData) {
  const data = {
    nameKo: s(fd, "nameKo"), nameEn: s(fd, "nameEn"), nameScientific: s(fd, "nameScientific") || null, aliases: lines(fd, "aliases"), category: s(fd, "category"),
    functionality: list(fd, "functionality"), dosageForms: list(fd, "dosageForms"), descriptionKo: s(fd, "descriptionKo") || null, dailyIntake: s(fd, "dailyIntake") || null, caution: s(fd, "caution") || null,
    sourceName: s(fd, "sourceName") || null, sourceUrl: s(fd, "sourceUrl") || null, verifiedAt: s(fd, "verifiedAt") || null, curated: Boolean(fd.get("curated")),
  };
  let row;
  if (id) row = await prisma.ingredient.update({ where: { id }, data });
  else row = await prisma.ingredient.create({ data: { ...data, slug: s(fd, "slug") ? slugify(s(fd, "slug")) : slugify(data.nameEn || data.nameKo) } });
  // 국가별 상태 (published/legalityStatus 있는 것만 저장)
  for (const c of MARKET_CODES) {
    const legalityStatus = s(fd, `st_${c}_legalityStatus`);
    if (!legalityStatus) { await prisma.regulatoryStatus.deleteMany({ where: { ingredientId: row.id, countryCode: c } }); continue; }
    const claims = s(fd, `st_${c}_claims`).split("\n").map((l) => l.trim()).filter(Boolean).map((l) => { const [original, translated] = l.split(" || ").map((x) => x.trim()); return { original, translated: translated ?? "" }; });
    const sd = {
      legalityStatus, usable: Boolean(fd.get(`st_${c}_usable`)), approvalType: s(fd, `st_${c}_approvalType`) || null, approvalHolder: s(fd, `st_${c}_approvalHolder`) || null, legality: s(fd, `st_${c}_legality`) || null,
      allowedClaims: JSON.stringify(claims), facilityRequirements: s(fd, `st_${c}_facilityRequirements`) || null, registrationDuration: s(fd, `st_${c}_registrationDuration`) || null, registrationCost: s(fd, `st_${c}_registrationCost`) || null,
      alternativeChannels: s(fd, `st_${c}_alternativeChannels`) || null, sourceName: s(fd, `st_${c}_sourceName`) || null, sourceUrl: s(fd, `st_${c}_sourceUrl`) || null, verifiedAt: s(fd, `st_${c}_verifiedAt`) || null, published: Boolean(fd.get(`st_${c}_published`)),
    };
    await prisma.regulatoryStatus.upsert({ where: { ingredientId_countryCode: { ingredientId: row.id, countryCode: c } }, update: sd, create: { ...sd, ingredientId: row.id, countryCode: c } });
  }
  // 취급 공급사
  const supplierIds = fd.getAll("supplierIds").map(Number).filter(Number.isFinite);
  await prisma.supplierIngredient.deleteMany({ where: { ingredientId: row.id, supplierId: { notIn: supplierIds } } });
  for (const sid of supplierIds) await prisma.supplierIngredient.upsert({ where: { supplierId_ingredientId: { supplierId: sid, ingredientId: row.id } }, update: {}, create: { supplierId: sid, ingredientId: row.id } });
  revalidateAll();
  redirect(`/admin/ingredients/${row.id}?saved=1`);
}
export async function deleteIngredient(id: number) {
  await prisma.ingredient.delete({ where: { id } });
  revalidateAll(); redirect("/admin/ingredients");
}

// ── 공급사 ──
export async function saveSupplier(id: number | null, fd: FormData) {
  const data = {
    nameKo: s(fd, "nameKo"), nameEn: s(fd, "nameEn") || null, countryCode: s(fd, "countryCode"), supplierTypes: list(fd, "supplierTypes"), dosageForms: list(fd, "dosageForms"), certifications: list(fd, "certifications"),
    moqMin: n(fd, "moqMin"), moqUnit: s(fd, "moqUnit") || null, leadWeeksMin: n(fd, "leadWeeksMin"), leadWeeksMax: n(fd, "leadWeeksMax"), verificationStatus: s(fd, "verificationStatus") || "unverified",
    description: s(fd, "description") || null, foundedYear: n(fd, "foundedYear"), capacity: s(fd, "capacity") || null, contactEmail: s(fd, "contactEmail") || null, visible: Boolean(fd.get("visible")),
  };
  const row = id ? await prisma.supplier.update({ where: { id }, data }) : await prisma.supplier.create({ data: { ...data, slug: slugify(s(fd, "slug") || data.nameEn || data.nameKo) } });
  const ingredientIds = fd.getAll("ingredientIds").map(Number).filter(Number.isFinite);
  await prisma.supplierIngredient.deleteMany({ where: { supplierId: row.id, ingredientId: { notIn: ingredientIds } } });
  for (const iid of ingredientIds) await prisma.supplierIngredient.upsert({ where: { supplierId_ingredientId: { supplierId: row.id, ingredientId: iid } }, update: {}, create: { supplierId: row.id, ingredientId: iid } });
  revalidateAll();
  redirect(`/admin/suppliers/${row.id}?saved=1`);
}
export async function setVerification(id: number, status: string) {
  await prisma.supplier.update({ where: { id }, data: { verificationStatus: status } });
  revalidateAll();
}
export async function deleteSupplier(id: number) {
  await prisma.supplier.delete({ where: { id } });
  revalidateAll(); redirect("/admin/suppliers");
}

// ── 컨택 요청 ──
export async function setContactStatus(id: number, status: string, note?: string) {
  const data: { status: string; sentAt?: Date; respondedAt?: Date; adminNote?: string } = { status };
  if (status === "sent") data.sentAt = new Date();
  if (status === "responded") data.respondedAt = new Date();
  if (note != null) data.adminNote = note;
  await prisma.contactRequest.update({ where: { id }, data });
  revalidatePath("/admin/contacts"); revalidatePath("/admin");
}

// ── 공급사 신청 → 승인 시 프로필 생성 ──
export async function approveApplication(id: number) {
  const a = await prisma.supplierApplication.findUnique({ where: { id } });
  if (!a) return;
  const moq = a.moq ? Number((a.moq.match(/[\d,]+/)?.[0] ?? "").replace(/,/g, "")) : NaN;
  const lead = a.leadTime?.match(/(\d+)\s*[~-]\s*(\d+)/);
  await prisma.supplier.create({
    data: {
      slug: slugify(`${a.company}-${a.id}`), nameKo: a.company, countryCode: a.countryCode, supplierTypes: a.supplierTypes, dosageForms: a.dosageForms, certifications: a.certifications,
      moqMin: Number.isFinite(moq) ? moq : null, moqUnit: a.moq?.includes("kg") ? "kg" : "개", leadWeeksMin: lead ? Number(lead[1]) : null, leadWeeksMax: lead ? Number(lead[2]) : null,
      verificationStatus: "self_registered", description: a.message, contactEmail: a.email,
    },
  });
  await prisma.supplierApplication.update({ where: { id }, data: { status: "approved" } });
  revalidateAll();
}
export async function rejectApplication(id: number) {
  await prisma.supplierApplication.update({ where: { id }, data: { status: "rejected" } });
  revalidatePath("/admin/applications"); revalidatePath("/admin");
}

// ── 정보 요청 / 오류 신고 ──
export async function closeInfoRequest(id: number) { await prisma.infoRequest.update({ where: { id }, data: { status: "done" } }); revalidatePath("/admin/requests"); revalidatePath("/admin"); }
export async function closeIssue(id: number) { await prisma.issueReport.update({ where: { id }, data: { status: "resolved" } }); revalidatePath("/admin/requests"); revalidatePath("/admin"); }

// ── 데이터 동기화 / 설정 ──
export async function runSync(fd: FormData) {
  const keywords = s(fd, "keywords").split("\n").map((k) => k.trim()).filter(Boolean).slice(0, 10);
  for (const k of keywords) await syncMfds(k);
  revalidateAll();
}
export async function linkProduct(productId: number, ingredientId: number | null) {
  await prisma.mfdsProduct.update({ where: { id: productId }, data: { ingredientId } });
  revalidateAll();
}
export async function saveSettings(fd: FormData) {
  for (const key of ["mfdsApiKey"]) await prisma.setting.upsert({ where: { key }, update: { value: s(fd, key) }, create: { key, value: s(fd, key) } });
  revalidatePath("/admin/sync");
}
