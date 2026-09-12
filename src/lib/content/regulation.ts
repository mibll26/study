/** FR-7 국가별 규제 가이드 — MVP: 한국 + 미국 (P1), EU·일본·중국은 요약만. 출처·확인일 필수. */
export type RegRow = { label: string; value: string };
export type RegGuide = { code: string; name: string; source: string; sourceUrl: string; verifiedAt: string; rows: RegRow[]; highlight?: { title: string; rows: RegRow[] } };

export const REGULATION: RegGuide[] = [
  {
    code: "KR", name: "한국", source: "식약처 · 식품안전나라 · 찾기쉬운 생활법령정보", sourceUrl: "https://impfood.mfds.go.kr/CFAAA01F01/?cvaaClsNo=1471000999101", verifiedAt: "2026-09-01",
    rows: [
      { label: "제도 개요", value: "고시형(공전 등재, 누구나 사용)과 개별인정형(인정받은 영업자만 사용) 이원 체계. 원료 사용 가능 여부는 이 구분에서 시작한다." },
      { label: "개별인정 절차", value: "신규 120일 / 변경 60일. 수수료 신규 190만 원 · 변경 80만 원. 제출자료 9종(기원·개발경위, 제조방법, 원료특성, 지표성분 규격·시험법, 유해물질 규격, 안전성, 기능성 입증, 섭취량 근거 등)." },
      { label: "독점 해제", value: "인정일 6년 경과 + 품목제조신고 50건 이상이면 고시형 전환. 2016년 기준 수립 이후 실제 전환은 2건뿐 — 개별인정 원료는 사실상 독점으로 본다." },
      { label: "영업 인허가", value: "제조업(허가) · 판매업(신고) · 수입·판매업(등록). 미등록 영업 시 5년 이하 징역 또는 5천만 원 이하 벌금." },
      { label: "표시·광고", value: "법정 표시사항만 표시하는 경우를 제외하고 사전심의 의무. 식약처 직접 심의 시 20일 이내 통지. 미심의 광고는 행정처분·과징금." },
      { label: "관할기관", value: "식품의약품안전처 (건강기능식품정책과) · 한국건강기능식품협회 (광고 심의)" },
    ],
    highlight: {
      title: "해외제조업소 등록 — 발주처가 가장 자주 막히는 지점",
      rows: [
        { label: "시점", value: "수입신고 전 필수" },
        { label: "처리·비용", value: "3일 · 수수료 없음 · 유효기간 2년" },
        { label: "등록 대상", value: "실제 제조시설 (수출·판매업체 아님). 소재지 불일치만으로도 허위신고 논란 사례 있음" },
        { label: "제출 서류", value: "수출국 정부 발행 허가·등록 증명 또는 HACCP / GMP / ISO22000 인증서" },
      ],
    },
  },
  {
    code: "US", name: "미국", source: "US FDA — Dietary Supplements / NDI", sourceUrl: "https://www.fda.gov/food/dietary-supplements/new-dietary-ingredient-ndi-notification-process", verifiedAt: "2026-09-01",
    rows: [
      { label: "제도 개요", value: "DSHEA(1994). 1994-10-15 이전 유통 원료는 grandfathered — 사전 승인 없이 사용. 그 외는 New Dietary Ingredient." },
      { label: "신규 원료 (NDI)", value: "시판 75일 전 FDA에 NDI notification 제출. 안전성 근거 필요." },
      { label: "시설 요건", value: "FDA 식품시설 등록 (2년마다 갱신) + cGMP 21 CFR Part 111." },
      { label: "표시·광고", value: "Structure-function claim은 사전승인 불요, 단 DSHEA 면책문구(\"This statement has not been evaluated by the FDA…\") 필수. 질병 치료·예방 표현 금지." },
      { label: "소요·비용", value: "NDI 심사 75일. 시설등록 무료. cGMP 준수 비용은 제조사 부담." },
      { label: "관할기관", value: "FDA CFSAN (Office of Dietary Supplement Programs)" },
    ],
  },
  {
    code: "EU", name: "EU", source: "EUR-Lex Reg. 1924/2006 · EFSA", sourceUrl: "https://eur-lex.europa.eu/eli/reg/2006/1924/oj/eng", verifiedAt: "2026-09-01",
    rows: [
      { label: "제도 개요", value: "1997-05-15 이전 소비 이력이 없으면 Novel Food 인가 필요. 헬스클레임은 EU Register 등재 문구만 사용 가능." },
      { label: "소요", value: "EFSA 평가 12~18개월 + EC 승인 12~18개월 ≈ 3~5년. 평가 건 중 약 80% 반려. 식물성(botanical) 클레임 다수 'on hold'." },
      { label: "판매", value: "식품보충제는 회원국별 notification 별도." },
    ],
  },
  {
    code: "JP", name: "일본", source: "소비자청 機能性表示食品 届出情報", sourceUrl: "https://www.fld.caa.go.jp/caaks/cssc01/", verifiedAt: "2026-09-01",
    rows: [
      { label: "제도 개요", value: "機能性表示食品(FFC, 신고제)과 特定保健用食品(FOSHU, 허가제). FFC는 최종제품 임상 또는 SR(체계적 문헌고찰) 근거 제출." },
      { label: "GMP", value: "2024년 붉은누룩 사건 이후 GMP 요건 강화 — 2026년 9월 전환 기한." },
      { label: "소요", value: "FFC 등록 최소 6개월. '출시 60일 전 신고' 요건은 1차 출처 미확인 (정보 없음)." },
    ],
  },
  {
    code: "CN", name: "중국", source: "NMPA · GAC", sourceUrl: "https://www.nmpa.gov.cn", verifiedAt: "2026-09-01",
    rows: [
      { label: "제도 개요", value: "保健食品 '블루햇' — 등록(注册) vs 신고(备案) 이원화. 오프라인·Tmall 국내몰·병원 채널은 블루햇 필수." },
      { label: "우회 채널", value: "CBEC(Tmall Global 등)는 블루햇 불요 → CBEC로 2~3년 검증 후 주력 SKU만 블루햇 권장. 2026-06 GAC 280호령으로 CBEC 서류 요건 강화." },
      { label: "소요·비용", value: "수입제품 2~5년 · SKU당 USD 5만~20만." },
    ],
  },
];
