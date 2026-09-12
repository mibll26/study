import { prisma } from "@/lib/db";
import { parseList } from "@/lib/constants";

export async function loadPicker() {
  const rows = await prisma.ingredient.findMany({ orderBy: { nameKo: "asc" }, select: { slug: true, nameKo: true, nameEn: true, category: true, functionality: true, intakeMin: true, intakeMax: true, intakeUnit: true } });
  return rows.map((r) => ({ ...r, functionality: parseList(r.functionality) }));
}

export function FormulateShell({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) {
  return (
    <div className="mx-auto max-w-[1260px] px-6 py-10 md:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div><div className="eyebrow mb-1">Formulation builder</div><h1 className="text-[26px] font-semibold tracking-[-0.025em]">배합 설계</h1><p className="mt-1 max-w-[70ch] text-[13px] text-muted">{subtitle ?? "원료를 조합하면 판매 국가별 사용 가능 여부, 함량 범위, 허용 표현 문구, 전 원료를 취급하는 공급사를 즉시 확인합니다. 저장하면 공유 링크가 생기고, 매칭 공급사에 배합표를 첨부해 견적을 요청할 수 있습니다."}</p></div>
      </div>
      <div className="callout mb-6 max-w-[80ch]">규제 판정은 큐레이션된 공개 정보 기준의 참고용이며 법적 효력이 없습니다. 함량 체크는 한국 일일섭취량 기준입니다. 최종 확인은 관할 기관 또는 전문가를 통해 진행하세요.</div>
      {children}
    </div>
  );
}

