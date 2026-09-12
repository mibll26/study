import { PrismaClient } from "@prisma/client";
import { INGREDIENTS, SUPPLIERS, SETTINGS } from "./seed-data";
import { MORE_INGREDIENTS, EVIDENCE, INTERACTIONS } from "./seed-evidence";

const prisma = new PrismaClient();
const j = (v: unknown) => JSON.stringify(v);
const pub = (q: string) => `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(q)}`;

async function main() {
  const supplierIds = new Map<string, number>();
  for (const s of SUPPLIERS) {
    const { supplierTypes, dosageForms, certifications, ...rest } = s;
    const data = { ...rest, supplierTypes: j(supplierTypes), dosageForms: j(dosageForms), certifications: j(certifications) };
    const row = await prisma.supplier.upsert({ where: { slug: s.slug }, update: data, create: data });
    supplierIds.set(s.slug, row.id);
  }
  const ingIds = new Map<string, number>();
  for (const ing of [...INGREDIENTS, ...MORE_INGREDIENTS]) {
    const { statuses, supplierSlugs, aliases, functionality, dosageForms, ...rest } = ing;
    const data = { ...rest, aliases: j(aliases), functionality: j(functionality), dosageForms: j(dosageForms), curated: true };
    const row = await prisma.ingredient.upsert({ where: { slug: ing.slug }, update: data, create: data });
    ingIds.set(ing.slug, row.id);
    for (const st of statuses) {
      const { allowedClaims, ...s } = st;
      const sdata = { ...s, allowedClaims: j(allowedClaims ?? []) };
      await prisma.regulatoryStatus.upsert({ where: { ingredientId_countryCode: { ingredientId: row.id, countryCode: st.countryCode } }, update: sdata, create: { ...sdata, ingredientId: row.id } });
    }
    for (const slug of supplierSlugs) {
      const sid = supplierIds.get(slug);
      if (sid) await prisma.supplierIngredient.upsert({ where: { supplierId_ingredientId: { supplierId: sid, ingredientId: row.id } }, update: {}, create: { supplierId: sid, ingredientId: row.id } });
    }
  }
  let ev = 0;
  for (const e of EVIDENCE) {
    const id = ingIds.get(e.slug); if (!id) { console.warn("evidence: unknown slug", e.slug); continue; }
    const data = { level: e.level, mechanism: e.mechanism, summary: e.summary, refLabel: `PubMed: ${e.q}`, refUrl: pub(e.q) };
    await prisma.ingredientEvidence.upsert({ where: { ingredientId_goal: { ingredientId: id, goal: e.goal } }, update: data, create: { ...data, ingredientId: id, goal: e.goal } });
    ev++;
  }
  let it = 0;
  for (const x of INTERACTIONS) {
    const a = ingIds.get(x.a), b = ingIds.get(x.b); if (!a || !b) { console.warn("interaction: unknown", x.a, x.b); continue; }
    const [aId, bId] = a < b ? [a, b] : [b, a];
    await prisma.ingredientInteraction.upsert({ where: { aId_bId: { aId, bId } }, update: { type: x.type, note: x.note }, create: { aId, bId, type: x.type, note: x.note } });
    it++;
  }
  for (const s of SETTINGS) await prisma.setting.upsert({ where: { key: s.key }, update: {}, create: s });
  console.log(`seeded: ingredients ${INGREDIENTS.length + MORE_INGREDIENTS.length}, suppliers ${SUPPLIERS.length}, evidence ${ev}, interactions ${it}`);
}

main().finally(() => prisma.$disconnect());
