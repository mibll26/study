# 건기식 수배 시스템

건강기능식품 정보를 **식약처 공공데이터 API**와 **네이버 쇼핑 검색 API**에서 키워드 단위로 수집하고, 가중치 기반 점수로 판매 유망 후보를 정렬·필터링하는 Next.js 앱. 요구사항은 [docs/BRD.md](docs/BRD.md), [docs/PRD.md](docs/PRD.md) 참고.

## 시작하기

```bash
npm install            # postinstall에서 prisma generate 실행
cp .env.example .env   # API 키 입력
npm run db:migrate     # SQLite 마이그레이션 (prisma/dev.db 생성)
npm run db:seed        # 기본 가중치·설정 시드
npm run dev            # http://localhost:3000
```

### API 키 발급

| 키 | 발급처 | 용도 |
|---|---|---|
| `MFDS_API_KEY` | https://www.foodsafetykorea.go.kr/api/ (식품안전나라 → 인증키 발급) | C003 건강기능식품 품목제조신고사항 |
| `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET` | https://developers.naver.com → 애플리케이션 등록 → "검색" API | 쇼핑 검색 (가격·판매몰·경쟁 상품 수) |

키 없이도 화면은 열리지만, 수집 실행 시 해당 소스는 "실패"로 기록됩니다.

## 화면

| 경로 | 설명 |
|---|---|
| `/` | 제품 목록 (점수순), 검색·필터·정렬, CSV 내보내기 |
| `/products/[id]` | 식약처 정보 · 시장 정보 · 점수 상세 · 메모 |
| `/admin` | 관리자 대시보드 (인증 없음 — 로컬 전용) |
| `/admin/collect` | 키워드 입력 → 수집 실행 |
| `/admin/products` | 제품 편집(리뷰수·평점 수동 입력)/삭제/후보 표시 |
| `/admin/weights` | 지표 가중치, 목표 가격대, 원료 관심도 → 저장 시 전체 재계산 |
| `/admin/jobs` | 수집 로그, 실패 건 재실행 |

## 점수 산정

`src/lib/scoring/score.ts`. 지표별 원시값을 전체 제품 기준 min–max 정규화(0~1)한 뒤 가중 평균 × 100.

| 지표 | 원시값 | 방향 |
|---|---|---|
| 시장 수요 | log10(네이버 검색 결과 수 + 1) | 높을수록 ↑ |
| 경쟁 강도 | 동일 키워드 내 제품 수 | 낮을수록 ↑ |
| 가격 여지 | (최고가 − 최저가) / 최저가 | 높을수록 ↑ |
| 가격대 적정성 | 최저가가 목표 가격대에 속하면 1, 벗어나면 거리 비례 감점 | 높을수록 ↑ |
| 식약처 등록 신뢰도 | 신고번호 존재 + log10(동일 원료 등록 업체 수) | 높을수록 ↑ |
| 원료 관심도 | 관리자 입력 1~5 (기본 3) | 높을수록 ↑ |

결측 지표는 0.5(중립)로 처리하고 상세 화면에 "데이터 없음"으로 표시.

## 구조

```
prisma/schema.prisma        Product, ScoreWeight, IngredientTrend, Setting, CollectJob
src/lib/collectors/         mfds.ts(식약처 어댑터) · naver.ts(네이버 어댑터) · index.ts(오케스트레이션+로그)
src/lib/scoring/score.ts    점수 엔진, recalculateAll
src/lib/actions/            Server Actions (제품·가중치·재실행)
src/lib/products-query.ts   목록 필터/정렬 공통 로직
src/app/api/                POST /api/collect · GET /api/products · GET /api/products/export
scripts/fixture.ts          점수 검증용 테스트 데이터 (npx tsx scripts/fixture.ts)
```

## 주의

- 식약처 API 응답 필드명은 `src/lib/collectors/mfds.ts`의 `mapMfdsRow` 한 곳에서만 매핑합니다. 실제 응답과 다르면 여기만 수정하세요.
- 네이버 쇼핑 API는 리뷰 수·평점을 제공하지 않습니다. 관리자 → 제품 관리에서 수동 입력합니다.
- `/admin`은 인증이 없습니다. 외부에 공개하지 마세요 (2차에서 인증 추가 예정).
