import { Overlay } from "@/components/Overlay";
import { ContactForm } from "@/components/Forms";
import { prisma } from "@/lib/db";
import { closeOverlays, href } from "@/lib/url";
import type { SP } from "@/lib/queries";
import { COUNTRIES, parseList } from "@/lib/constants";

/** ?contact=1,2,3 → 컨택 모달. ?contact=sourcing → 운영팀 소싱 지원 요청 (공급사 없음) */
export async function ContactModal({ param, sp }: { param: string; sp: SP }) {
  const ingredientSlug = typeof sp.ingredient === "string" ? sp.ingredient : undefined;
  const ingredient = ingredientSlug ? await prisma.ingredient.findUnique({ where: { slug: ingredientSlug }, select: { nameKo: true } }) : null;
  const fSlug = typeof sp.f === "string" ? sp.f : undefined;
  const formulation = fSlug ? await prisma.formulation.findUnique({ where: { slug: fSlug }, include: { items: { orderBy: { order: "asc" }, include: { ingredient: { select: { nameKo: true } } } } } }) : null;
  const fSummary = formulation ? `[배합: ${formulation.name}] ${formulation.items.map((i) => `${i.ingredient.nameKo} ${i.amount}${i.unit}`).join(" + ")} / ${formulation.dosageForm} / ${parseList(formulation.targetMarkets).map((m) => COUNTRIES[m]?.name ?? m).join(", ")}` : undefined;
  const closeHref = ingredientSlug ? href(sp, { contact: undefined }, "explore") : closeOverlays(sp, "suppliers");

  if (param === "sourcing") {
    const ops = await prisma.supplier.findFirst({ where: { slug: "pacific-agency" }, select: { id: true, nameKo: true } });
    return (
      <Overlay closeHref={closeHref} kind="modal" kicker="Sourcing support" title="소싱 지원 요청">
        <ContactForm suppliers={ops ? [{ id: ops.id, nameKo: `운영팀 소싱 지원 (${ops.nameKo} 경유)` }] : []} ingredient={ingredient?.nameKo} />
      </Overlay>
    );
  }
  const ids = param.split(",").map(Number).filter(Number.isFinite);
  const suppliers = await prisma.supplier.findMany({ where: { id: { in: ids }, visible: true }, select: { id: true, nameKo: true } });
  return (
    <Overlay closeHref={closeHref} kind="modal" kicker="Contact request" title={suppliers.length === 1 ? `${suppliers[0].nameKo}에 문의` : `${suppliers.length}개 공급사에 문의`}>
      <ContactForm suppliers={suppliers} ingredient={fSummary ?? ingredient?.nameKo} dosageForm={formulation?.dosageForm} markets={formulation ? parseList(formulation.targetMarkets) : undefined} formulationSlug={formulation?.slug} formulationHref={formulation ? `/formulate/${formulation.slug}` : undefined} />
    </Overlay>
  );
}
