import { Hero } from "@/components/sections/Hero";
import { Explore } from "@/components/sections/Explore";
import { Suppliers } from "@/components/sections/Suppliers";
import { Trends } from "@/components/sections/Trends";
import { Regulation } from "@/components/sections/Regulation";
import { ForSuppliers } from "@/components/sections/ForSuppliers";
import { IngredientPanel } from "@/components/panels/IngredientPanel";
import { SupplierPanel } from "@/components/panels/SupplierPanel";
import { ContactModal } from "@/components/panels/ContactModal";
import { ApplyModal } from "@/components/panels/ApplyModal";
import { CompareProvider } from "@/components/Compare";
import { one, type SP } from "@/lib/queries";

export const dynamic = "force-dynamic";

/** 원페이지. 패널·모달 상태는 쿼리스트링으로 동기화 (?ingredient= ?supplier= ?contact= ?apply=1) */
export async function OnePage({ sp }: { sp: SP }) {
  const ingredient = one(sp, "ingredient"), supplier = one(sp, "supplier"), contact = one(sp, "contact"), apply = one(sp, "apply");
  return (
    <CompareProvider>
      <Hero q={one(sp, "q")} />
      <Explore sp={sp} />
      <Suppliers sp={sp} />
      <Trends />
      <Regulation />
      <ForSuppliers sp={sp} />
      {/* 오버레이: 모달이 패널 위에 오도록 마지막에 렌더 */}
      {ingredient && !contact && <IngredientPanel slug={ingredient} sp={sp} />}
      {supplier && <SupplierPanel slug={supplier} sp={sp} />}
      {contact && <ContactModal param={contact} sp={sp} />}
      {apply && <ApplyModal sp={sp} />}
    </CompareProvider>
  );
}

export default async function Home(props: { searchParams: Promise<SP> }) {
  return <OnePage sp={await props.searchParams} />;
}
