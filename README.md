# GlobalNutri Source

전 세계 건강기능식품 **원료·완제품 정보를 통합 검색**하고, 조건에 맞는 **공급사를 찾아 컨택 요청**을 보내는 원페이지 B2B 웹 서비스 (MVP). 요구사항: [docs/BRD.md](docs/BRD.md) · [docs/PRD.md](docs/PRD.md).

## 시작하기

```bash
npm install            # postinstall에서 prisma generate
cp .env.example .env
npm run db:migrate     # SQLite (prisma/dev.db)
npm run db:seed        # 원료 40종 + 국가별 규제 상태 + 근거·상호작용 + 공급사 10곳 (큐레이션 초기 데이터)
npm run dev            # http://localhost:3000
```

## 화면

| 경로 | 설명 |
|---|---|
| `/` | 원페이지: Hero 검색 → 원료·제품 탐색 → 공급사 디렉터리 → 트렌드 → 규제 가이드 → 공급사 등록 CTA |
| `/?ingredient=<slug>` | 원료 상세 패널 (기본 정보 / 국가별 상태 5축 / 취급 공급사 → 일괄 문의) |
| `/?supplier=<slug>` | 공급사 상세 패널 |
| `/?contact=<id,id>` | 컨택 요청 모달 (`contact=sourcing` = 운영팀 소싱 지원) |
| `/?apply=1` | 공급사 등록 신청 모달 |
| `/ingredient/<slug>`, `/supplier/<slug>` | SEO용 개별 URL — 패널이 열린 상태로 원페이지 렌더 |
| `/discover` | **목표 → 조합 탐색**: 기능성 목표 선택 → 근거(A~D)·기전·규제 상태별 후보 원료 → 조합 자동 생성·점수화(근거 35 · 기전 상보성 20 · 상호작용 ± · 규제 ±15/−40 · 공급 5 · 시장 포화 −15) → 배합 설계로 전송. 고정/제외, 부 목표, 조합 크기 조절 |
| `/formulate`, `/formulate/<slug>` | **배합 설계**: 원료 조합 → 국가별 사용 가능 여부·함량 범위(KR 일일섭취량)·허용 표현 문구·공급사 매칭 실시간 체크 → 저장(공유 링크) → 매칭 공급사에 배합표 첨부 견적 요청 |
| `/admin` | 백오피스 (인증 없음, 로컬 전용): 원료 큐레이션, 공급사·검증 배지, 컨택 요청 워크플로우, 공급사 신청 승인, 배합 설계 현황(원료 수요 신호), 정보 요청·오류 신고, 식약처 동기화 |

필터·패널 상태는 모두 쿼리스트링에 반영되어 링크 공유 시 재현됩니다. 비교 트레이(최대 3개)만 클라이언트 상태입니다.

## 데이터

- **L1 공공 DB**: 식품안전나라 C003(품목제조신고) → `MfdsProduct` 원본 보존, 원료 사전(이름·별칭)과 자동 매핑. 미매칭은 `/admin/sync` 큐에서 수동 연결. API 키는 `/admin/sync`에서 입력.
- **L2 공급사 등록**: `/?apply=1` 신청 → 관리자 승인 → `공식 등록` 프로필 생성.
- **L3 큐레이션**: `prisma/seed-data.ts` 초기 데이터 + `/admin/ingredients` 오버레이 편집. 규제 문구는 `공개` 체크 전 비노출.
- 트렌드·규제 가이드는 정적 콘텐츠 (`src/lib/content/`). 모든 항목에 출처·확인일 표기.

## 구조

```
prisma/schema.prisma          Ingredient · RegulatoryStatus(5축) · Supplier · SupplierIngredient · MfdsProduct · ContactRequest · SupplierApplication · InfoRequest · IssueReport · SyncJob · Setting
src/lib/queries.ts            탐색/디렉터리 필터, 상세, 자동완성, 편집거리 유사 원료
src/lib/url.ts                쿼리스트링 토글/패널 상태
src/lib/formulation.ts        배합 체크 엔진 (규제 레벨 판정, 단위 환산·함량 범위, 상호작용, 공급사 매칭)
src/lib/discover.ts           조합 탐색 엔진 (원료×목표 근거, 원료×원료 상호작용, 조합 생성·점수화)
prisma/seed-evidence.ts       원료 26종 추가 + 근거 72건 + 상호작용 32건 (근거 링크는 PubMed 검색 — 운영자가 실제 논문으로 교체 전제)
src/lib/actions/public.ts     컨택 요청·공급사 신청·정보 요청·오류 신고 (Server Actions)
src/lib/actions/admin.ts      백오피스 액션
src/lib/collectors/           mfds.ts(필드 매핑 단일 지점) · sync.ts(동기화+원료 매핑)
src/components/sections/      Hero · Explore · Suppliers · Trends · Regulation · ForSuppliers
src/components/panels/        IngredientPanel · SupplierPanel · ContactModal · ApplyModal
```

## MVP에서 제외·단순화한 것

- 사용자 계정(FR-10)·이메일 발송: 컨택 폼에서 연락처를 직접 받고, 발송 제한(10건/일)은 이메일 기준. 공급사 전달·응답 기록은 관리자가 수동 처리.
- 검색 엔진(OpenSearch): SQLite `contains` + 편집거리 유사 추천으로 대체.
- 해외 DB(FDA/EFSA 등) 자동 연동: 국가별 상태는 큐레이션 입력. 식약처만 API 연동.
- 관리자 인증·2FA: 외부 공개 전 필수 (PRD 6.4).
