import { Overlay } from "@/components/Overlay";
import { SupplierApplyForm } from "@/components/Forms";
import { closeOverlays } from "@/lib/url";
import type { SP } from "@/lib/queries";

export function ApplyModal({ sp }: { sp: SP }) {
  return (
    <Overlay closeHref={closeOverlays(sp, "for-suppliers")} kind="modal" kicker="For suppliers" title="공급사 등록 신청">
      <SupplierApplyForm />
    </Overlay>
  );
}
