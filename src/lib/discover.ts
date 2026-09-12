import { prisma } from "@/lib/db";

export const LEVEL_LABEL: Record<number, { grade: string; text: string }> = { 4: { grade: "A", text: "메타분석·다수 RCT" }, 3: { grade: "B", text: "일부 RCT" }, 2: { grade: "C", text: "소규모·예비 임상" }, 1: { grade: "D", text: "전임상·기전" } };
export const INTERACTION_LABEL: Record<string, { label: string; tone: "good" | "neutral" | "bad" }> = {
  synergy: { label: "시너지", tone: "good" }, complementary: { label: "상보", tone: "neutral" }, caution: { label: "병용 주의", tone: "bad" }, antagonism: { label: "길항", tone: "bad" }, absorption: { label: "흡수 경쟁", tone: "bad" },
};

export type Candidate = {
  id: number; slug: string; nameKo: string; nameEn: string; category: string; level: number; mechanism: string; summary: string; refUrl: string | null; refLabel: string | null;
  kr: { status: "ok" | "warn" | "blocked" | "unknown"; label: string; holder: string | null };
  supplierCount: number; productCount: number; otherGoals: string[];
};
export type Interaction = { a: string; b: string; aName: string; bName: string; type: string; note: string };
export type Combo = { slugs: string[]; names: string[]; score: number; level: "ok" | "warn" | "blocked"; reasons: { text: string; tone: "good" | "neutral" | "bad" }[]; interactions: Interaction[]; mechanisms: string[] };
export type DiscoverResult = { goal: string; secondary?: string; candidates: Candidate[]; combos: Combo[]; interactions: Interaction[]; hasProductData: boolean };

export type DiscoverOptions = { goal: string; secondary?: string; pin: string[]; exclude: string[]; krOnly: boolean; size: number };

function krStatus(st: { legalityStatus: string; usable: boolean; approvalHolder: string | null; alternativeChannels: string | null; approvalType: string | null } | undefined): Candidate["kr"] {
  if (!st) return { status: "unknown", label: "정보 없음", holder: null };
  if (st.usable) return { status: "ok", label: st.legalityStatus, holder: null };
  const warn = st.approvalHolder || st.alternativeChannels || (st.approvalType ?? "").includes("개별인정");
  return { status: warn ? "warn" : "blocked", label: st.legalityStatus, holder: st.approvalHolder };
}

export async function discover(opt: DiscoverOptions): Promise<DiscoverResult> {
  const goals = [opt.goal, opt.secondary].filter(Boolean) as string[];
  const rows = await prisma.ingredientEvidence.findMany({
    where: { goal: { in: goals } },
    include: { ingredient: { include: { statuses: { where: { countryCode: "KR", published: true } }, evidence: { select: { goal: true } }, _count: { select: { suppliers: true, products: true } } } } },
  });
  // 원료별로 주 목표 근거를 대표로, 부 목표 근거는 보너스
  const byIng = new Map<string, Candidate & { secondaryLevel: number }>();
  for (const r of rows) {
    const ing = r.ingredient;
    const cur = byIng.get(ing.slug);
    const isPrimary = r.goal === opt.goal;
    if (!cur) {
      byIng.set(ing.slug, {
        id: ing.id, slug: ing.slug, nameKo: ing.nameKo, nameEn: ing.nameEn, category: ing.category, level: isPrimary ? r.level : 0, mechanism: r.mechanism, summary: r.summary, refUrl: r.refUrl, refLabel: r.refLabel,
        kr: krStatus(ing.statuses[0]), supplierCount: ing._count.suppliers, productCount: ing._count.products, otherGoals: ing.evidence.map((e) => e.goal).filter((g) => !goals.includes(g)), secondaryLevel: isPrimary ? 0 : r.level,
      });
    } else if (isPrimary) { cur.level = r.level; cur.mechanism = r.mechanism; cur.summary = r.summary; cur.refUrl = r.refUrl; cur.refLabel = r.refLabel; }
    else cur.secondaryLevel = r.level;
  }
  let candidates = [...byIng.values()].filter((c) => c.level > 0 && !opt.exclude.includes(c.slug));
  if (opt.krOnly) candidates = candidates.filter((c) => c.kr.status !== "blocked");
  candidates.sort((a, b) => b.level + b.secondaryLevel * 0.5 - (a.level + a.secondaryLevel * 0.5) || b.supplierCount - a.supplierCount);

  // 상호작용 (후보 간)
  const ids = candidates.map((c) => c.id);
  const ints = ids.length ? await prisma.ingredientInteraction.findMany({ where: { aId: { in: ids }, bId: { in: ids } }, include: { a: { select: { slug: true, nameKo: true } }, b: { select: { slug: true, nameKo: true } } } }) : [];
  const interactions: Interaction[] = ints.map((i) => ({ a: i.a.slug, b: i.b.slug, aName: i.a.nameKo, bName: i.b.nameKo, type: i.type, note: i.note }));
  const intMap = new Map<string, Interaction>();
  for (const i of interactions) { intMap.set(`${i.a}|${i.b}`, i); intMap.set(`${i.b}|${i.a}`, i); }

  // 시장 포화: 동일 원료를 포함한 식약처 완제품 수 (제품 데이터 있을 때만)
  const hasProductData = (await prisma.mfdsProduct.count()) > 0;
  const productSets = new Map<string, Set<number>>();
  if (hasProductData) {
    const links = await prisma.mfdsProduct.findMany({ where: { ingredientId: { in: ids } }, select: { id: true, ingredientId: true } });
    // 완제품은 원료 1개에만 연결되므로 근사: 원료별 제품 수 합. 조합 공출현은 ingredientRaw 텍스트로 추정
    const raws = await prisma.mfdsProduct.findMany({ select: { id: true, ingredientRaw: true, name: true } });
    for (const c of candidates) {
      const keys = [c.nameKo, c.nameEn].map((s) => s.toLowerCase());
      const set = new Set<number>();
      for (const p of raws) { const t = `${p.ingredientRaw ?? ""} ${p.name}`.toLowerCase(); if (keys.some((k) => k && t.includes(k))) set.add(p.id); }
      for (const l of links) if (l.ingredientId === c.id) set.add(l.id);
      productSets.set(c.slug, set);
    }
  }

  // 조합 생성: 상위 N 후보 + 고정(pin) 필수 포함
  const N = 8;
  const pool = candidates.slice(0, N);
  for (const p of opt.pin) { const c = candidates.find((x) => x.slug === p); if (c && !pool.includes(c)) pool.push(c); }
  const size = Math.min(4, Math.max(2, opt.size));
  const combos: Combo[] = [];
  const pick = (start: number, acc: (Candidate & { secondaryLevel: number })[]) => {
    if (acc.length >= 2) combos.push(scoreCombo(acc, intMap, productSets, hasProductData, opt));
    if (acc.length === size) return;
    for (let i = start; i < pool.length; i++) pick(i + 1, [...acc, pool[i]]);
  };
  pick(0, []);
  const filtered = combos.filter((c) => opt.pin.every((p) => c.slugs.includes(p))).sort((a, b) => b.score - a.score).slice(0, 12);
  return { goal: opt.goal, secondary: opt.secondary, candidates, combos: filtered, interactions, hasProductData };
}

function scoreCombo(items: (Candidate & { secondaryLevel: number })[], intMap: Map<string, Interaction>, productSets: Map<string, Set<number>>, hasProductData: boolean, opt: DiscoverOptions): Combo {
  const reasons: Combo["reasons"] = [];
  let score = 0;
  // 근거 (0~35)
  const avg = items.reduce((s, c) => s + c.level, 0) / items.length;
  score += (avg / 4) * 35;
  reasons.push({ text: `근거 평균 ${LEVEL_LABEL[Math.round(avg)]?.grade ?? "?"}등급 (${items.map((c) => `${c.nameKo} ${LEVEL_LABEL[c.level].grade}`).join(", ")})`, tone: avg >= 3 ? "good" : "neutral" });
  if (opt.secondary) { const sec = items.filter((c) => c.secondaryLevel > 0); if (sec.length) { score += Math.min(8, sec.length * 4); reasons.push({ text: `부 목표(${opt.secondary})도 커버: ${sec.map((c) => c.nameKo).join(", ")}`, tone: "good" }); } }
  // 기전 상보성 (0~20)
  const mechanisms = [...new Set(items.map((c) => c.mechanism))];
  const div = mechanisms.length / items.length;
  score += div * 20;
  reasons.push({ text: mechanisms.length === items.length ? `서로 다른 기전 ${mechanisms.length}개 — 상보적 설계` : `기전 중복 (${items.length - mechanisms.length}건) — 효과 가산 근거 약함`, tone: mechanisms.length === items.length ? "good" : "neutral" });
  // 상호작용
  const interactions: Interaction[] = [];
  for (let i = 0; i < items.length; i++) for (let k = i + 1; k < items.length; k++) { const x = intMap.get(`${items[i].slug}|${items[k].slug}`); if (x) interactions.push(x); }
  for (const x of interactions) {
    if (x.type === "synergy") { score += 8; reasons.push({ text: `시너지: ${x.aName}+${x.bName} — ${x.note}`, tone: "good" }); }
    else if (x.type === "complementary") { score += 2; reasons.push({ text: `상보: ${x.aName}+${x.bName} — ${x.note}`, tone: "neutral" }); }
    else if (x.type === "absorption") { score -= 8; reasons.push({ text: `흡수 경쟁: ${x.aName}+${x.bName} — ${x.note}`, tone: "bad" }); }
    else { score -= 15; reasons.push({ text: `${x.type === "caution" ? "병용 주의" : "길항"}: ${x.aName}+${x.bName} — ${x.note}`, tone: "bad" }); }
  }
  // 규제 (KR)
  const blocked = items.filter((c) => c.kr.status === "blocked"), warn = items.filter((c) => c.kr.status === "warn"), unknown = items.filter((c) => c.kr.status === "unknown");
  let level: Combo["level"] = "ok";
  if (blocked.length) { score -= 40; level = "blocked"; reasons.push({ text: `🇰🇷 사용 불가: ${blocked.map((c) => c.nameKo).join(", ")}`, tone: "bad" }); }
  else if (warn.length) { score += 5; level = "warn"; reasons.push({ text: `🇰🇷 개별인정형 포함: ${warn.map((c) => `${c.nameKo}${c.kr.holder ? `(${c.kr.holder})` : ""}`).join(", ")} — 인정권자 원료 확보 필요`, tone: "neutral" }); }
  else if (unknown.length) { level = "warn"; reasons.push({ text: `🇰🇷 규제 정보 없음: ${unknown.map((c) => c.nameKo).join(", ")}`, tone: "neutral" }); }
  else { score += 15; reasons.push({ text: "🇰🇷 전부 고시형 — 품목제조신고만으로 출시 가능", tone: "good" }); }
  // 시장 포화 (완제품 데이터 있을 때)
  if (hasProductData) {
    const sets = items.map((c) => productSets.get(c.slug) ?? new Set<number>());
    let co = 0; for (const id of sets[0]) if (sets.every((s) => s.has(id))) co++;
    const pen = Math.min(15, co); score -= pen;
    reasons.push({ text: co === 0 ? "식약처 신고 완제품 중 동일 조합 없음 — 화이트스페이스" : `동일 조합 완제품 ${co}건 — 시장 포화도 ${co >= 15 ? "높음" : co >= 5 ? "중간" : "낮음"}`, tone: co === 0 ? "good" : co >= 15 ? "bad" : "neutral" });
  }
  // 공급 가능성
  const noSup = items.filter((c) => c.supplierCount === 0);
  if (noSup.length === 0) { score += 5; reasons.push({ text: "모든 원료에 등록 공급사 있음", tone: "good" }); }
  else reasons.push({ text: `공급사 미등록: ${noSup.map((c) => c.nameKo).join(", ")}`, tone: "neutral" });
  return { slugs: items.map((c) => c.slug), names: items.map((c) => c.nameKo), score: Math.round(Math.max(0, Math.min(100, score))), level, reasons, interactions, mechanisms };
}
