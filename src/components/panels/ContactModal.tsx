import { Overlay } from "@/components/Overlay";
import { ContactForm } from "@/components/Forms";
import { prisma } from "@/lib/db";
import { closeOverlays, href } from "@/lib/url";
import type { SP } from "@/lib/queries";

/** ?contact=1,2,3 → 컨택 모달. ?contact=sourcing → 운영팀 소싱 지원 요청 (공급사 없음) */
export async function ContactModal({ param, sp }: { param: string; sp: SP }) {
  const ingredientSlug = typeof sp.ingredient === "string" ? sp.ingredient : undefined;
  const ingredient = ingredientSlug ? await prisma.ingredient.findUnique({ where: { slug: ingredientSlug }, select: { nameKo: true } }) : null;
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
      <ContactForm suppliers={suppliers} ingredient={ingredient?.nameKo} />
    </Overlay>
  );
}
