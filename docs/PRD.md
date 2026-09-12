# PRD — 건강기능식품 정보 수집 및 판매 유망 제품 수배 시스템

| 항목 | 내용 |
|---|---|
| 문서 버전 | v0.1 (초안) |
| 작성일 | 2026-09-12 |
| 상태 | 검토 대기 |
| 관련 문서 | [BRD.md](./BRD.md) |

---

## 1. 개요 (Overview)

식약처 공공데이터와 네이버 쇼핑 시장 데이터를 키워드 단위로 수집하고, 가중치 기반 점수로 **판매 유망 건기식 후보**를 정렬·필터링해서 보여주는 Next.js 웹 애플리케이션. 관리자 페이지에서 수집을 실행하고 데이터와 점수 기준을 관리한다.

### 1.1 기술 스택 (확정)

| 영역 | 선택 | 비고 |
|---|---|---|
| 프레임워크 | Next.js (App Router, TypeScript) | Server Actions + Route Handlers |
| 스타일 | Tailwind CSS | |
| DB | SQLite + Prisma ORM | 추후 PostgreSQL 전환 가능 |
| 외부 API | 식약처 공공데이터 API, 네이버 쇼핑 검색 API | 키는 `.env`로 관리 |
| 인증 | 없음 (1차) | 2차에서 NextAuth 또는 환경변수 비밀번호 검토 |
| 실행 환경 | 로컬 (macOS) | Node.js 20 LTS 이상 |

## 2. 사용자 (Users)

| 페르소나 | 설명 | 주요 행동 |
|---|---|---|
| 소싱 담당자 | 판매할 건기식을 찾는 사람 | 점수순 목록 조회, 필터, 상세 확인, 후보 표시 |
| 관리자 | 데이터와 기준을 관리하는 사람 (1차에서는 소싱 담당자와 동일인일 수 있음) | 수집 실행, 제품 수정, 가중치 조정, 로그 확인 |

## 3. 사용자 스토리 (User Stories)

| ID | 스토리 | 우선순위 |
|---|---|---|
| US-01 | 소싱 담당자로서, 키워드("오메가3", "밀크씨슬")를 입력해 관련 제품을 한 번에 수집하고 싶다 | 필수 |
| US-02 | 소싱 담당자로서, 수집된 제품을 판매 유망 점수 순으로 보고 싶다 | 필수 |
| US-03 | 소싱 담당자로서, 기능성 원료·카테고리·가격대로 목록을 좁히고 싶다 | 필수 |
| US-04 | 소싱 담당자로서, 제품 하나를 클릭하면 식약처 정보와 시장 정보를 한 화면에서 보고 싶다 | 필수 |
| US-05 | 소싱 담당자로서, 괜찮아 보이는 제품을 "후보"로 표시하고 메모를 남기고 싶다 | 필수 |
| US-06 | 관리자로서, 점수 산정 가중치를 화면에서 바꾸고 결과가 바로 반영되는 것을 보고 싶다 | 필수 |
| US-07 | 관리자로서, 잘못 수집된 제품을 수정하거나 삭제하고 싶다 | 필수 |
| US-08 | 관리자로서, 수집이 언제 실행됐고 몇 건이 들어왔는지 확인하고 싶다 | 필수 |
| US-09 | 소싱 담당자로서, 후보 목록을 CSV로 내보내고 싶다 | 선택 |

## 4. 기능 요구사항 (Functional Requirements)

### 4.1 데이터 수집 (Collector)

| ID | 요구사항 |
|---|---|
| FR-01 | 관리자 페이지에서 키워드를 입력하고 "수집 실행"을 누르면 식약처 API와 네이버 쇼핑 API를 순차 호출한다 |
| FR-02 | 식약처 API 결과에서 제품명, 업체명, 품목제조신고번호, 기능성 원료, 주된 기능성, 섭취 방법, 신고일을 저장한다 |
| FR-03 | 네이버 쇼핑 API 결과에서 상품명, 최저가, 최고가, 판매몰명, 브랜드, 제조사, 카테고리(1~4), 상품 링크, 이미지, 검색 결과 총 건수를 저장한다 |
| FR-04 | 동일 키워드·동일 신고번호(식약처) 또는 동일 productId(네이버)는 중복 저장하지 않고 갱신한다 (upsert) |
| FR-05 | 수집 1회당 `CollectJob` 레코드를 생성하고 시작/종료 시각, 키워드, 소스별 수집 건수, 상태(성공/부분성공/실패), 에러 메시지를 기록한다 |
| FR-06 | 외부 API 오류 시 해당 소스만 실패 처리하고 나머지 소스 결과는 저장한다 (부분성공) |
| FR-07 | 키워드당 네이버 API 호출은 최대 N페이지(기본 3페이지 × 100건)로 제한한다 |
| FR-08 | 수집 완료 후 해당 키워드의 모든 제품 점수를 재계산한다 |

### 4.2 제품 목록 / 상세 (사용자 화면)

| ID | 요구사항 |
|---|---|
| FR-10 | `/` 메인은 점수 내림차순 제품 목록을 표시한다 (제품명, 브랜드/업체, 기능성 원료, 최저가, 판매몰 수, 점수, 후보 여부) |
| FR-11 | 검색창(제품명·업체·원료), 필터(카테고리, 기능성 원료, 가격대, 점수 범위, 후보만 보기), 정렬(점수, 최저가, 최근 수집)을 제공한다 |
| FR-12 | 페이지네이션(기본 20건) |
| FR-13 | `/products/[id]` 상세는 식약처 정보 블록, 시장 정보 블록(가격·판매몰·링크), 점수 상세(지표별 기여도), 관리자 메모를 보여준다 |
| FR-14 | 상세에서 "후보 표시/해제"와 메모 저장이 가능하다 (관리자 페이지 이동 없이) |

### 4.3 점수 엔진 (Scoring)

| ID | 요구사항 |
|---|---|
| FR-20 | 지표별 0~1 정규화 값에 가중치를 곱해 합산 후 0~100으로 환산한다 |
| FR-21 | 가중치는 DB(`ScoreWeight`)에 저장하며 관리자 화면에서 수정 가능하다 |
| FR-22 | 가중치 변경 시 전체 제품 점수를 재계산한다 |
| FR-23 | 상세 화면에서 지표별 원시값·정규화값·기여 점수를 표로 보여준다 |

#### 점수 지표 (1차)

| 지표 키 | 의미 | 원시값 출처 | 방향 | 기본 가중치 |
|---|---|---|---|---|
| `demand` | 시장 수요 | 네이버 검색 결과 총 건수 (log 스케일) | 높을수록 ↑ | 25 |
| `competition` | 경쟁 강도 | 동일 키워드 내 상품 수 / 판매몰 수 | 낮을수록 ↑ (역방향) | 20 |
| `priceMargin` | 가격 여지 | (최고가 − 최저가) / 최저가 | 높을수록 ↑ | 15 |
| `priceBand` | 가격대 적정성 | 최저가가 목표 가격대(설정값, 기본 1~5만원)에 속하는지 | 속하면 1, 벗어나면 거리 비례 감점 | 15 |
| `certified` | 식약처 등록 신뢰도 | 신고번호 존재 여부 + 동일 원료 등록 업체 수 | 높을수록 ↑ | 15 |
| `ingredientTrend` | 원료 관심도 | 관리자가 원료별로 입력하는 1~5 값 (기본 3) | 높을수록 ↑ | 10 |

- 정규화: 각 지표는 현재 DB 전체 제품 기준 min–max 정규화 (`demand`는 `log10(total+1)` 후 정규화).
- 결측 지표는 0.5(중립)로 처리하고 상세에 "데이터 없음"으로 표시한다.
- 최종 점수 = `Σ(가중치_i × 정규화값_i) / Σ(가중치_i) × 100`, 소수점 1자리.

### 4.4 관리자 페이지 (`/admin`)

| ID | 요구사항 |
|---|---|
| FR-30 | `/admin` 대시보드: 총 제품 수, 후보 수, 최근 수집 5건, 실패 수집 건수 |
| FR-31 | `/admin/collect`: 키워드 입력(여러 개 줄바꿈 구분), 소스 선택(식약처/네이버/둘 다), 실행 버튼, 실행 중 진행 상태 표시 |
| FR-32 | `/admin/products`: 제품 테이블(인라인 편집: 제품명, 브랜드, 원료, 카테고리, 리뷰수·평점 수동 입력), 삭제, 후보 토글, 일괄 삭제 |
| FR-33 | `/admin/weights`: 지표별 가중치 슬라이더/숫자 입력, 목표 가격대 설정, 원료별 관심도(1~5) 입력, 저장 시 재계산 |
| FR-34 | `/admin/jobs`: 수집 로그 테이블(시각, 키워드, 소스별 건수, 상태, 에러), 실패 건 재실행 버튼 |
| FR-35 | 인증 없음. 단, 향후 미들웨어 한 곳에서 보호할 수 있도록 `/admin/*` 경로를 라우트 그룹으로 분리한다 |

### 4.5 내보내기 (선택)

| ID | 요구사항 |
|---|---|
| FR-40 | 현재 필터가 적용된 목록을 CSV(UTF-8 BOM)로 다운로드한다 |

## 5. 데이터 모델 (Data Model)

Prisma 스키마 초안. SQLite 기준이며 PostgreSQL로 전환 시 `provider`만 변경.

```prisma
model Product {
  id              Int       @id @default(autoincrement())
  keyword         String                     // 수집 시 사용한 키워드
  name            String
  brand           String?
  maker           String?
  category        String?                    // 네이버 category1~4를 " > "로 결합
  ingredient      String?                    // 기능성 원료(식약처 RAWMTRL_NM 또는 관리자 입력)
  functionality   String?                    // 주된 기능성

  // 식약처
  mfdsReportNo    String?   @unique          // 품목제조신고번호
  mfdsCompany     String?
  mfdsReportDate  String?
  intakeMethod    String?

  // 시장 (네이버)
  naverProductId  String?   @unique
  lowestPrice     Int?
  highestPrice    Int?
  mallName        String?
  mallCount       Int?                       // 동일 상품 판매몰 수(집계)
  searchTotal     Int?                       // 키워드 검색 결과 총 건수
  productUrl      String?
  imageUrl        String?

  // 수동 입력
  reviewCount     Int?
  rating          Float?

  // 점수/관리
  score           Float?    
  scoreDetail     String?                    // JSON: 지표별 원시값/정규화값/기여도
  isCandidate     Boolean   @default(false)
  memo            String?
  source          String                     // "mfds" | "naver" | "merged"
  collectedAt     DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([keyword])
  @@index([score])
  @@index([isCandidate])
}

model ScoreWeight {
  key         String  @id                    // demand, competition, ...
  label       String
  weight      Int     @default(10)           // 0~100
  direction   String  @default("asc")        // asc: 높을수록 좋음, desc: 낮을수록 좋음
  description String?
}

model IngredientTrend {
  ingredient  String  @id
  level       Int     @default(3)            // 1~5
  updatedAt   DateTime @updatedAt
}

model Setting {
  key   String @id                           // e.g. targetPriceMin, targetPriceMax, naverMaxPages
  value String
}

model CollectJob {
  id          Int      @id @default(autoincrement())
  keyword     String
  sources     String                          // "mfds,naver"
  status      String                          // pending | running | success | partial | failed
  mfdsCount   Int      @default(0)
  naverCount  Int      @default(0)
  error       String?
  startedAt   DateTime @default(now())
  finishedAt  DateTime?
}
```

## 6. 외부 연동 상세 (Integrations)

### 6.1 식약처 — 식품안전나라 Open API (권장)

- 발급: https://www.foodsafetykorea.go.kr/api/ (식품안전나라 회원가입 후 인증키 발급)
- 서비스: **C003 — 건강기능식품 품목제조신고사항**
- 호출 형식: `https://openapi.foodsafetykorea.go.kr/api/{KEY}/C003/json/{startIdx}/{endIdx}/PRDLST_NM={키워드}`
- 주요 응답 필드(확인 필요): `PRDLST_NM`(제품명), `BSSH_NM`(업체명), `PRDLST_REPORT_NO`(신고번호), `PRIMARY_FNCLTY`(주된 기능성), `RAWMTRL_NM`(원재료/기능성 원료), `NTK_MTHD`(섭취 방법), `PRMS_DT`(신고일)
- 한도: 1회 최대 1,000건, 일일 호출 제한은 발급 시 안내 확인
- 대안: 공공데이터포털 `HtfsInfoService03/getHtfsItem01` (필드명 다름, 어댑터로 흡수)

> 필드명은 발급 후 실제 응답으로 반드시 검증한다. 어댑터(`lib/collectors/mfds.ts`) 한 곳에서만 필드를 매핑한다.

### 6.2 네이버 쇼핑 검색 API

- 발급: https://developers.naver.com → 애플리케이션 등록 → "검색" API 사용 설정
- 호출: `GET https://openapi.naver.com/v1/search/shop.json?query={키워드}&display=100&start={1..1000}&sort=sim`
- 헤더: `X-Naver-Client-Id`, `X-Naver-Client-Secret`
- 응답: `total`, `items[]` — `title`(HTML 태그 포함, 제거 필요), `link`, `image`, `lprice`, `hprice`, `mallName`, `productId`, `productType`, `brand`, `maker`, `category1~4`
- 한도: 25,000회/일
- 제공하지 않는 것: 리뷰 수, 평점, 판매량 → 관리자 수동 입력 필드로 보완

### 6.3 환경변수

```
DATABASE_URL="file:./dev.db"
MFDS_API_KEY=
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
```

## 7. 화면 구성 (Screens)

```
/                       제품 목록 (점수순) + 검색/필터/정렬
/products/[id]          제품 상세 (식약처 · 시장 · 점수 상세 · 메모)
/admin                  관리자 대시보드
/admin/collect          수집 실행
/admin/products         제품 관리 (편집/삭제/후보)
/admin/weights          가중치 · 목표 가격대 · 원료 관심도
/admin/jobs             수집 로그
```

### 7.1 화면별 주요 요소

**목록 (`/`)**
- 상단: 검색창, 필터 바(카테고리, 원료, 가격대 슬라이더, 점수 범위, 후보만), 정렬 셀렉트, CSV 버튼(선택)
- 본문: 테이블 또는 카드 — 썸네일, 제품명(링크), 브랜드/업체, 원료, 최저가, 판매몰 수, 점수 배지(색상: 80↑ 초록 / 60↑ 노랑 / 그 외 회색), 후보 별표
- 하단: 페이지네이션

**상세 (`/products/[id]`)**
- 헤더: 제품명, 점수 배지, 후보 토글 버튼
- 좌: 식약처 정보 카드 (신고번호, 업체, 원료, 기능성, 섭취방법, 신고일)
- 우: 시장 정보 카드 (최저/최고가, 판매몰, 검색 결과 수, 상품 링크, 이미지)
- 하: 점수 상세 표 (지표 / 원시값 / 정규화 / 가중치 / 기여점수), 메모 textarea + 저장

**관리자 — 수집 (`/admin/collect`)**
- 키워드 textarea(줄바꿈 구분), 소스 체크박스, 실행 버튼
- 실행 결과 영역: 키워드별 진행/완료/실패 상태, 건수

**관리자 — 가중치 (`/admin/weights`)**
- 지표별 행: 라벨, 설명, 가중치 입력(0~100), 방향 표시
- 목표 가격대 min/max 입력
- 원료 관심도 표: 원료명, 1~5 셀렉트
- 저장 → 재계산 후 토스트

## 8. API / Server Action 설계

| 종류 | 경로/이름 | 설명 |
|---|---|---|
| Route Handler | `POST /api/collect` | `{ keywords: string[], sources: ("mfds"\|"naver")[] }` → 수집 실행, `CollectJob[]` 반환 |
| Route Handler | `GET /api/products` | 목록 조회 (query: q, category, ingredient, priceMin, priceMax, scoreMin, candidate, sort, page) |
| Route Handler | `GET /api/products/export` | CSV 다운로드 (선택) |
| Server Action | `updateProduct(id, data)` | 제품 필드 수정 |
| Server Action | `deleteProducts(ids)` | 삭제 |
| Server Action | `toggleCandidate(id)` | 후보 토글 |
| Server Action | `saveMemo(id, memo)` | 메모 저장 |
| Server Action | `saveWeights(weights, settings, trends)` | 가중치·설정 저장 후 `recalculateAll()` |
| Server Action | `rerunJob(jobId)` | 실패 수집 재실행 |

## 9. 비기능 요구사항 (Non-Functional)

| 항목 | 요구사항 |
|---|---|
| 성능 | 제품 1,000건 기준 목록 응답 < 500ms, 점수 전체 재계산 < 3초 |
| 안정성 | 외부 API 타임아웃 10초, 실패 시 1회 재시도, 부분성공 처리 |
| 로깅 | 수집 로그는 DB(`CollectJob`), 서버 에러는 콘솔 |
| 보안 | API 키는 `.env`, 클라이언트에 노출 금지. `/admin`은 1차에서 인증 없음(로컬 전용) |
| 이식성 | Prisma `provider` 변경만으로 PostgreSQL 전환 가능하도록 SQLite 전용 기능 사용 금지 |
| 접근성 | 키보드 조작 가능, 점수 배지는 색+숫자 병기 |

## 10. 프로젝트 구조 (제안)

```
src/
  app/
    page.tsx                    목록
    products/[id]/page.tsx      상세
    admin/
      layout.tsx                관리자 네비게이션
      page.tsx                  대시보드
      collect/page.tsx
      products/page.tsx
      weights/page.tsx
      jobs/page.tsx
    api/
      collect/route.ts
      products/route.ts
      products/export/route.ts
  lib/
    db.ts                       Prisma client
    collectors/
      mfds.ts                   식약처 어댑터
      naver.ts                  네이버 어댑터
      index.ts                  수집 오케스트레이션 + CollectJob 기록
    scoring/
      metrics.ts                지표 계산
      normalize.ts
      score.ts                  최종 점수 + recalculateAll
    actions/                    Server Actions
  components/
prisma/
  schema.prisma
  seed.ts                       기본 가중치·설정 시드
```

## 11. 마일스톤

| 마일스톤 | 완료 기준 |
|---|---|
| M0 환경 구성 | Node.js 설치, `create-next-app`, Prisma 초기화, `.env` 세팅, API 키 발급 |
| M1 수집 | `/admin/collect`에서 키워드 실행 → DB에 Product/CollectJob 저장 확인 |
| M2 목록·점수 | `/`에서 점수순 목록 + 필터 동작, 상세 페이지 점수 상세 표시 |
| M3 관리자 | 제품 편집/삭제, 가중치 저장 후 재계산, 로그 조회 |
| M4 마무리 | CSV 내보내기, README, (선택) 인증 |

## 12. 오픈 이슈 (Open Issues)

| # | 이슈 | 결정 필요 시점 |
|---|---|---|
| 1 | 식약처 API를 식품안전나라(C003)로 할지 공공데이터포털로 할지 — 키 발급 편의성과 응답 필드로 결정 | M0 |
| 2 | 식약처 제품과 네이버 상품의 매칭 규칙 (제품명 유사도 vs 키워드 묶음만) — 1차는 키워드 묶음 | M1 |
| 3 | 리뷰수·평점 수동 입력을 1차에 포함할지 | M2 |
| 4 | `ingredientTrend` 관리 UI를 별도 페이지로 뺄지 가중치 페이지에 포함할지 | M3 |
| 5 | 관리자 인증 방식 (환경변수 비밀번호 vs NextAuth) | M4 |
