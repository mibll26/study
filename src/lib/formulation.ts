import { prisma } from "@/lib/db";
import { COUNTRIES, parseClaims, parseList } from "@/lib/constants";

export type FormulationInput = { items: { slug: string; amount: number; unit: string }[]; dosageForm: string; markets: string[] };
export type Level = "ok" | "warn" | "blocked" | "unknown";

export type IngredientReport = {
  slug: string; nameKo: string; nameEn: string; amount: number; unit: string;
  intake: { status: "ok" | "low" | "high" | "unknown" | "unit"; min: number | null; max: number | null; unit: string | null; basis: string | null; note: string };
  markets: { code: string; status: Level; label: string; note: string; approvalHolder: string | null; alternativeChannels: string | null; claims: { original: string; translated: string }[]; sourceName: string | null; sourceUrl: string | null; verifiedAt: string | null }[];
};
export type SupplierMatch = { id: number; slug: string; nameKo: string; countryCode: string; verificationStatus: string; supplierTypes: string[]; coversAll: boolean; missing: string[]; formOk: boolean | null; moqMin: number | null; moqUnit: string | null; leadWeeksMin: number | null; leadWeeksMax: number | null };
export type InteractionNote = { aName: string; bName: string; type: string; label: string; tone: "good" | "neutral" | "bad"; note: string };
export type Report = {
  ingredients: IngredientReport[];
  interactions: InteractionNote[];
  markets: { code: string; status: Level; ok: string[]; warn: string[]; blocked: string[]; unknown: string[] }[];
  suppliers: SupplierMatch[];
  summary: { level: Level; text: string };
};

export const UNITS = ["mg", "µg", "g", "CFU", "IU"];
const RANK: Record<Level, number> = { ok: 0, unknown: 1, warn: 2, blocked: 3 };

/** 단위 정규화 → 기준 단위로 환산. 환산 불가면 null */
function convert(amount: number, from: string, to: string): number | null {
  const norm = (u: string) => (u === "mcg" || u === "ug" ? "µg" : u);
  const f = norm(from), t = norm(to);
  if (f === t) return amount;
  const mass: Record<string, number> = { g: 1000, mg: 1, "µg": 0.001 };
  if (mass[f] != null && mass[t] != null) return (amount * mass[f]) / mass[t];
  return null;
}

function marketLevel(s: { usable: boolean; approvalType: string | null; approvalHolder: string | null; alternativeChannels: string | null }): Level {
  if (s.usable) return "ok";
  if (s.approvalHolder || s.alternativeChannels || (s.approvalType ?? "").includes("개별인정") || (s.approvalType ?? "").includes("Novel Food")) return "warn";
  return "blocked";
}

export async function checkFormulation(input: FormulationInput): Promise<Report> {
  const slugs = input.items.map((i) => i.slug);
  const ings = await prisma.ingredient.findMany({ where: { slug: { in: slugs } }, include: { statuses: { where: { published: true } }, suppliers: { select: { supplierId: true } } } });
  const bySlug = new Map(ings.map((i) => [i.slug, i]));
  const markets = input.markets.length ? input.markets : ["KR"];

  const ingredients: IngredientReport[] = input.items.filter((it) => bySlug.has(it.slug)).map((it) => {
    const ing = bySlug.get(it.slug)!;
    // 함량 체크
    let intake: IngredientReport["intake"];
    if (ing.intakeMin == null && ing.intakeMax == null) intake = { status: "unknown", min: null, max: null, unit: ing.intakeUnit, basis: ing.intakeBasis, note: "일일섭취량 기준 정보 없음" };
    else {
      const v = convert(it.amount, it.unit, ing.intakeUnit ?? it.unit);
      const min = ing.intakeMin, max = ing.intakeMax, unit = ing.intakeUnit;
      if (v == null) intake = { status: "unit", min, max, unit, basis: ing.intakeBasis, note: `단위 ${it.unit} → ${unit} 환산 불가. 기준 단위로 입력하세요` };
      else if (min != null && v < min) intake = { status: "low", min, max, unit, basis: ing.intakeBasis, note: `하한 ${fmt(min)}${unit} 미만 — 기능성 표시 불가 (일반식품 함량)` };
      else if (max != null && v > max) intake = { status: "high", min, max, unit, basis: ing.intakeBasis, note: `상한 ${fmt(max)}${unit} 초과 — 신고 불가` };
      else intake = { status: "ok", min, max, unit, basis: ing.intakeBasis, note: `KR 기준 ${fmt(min)}–${fmt(max)}${unit}${ing.intakeBasis ? ` (${ing.intakeBasis})` : ""} 범위 내` };
    }
    // 국가별
    const mk = markets.map((code) => {
      const s = ing.statuses.find((x) => x.countryCode === code);
      if (!s) return { code, status: "unknown" as Level, label: "정보 없음", note: `${COUNTRIES[code]?.name ?? code} 규제 정보가 아직 큐레이션되지 않았습니다`, approvalHolder: null, alternativeChannels: null, claims: [], sourceName: null, sourceUrl: null, verifiedAt: null };
      const status = marketLevel(s);
      const note = status === "warn" ? (s.approvalHolder ? `개별인정형 — 인정권자(${s.approvalHolder})의 원료를 확보해야 합니다` : s.alternativeChannels ? `직접 판매는 제한 — 우회 채널: ${s.alternativeChannels}` : s.legality ?? "") : (s.legality ?? "");
      return { code, status, label: s.legalityStatus, note, approvalHolder: s.approvalHolder, alternativeChannels: s.alternativeChannels, claims: parseClaims(s.allowedClaims), sourceName: s.sourceName, sourceUrl: s.sourceUrl, verifiedAt: s.verifiedAt };
    });
    return { slug: ing.slug, nameKo: ing.nameKo, nameEn: ing.nameEn, amount: it.amount, unit: it.unit, intake, markets: mk };
  });

  const marketSummary = markets.map((code) => {
    const g = { ok: [] as string[], warn: [] as string[], blocked: [] as string[], unknown: [] as string[] };
    for (const r of ingredients) { const m = r.markets.find((x) => x.code === code)!; g[m.status].push(r.nameKo); }
    const status: Level = g.blocked.length ? "blocked" : g.warn.length ? "warn" : g.unknown.length ? "unknown" : "ok";
    return { code, status, ...g };
  });

  // 공급사 매칭
  const ids = ings.map((i) => i.id);
  const sups = ids.length ? await prisma.supplier.findMany({ where: { visible: true, ingredients: { some: { ingredientId: { in: ids } } } }, include: { ingredients: { select: { ingredientId: true } } } }) : [];
  const suppliers: SupplierMatch[] = sups.map((s) => {
    const have = new Set(s.ingredients.map((x) => x.ingredientId));
    const missing = ings.filter((i) => !have.has(i.id)).map((i) => i.nameKo);
    const types = parseList(s.supplierTypes), forms = parseList(s.dosageForms);
    const manufacturer = types.some((t) => ["OEM", "ODM", "OBM"].includes(t));
    const formOk = manufacturer ? forms.includes(input.dosageForm) : null; // 원료공급/부자재/에이전시는 제형 무관
    return { id: s.id, slug: s.slug, nameKo: s.nameKo, countryCode: s.countryCode, verificationStatus: s.verificationStatus, supplierTypes: types, coversAll: missing.length === 0, missing, formOk, moqMin: s.moqMin, moqUnit: s.moqUnit, leadWeeksMin: s.leadWeeksMin, leadWeeksMax: s.leadWeeksMax };
  }).sort((a, b) => Number(b.coversAll) - Number(a.coversAll) || Number(b.formOk ?? 0.5) - Number(a.formOk ?? 0.5) || a.missing.length - b.missing.length || (a.verificationStatus === "verified" ? -1 : 1));

  // 상호작용
  const ints = ids.length > 1 ? await prisma.ingredientInteraction.findMany({ where: { aId: { in: ids }, bId: { in: ids } }, include: { a: { select: { nameKo: true } }, b: { select: { nameKo: true } } } }) : [];
  const LABEL: Record<string, { label: string; tone: InteractionNote["tone"] }> = { synergy: { label: "시너지", tone: "good" }, complementary: { label: "상보", tone: "neutral" }, caution: { label: "병용 주의", tone: "bad" }, antagonism: { label: "길항", tone: "bad" }, absorption: { label: "흡수 경쟁", tone: "bad" } };
  const interactions: InteractionNote[] = ints.map((i) => ({ aName: i.a.nameKo, bName: i.b.nameKo, type: i.type, ...(LABEL[i.type] ?? { label: i.type, tone: "neutral" as const }), note: i.note }));

  // 요약
  const worstMarket = marketSummary.reduce<Level>((w, m) => (RANK[m.status] > RANK[w] ? m.status : w), "ok");
  const intakeBad = ingredients.filter((r) => r.intake.status === "high" || r.intake.status === "low");
  const level: Level = ingredients.length === 0 ? "unknown" : intakeBad.some((r) => r.intake.status === "high") ? "blocked" : RANK[worstMarket] > RANK["ok"] || intakeBad.length ? (worstMarket === "blocked" ? "blocked" : "warn") : "ok";
  const text = ingredients.length === 0 ? "원료를 추가하면 규제·함량·공급사 체크가 시작됩니다."
    : level === "ok" ? `${markets.map((m) => COUNTRIES[m]?.flag).join(" ")} 선택한 모든 시장에서 사용 가능하고 함량이 KR 기준 범위 안에 있습니다. 완제품 제조 가능 공급사 ${suppliers.filter((s) => s.coversAll && s.formOk).length}곳.`
    : level === "blocked" ? `막히는 항목이 있습니다: ${[...marketSummary.filter((m) => m.blocked.length).map((m) => `${COUNTRIES[m.code]?.flag} ${m.blocked.join("·")}`), ...intakeBad.filter((r) => r.intake.status === "high").map((r) => `${r.nameKo} 상한 초과`)].join(" / ")}`
    : `검토 필요: ${[...marketSummary.filter((m) => m.warn.length).map((m) => `${COUNTRIES[m.code]?.flag} ${m.warn.join("·")}`), ...marketSummary.filter((m) => m.unknown.length).map((m) => `${COUNTRIES[m.code]?.flag} 정보 없음(${m.unknown.join("·")})`), ...intakeBad.map((r) => `${r.nameKo} 함량 ${r.intake.status === "low" ? "하한 미만" : "상한 초과"}`)].join(" / ")}`;
  const cautions = interactions.filter((i) => i.tone === "bad");
  const finalLevel: Level = level === "ok" && cautions.length ? "warn" : level;
  const finalText = level === "ok" && cautions.length ? `${text} 단, 상호작용 주의 ${cautions.length}건: ${cautions.map((c) => `${c.aName}+${c.bName}(${c.label})`).join(", ")}` : text;
  return { ingredients, interactions, markets: marketSummary, suppliers, summary: { level: finalLevel, text: finalText } };
}

function fmt(n: number | null): string {
  if (n == null) return "?";
  if (n >= 1e6) return n.toExponential(0).replace("e+", "×10^");
  return Number.isInteger(n) ? n.toLocaleString() : String(n);
}

export function parseFormulationInput(body: unknown): FormulationInput {
  const b = (body ?? {}) as Partial<FormulationInput>;
  const items = Array.isArray(b.items) ? b.items.map((i) => ({ slug: String(i.slug ?? ""), amount: Number(i.amount) || 0, unit: String(i.unit ?? "mg") })).filter((i) => i.slug).slice(0, 20) : [];
  return { items, dosageForm: String(b.dosageForm ?? "캡슐"), markets: Array.isArray(b.markets) ? b.markets.map(String).slice(0, 5) : ["KR"] };
}
