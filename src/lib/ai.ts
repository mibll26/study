import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { COUNTRIES, DOSAGE_FORMS, MARKET_CODES, parseList } from "@/lib/constants";
import { getCredentials } from "@/lib/credentials";
import { UNITS } from "@/lib/formulation";

export type AiSuggestion = {
  name: string; dosageForm: string; markets: string[];
  items: { slug: string; amount: number; unit: string; reason: string }[];
  rationale: string; cautions: string[];
};
export type AiResult = { ok: true; suggestion: AiSuggestion } | { ok: false; error: string };

const MODEL = "claude-opus-5";

const Suggestion = z.object({
  name: z.string().describe("배합 이름 (한국어, 20자 이내)"),
  dosageForm: z.string().describe(`제형 — 다음 중 하나: ${DOSAGE_FORMS.join(", ")}`),
  markets: z.array(z.string()).describe(`판매 국가 코드 — ${MARKET_CODES.join(", ")} 중`),
  items: z.array(z.object({
    slug: z.string().describe("카탈로그의 slug 그대로"),
    amount: z.number().describe("1일 함량 (숫자)"),
    unit: z.string().describe("카탈로그 기준 단위 그대로"),
    reason: z.string().describe("선정 이유 한 줄 (한국어)"),
  })),
  rationale: z.string().describe("배합 전체 설계 의도 2~3문장 (한국어)"),
  cautions: z.array(z.string()).describe("주의점·검토 필요 사항 (한국어, 없으면 빈 배열)"),
});

function statusMark(s: { usable: boolean; approvalHolder: string | null; alternativeChannels: string | null; approvalType: string | null } | undefined): string {
  if (!s) return "?";
  if (s.usable) return "OK";
  if (s.approvalHolder || s.alternativeChannels || (s.approvalType ?? "").includes("개별인정") || (s.approvalType ?? "").includes("Novel Food")) return "검토";
  return "불가";
}

/** 원료 카탈로그를 한 줄/원료 텍스트로 — 시스템 프롬프트에 넣어 캐시 */
async function buildCatalog(): Promise<string> {
  const rows = await prisma.ingredient.findMany({ orderBy: { nameKo: "asc" }, include: { statuses: { where: { published: true } } } });
  return rows.map((r) => {
    const range = r.intakeMin != null || r.intakeMax != null ? `${r.intakeMin ?? "?"}–${r.intakeMax ?? "?"}${r.intakeUnit ?? ""}${r.intakeBasis ? `(${r.intakeBasis} 기준)` : ""}` : "기준 없음";
    const mk = MARKET_CODES.map((c) => `${c}:${statusMark(r.statuses.find((s) => s.countryCode === c))}`).join(" ");
    return `- slug=${r.slug} | ${r.nameKo} (${r.nameEn}) | ${r.category} | 기능성: ${parseList(r.functionality).join(",") || "-"} | KR 일일섭취량: ${range} | 단위: ${r.intakeUnit ?? "mg"} | 시장: ${mk}${r.caution ? ` | 주의: ${r.caution}` : ""}`;
  }).join("\n");
}

const SYSTEM = `당신은 건강기능식품 배합 설계 전문가입니다. 사용자의 목표(타깃 소비자, 기능성, 제형, 판매 국가 등)를 읽고, 아래 원료 카탈로그 안에서만 원료를 골라 배합을 설계합니다.

규칙:
- 반드시 카탈로그에 있는 slug만 사용합니다. 카탈로그에 없는 원료는 절대 추가하지 말고, 필요하다면 cautions에 "카탈로그에 없어 제외: ○○"로 적습니다.
- 함량(amount)은 카탈로그의 KR 일일섭취량 범위 안에서, 카탈로그의 단위 그대로 적습니다. 기준이 없는 원료는 업계 통상 함량을 적고 cautions에 근거 없음을 명시합니다.
- 판매 국가가 여러 곳이면 모든 국가에서 OK인 원료를 우선하고, "검토"는 꼭 필요할 때만 넣고 이유를 cautions에 적습니다. "불가"인 원료는 그 국가가 대상이면 넣지 않습니다.
- 원료는 2~6개. 기능성이 겹치는 원료를 중복해서 넣지 않습니다. 시너지(예: 비타민D+칼슘, 마그네슘+비타민B6)나 상호작용 주의는 reason/cautions에 반영합니다.
- 제형은 목표에 맞게 선택하되 사용자가 지정했으면 그대로 따릅니다. markets는 사용자가 지정한 코드를 그대로 씁니다.
- 모든 문장은 한국어로, 간결하게. 의학적 효능을 단정하지 말고 "도움을 줄 수 있음" 수준으로 씁니다.`;

/** 자연어 목표 → 배합 제안. 결과는 DB 카탈로그 기준으로 다시 검증·보정한다. */
export async function suggestFormulationWithAi(goal: string, hints: { markets: string[]; dosageForm: string }): Promise<AiResult> {
  const { anthropicApiKey } = await getCredentials();
  if (!anthropicApiKey) return { ok: false, error: "Anthropic API 키가 없습니다. 관리자 → 데이터 동기화 화면에서 입력하거나 ANTHROPIC_API_KEY 환경변수를 설정하세요." };
  const text = goal.trim().slice(0, 1000);
  if (!text) return { ok: false, error: "목표를 입력하세요." };

  const [catalog, ings] = await Promise.all([buildCatalog(), prisma.ingredient.findMany({ select: { slug: true, intakeMin: true, intakeMax: true, intakeUnit: true } })]);
  const bySlug = new Map(ings.map((i) => [i.slug, i]));
  const markets = hints.markets.filter((m) => (MARKET_CODES as readonly string[]).includes(m));
  const client = new Anthropic({ apiKey: anthropicApiKey });

  let parsed: z.infer<typeof Suggestion> | null;
  try {
    const res = await client.messages.parse({
      model: MODEL, max_tokens: 16000,
      system: [
        { type: "text", text: SYSTEM },
        { type: "text", text: `## 원료 카탈로그 (시장 표기: OK=사용 가능, 검토=개별인정·우회채널 등 검토 필요, 불가=사용 불가, ?=정보 없음)\n${catalog}`, cache_control: { type: "ephemeral" } },
      ],
      messages: [{ role: "user", content: `목표: ${text}\n판매 예정 국가: ${markets.length ? markets.map((m) => `${m}(${COUNTRIES[m]?.name})`).join(", ") : "미지정 — 목표에서 유추, 없으면 KR"}\n제형: ${DOSAGE_FORMS.includes(hints.dosageForm) ? hints.dosageForm : "미지정 — 목표에 맞게 선택"}` }],
      output_config: { format: zodOutputFormat(Suggestion) },
    });
    if (res.stop_reason === "refusal") return { ok: false, error: "AI가 이 요청에 대한 배합 생성을 거부했습니다. 목표 설명을 바꿔 다시 시도하세요." };
    parsed = res.parsed_output;
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) return { ok: false, error: "Anthropic API 키가 올바르지 않습니다." };
    if (e instanceof Anthropic.RateLimitError) return { ok: false, error: "AI 요청 한도에 걸렸습니다. 잠시 후 다시 시도하세요." };
    if (e instanceof Anthropic.APIError) return { ok: false, error: `AI 호출 실패 (${e.status}): ${e.message}` };
    return { ok: false, error: `AI 호출 실패: ${e instanceof Error ? e.message : String(e)}` };
  }
  if (!parsed) return { ok: false, error: "AI 응답을 해석하지 못했습니다. 다시 시도하세요." };

  // 카탈로그 기준 보정: 없는 slug 제거, 단위·함량을 KR 기준 범위로 클램프
  const seen = new Set<string>();
  const dropped: string[] = [];
  const items = parsed.items.flatMap((it) => {
    const ing = bySlug.get(it.slug);
    if (!ing || seen.has(it.slug)) { if (!ing) dropped.push(it.slug); return []; }
    seen.add(it.slug);
    const unit = ing.intakeUnit ?? (UNITS.includes(it.unit) ? it.unit : "mg");
    let amount = Number.isFinite(it.amount) && it.amount > 0 ? it.amount : ing.intakeMin ?? 0;
    if (ing.intakeMin != null && amount < ing.intakeMin) amount = ing.intakeMin;
    if (ing.intakeMax != null && amount > ing.intakeMax) amount = ing.intakeMax;
    return [{ slug: it.slug, amount, unit, reason: it.reason.trim() }];
  }).slice(0, 20);
  if (items.length === 0) return { ok: false, error: "카탈로그에 맞는 원료를 찾지 못했습니다. 목표를 더 구체적으로 적어보세요." };

  const outMarkets = markets.length ? markets : parsed.markets.filter((m) => (MARKET_CODES as readonly string[]).includes(m));
  return { ok: true, suggestion: {
    name: parsed.name.trim().slice(0, 40) || "AI 추천 배합",
    dosageForm: DOSAGE_FORMS.includes(hints.dosageForm) ? hints.dosageForm : DOSAGE_FORMS.includes(parsed.dosageForm) ? parsed.dosageForm : "캡슐",
    markets: outMarkets.length ? outMarkets : ["KR"],
    items, rationale: parsed.rationale.trim(),
    cautions: [...parsed.cautions.map((c) => c.trim()).filter(Boolean), ...(dropped.length ? [`카탈로그에 없는 원료는 제외했습니다: ${dropped.join(", ")}`] : [])],
  } };
}
