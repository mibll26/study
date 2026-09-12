/** 초기 큐레이션 데이터. 수치·문구는 BRD 부록 A와 디자인 시안 기준. 각 항목에 출처·확인일을 붙인다 (P1 원칙). */

const MFDS = { sourceName: "식품안전나라 (MFDS)", sourceUrl: "https://various.foodsafetykorea.go.kr", verifiedAt: "2026-09-01" };
const FDA = { sourceName: "US FDA", sourceUrl: "https://www.fda.gov/food/dietary-supplements/new-dietary-ingredient-ndi-notification-process", verifiedAt: "2026-09-01" };
const EU = { sourceName: "EU Register of health claims", sourceUrl: "https://eur-lex.europa.eu/eli/reg/2006/1924/oj/eng", verifiedAt: "2026-09-01" };
const NMPA = { sourceName: "NMPA", sourceUrl: "https://www.nmpa.gov.cn", verifiedAt: "2026-09-01" };
const CAA = { sourceName: "일본 소비자청 기능성표시식품", sourceUrl: "https://www.fld.caa.go.jp/caaks/cssc01/", verifiedAt: "2026-09-01" };

type Claim = { original: string; translated: string };
type Status = {
  countryCode: string; legalityStatus: string; usable: boolean; approvalType?: string; approvalHolder?: string; legality?: string;
  allowedClaims?: Claim[]; facilityRequirements?: string; registrationDuration?: string; registrationCost?: string; alternativeChannels?: string;
  sourceName?: string; sourceUrl?: string; verifiedAt?: string;
};
export type IngredientSeed = {
  slug: string; nameKo: string; nameEn: string; nameScientific?: string; aliases: string[]; category: string; functionality: string[]; dosageForms: string[];
  descriptionKo: string; dailyIntake?: string; intakeMin?: number; intakeMax?: number; intakeUnit?: string; intakeBasis?: string; caution?: string; statuses: Status[]; supplierSlugs: string[];
};

const KR_NOTIFIED = (claim: Claim, extra?: Partial<Status>): Status => ({
  countryCode: "KR", legalityStatus: "고시형", usable: true, approvalType: "고시형",
  legality: "「건강기능식품 기준 및 규격」 공전 등재 — 영업 허가를 받은 누구나 사용 가능", allowedClaims: [claim],
  facilityRequirements: "건강기능식품 GMP", registrationDuration: "품목제조신고만 (별도 인정 절차 없음)", ...MFDS, ...extra,
});
const KR_INDIVIDUAL = (claim: Claim, holder: string, extra?: Partial<Status>): Status => ({
  countryCode: "KR", legalityStatus: "개별인정형", usable: false, approvalType: "개별인정형", approvalHolder: holder,
  legality: "인정받은 영업자만 사용 가능 — 소싱하려면 인정권자의 원료를 확보해야 함", allowedClaims: [claim],
  facilityRequirements: "건강기능식품 GMP", registrationDuration: "신규 인정 120일 / 변경 60일", registrationCost: "신규 190만 원 / 변경 80만 원 · 제출자료 9종",
  sourceName: "식약처 개별인정 현황", sourceUrl: "https://various.foodsafetykorea.go.kr", verifiedAt: "2026-09-01", ...extra,
});
const US_GRANDFATHERED = (claim: Claim): Status => ({
  countryCode: "US", legalityStatus: "NDI 불요", usable: true, approvalType: "Grandfathered (DSHEA)",
  legality: "1994-10-15 이전 유통 원료 — NDI 신고 없이 사용 가능", allowedClaims: [claim],
  facilityRequirements: "FDA 시설등록(2년 갱신) + cGMP 21 CFR 111", registrationDuration: "사전 심사 없음 (Structure-function claim은 DSHEA 면책문구 필요)", ...FDA,
});
const EU_AUTHORISED = (claim: Claim, extra?: Partial<Status>): Status => ({
  countryCode: "EU", legalityStatus: "승인 클레임 있음", usable: true, approvalType: "Reg. 1924/2006 승인 클레임",
  legality: "Novel Food 아님 — 회원국별 식품보충제 notification 필요", allowedClaims: [claim],
  facilityRequirements: "회원국 식품위생 규정", registrationDuration: "회원국 notification만", ...EU, ...extra,
});
const CN_BLUEHAT: Status = {
  countryCode: "CN", legalityStatus: "블루햇 필요", usable: false, approvalType: "保健食品 등록(注册)/신고(备案)",
  legality: "오프라인·Tmall 국내몰·병원 채널은 블루햇 필수", alternativeChannels: "CBEC(Tmall Global 등)는 블루햇 불요 — CBEC로 2~3년 검증 후 주력 SKU만 블루햇 권장. 2026-06 GAC 280호령으로 CBEC 서류 요건 강화",
  registrationDuration: "수입제품 2~5년", registrationCost: "SKU당 USD 5만~20만", ...NMPA,
};
const JP_FFC = (claim: Claim): Status => ({
  countryCode: "JP", legalityStatus: "기능성표시식품 신고 가능", usable: true, approvalType: "機能性表示食品 (FFC, 신고제)",
  legality: "최종제품 임상 또는 SR(체계적 문헌고찰) 근거로 소비자청 신고", allowedClaims: [claim],
  facilityRequirements: "GMP — 2024 붉은누룩 사건 이후 강화, 2026-09 전환 기한", registrationDuration: "FFC 등록 최소 6개월", ...CAA,
});

export const INGREDIENTS: IngredientSeed[] = [
  {
    slug: "magnesium", nameKo: "마그네슘", nameEn: "Magnesium", nameScientific: "Mg", aliases: ["Magnesium citrate", "Magnesium oxide", "Magnesium glycinate", "마그네슘 시트레이트"],
    intakeMin: 94.5, intakeMax: 250, intakeUnit: "mg",
    category: "비타민·미네랄", functionality: ["수면", "근육", "에너지"], dosageForms: ["정제", "캡슐", "분말"],
    descriptionKo: "2025년 국내 시장 +58.3%(3,000→4,750억 원) 성장한 대표 미네랄. 수면·근육 기능 소구로 브랜드 신제품이 집중되는 원료.",
    dailyIntake: "KR 94.5–250 mg · US supplemental UL 350 mg", caution: "고용량 섭취 시 묽은 변. 일부 항생제와 병용 주의.",
    statuses: [
      KR_NOTIFIED({ original: "근육 기능 유지에 필요", translated: "근육 기능 유지에 필요 / 에너지 이용에 필요" }),
      US_GRANDFATHERED({ original: "Supports normal muscle function*", translated: "정상적인 근육 기능을 돕습니다* (DSHEA 면책문구 필요)" }),
      EU_AUTHORISED({ original: "Magnesium contributes to normal muscle function", translated: "마그네슘은 정상적인 근육 기능에 기여합니다" }),
      JP_FFC({ original: "マグネシウムは、骨や歯の形成に必要な栄養素です", translated: "마그네슘은 뼈와 치아 형성에 필요한 영양소입니다 (영양기능식품 표시)" }),
      CN_BLUEHAT,
    ],
    supplierSlugs: ["novarex", "kolmar-bnh", "jiangxi-mineral"],
  },
  {
    slug: "vitamin-d", nameKo: "비타민D", nameEn: "Vitamin D", nameScientific: "Cholecalciferol (D3)", aliases: ["Vitamin D3", "Ergocalciferol", "콜레칼시페롤"],
    intakeMin: 5, intakeMax: 10, intakeUnit: "µg",
    category: "비타민·미네랄", functionality: ["뼈건강", "면역"], dosageForms: ["정제", "캡슐", "액상"],
    descriptionKo: "2025년 +53.4%(1,760→2,700억 원). 비타민·미네랄이 홍삼을 처음으로 추월한 해의 주역.",
    dailyIntake: "KR 5–10 µg · EU NRV 5 µg", caution: "지용성 — 누적 섭취량 모니터링.",
    statuses: [
      KR_NOTIFIED({ original: "칼슘과 인이 흡수되고 이용되는데 필요", translated: "칼슘과 인이 흡수되고 이용되는데 필요 / 뼈의 형성과 유지에 필요" }),
      US_GRANDFATHERED({ original: "Supports bone health*", translated: "뼈 건강을 돕습니다*" }),
      EU_AUTHORISED({ original: "Vitamin D contributes to the normal function of the immune system", translated: "비타민D는 면역계의 정상적인 기능에 기여합니다" }),
    ],
    supplierSlugs: ["novarex", "deccan-botanicals"],
  },
  {
    slug: "omega-3", nameKo: "오메가3", nameEn: "Omega-3", nameScientific: "EPA + DHA", aliases: ["Fish oil", "Algal oil", "rTG 오메가3", "EPA 및 DHA 함유 유지"],
    intakeMin: 500, intakeMax: 2000, intakeUnit: "mg", intakeBasis: "EPA+DHA 합",
    category: "지방산", functionality: ["혈행", "눈건강", "기억력"], dosageForms: ["연질캡슐", "액상"],
    descriptionKo: "2025년 +45.7% 성장. rTG·초임계 추출 등 원료 등급 경쟁이 치열하며 식물성(조류) 원료 수요 증가.",
    dailyIntake: "KR EPA+DHA 합으로 500–2,000 mg", caution: "항응고제 복용 시 의사 상담.",
    statuses: [
      KR_NOTIFIED({ original: "혈중 중성지질 개선·혈행 개선에 도움을 줄 수 있음", translated: "혈중 중성지질 개선·혈행 개선·건조한 눈 개선·기억력 개선에 도움을 줄 수 있음" }),
      US_GRANDFATHERED({ original: "Supportive but not conclusive research shows that consumption of EPA and DHA omega-3 fatty acids may reduce the risk of coronary heart disease", translated: "제한적 근거에 따르면 EPA·DHA 섭취가 관상동맥질환 위험을 낮출 수 있음 (Qualified health claim)" }),
      EU_AUTHORISED({ original: "EPA and DHA contribute to the normal function of the heart", translated: "EPA와 DHA는 심장의 정상적인 기능에 기여합니다" }, { legality: "허용 — 조류(algal) 유래 일부 균주는 Novel Food 확인 필요" }),
    ],
    supplierSlugs: ["epax-nordic", "kolmar-bnh"],
  },
  {
    slug: "lutein", nameKo: "루테인", nameEn: "Lutein", nameScientific: "Tagetes erecta extract", aliases: ["Marigold extract", "마리골드꽃추출물", "Lutein esters", "지아잔틴"],
    intakeMin: 10, intakeMax: 20, intakeUnit: "mg", intakeBasis: "루테인",
    category: "식물추출물", functionality: ["눈건강"], dosageForms: ["연질캡슐", "정제"],
    descriptionKo: "황반색소밀도 유지 기능성. 마리골드꽃추출물은 고시형이나, 특정 제제(루테인지아잔틴복합추출물 등)는 개별인정형으로 인정권자가 존재.",
    dailyIntake: "KR 루테인으로 10–20 mg", caution: "고용량 섭취 시 일시적 피부 황변 보고.",
    statuses: [
      KR_NOTIFIED({ original: "노화로 인해 감소될 수 있는 황반색소밀도를 유지하여 눈 건강에 도움을 줄 수 있음", translated: "노화로 인해 감소될 수 있는 황반색소밀도를 유지하여 눈 건강에 도움을 줄 수 있음" }, { legalityStatus: "고시형 (마리골드꽃추출물)", legality: "마리골드꽃추출물은 고시형. 루테인지아잔틴복합추출물 등 일부 제제는 개별인정형 — 인정번호별 인정권자 확인 필요" }),
      US_GRANDFATHERED({ original: "Supports eye health*", translated: "눈 건강을 돕습니다*" }),
      CN_BLUEHAT,
    ],
    supplierSlugs: ["deccan-botanicals", "novarex"],
  },
  {
    slug: "probiotics", nameKo: "프로바이오틱스", nameEn: "Probiotics", nameScientific: "Lactobacillus spp., Bifidobacterium spp.", aliases: ["유산균", "Lactic acid bacteria", "LAB", "생유산균"],
    intakeMin: 100000000, intakeMax: 10000000000, intakeUnit: "CFU",
    category: "프로바이오틱스", functionality: ["장건강", "면역"], dosageForms: ["스틱", "캡슐", "분말"],
    descriptionKo: "고시형 19개 균종. 균주별 개별인정(면역·체지방 등)이 활발해 인정권자 확인이 소싱의 핵심.",
    dailyIntake: "KR 1×10⁸ – 1×10¹⁰ CFU", caution: "면역저하자 주의.",
    statuses: [
      KR_NOTIFIED({ original: "유산균 증식 및 유해균 억제·배변활동 원활에 도움을 줄 수 있음", translated: "유산균 증식 및 유해균 억제·배변활동 원활·장 건강에 도움을 줄 수 있음" }, { legality: "공전 등재 19개 속·종은 고시형. 특정 균주의 추가 기능성(면역·체지방)은 개별인정형" }),
      US_GRANDFATHERED({ original: "Supports digestive health*", translated: "소화기 건강을 돕습니다*" }),
      JP_FFC({ original: "腸内環境を良好にし、お通じを改善する", translated: "장내 환경을 개선하고 배변을 돕습니다" }),
    ],
    supplierSlugs: ["cosmax-nbt", "novarex"],
  },
  {
    slug: "collagen-peptide", nameKo: "저분자콜라겐펩타이드", nameEn: "Low-molecular collagen peptide", nameScientific: "Hydrolysed collagen peptide", aliases: ["콜라겐", "Collagen tripeptide", "피쉬콜라겐"],
    category: "단백질·아미노산", functionality: ["피부"], dosageForms: ["스틱", "젤리", "액상"],
    descriptionKo: "2025년 -62.7% 급감한 쇠퇴 원료. 개별인정형으로 인정권자 제한. 재고 리스크 주의.",
    statuses: [
      KR_INDIVIDUAL({ original: "피부 보습에 도움을 줄 수 있음 (인정 건별 상이)", translated: "피부 보습·자외선에 의한 피부 손상으로부터 피부 건강 유지에 도움 (인정 건별 확인)" }, "정보 없음 — 인정번호별 확인 필요"),
      EU_AUTHORISED({ original: "정보 없음", translated: "정보 없음 — 콜라겐 관련 승인 헬스클레임 없음 (EU Register 확인)" }, { legalityStatus: "승인 클레임 없음", usable: true, legality: "식품보충제로 판매 가능하나 기능성 표현 불가" }),
    ],
    supplierSlugs: [],
  },
  {
    slug: "red-ginseng", nameKo: "홍삼", nameEn: "Red Ginseng", nameScientific: "Panax ginseng C.A. Meyer", aliases: ["홍삼농축액", "진세노사이드", "Korean red ginseng"],
    intakeMin: 3, intakeMax: 80, intakeUnit: "mg", intakeBasis: "진세노사이드 Rg1+Rb1+Rg3 합",
    category: "식물추출물", functionality: ["면역", "피로개선", "혈행", "기억력"], dosageForms: ["액상", "스틱", "캡슐", "정제"],
    descriptionKo: "2025년 -14.2%였으나 9,536억 원으로 여전히 단일 원료 1위. 원료 수급은 대형 인삼 조합·KGC 계열이 주도.",
    dailyIntake: "KR 진세노사이드 Rg1+Rb1+Rg3 합 3–80 mg", caution: "항응고제·혈당강하제 병용 시 주의.",
    statuses: [
      KR_NOTIFIED({ original: "면역력 증진·피로 개선·혈소판 응집 억제를 통한 혈액흐름·기억력 개선·항산화에 도움을 줄 수 있음", translated: "면역력 증진·피로 개선·혈행·기억력 개선·항산화에 도움" }),
      US_GRANDFATHERED({ original: "Supports immune health*", translated: "면역 건강을 돕습니다*" }),
      CN_BLUEHAT,
    ],
    supplierSlugs: ["kolmar-bnh", "cosmax-nbt"],
  },
  {
    slug: "milk-thistle", nameKo: "밀크씨슬 추출물", nameEn: "Milk Thistle Extract", nameScientific: "Silybum marianum", aliases: ["실리마린", "Silymarin", "카르두스 마리아누스"],
    intakeMin: 130, intakeMax: 130, intakeUnit: "mg", intakeBasis: "실리마린",
    category: "식물추출물", functionality: ["간건강"], dosageForms: ["정제", "캡슐"],
    descriptionKo: "간 건강 기능성 고시형 원료. 실리마린 130mg 규격이 표준. 인도·유럽 원료사 다수.",
    dailyIntake: "KR 실리마린으로 130 mg", caution: "국화과 알레르기 주의.",
    statuses: [
      KR_NOTIFIED({ original: "간 건강에 도움을 줄 수 있음", translated: "간 건강에 도움을 줄 수 있음" }),
      US_GRANDFATHERED({ original: "Supports liver health*", translated: "간 건강을 돕습니다*" }),
      EU_AUTHORISED({ original: "정보 없음", translated: "정보 없음 — 식물성(botanical) 클레임 다수 'on hold' 상태" }, { legalityStatus: "클레임 보류(on hold)", usable: true }),
    ],
    supplierSlugs: ["deccan-botanicals", "novarex"],
  },
  {
    slug: "vitamin-c", nameKo: "비타민C", nameEn: "Vitamin C", nameScientific: "L-Ascorbic acid", aliases: ["아스코르브산", "Ascorbic acid"],
    intakeMin: 30, intakeMax: 1000, intakeUnit: "mg",
    category: "비타민·미네랄", functionality: ["면역", "항산화", "피부"], dosageForms: ["정제", "분말", "구미"],
    descriptionKo: "가장 보편적인 비타민 원료. 중국산 아스코르브산이 가격 주도.",
    dailyIntake: "KR 30–1,000 mg", caution: "고용량 시 위장 장애.",
    statuses: [
      KR_NOTIFIED({ original: "결합조직 형성과 기능유지에 필요·철의 흡수에 필요·항산화 작용", translated: "결합조직 형성·철 흡수·유해산소로부터 세포 보호에 필요" }),
      US_GRANDFATHERED({ original: "Supports immune health*", translated: "면역 건강을 돕습니다*" }),
      EU_AUTHORISED({ original: "Vitamin C contributes to the normal function of the immune system", translated: "비타민C는 면역계의 정상적인 기능에 기여합니다" }),
    ],
    supplierSlugs: ["jiangxi-mineral", "novarex", "cosmax-nbt"],
  },
  {
    slug: "zinc", nameKo: "아연", nameEn: "Zinc", nameScientific: "Zn", aliases: ["징크", "Zinc gluconate", "Zinc picolinate"],
    intakeMin: 2.55, intakeMax: 12, intakeUnit: "mg",
    category: "비타민·미네랄", functionality: ["면역", "피부"], dosageForms: ["정제", "캡슐"],
    descriptionKo: "면역 소구 미네랄. 마그네슘·비타민D와 복합 설계가 흔함.",
    dailyIntake: "KR 2.55–12 mg", caution: "장기 고용량 시 구리 결핍.",
    statuses: [
      KR_NOTIFIED({ original: "정상적인 면역기능에 필요·정상적인 세포분열에 필요", translated: "정상적인 면역기능·세포분열에 필요" }),
      US_GRANDFATHERED({ original: "Supports immune function*", translated: "면역 기능을 돕습니다*" }),
      EU_AUTHORISED({ original: "Zinc contributes to the normal function of the immune system", translated: "아연은 면역계의 정상적인 기능에 기여합니다" }),
    ],
    supplierSlugs: ["jiangxi-mineral", "kolmar-bnh", "novarex"],
  },
  {
    slug: "coenzyme-q10", nameKo: "코엔자임Q10", nameEn: "Coenzyme Q10", nameScientific: "Ubiquinone", aliases: ["CoQ10", "유비퀴논", "Ubiquinol"],
    intakeMin: 90, intakeMax: 100, intakeUnit: "mg",
    category: "기타", functionality: ["항산화", "혈압"], dosageForms: ["연질캡슐"],
    descriptionKo: "항산화·높은 혈압 감소 고시형 원료. 일본 카네카 등 발효 원료가 프리미엄.",
    dailyIntake: "KR 90–100 mg", caution: "와파린 병용 시 주의.",
    statuses: [
      KR_NOTIFIED({ original: "항산화·높은 혈압 감소에 도움을 줄 수 있음", translated: "항산화·높은 혈압 감소에 도움을 줄 수 있음" }),
      US_GRANDFATHERED({ original: "Supports heart health*", translated: "심장 건강을 돕습니다*" }),
      JP_FFC({ original: "コエンザイムQ10は、細胞のエネルギー産生を助け、一過性の疲労感を軽減する", translated: "코엔자임Q10은 세포 에너지 생성을 도와 일시적 피로감을 줄입니다" }),
    ],
    supplierSlugs: ["kolmar-bnh"],
  },
  {
    slug: "glucosamine", nameKo: "글루코사민", nameEn: "Glucosamine", nameScientific: "Glucosamine sulfate / HCl", aliases: ["글루코사민황산염", "Glucosamine sulfate"],
    intakeMin: 1500, intakeMax: 2000, intakeUnit: "mg", intakeBasis: "글루코사민",
    category: "기타", functionality: ["관절"], dosageForms: ["정제"],
    descriptionKo: "2025년 -55% 급감한 쇠퇴 원료. 관절 소구는 MSM·보스웰리아 등으로 이동 중.",
    dailyIntake: "KR 글루코사민으로 1.5–2 g", caution: "갑각류 알레르기 주의.",
    statuses: [
      KR_NOTIFIED({ original: "관절 및 연골 건강에 도움을 줄 수 있음", translated: "관절 및 연골 건강에 도움을 줄 수 있음" }),
      US_GRANDFATHERED({ original: "Supports joint health*", translated: "관절 건강을 돕습니다*" }),
      EU_AUTHORISED({ original: "정보 없음", translated: "정보 없음 — 관절 관련 클레임 반려 이력 (EFSA)" }, { legalityStatus: "승인 클레임 없음", usable: true }),
    ],
    supplierSlugs: ["jiangxi-mineral"],
  },
  {
    slug: "krill-oil", nameKo: "크릴오일", nameEn: "Krill Oil", nameScientific: "Euphausia superba oil", aliases: ["남극크릴오일", "인지질 오메가3"],
    category: "지방산", functionality: ["혈행"], dosageForms: ["연질캡슐"],
    descriptionKo: "2020년 국내에서는 건강기능식품이 아닌 일반식품으로 분류 정리. 기능성 표시 불가 — 소싱 전 규제 확인 필수.",
    statuses: [
      { countryCode: "KR", legalityStatus: "건기식 원료 아님", usable: false, approvalType: "일반식품(어유)", legality: "국내에서는 건강기능식품 기능성 원료로 인정되지 않음 — 기능성 표시·광고 불가. 오메가3(EPA·DHA 함유 유지) 규격 충족 시에만 해당 원료로 신고 가능", ...MFDS },
      US_GRANDFATHERED({ original: "Supports heart health*", translated: "심장 건강을 돕습니다*" }),
      EU_AUTHORISED({ original: "Novel Food authorised (krill oil, 2009)", translated: "Novel Food 인가 원료 — 인가 조건(인지질 함량 등) 준수 필요" }, { legalityStatus: "Novel Food 인가 원료", approvalType: "Novel Food (인가 완료)" }),
    ],
    supplierSlugs: ["epax-nordic"],
  },
  {
    slug: "hyaluronic-acid", nameKo: "히알루론산", nameEn: "Hyaluronic Acid", nameScientific: "Sodium hyaluronate", aliases: ["히알루론산나트륨", "HA"],
    intakeMin: 120, intakeMax: 240, intakeUnit: "mg",
    category: "기타", functionality: ["피부"], dosageForms: ["정제", "스틱"],
    descriptionKo: "피부 보습 고시형 원료. 저분자 발효 원료(일본·중국) 수급.",
    dailyIntake: "KR 120–240 mg", caution: "정보 없음",
    statuses: [
      KR_NOTIFIED({ original: "피부 보습에 도움을 줄 수 있음", translated: "피부 보습·자외선에 의한 피부 손상으로부터 피부 건강 유지에 도움" }),
      JP_FFC({ original: "肌の水分保持に役立つ", translated: "피부 수분 보유에 도움을 줍니다" }),
      CN_BLUEHAT,
    ],
    supplierSlugs: ["cosmax-nbt", "jiangxi-mineral"],
  },
];

export type SupplierSeed = {
  slug: string; nameKo: string; nameEn?: string; countryCode: string; supplierTypes: string[]; dosageForms: string[]; certifications: string[];
  moqMin?: number; moqUnit?: string; leadWeeksMin?: number; leadWeeksMax?: number; verificationStatus: "verified" | "unverified" | "self_registered";
  description: string; foundedYear?: number; capacity?: string;
};

export const SUPPLIERS: SupplierSeed[] = [
  { slug: "novarex", nameKo: "노바렉스", nameEn: "Novarex", countryCode: "KR", supplierTypes: ["ODM"], dosageForms: ["정제", "캡슐", "스틱"], certifications: ["GMP", "HACCP", "ISO22000"], moqMin: 1000, moqUnit: "개", leadWeeksMin: 8, leadWeeksMax: 12, verificationStatus: "verified", description: "2025년 국내 건기식 생산실적 1위(3,503억 원, 점유율 12.4%) ODM 전업사. 개별인정 원료 다수 보유.", foundedYear: 2008, capacity: "연 1조 원 규모 생산능력 (오송·오창)" },
  { slug: "kolmar-bnh", nameKo: "콜마비앤에이치", nameEn: "Kolmar BNH", countryCode: "KR", supplierTypes: ["ODM"], dosageForms: ["정제", "연질캡슐", "액상"], certifications: ["GMP", "HACCP", "cGMP"], moqMin: 3000, moqUnit: "개", leadWeeksMin: 8, leadWeeksMax: 12, verificationStatus: "verified", description: "생산실적 2위(2,541억 원). 헤모힘 등 개별인정 원료와 연질캡슐 라인 강점.", foundedYear: 2004 },
  { slug: "cosmax-nbt", nameKo: "코스맥스엔비티", nameEn: "Cosmax NBT", countryCode: "KR", supplierTypes: ["OEM", "ODM"], dosageForms: ["구미", "젤리", "정제", "스틱"], certifications: ["GMP", "HACCP", "할랄"], moqMin: 5000, moqUnit: "개", leadWeeksMin: 14, leadWeeksMax: 16, verificationStatus: "verified", description: "구미·젤리스틱 등 신제형 강점. 미국·호주 현지 공장 보유로 수출 브랜드에 유리.", foundedYear: 2002 },
  { slug: "jiangxi-mineral", nameKo: "장시 미네랄 웍스", nameEn: "Jiangxi Mineral Works", countryCode: "CN", supplierTypes: ["원료공급"], dosageForms: ["분말"], certifications: ["ISO22000", "코셔"], moqMin: 500, moqUnit: "kg", leadWeeksMin: 4, leadWeeksMax: 6, verificationStatus: "unverified", description: "마그네슘·아연·비타민C 등 베이스 미네랄 원료. 가격 경쟁력 중심. 공개 정보 기반 등록 — 인증서 미확인.", },
  { slug: "deccan-botanicals", nameKo: "데칸 보타니컬스", nameEn: "Deccan Botanicals", countryCode: "IN", supplierTypes: ["원료공급"], dosageForms: ["분말"], certifications: ["cGMP", "유기농", "할랄"], moqMin: 100, moqUnit: "kg", leadWeeksMin: 6, leadWeeksMax: 8, verificationStatus: "self_registered", description: "루테인·밀크씨슬 등 식물추출물 전문. 공급사가 직접 등록·관리 중.", foundedYear: 2011 },
  { slug: "epax-nordic", nameKo: "에팍스 노르딕", nameEn: "Epax Nordic", countryCode: "EU", supplierTypes: ["원료공급"], dosageForms: ["액상", "연질캡슐"], certifications: ["FSSC22000", "GMP", "Friend of the Sea"], moqMin: 200, moqUnit: "kg", leadWeeksMin: 6, leadWeeksMax: 8, verificationStatus: "verified", description: "노르웨이 고농축 오메가3·크릴오일 원료사. rTG 85% 이상 규격.", foundedYear: 1838 },
  { slug: "seoul-capsule", nameKo: "서울캡슐", nameEn: "Seoul Capsule", countryCode: "KR", supplierTypes: ["부자재"], dosageForms: ["캡슐", "연질캡슐"], certifications: ["GMP", "할랄"], moqMin: 100000, moqUnit: "개", leadWeeksMin: 2, leadWeeksMax: 4, verificationStatus: "unverified", description: "경질·연질 공캡슐 및 식물성 캡슐 부자재. 소량 발주는 대리점 경유.", },
  { slug: "green-lab-smallbatch", nameKo: "그린랩 스몰배치", nameEn: "Green Lab Smallbatch", countryCode: "KR", supplierTypes: ["OEM"], dosageForms: ["스틱", "분말", "액상"], certifications: ["GMP", "HACCP"], moqMin: 500, moqUnit: "개", leadWeeksMin: 4, leadWeeksMax: 6, verificationStatus: "self_registered", description: "인플루언서·D2C 브랜드 대상 소량(500개~) 위탁 제조. 스틱·분말 전문.", foundedYear: 2019 },
  { slug: "tokyo-ferment", nameKo: "도쿄 퍼먼트", nameEn: "Tokyo Ferment Co.", countryCode: "JP", supplierTypes: ["원료공급"], dosageForms: ["분말"], certifications: ["FSSC22000", "GMP"], moqMin: 50, moqUnit: "kg", leadWeeksMin: 8, leadWeeksMax: 10, verificationStatus: "unverified", description: "발효 히알루론산·코엔자임Q10 원료. 일본 FFC 신고 실적 다수.", },
  { slug: "pacific-agency", nameKo: "퍼시픽 원료 에이전시", nameEn: "Pacific Ingredient Agency", countryCode: "KR", supplierTypes: ["수입에이전시"], dosageForms: [], certifications: ["수입판매업 등록"], leadWeeksMin: 3, leadWeeksMax: 6, verificationStatus: "verified", description: "해외 원료사 국내 수입·해외제조업소 등록 대행. 소량 샘플 수입 가능.", foundedYear: 2015 },
];

export const SETTINGS = [
  { key: "mfdsApiKey", value: "" },
];
