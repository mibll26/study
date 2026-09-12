/**
 * 탐색 엔진용 큐레이션 데이터: 추가 원료, 원료×목표 근거, 원료×원료 상호작용.
 * 근거 등급: 4=A 메타분석/다수 RCT · 3=B 일부 RCT · 2=C 소규모/예비 임상 · 1=D 전임상/기전.
 * 참고 링크는 PubMed 검색 URL — 운영자가 실제 논문으로 교체하는 것을 전제 (P1 원칙).
 */
import type { IngredientSeed } from "./seed-data";

const MFDS = { sourceName: "식품안전나라 (MFDS)", sourceUrl: "https://various.foodsafetykorea.go.kr", verifiedAt: "2026-09-01" };
const FDA = { sourceName: "US FDA", sourceUrl: "https://www.fda.gov/food/dietary-supplements", verifiedAt: "2026-09-01" };

const KR = (legalityStatus: string, claim: string, extra: Record<string, unknown> = {}) => ({ countryCode: "KR", legalityStatus, usable: !legalityStatus.includes("개별인정") && !legalityStatus.includes("아님"), approvalType: legalityStatus, legality: legalityStatus === "고시형" ? "「건강기능식품 기준 및 규격」 공전 등재 — 누구나 사용 가능" : legalityStatus.includes("개별인정") ? "인정받은 영업자만 사용 가능 — 인정권자 확인 필요" : "국내 건강기능식품 기능성 원료로 인정되지 않음", allowedClaims: claim ? [{ original: claim, translated: claim }] : [], facilityRequirements: "건강기능식품 GMP", ...MFDS, ...extra });
const US = (claim: string, extra: Record<string, unknown> = {}) => ({ countryCode: "US", legalityStatus: "NDI 불요", usable: true, approvalType: "Grandfathered (DSHEA)", legality: "1994-10-15 이전 유통 원료 — 사전 승인 없이 사용 가능", allowedClaims: [{ original: claim, translated: `${claim} (DSHEA 면책문구 필요)` }], facilityRequirements: "FDA 시설등록 + cGMP 21 CFR 111", ...FDA, ...extra });

export const MORE_INGREDIENTS: IngredientSeed[] = [
  { slug: "pycnogenol", nameKo: "프랑스해안송껍질추출물 (피크노제놀)", nameEn: "French Maritime Pine Bark Extract (Pycnogenol)", nameScientific: "Pinus pinaster", aliases: ["피크노제놀", "Pycnogenol", "소나무껍질추출물", "OPC"], category: "식물추출물", functionality: ["항산화", "피부", "혈행"], dosageForms: ["정제", "캡슐"], descriptionKo: "프로시아니딘 풍부한 송피 추출물. 항산화·피부 보습·혈행 개선 근거. 원료 브랜드(Pycnogenol®)는 Horphag 독점.", dailyIntake: "KR 프로시아니딘으로 40–150 mg", intakeMin: 40, intakeMax: 150, intakeUnit: "mg", intakeBasis: "프로시아니딘", caution: "항응고제 병용 주의", statuses: [KR("고시형", "항산화·피부 보습·혈행 개선에 도움을 줄 수 있음"), US("Supports healthy circulation*")], supplierSlugs: ["pacific-agency"] },
  { slug: "l-theanine", nameKo: "테아닌", nameEn: "L-Theanine", nameScientific: "L-γ-glutamylethylamide", aliases: ["L-테아닌", "Suntheanine"], category: "단백질·아미노산", functionality: ["스트레스", "수면"], dosageForms: ["정제", "캡슐", "스틱"], descriptionKo: "녹차 유래 아미노산. 알파파 증가·긴장 완화. 수면 보조 조합의 기본 원료.", dailyIntake: "KR 테아닌으로 200–250 mg", intakeMin: 200, intakeMax: 250, intakeUnit: "mg", caution: "정보 없음", statuses: [KR("고시형", "스트레스로 인한 긴장 완화에 도움을 줄 수 있음"), US("Promotes relaxation*")], supplierSlugs: ["novarex", "tokyo-ferment"] },
  { slug: "ecklonia-cava", nameKo: "감태추출물", nameEn: "Ecklonia cava Extract", nameScientific: "Ecklonia cava", aliases: ["감태", "씨폴리놀", "플로로탄닌"], category: "식물추출물", functionality: ["수면"], dosageForms: ["정제", "캡슐"], descriptionKo: "제주 해조류 유래 플로로탄닌. 수면의 질 개선 개별인정 원료.", dailyIntake: "KR 디에콜로 30 mg", intakeMin: 30, intakeMax: 30, intakeUnit: "mg", intakeBasis: "디에콜", statuses: [KR("개별인정형", "수면의 질 개선에 도움을 줄 수 있음", { approvalHolder: "보타메디 (인정번호별 확인 필요)", registrationDuration: "신규 인정 120일" })], supplierSlugs: [] },
  { slug: "lactium", nameKo: "유단백가수분해물 (락티움)", nameEn: "Milk Protein Hydrolysate (Lactium)", nameScientific: "αs1-casein hydrolysate", aliases: ["락티움", "Lactium", "카제인 가수분해물"], category: "단백질·아미노산", functionality: ["수면", "스트레스"], dosageForms: ["정제", "캡슐"], descriptionKo: "우유 카제인 유래 펩타이드. 수면의 질·스트레스 개별인정.", dailyIntake: "KR 300 mg", intakeMin: 300, intakeMax: 300, intakeUnit: "mg", caution: "유단백 알레르기 주의", statuses: [KR("개별인정형", "수면의 질 개선·스트레스로 인한 긴장 완화에 도움", { approvalHolder: "정보 없음 — 인정번호별 확인" })], supplierSlugs: [] },
  { slug: "ashwagandha", nameKo: "아슈와간다추출물", nameEn: "Ashwagandha Extract", nameScientific: "Withania somnifera", aliases: ["위타니아", "KSM-66", "인도인삼"], category: "식물추출물", functionality: ["스트레스", "수면", "피로개선"], dosageForms: ["캡슐", "정제"], descriptionKo: "아유르베다 유래 아답토젠. 코르티솔 감소·스트레스 RCT 다수. 한국은 개별인정형.", dailyIntake: "정보 없음", caution: "갑상선·자가면역 질환자 주의, 임산부 금기", statuses: [KR("개별인정형", "스트레스로 인한 긴장 완화·수면의 질 개선 (인정 건별 확인)", { approvalHolder: "정보 없음 — 인정번호별 확인" }), US("Helps the body adapt to stress*"), { countryCode: "EU", legalityStatus: "일부 회원국 제한", usable: false, approvalType: "회원국별 상이", legality: "덴마크 등 일부 회원국 판매 금지/제한 — 국가별 확인 필요", alternativeChannels: "허용 회원국에서만 판매", sourceName: "EFSA / 회원국 당국", sourceUrl: "https://www.efsa.europa.eu", verifiedAt: "2026-09-01" }], supplierSlugs: ["deccan-botanicals"] },
  { slug: "rhodiola", nameKo: "홍경천추출물", nameEn: "Rhodiola rosea Extract", nameScientific: "Rhodiola rosea", aliases: ["로디올라", "Rhodiola", "살리드로사이드"], category: "식물추출물", functionality: ["피로개선", "스트레스"], dosageForms: ["정제", "캡슐"], descriptionKo: "아답토젠. 스트레스로 인한 피로 개선 고시형.", dailyIntake: "KR 로사빈으로 4.32–12 mg", intakeMin: 4.32, intakeMax: 12, intakeUnit: "mg", intakeBasis: "로사빈", statuses: [KR("고시형", "스트레스로 인한 피로 개선에 도움을 줄 수 있음"), US("Supports stress resilience*")], supplierSlugs: ["deccan-botanicals", "novarex"] },
  { slug: "msm", nameKo: "MSM (디메틸설폰)", nameEn: "Methylsulfonylmethane", nameScientific: "Dimethyl sulfone", aliases: ["MSM", "식이유황", "디메틸설폰"], category: "기타", functionality: ["관절"], dosageForms: ["정제", "분말"], descriptionKo: "관절·연골 건강 고시형. 글루코사민·보스웰리아와의 복합 RCT 존재.", dailyIntake: "KR 1.5–2 g", intakeMin: 1500, intakeMax: 2000, intakeUnit: "mg", statuses: [KR("고시형", "관절 및 연골 건강에 도움을 줄 수 있음"), US("Supports joint health*")], supplierSlugs: ["jiangxi-mineral", "novarex", "kolmar-bnh"] },
  { slug: "boswellia", nameKo: "보스웰리아추출물", nameEn: "Boswellia serrata Extract", nameScientific: "Boswellia serrata", aliases: ["보스웰리아", "AKBA", "유향"], category: "식물추출물", functionality: ["관절"], dosageForms: ["정제", "캡슐"], descriptionKo: "보스웰릭산(AKBA) — 5-LOX 억제로 관절 염증 완화. 한국은 개별인정형 (인정권자 확인).", dailyIntake: "정보 없음", statuses: [KR("개별인정형", "관절 건강에 도움을 줄 수 있음 (인정 건별 확인)", { approvalHolder: "정보 없음 — 인정번호별 확인" }), US("Supports joint comfort*")], supplierSlugs: ["deccan-botanicals"] },
  { slug: "green-lipped-mussel", nameKo: "초록입홍합추출오일", nameEn: "Green-lipped Mussel Extract Oil", nameScientific: "Perna canaliculus", aliases: ["초록입홍합", "리프리놀", "Lyprinol"], category: "지방산", functionality: ["관절"], dosageForms: ["연질캡슐"], descriptionKo: "뉴질랜드 초록입홍합 지질 분획. 관절 건강 고시형(전환 원료).", dailyIntake: "KR 200 mg", intakeMin: 200, intakeMax: 200, intakeUnit: "mg", caution: "패류 알레르기 주의", statuses: [KR("고시형", "관절 건강에 도움을 줄 수 있음"), US("Supports joint health*")], supplierSlugs: ["pacific-agency"] },
  { slug: "curcumin", nameKo: "강황추출물 (커큐민)", nameEn: "Turmeric Extract (Curcumin)", nameScientific: "Curcuma longa", aliases: ["커큐민", "울금", "테라큐민", "Curcumin"], category: "식물추출물", functionality: ["관절", "간건강", "항산화"], dosageForms: ["캡슐", "정제"], descriptionKo: "생체이용률이 낮아 제제 기술(테라큐민 등)이 핵심. 한국은 제제별 개별인정.", dailyIntake: "정보 없음", caution: "담석·항응고제 병용 주의", statuses: [KR("개별인정형", "간 건강·관절 건강 (인정 제제별 상이)", { approvalHolder: "정보 없음 — 제제별 인정권자 확인" }), US("Supports a healthy inflammatory response*")], supplierSlugs: ["deccan-botanicals"] },
  { slug: "saw-palmetto", nameKo: "쏘팔메토열매추출물", nameEn: "Saw Palmetto Extract", nameScientific: "Serenoa repens", aliases: ["쏘팔메토", "소팔메토", "Serenoa"], category: "식물추출물", functionality: ["전립선"], dosageForms: ["연질캡슐"], descriptionKo: "전립선 건강 고시형. 로르산 규격.", dailyIntake: "KR 로르산으로 115–320 mg", intakeMin: 115, intakeMax: 320, intakeUnit: "mg", intakeBasis: "로르산", statuses: [KR("고시형", "전립선 건강 유지에 도움을 줄 수 있음"), US("Supports prostate health*")], supplierSlugs: ["deccan-botanicals", "kolmar-bnh"] },
  { slug: "ginkgo", nameKo: "은행잎추출물", nameEn: "Ginkgo biloba Extract", nameScientific: "Ginkgo biloba", aliases: ["징코", "Ginkgo", "EGb 761"], category: "식물추출물", functionality: ["기억력", "혈행"], dosageForms: ["정제", "캡슐"], descriptionKo: "플라보놀배당체·테르펜락톤 규격. 기억력·혈행 개선 고시형.", dailyIntake: "KR 플라보놀배당체로 28–36 mg", intakeMin: 28, intakeMax: 36, intakeUnit: "mg", intakeBasis: "플라보놀배당체", caution: "항응고제·항혈소판제 병용 주의, 수술 전 중단", statuses: [KR("고시형", "기억력 개선·혈행 개선에 도움을 줄 수 있음"), US("Supports memory and circulation*")], supplierSlugs: ["kolmar-bnh"] },
  { slug: "phosphatidylserine", nameKo: "포스파티딜세린", nameEn: "Phosphatidylserine", nameScientific: "PS", aliases: ["PS", "포스파티딜세린"], category: "지방산", functionality: ["기억력"], dosageForms: ["캡슐"], descriptionKo: "노화로 인한 인지력 저하 개선 고시형. 대두 유래.", dailyIntake: "KR 300 mg", intakeMin: 300, intakeMax: 300, intakeUnit: "mg", statuses: [KR("고시형", "노화로 인해 저하된 인지력 개선에 도움을 줄 수 있음"), US("Supports cognitive function*")], supplierSlugs: ["kolmar-bnh"] },
  { slug: "vitamin-b6", nameKo: "비타민B6", nameEn: "Vitamin B6", nameScientific: "Pyridoxine", aliases: ["피리독신", "P5P"], category: "비타민·미네랄", functionality: ["에너지", "스트레스"], dosageForms: ["정제", "캡슐"], descriptionKo: "단백질·아미노산 대사, 신경전달물질 합성 보조. 마그네슘과 조합 근거.", dailyIntake: "KR 0.45–67 mg", intakeMin: 0.45, intakeMax: 67, intakeUnit: "mg", caution: "장기 고용량 시 말초신경병증", statuses: [KR("고시형", "단백질 및 아미노산 이용에 필요·혈액의 호모시스테인 수준을 정상으로 유지하는데 필요"), US("Supports energy metabolism*")], supplierSlugs: ["jiangxi-mineral", "novarex", "kolmar-bnh"] },
  { slug: "vitamin-b12", nameKo: "비타민B12", nameEn: "Vitamin B12", nameScientific: "Cobalamin", aliases: ["코발라민", "메틸코발라민"], category: "비타민·미네랄", functionality: ["에너지", "피로개선"], dosageForms: ["정제", "스틱"], descriptionKo: "정상적인 엽산 대사에 필요. 채식·고령층 결핍 소구.", dailyIntake: "KR 0.72–2000 µg", intakeMin: 0.72, intakeMax: 2000, intakeUnit: "µg", statuses: [KR("고시형", "정상적인 엽산 대사에 필요"), US("Supports energy*")], supplierSlugs: ["jiangxi-mineral", "novarex"] },
  { slug: "folic-acid", nameKo: "엽산", nameEn: "Folic Acid", nameScientific: "Folate", aliases: ["폴산", "활성엽산", "5-MTHF"], category: "비타민·미네랄", functionality: ["에너지"], dosageForms: ["정제"], descriptionKo: "세포·혈액 생성, 태아 신경관 발달. 임산부 소구.", dailyIntake: "KR 120–400 µg", intakeMin: 120, intakeMax: 400, intakeUnit: "µg", statuses: [KR("고시형", "세포와 혈액 생성에 필요·태아 신경관의 정상 발달에 필요"), US("Supports healthy pregnancy*")], supplierSlugs: ["jiangxi-mineral", "novarex"] },
  { slug: "biotin", nameKo: "비오틴", nameEn: "Biotin", nameScientific: "Vitamin B7", aliases: ["비타민B7", "비타민H"], category: "비타민·미네랄", functionality: ["피부", "에너지"], dosageForms: ["정제", "구미"], descriptionKo: "지방·탄수화물·단백질 대사. 모발·손톱 소구(표시는 대사 기능만 가능).", dailyIntake: "KR 9–900 µg", intakeMin: 9, intakeMax: 900, intakeUnit: "µg", statuses: [KR("고시형", "지방, 탄수화물, 단백질 대사와 에너지 생성에 필요"), US("Supports healthy hair, skin and nails*")], supplierSlugs: ["jiangxi-mineral", "cosmax-nbt"] },
  { slug: "iron", nameKo: "철", nameEn: "Iron", nameScientific: "Fe", aliases: ["철분", "헴철", "비헴철", "Ferrous"], category: "비타민·미네랄", functionality: ["에너지", "피로개선"], dosageForms: ["정제", "캡슐", "액상"], descriptionKo: "체내 산소 운반·에너지 생성. 가임기 여성 소구. 칼슘·녹차와 흡수 경쟁.", dailyIntake: "KR 3.6–15 mg", intakeMin: 3.6, intakeMax: 15, intakeUnit: "mg", caution: "과잉 시 위장 장애, 6세 이하 과다 섭취 위험", statuses: [KR("고시형", "체내 산소운반과 혈액생성에 필요·에너지 생성에 필요"), US("Supports healthy red blood cells*")], supplierSlugs: ["jiangxi-mineral", "novarex"] },
  { slug: "calcium", nameKo: "칼슘", nameEn: "Calcium", nameScientific: "Ca", aliases: ["탄산칼슘", "구연산칼슘", "해조칼슘"], category: "비타민·미네랄", functionality: ["뼈건강"], dosageForms: ["정제", "분말"], descriptionKo: "뼈·치아 형성. 비타민D·마그네슘과 조합이 표준.", dailyIntake: "KR 210–800 mg", intakeMin: 210, intakeMax: 800, intakeUnit: "mg", caution: "철·아연과 동시 섭취 시 흡수 저해", statuses: [KR("고시형", "뼈와 치아 형성에 필요·골다공증 발생 위험 감소에 도움"), US("Supports bone health*")], supplierSlugs: ["jiangxi-mineral", "novarex", "kolmar-bnh"] },
  { slug: "garcinia", nameKo: "가르시니아캄보지아추출물", nameEn: "Garcinia cambogia Extract", nameScientific: "Garcinia gummi-gutta", aliases: ["가르시니아", "HCA", "하이드록시시트르산"], category: "식물추출물", functionality: ["체지방"], dosageForms: ["정제", "캡슐"], descriptionKo: "HCA — 탄수화물의 지방 합성 억제. 체지방 감소 고시형. 간 안전성 논란 이력.", dailyIntake: "KR HCA로 750–2,800 mg", intakeMin: 750, intakeMax: 2800, intakeUnit: "mg", intakeBasis: "HCA", caution: "간 질환자 주의, 녹차추출물 등과 고용량 병용 주의", statuses: [KR("고시형", "탄수화물이 지방으로 합성되는 것을 억제하여 체지방 감소에 도움을 줄 수 있음"), US("Supports weight management*")], supplierSlugs: ["deccan-botanicals", "novarex"] },
  { slug: "green-tea-extract", nameKo: "녹차추출물", nameEn: "Green Tea Extract", nameScientific: "Camellia sinensis", aliases: ["카테킨", "EGCG", "그린티"], category: "식물추출물", functionality: ["항산화", "체지방"], dosageForms: ["정제", "캡슐"], descriptionKo: "카테킨(EGCG) 규격. 항산화·체지방 감소 고시형. 철 흡수 저해.", dailyIntake: "KR 카테킨으로 0.3–1 g", intakeMin: 300, intakeMax: 1000, intakeUnit: "mg", intakeBasis: "카테킨", caution: "고용량 공복 섭취 시 간독성 보고, 카페인 함유", statuses: [KR("고시형", "항산화·체지방 감소에 도움을 줄 수 있음"), US("Supports metabolism*")], supplierSlugs: ["deccan-botanicals", "jiangxi-mineral"] },
  { slug: "psyllium", nameKo: "차전자피식이섬유", nameEn: "Psyllium Husk Fiber", nameScientific: "Plantago ovata", aliases: ["차전자피", "질경이씨껍질", "Psyllium"], category: "기타", functionality: ["장건강", "콜레스테롤"], dosageForms: ["분말", "스틱"], descriptionKo: "수용성 식이섬유. 배변·콜레스테롤 개선 고시형. 유산균과 프리바이오틱 조합.", dailyIntake: "KR 식이섬유로 5.5 g", intakeMin: 5500, intakeMax: 5500, intakeUnit: "mg", intakeBasis: "식이섬유", caution: "충분한 물과 함께 섭취", statuses: [KR("고시형", "배변활동 원활·혈중 콜레스테롤 개선·식후 혈당 상승 억제에 도움"), US("Supports digestive regularity*")], supplierSlugs: ["green-lab-smallbatch", "deccan-botanicals"] },
  { slug: "resistant-maltodextrin", nameKo: "난소화성말토덱스트린", nameEn: "Resistant Maltodextrin", nameScientific: "Indigestible dextrin", aliases: ["난소화성덱스트린", "파이버솔"], category: "기타", functionality: ["혈당", "장건강"], dosageForms: ["분말", "스틱", "RTD"], descriptionKo: "식후 혈당·중성지질 상승 억제, 배변. 음료·스틱에 배합 용이.", dailyIntake: "KR 식이섬유로 2.5–30 g", intakeMin: 2500, intakeMax: 30000, intakeUnit: "mg", intakeBasis: "식이섬유", statuses: [KR("고시형", "식후 혈당 상승 억제·혈중 중성지질 개선·배변활동 원활에 도움"), US("Supports healthy blood sugar*")], supplierSlugs: ["tokyo-ferment", "green-lab-smallbatch"] },
  { slug: "banaba", nameKo: "바나바잎추출물", nameEn: "Banaba Leaf Extract", nameScientific: "Lagerstroemia speciosa", aliases: ["바나바", "코로솔산"], category: "식물추출물", functionality: ["혈당"], dosageForms: ["정제", "캡슐"], descriptionKo: "코로솔산 — 식후 혈당 상승 억제 고시형.", dailyIntake: "KR 코로솔산으로 0.24–1.3 mg", intakeMin: 0.24, intakeMax: 1.3, intakeUnit: "mg", intakeBasis: "코로솔산", caution: "혈당강하제 병용 시 주의", statuses: [KR("고시형", "식후 혈당 상승 억제에 도움을 줄 수 있음"), US("Supports healthy glucose metabolism*")], supplierSlugs: ["deccan-botanicals"] },
  { slug: "melatonin", nameKo: "멜라토닌", nameEn: "Melatonin", nameScientific: "N-acetyl-5-methoxytryptamine", aliases: ["Melatonin"], category: "기타", functionality: ["수면"], dosageForms: ["정제", "구미"], descriptionKo: "미국에서는 대표 수면 보충제이지만 한국은 전문의약품 — 건강기능식품 원료로 사용 불가. 수출 전용 설계 시에만 검토.", dailyIntake: "정보 없음", caution: "한국 내 판매 불가", statuses: [KR("건기식 원료 아님", "", { legality: "전문의약품 성분 — 국내 식품·건기식 사용 불가. 해외직구 반입도 제한", usable: false }), US("Supports restful sleep*", { legality: "Grandfathered — 미국 내 일반 판매" }), { countryCode: "EU", legalityStatus: "승인 클레임 있음 (1 mg)", usable: true, approvalType: "Reg. 1924/2006", legality: "회원국별로 식품보충제 허용 여부 상이 (일부 국가 의약품)", allowedClaims: [{ original: "Melatonin contributes to the reduction of time taken to fall asleep", translated: "멜라토닌은 잠드는 데 걸리는 시간 단축에 기여합니다 (1 mg 조건)" }], sourceName: "EU Register", sourceUrl: "https://eur-lex.europa.eu/eli/reg/2006/1924/oj/eng", verifiedAt: "2026-09-01" }], supplierSlugs: [] },
  { slug: "creatine", nameKo: "크레아틴", nameEn: "Creatine Monohydrate", nameScientific: "Creatine", aliases: ["크레아틴 모노하이드레이트"], category: "단백질·아미노산", functionality: ["근육", "에너지"], dosageForms: ["분말"], descriptionKo: "근력·운동수행 근거는 A등급이나 한국에서는 건강기능식품 기능성 원료가 아님(일반식품 원료). 기능성 표시 불가.", dailyIntake: "정보 없음", statuses: [KR("건기식 원료 아님", "", { legality: "식품원료로는 사용 가능하나 건강기능식품 기능성 원료 아님 — 기능성 표시·광고 불가", usable: false }), US("Supports muscle strength and performance*")], supplierSlugs: ["jiangxi-mineral"] },
];

// ── 원료 × 목표 근거 ──
type Ev = { slug: string; goal: string; level: 1 | 2 | 3 | 4; mechanism: string; summary: string; q: string };
export const EVIDENCE: Ev[] = [
  // 수면
  { slug: "magnesium", goal: "수면", level: 2, mechanism: "NMDA 길항·GABA 조절", summary: "고령·결핍군에서 입면 시간 단축 소규모 RCT. 일반 성인 근거는 제한적.", q: "magnesium supplementation sleep randomized" },
  { slug: "l-theanine", goal: "수면", level: 3, mechanism: "알파파 증가·글루타메이트 조절", summary: "200 mg에서 수면의 질·입면 개선 RCT 다수 (특히 스트레스 동반군).", q: "L-theanine sleep quality randomized" },
  { slug: "ecklonia-cava", goal: "수면", level: 3, mechanism: "GABA-A 수용체 조절 (플로로탄닌)", summary: "국내 인체적용시험에서 수면 효율·입면 개선 — 개별인정 근거.", q: "Ecklonia cava sleep" },
  { slug: "lactium", goal: "수면", level: 3, mechanism: "GABA-A 수용체 친화 펩타이드", summary: "αs1-casein hydrolysate 수면의 질 개선 RCT 2건 이상.", q: "alpha-casozepine sleep" },
  { slug: "ashwagandha", goal: "수면", level: 3, mechanism: "코르티솔 감소·GABA 유사", summary: "600 mg/일 8주 RCT에서 입면 시간·수면 효율 개선.", q: "ashwagandha sleep randomized" },
  { slug: "melatonin", goal: "수면", level: 4, mechanism: "멜라토닌 수용체(MT1/MT2)", summary: "메타분석에서 입면 시간 단축 확인. 한국 사용 불가.", q: "melatonin sleep meta-analysis" },
  { slug: "vitamin-b6", goal: "수면", level: 1, mechanism: "세로토닌·멜라토닌 합성 보조인자", summary: "기전적 근거 위주. 마그네슘과의 조합 연구 일부.", q: "pyridoxine sleep" },
  // 스트레스
  { slug: "l-theanine", goal: "스트레스", level: 3, mechanism: "알파파 증가", summary: "급성 스트레스 반응(심박·코르티솔) 완화 RCT.", q: "L-theanine stress randomized" },
  { slug: "ashwagandha", goal: "스트레스", level: 4, mechanism: "HPA축 조절·코르티솔 감소", summary: "다수 RCT·메타분석에서 지각 스트레스·코르티솔 감소.", q: "ashwagandha stress meta-analysis" },
  { slug: "rhodiola", goal: "스트레스", level: 3, mechanism: "HPA축 조절·아답토젠", summary: "스트레스 관련 피로에서 RCT 다수.", q: "Rhodiola rosea stress fatigue randomized" },
  { slug: "lactium", goal: "스트레스", level: 2, mechanism: "GABA-A 수용체", summary: "스트레스 지표 개선 소규모 RCT.", q: "alpha-casozepine stress" },
  { slug: "magnesium", goal: "스트레스", level: 2, mechanism: "HPA축·NMDA 조절", summary: "결핍군 중심 근거. 비타민B6 병용 RCT 1건.", q: "magnesium vitamin B6 stress randomized" },
  { slug: "vitamin-b6", goal: "스트레스", level: 2, mechanism: "신경전달물질 합성 보조", summary: "마그네슘 병용 시 스트레스 점수 개선 RCT.", q: "magnesium vitamin B6 stress" },
  // 관절
  { slug: "glucosamine", goal: "관절", level: 3, mechanism: "연골 기질 합성 전구체", summary: "황산염 제형에서 증상 개선 RCT 다수, 결과 이질적.", q: "glucosamine sulfate osteoarthritis randomized" },
  { slug: "msm", goal: "관절", level: 3, mechanism: "항염·항산화 (황 공급)", summary: "무릎 OA 통증·기능 개선 RCT 다수.", q: "methylsulfonylmethane osteoarthritis" },
  { slug: "boswellia", goal: "관절", level: 3, mechanism: "5-LOX 억제 (AKBA)", summary: "OA 통증·기능 개선 RCT 다수, 메타분석 존재.", q: "Boswellia serrata osteoarthritis meta-analysis" },
  { slug: "green-lipped-mussel", goal: "관절", level: 2, mechanism: "오메가3 지질 분획·항염", summary: "소규모 RCT에서 관절 통증 개선.", q: "green-lipped mussel osteoarthritis" },
  { slug: "curcumin", goal: "관절", level: 3, mechanism: "NF-κB·COX-2 억제", summary: "생체이용률 개선 제제에서 OA 증상 개선 RCT 다수.", q: "curcumin osteoarthritis randomized" },
  { slug: "omega-3", goal: "관절", level: 2, mechanism: "항염 (EPA/DHA 레졸빈)", summary: "류마티스 중심 근거, OA는 제한적.", q: "omega-3 osteoarthritis" },
  // 눈건강
  { slug: "lutein", goal: "눈건강", level: 4, mechanism: "황반색소 축적·청색광 흡수", summary: "AREDS2 등 대규모 RCT.", q: "lutein zeaxanthin macular AREDS2" },
  { slug: "omega-3", goal: "눈건강", level: 3, mechanism: "안구건조 — 눈물막 지질층", summary: "건조한 눈 개선 RCT, 결과 이질적.", q: "omega-3 dry eye randomized" },
  { slug: "zinc", goal: "눈건강", level: 3, mechanism: "망막 항산화 효소 보조인자", summary: "AREDS 복합제 구성 성분.", q: "zinc macular degeneration AREDS" },
  // 장건강
  { slug: "probiotics", goal: "장건강", level: 4, mechanism: "장내 균총 조절", summary: "균주별 배변·IBS 증상 개선 메타분석.", q: "probiotics constipation meta-analysis" },
  { slug: "psyllium", goal: "장건강", level: 4, mechanism: "수용성 섬유 — 변 부피·점도", summary: "변비 개선 RCT 다수, 가이드라인 권고.", q: "psyllium constipation" },
  { slug: "resistant-maltodextrin", goal: "장건강", level: 3, mechanism: "프리바이오틱 발효", summary: "배변 빈도 개선 RCT.", q: "resistant maltodextrin bowel" },
  // 면역
  { slug: "vitamin-d", goal: "면역", level: 3, mechanism: "면역세포 VDR 조절", summary: "결핍군 호흡기 감염 감소 메타분석.", q: "vitamin D respiratory infection meta-analysis" },
  { slug: "zinc", goal: "면역", level: 3, mechanism: "T세포 기능·항바이러스", summary: "감기 지속기간 단축 메타분석 (아연 로젠지).", q: "zinc common cold meta-analysis" },
  { slug: "vitamin-c", goal: "면역", level: 3, mechanism: "항산화·백혈구 기능", summary: "감기 지속기간 소폭 단축 (코크란).", q: "vitamin C common cold cochrane" },
  { slug: "probiotics", goal: "면역", level: 3, mechanism: "장-면역 축", summary: "상기도 감염 빈도 감소 메타분석.", q: "probiotics upper respiratory infection meta-analysis" },
  { slug: "red-ginseng", goal: "면역", level: 3, mechanism: "진세노사이드 — NK세포 활성", summary: "면역 지표 개선 RCT 다수 (국내).", q: "red ginseng immune randomized" },
  // 체지방
  { slug: "garcinia", goal: "체지방", level: 2, mechanism: "ATP-citrate lyase 억제", summary: "체중 감소 효과 소폭, 메타분석 결과 이질적.", q: "Garcinia cambogia weight meta-analysis" },
  { slug: "green-tea-extract", goal: "체지방", level: 3, mechanism: "카테킨 — 열발생·지방산화", summary: "체지방 소폭 감소 메타분석 (카페인 병용 시 강화).", q: "green tea catechins body fat meta-analysis" },
  // 혈당
  { slug: "banaba", goal: "혈당", level: 2, mechanism: "코로솔산 — GLUT4 전위", summary: "식후 혈당 개선 소규모 RCT.", q: "banaba corosolic acid glucose" },
  { slug: "resistant-maltodextrin", goal: "혈당", level: 3, mechanism: "당 흡수 지연", summary: "식후 혈당 상승 억제 RCT 다수 (일본).", q: "indigestible dextrin postprandial glucose" },
  { slug: "psyllium", goal: "혈당", level: 3, mechanism: "점성 섬유 — 당 흡수 지연", summary: "2형 당뇨에서 공복·식후 혈당 개선 메타분석.", q: "psyllium glycemic control meta-analysis" },
  // 간건강
  { slug: "milk-thistle", goal: "간건강", level: 3, mechanism: "실리마린 — 간세포 막 안정·항산화", summary: "간효소 개선 RCT, 임상 결과는 이질적.", q: "silymarin liver enzymes randomized" },
  { slug: "curcumin", goal: "간건강", level: 2, mechanism: "항산화·NF-κB 억제", summary: "NAFLD에서 간효소·지방 감소 소규모 RCT.", q: "curcumin NAFLD randomized" },
  // 기억력
  { slug: "ginkgo", goal: "기억력", level: 3, mechanism: "뇌혈류 개선·항산화", summary: "경도 인지장애에서 일부 개선, 건강 성인은 근거 약함.", q: "Ginkgo biloba cognition randomized" },
  { slug: "phosphatidylserine", goal: "기억력", level: 3, mechanism: "신경세포막 구성·신호전달", summary: "노년 기억력 개선 RCT (특히 DHA 결합형).", q: "phosphatidylserine memory elderly" },
  { slug: "omega-3", goal: "기억력", level: 2, mechanism: "DHA — 신경세포막", summary: "경도 인지저하에서 일부 효과, 건강 성인은 제한적.", q: "DHA cognitive function randomized" },
  { slug: "red-ginseng", goal: "기억력", level: 2, mechanism: "진세노사이드 — 콜린성 조절", summary: "인지 기능 개선 소규모 RCT.", q: "red ginseng cognitive" },
  // 피부
  { slug: "collagen-peptide", goal: "피부", level: 3, mechanism: "저분자 펩타이드 — 진피 콜라겐 합성 자극", summary: "피부 수분·탄력 개선 메타분석 (제조사 후원 편향 주의).", q: "collagen peptide skin hydration meta-analysis" },
  { slug: "hyaluronic-acid", goal: "피부", level: 3, mechanism: "수분 결합", summary: "경구 HA 피부 수분 개선 RCT 다수 (일본).", q: "oral hyaluronic acid skin moisture" },
  { slug: "pycnogenol", goal: "피부", level: 2, mechanism: "항산화·히알루론산 합성 유전자 발현", summary: "피부 수분·탄력 개선 소규모 임상.", q: "Pycnogenol skin elasticity" },
  { slug: "vitamin-c", goal: "피부", level: 2, mechanism: "콜라겐 합성 보조인자", summary: "경구 단독 근거 제한, 콜라겐 병용 기전 근거.", q: "vitamin C collagen synthesis skin" },
  { slug: "biotin", goal: "피부", level: 1, mechanism: "케라틴 대사", summary: "결핍 외 근거 부족.", q: "biotin hair nails" },
  // 뼈건강
  { slug: "calcium", goal: "뼈건강", level: 4, mechanism: "골 무기질", summary: "골밀도 유지·골절 예방 (비타민D 병용) 메타분석.", q: "calcium vitamin D fracture meta-analysis" },
  { slug: "vitamin-d", goal: "뼈건강", level: 4, mechanism: "칼슘 흡수 조절", summary: "칼슘 병용 시 골절 위험 감소.", q: "vitamin D bone density" },
  { slug: "magnesium", goal: "뼈건강", level: 2, mechanism: "비타민D 활성화·골 기질", summary: "관찰 연구 중심.", q: "magnesium bone density" },
  // 혈행 / 항산화 / 피로 / 에너지 / 전립선 / 콜레스테롤 / 근육
  { slug: "omega-3", goal: "혈행", level: 4, mechanism: "중성지질 감소·혈소판 응집 억제", summary: "중성지질 감소 메타분석 확립.", q: "omega-3 triglycerides meta-analysis" },
  { slug: "pycnogenol", goal: "혈행", level: 3, mechanism: "NO 생성·혈관내피 기능", summary: "미세순환·혈관내피 기능 개선 RCT.", q: "Pycnogenol endothelial function" },
  { slug: "ginkgo", goal: "혈행", level: 3, mechanism: "혈소판활성인자 길항·혈관 확장", summary: "말초 혈행 개선 RCT.", q: "Ginkgo biloba peripheral circulation" },
  { slug: "red-ginseng", goal: "혈행", level: 2, mechanism: "혈소판 응집 억제", summary: "소규모 RCT.", q: "red ginseng platelet aggregation" },
  { slug: "pycnogenol", goal: "항산화", level: 3, mechanism: "프로시아니딘 — 라디칼 소거", summary: "산화 스트레스 지표 개선 RCT.", q: "Pycnogenol oxidative stress" },
  { slug: "vitamin-c", goal: "항산화", level: 3, mechanism: "수용성 항산화", summary: "산화 지표 개선 근거 다수.", q: "vitamin C oxidative stress" },
  { slug: "coenzyme-q10", goal: "항산화", level: 3, mechanism: "미토콘드리아 전자전달·지용성 항산화", summary: "산화 지표·혈압 개선 RCT.", q: "coenzyme Q10 oxidative stress randomized" },
  { slug: "green-tea-extract", goal: "항산화", level: 3, mechanism: "카테킨", summary: "산화 지표 개선 RCT.", q: "green tea catechin oxidative" },
  { slug: "red-ginseng", goal: "피로개선", level: 3, mechanism: "에너지 대사·HPA축", summary: "피로 지표 개선 RCT (국내 다수).", q: "red ginseng fatigue randomized" },
  { slug: "rhodiola", goal: "피로개선", level: 3, mechanism: "아답토젠", summary: "스트레스성 피로 개선 RCT.", q: "Rhodiola fatigue" },
  { slug: "ashwagandha", goal: "피로개선", level: 2, mechanism: "코르티솔 감소", summary: "피로·활력 개선 소규모 RCT.", q: "ashwagandha fatigue" },
  { slug: "vitamin-b12", goal: "피로개선", level: 2, mechanism: "적혈구·에너지 대사", summary: "결핍군 중심 근거.", q: "vitamin B12 fatigue" },
  { slug: "iron", goal: "피로개선", level: 3, mechanism: "산소 운반", summary: "비빈혈 철결핍 여성 피로 개선 RCT.", q: "iron supplementation fatigue non-anaemic" },
  { slug: "coenzyme-q10", goal: "에너지", level: 2, mechanism: "ATP 생성", summary: "피로 개선 소규모 RCT.", q: "coenzyme Q10 fatigue" },
  { slug: "vitamin-b6", goal: "에너지", level: 2, mechanism: "에너지 대사 보조효소", summary: "결핍 교정 근거.", q: "vitamin B6 energy metabolism" },
  { slug: "vitamin-b12", goal: "에너지", level: 2, mechanism: "에너지 대사 보조효소", summary: "결핍 교정 근거.", q: "vitamin B12 energy" },
  { slug: "saw-palmetto", goal: "전립선", level: 3, mechanism: "5α-환원효소 억제", summary: "하부요로증상 개선 RCT, 코크란 결과는 혼재.", q: "saw palmetto BPH cochrane" },
  { slug: "zinc", goal: "전립선", level: 1, mechanism: "전립선 조직 아연 농도", summary: "관찰 근거.", q: "zinc prostate" },
  { slug: "psyllium", goal: "콜레스테롤", level: 4, mechanism: "담즙산 배설 증가", summary: "LDL 감소 메타분석.", q: "psyllium LDL cholesterol meta-analysis" },
  { slug: "omega-3", goal: "콜레스테롤", level: 2, mechanism: "중성지질 감소 (LDL은 증가 가능)", summary: "중성지질 중심.", q: "omega-3 LDL cholesterol" },
  { slug: "creatine", goal: "근육", level: 4, mechanism: "포스포크레아틴 — ATP 재합성", summary: "근력·제지방량 증가 메타분석 확립. 한국 건기식 불가.", q: "creatine muscle strength meta-analysis" },
  { slug: "magnesium", goal: "근육", level: 2, mechanism: "근수축·이완", summary: "근경련 근거 혼재.", q: "magnesium muscle cramps" },
  { slug: "vitamin-d", goal: "근육", level: 2, mechanism: "근육 VDR", summary: "고령 근력·낙상 감소 일부 근거.", q: "vitamin D muscle strength elderly" },
];

// ── 원료 × 원료 상호작용 ──
type Int = { a: string; b: string; type: "synergy" | "complementary" | "caution" | "antagonism" | "absorption"; note: string };
export const INTERACTIONS: Int[] = [
  { a: "magnesium", b: "vitamin-d", type: "synergy", note: "마그네슘은 비타민D 활성화(25-OH→1,25-OH) 효소의 보조인자 — 결핍 시 비타민D 효과 저하" },
  { a: "magnesium", b: "vitamin-b6", type: "synergy", note: "Mg+B6 병용이 단독보다 스트레스 점수 개선 (RCT 1건)" },
  { a: "magnesium", b: "zinc", type: "absorption", note: "고용량 아연(>50mg)이 마그네슘 흡수 저해 — 함량 확인 또는 시간차 섭취" },
  { a: "magnesium", b: "calcium", type: "absorption", note: "동일 흡수 경로 경쟁 — Ca:Mg 2:1 이내 권장" },
  { a: "calcium", b: "vitamin-d", type: "synergy", note: "비타민D가 장내 칼슘 흡수를 촉진 — 뼈 건강 표준 조합" },
  { a: "calcium", b: "iron", type: "absorption", note: "칼슘이 철 흡수를 유의하게 저해 — 동시 배합 비권장" },
  { a: "calcium", b: "zinc", type: "absorption", note: "칼슘이 아연 흡수 저해" },
  { a: "vitamin-c", b: "iron", type: "synergy", note: "비타민C가 비헴철 흡수를 2~3배 증가" },
  { a: "green-tea-extract", b: "iron", type: "absorption", note: "카테킨이 비헴철 흡수 저해" },
  { a: "omega-3", b: "ginkgo", type: "caution", note: "항혈소판 작용 중첩 — 출혈 경향 증가 가능, 항응고제 복용자 주의 표기" },
  { a: "red-ginseng", b: "ginkgo", type: "caution", note: "항혈소판 작용 중첩" },
  { a: "omega-3", b: "pycnogenol", type: "caution", note: "항응고 작용 중첩 가능" },
  { a: "lutein", b: "omega-3", type: "synergy", note: "지용성 — 오메가3 오일이 루테인 흡수 개선 (AREDS2 조합)" },
  { a: "coenzyme-q10", b: "omega-3", type: "synergy", note: "지용성 — 오일 매트릭스에서 CoQ10 생체이용률 상승" },
  { a: "vitamin-d", b: "omega-3", type: "complementary", note: "지용성 비타민 — 연질캡슐 동일 제형에 배합 용이" },
  { a: "probiotics", b: "psyllium", type: "synergy", note: "프리바이오틱 섬유가 유산균 정착 보조 (신바이오틱스)" },
  { a: "probiotics", b: "resistant-maltodextrin", type: "synergy", note: "프리바이오틱 발효 기질 제공" },
  { a: "glucosamine", b: "msm", type: "synergy", note: "글루코사민+MSM 병용이 단독보다 통증 개선 (RCT)" },
  { a: "boswellia", b: "curcumin", type: "synergy", note: "보스웰리아+커큐민 복합제 OA 임상 다수" },
  { a: "garcinia", b: "green-tea-extract", type: "caution", note: "고용량 병용 시 간독성 사례 보고 — 함량 보수적으로" },
  { a: "hyaluronic-acid", b: "collagen-peptide", type: "complementary", note: "피부 수분(HA)+탄력(콜라겐) 상보 소구" },
  { a: "vitamin-c", b: "collagen-peptide", type: "synergy", note: "비타민C는 콜라겐 합성 필수 보조인자" },
  { a: "l-theanine", b: "ecklonia-cava", type: "complementary", note: "알파파 증가 + GABA-A 조절 — 서로 다른 기전" },
  { a: "l-theanine", b: "ashwagandha", type: "complementary", note: "급성 이완 + HPA축 장기 조절" },
  { a: "l-theanine", b: "magnesium", type: "complementary", note: "서로 다른 기전의 수면 보조 조합, 상호작용 보고 없음" },
  { a: "ashwagandha", b: "rhodiola", type: "caution", note: "아답토젠 중첩 — 효과 가산 근거 없고 갑상선 영향 주의" },
  { a: "zinc", b: "vitamin-c", type: "complementary", note: "면역 표준 조합, 상호작용 없음" },
  { a: "vitamin-b6", b: "vitamin-b12", type: "complementary", note: "호모시스테인 대사 경로 공유 (엽산과 3종 조합)" },
  { a: "vitamin-b12", b: "folic-acid", type: "synergy", note: "엽산 대사에 B12 필요 — 고용량 엽산 단독은 B12 결핍 은폐 가능" },
  { a: "banaba", b: "resistant-maltodextrin", type: "complementary", note: "당 흡수 지연 + 세포 내 당 이용 — 다른 기전" },
  { a: "phosphatidylserine", b: "omega-3", type: "synergy", note: "PS-DHA 결합형에서 기억력 개선 근거 강화" },
  { a: "ginkgo", b: "phosphatidylserine", type: "complementary", note: "혈류 + 세포막 — 기억력 상보 조합" },
];
