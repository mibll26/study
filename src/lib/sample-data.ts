import type { Prisma } from "@prisma/client";

/** 키 없이 화면을 확인할 수 있는 샘플 데이터 (키워드가 "[샘플]"로 시작). 가격·수치는 가상값. */
const kw = (k: string) => `[샘플] ${k}`;

export const SAMPLE_PRODUCTS: Prisma.ProductCreateInput[] = [
    { keyword: kw("오메가3"), name: "rTG 오메가3 1000mg 60캡슐", brand: "종근당건강", ingredient: "EPA 및 DHA 함유 유지", functionality: "혈중 중성지질 개선·혈행 개선", lowestPrice: 18900, highestPrice: 39000, mallCount: 12, searchTotal: 250000, naverProductId: "s1", mfdsReportNo: "S-0001", mfdsCompany: "종근당건강", source: "naver", category: "식품 > 건강식품 > 영양제 > 오메가3" },
    { keyword: kw("오메가3"), name: "초임계 알티지 오메가3 프리미엄", brand: "뉴트리원", ingredient: "EPA 및 DHA 함유 유지", lowestPrice: 62000, highestPrice: 65000, mallCount: 2, searchTotal: 250000, naverProductId: "s2", source: "naver", category: "식품 > 건강식품 > 영양제 > 오메가3" },
    { keyword: kw("오메가3"), name: "식물성 오메가3 알티지", brand: "네추럴라이즈", ingredient: "EPA 및 DHA 함유 유지", lowestPrice: 4900, highestPrice: 5200, mallCount: 30, searchTotal: 250000, naverProductId: "s3", source: "naver", category: "식품 > 건강식품 > 영양제 > 오메가3" },
    { keyword: kw("밀크씨슬"), name: "밀크씨슬 실리마린 130mg", brand: "뉴트리코어", ingredient: "밀크씨슬 추출물", functionality: "간 건강에 도움", lowestPrice: 14900, highestPrice: 32000, mallCount: 18, searchTotal: 98000, naverProductId: "s4", mfdsReportNo: "S-0004", mfdsCompany: "뉴트리코어", source: "naver", category: "식품 > 건강식품 > 영양제 > 밀크씨슬" },
    { keyword: kw("밀크씨슬"), name: "간에 좋은 밀크씨슬 플러스", brand: "GNM자연의품격", ingredient: "밀크씨슬 추출물", lowestPrice: 9900, highestPrice: 12000, mallCount: 40, searchTotal: 98000, naverProductId: "s5", source: "naver", category: "식품 > 건강식품 > 영양제 > 밀크씨슬" },
    { keyword: kw("프로바이오틱스"), name: "장 건강 프로바이오틱스 100억 CFU", brand: "락토핏", ingredient: "프로바이오틱스", functionality: "유산균 증식 및 유해균 억제·배변활동 원활", lowestPrice: 24900, highestPrice: 45000, mallCount: 25, searchTotal: 610000, naverProductId: "s6", mfdsReportNo: "S-0006", mfdsCompany: "종근당건강", source: "naver", category: "식품 > 건강식품 > 영양제 > 유산균" },
    { keyword: kw("프로바이오틱스"), name: "듀오락 생유산균", brand: "듀오락", ingredient: "프로바이오틱스", lowestPrice: 38000, highestPrice: 41000, mallCount: 8, searchTotal: 610000, naverProductId: "s7", source: "naver", category: "식품 > 건강식품 > 영양제 > 유산균" },
    { keyword: kw("홍삼"), name: "6년근 홍삼정 에브리타임", brand: "정관장", ingredient: "홍삼", functionality: "면역력 증진·피로 개선", lowestPrice: 45000, highestPrice: 89000, mallCount: 50, searchTotal: 1200000, naverProductId: "s8", mfdsReportNo: "S-0008", mfdsCompany: "한국인삼공사", source: "naver", category: "식품 > 건강식품 > 홍삼" },
    { keyword: kw("루테인"), name: "루테인 지아잔틴 164", brand: "안국건강", ingredient: "마리골드꽃추출물", functionality: "노화로 인해 감소될 수 있는 황반색소밀도 유지", lowestPrice: 16900, highestPrice: 29000, mallCount: 15, searchTotal: 150000, naverProductId: "s9", mfdsReportNo: "S-0009", mfdsCompany: "안국건강", source: "naver", category: "식품 > 건강식품 > 영양제 > 루테인" },
    { keyword: kw("루테인"), name: "루테인 (식약처 신고, 판매 정보 없음)", ingredient: "마리골드꽃추출물", functionality: "황반색소밀도 유지", mfdsReportNo: "S-0010", mfdsCompany: "코스맥스바이오", source: "mfds" },
];
