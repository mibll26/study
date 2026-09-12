import { PrismaClient } from "@prisma/client";
import { INGREDIENTS, SUPPLIERS, SETTINGS } from "./seed-data";

const prisma = new PrismaClient();
const j = (v: unknown) => JSON.stringify(v);

async function main() {
  const supplierIds = new Map<string, number>();
  for (const s of SUPPLIERS) {
    const { supplierTypes, dosageForms, certifications, ...rest } = s;
    const data = { ...rest, supplierTypes: j(supplierTypes), dosageForms: j(dosageForms), certifications: j(certifications) };
    const row = await prisma.supplier.upsert({ where: { slug: s.slug }, update: data, create: data });
    supplierIds.set(s.slug, row.id);
  }
  for (const ing of INGREDIENTS) {
    const { statuses, supplierSlugs, aliases, functionality, dosageForms, ...rest } = ing;
    const data = { ...rest, aliases: j(aliases), functionality: j(functionality), dosageForms: j(dosageForms), curated: true };
    const row = await prisma.ingredient.upsert({ where: { slug: ing.slug }, update: data, create: data });
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
  for (const s of SETTINGS) await prisma.setting.upsert({ where: { key: s.key }, update: {}, create: s });
  console.log(`seeded: ingredients ${INGREDIENTS.length}, suppliers ${SUPPLIERS.length}`);
}

main().finally(() => prisma.$disconnect());
