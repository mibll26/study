"use server";

import { prisma } from "@/lib/db";
import { DAILY_CONTACT_LIMIT } from "@/lib/constants";

export type FormState = { ok: boolean; message?: string; refNo?: string; errors?: Record<string, string> } | null;

const s = (fd: FormData, k: string) => (typeof fd.get(k) === "string" ? (fd.get(k) as string).trim() : "");
const list = (fd: FormData, k: string) => fd.getAll(k).map(String).filter(Boolean);

function makeRef() {
  const d = new Date();
  return `GNS-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

/** FR-5 컨택 요청 */
export async function submitContact(_prev: FormState, fd: FormData): Promise<FormState> {
  const errors: Record<string, string> = {};
  const req = { company: "회사명", contactName: "담당자명", email: "이메일", phone: "연락처", ingredient: "관심 원료/제품", dosageForm: "희망 제형", quantityRange: "예상 수량" };
  for (const [k, label] of Object.entries(req)) if (!s(fd, k)) errors[k] = `${label}을(를) 입력하세요`;
  if (s(fd, "email") && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s(fd, "email"))) errors.email = "이메일 형식을 확인하세요";
  if (!fd.get("consentPrivacy")) errors.consentPrivacy = "개인정보 수집·이용에 동의해야 합니다";
  if (!fd.get("consentShare")) errors.consentShare = "공급사 정보 제공에 동의해야 합니다";
  const supplierIds = list(fd, "supplierIds").map(Number).filter(Number.isFinite);
  if (supplierIds.length === 0) errors.supplierIds = "공급사를 1개 이상 선택하세요";
  if (supplierIds.length > 5) errors.supplierIds = "한 번에 최대 5개 공급사까지 문의할 수 있습니다";
  if (Object.keys(errors).length) return { ok: false, errors };

  // 1일 발송 제한 (계정 없음 → 이메일 기준)
  const since = new Date(Date.now() - 24 * 3600 * 1000);
  const count = await prisma.contactRequest.count({ where: { email: s(fd, "email"), createdAt: { gte: since } } });
  if (count >= DAILY_CONTACT_LIMIT) return { ok: false, message: `하루 ${DAILY_CONTACT_LIMIT}건까지 문의할 수 있습니다. 내일 다시 시도하세요.` };

  const suppliers = await prisma.supplier.findMany({ where: { id: { in: supplierIds } }, select: { nameKo: true } });
  const refNo = makeRef();
  await prisma.contactRequest.create({
    data: {
      refNo, company: s(fd, "company"), contactName: s(fd, "contactName"), title: s(fd, "title") || null, email: s(fd, "email"), phone: s(fd, "phone"),
      ingredient: s(fd, "ingredient"), dosageForm: s(fd, "dosageForm"), quantityRange: s(fd, "quantityRange"), targetDate: s(fd, "targetDate") || null,
      targetMarkets: JSON.stringify(list(fd, "targetMarkets")), message: s(fd, "message") || null,
      supplierIds: JSON.stringify(supplierIds), supplierNames: JSON.stringify(suppliers.map((x) => x.nameKo)),
    },
  });
  return { ok: true, refNo, message: "접수되었습니다. 운영팀 검토 후 공급사에 전달됩니다 (영업일 1일 내)." };
}

/** FR-8 공급사 등록 신청 */
export async function submitSupplierApplication(_prev: FormState, fd: FormData): Promise<FormState> {
  const errors: Record<string, string> = {};
  for (const [k, label] of Object.entries({ company: "회사명", countryCode: "국가", contactName: "담당자", email: "이메일" })) if (!s(fd, k)) errors[k] = `${label}을(를) 입력하세요`;
  if (Object.keys(errors).length) return { ok: false, errors };
  await prisma.supplierApplication.create({
    data: {
      company: s(fd, "company"), countryCode: s(fd, "countryCode"), supplierTypes: JSON.stringify(list(fd, "supplierTypes")), dosageForms: JSON.stringify(list(fd, "dosageForms")),
      certifications: JSON.stringify(list(fd, "certifications")), moq: s(fd, "moq") || null, leadTime: s(fd, "leadTime") || null,
      contactName: s(fd, "contactName"), email: s(fd, "email"), phone: s(fd, "phone") || null, message: s(fd, "message") || null,
    },
  });
  return { ok: true, message: "신청이 접수되었습니다. 운영팀이 영업일 3일 내 검토 후 프로필을 공개합니다. 인증서 원본은 검토 과정에서 별도 요청드립니다." };
}

/** UF-3 정보 요청 (결과 없음) */
export async function submitInfoRequest(_prev: FormState, fd: FormData): Promise<FormState> {
  const query = s(fd, "query");
  if (!query) return { ok: false, errors: { query: "원료명을 입력하세요" } };
  await prisma.infoRequest.create({ data: { query, email: s(fd, "email") || null } });
  return { ok: true, message: `"${query}" 정보 요청을 받았습니다. 큐레이션 후 알려드리겠습니다.` };
}

/** FR-11 오류 신고 */
export async function submitIssue(_prev: FormState, fd: FormData): Promise<FormState> {
  const message = s(fd, "message");
  const entityId = Number(s(fd, "entityId"));
  const entityType = s(fd, "entityType");
  if (!message) return { ok: false, errors: { message: "내용을 입력하세요" } };
  if (!entityType || !Number.isFinite(entityId)) return { ok: false, message: "대상 정보가 올바르지 않습니다" };
  await prisma.issueReport.create({ data: { entityType, entityId, field: s(fd, "field") || null, message } });
  return { ok: true, message: "신고가 접수되었습니다. 확인 후 수정하겠습니다." };
}
