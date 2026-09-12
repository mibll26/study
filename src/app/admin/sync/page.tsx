import { prisma } from "@/lib/db";
import { linkProduct, runSync, saveSettings } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminSync() {
  const [key, aiKey, jobs, unlinked, ingredients, total] = await Promise.all([
    prisma.setting.findUnique({ where: { key: "mfdsApiKey" } }), prisma.setting.findUnique({ where: { key: "anthropicApiKey" } }), prisma.syncJob.findMany({ orderBy: { startedAt: "desc" }, take: 20 }),
    prisma.mfdsProduct.findMany({ where: { ingredientId: null }, take: 30, orderBy: { fetchedAt: "desc" } }), prisma.ingredient.findMany({ orderBy: { nameKo: "asc" }, select: { id: true, nameKo: true } }), prisma.mfdsProduct.count(),
  ]);
  const apiKey = key?.value || process.env.MFDS_API_KEY || "";
  const anthropicKey = aiKey?.value || process.env.ANTHROPIC_API_KEY || "";
  return (
    <div className="space-y-6">
      <div><div className="eyebrow mb-1">Data sources</div><h1 className="text-[22px] font-semibold tracking-[-0.02em]">공공 DB 동기화</h1><p className="text-[12.5px] text-muted-2">L1 레이어. 원본은 MfdsProduct에 그대로 저장하고(스냅샷), 원료 사전과 자동 매핑합니다. 미매칭은 아래 큐에서 수동 연결.</p></div>

      <section className="border-2 border-ink bg-panel p-5">
        <div className="eyebrow mb-2">식품안전나라 C003 — 건강기능식품 품목제조신고</div>
        <form action={saveSettings} className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-[11.5px] text-muted-2">인증키 (<a href="https://www.foodsafetykorea.go.kr/api/" target="_blank" rel="noopener">발급 ↗</a>)<input name="mfdsApiKey" defaultValue={apiKey} className="input-sm w-80 font-mono" autoComplete="off" /></label>
          <button className="btn py-1" type="submit">키 저장</button>
          <span className="text-[12px] text-muted-2">{apiKey ? "키 설정됨" : "키 없음 — 동기화 실행 시 실패로 기록됩니다"}</span>
        </form>
        <form action={runSync} className="mt-4 space-y-2">
          <label className="block text-[11.5px] text-muted-2">키워드 (줄바꿈 구분, 최대 10개 — 제품명 부분 일치)<textarea name="keywords" rows={3} className="input-sm mt-1 font-mono" placeholder={"마그네슘\n오메가3\n루테인"} /></label>
          <button className="btn-primary py-1.5" type="submit">동기화 실행</button>
        </form>
      </section>

      <section className="border-2 border-ink bg-panel p-5">
        <div className="eyebrow mb-2">AI 배합 추천 — Anthropic API</div>
        <form action={saveSettings} className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-[11.5px] text-muted-2">API 키 (<a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">발급 ↗</a>)<input name="anthropicApiKey" type="password" defaultValue={anthropicKey} className="input-sm w-80 font-mono" autoComplete="off" /></label>
          <button className="btn py-1" type="submit">키 저장</button>
          <span className="text-[12px] text-muted-2">{anthropicKey ? "키 설정됨 — /formulate 의 AI 배합 추천이 동작합니다" : "키 없음 — AI 배합 추천 버튼이 오류를 반환합니다"}</span>
        </form>
      </section>

      <section>
        <div className="mb-2 flex items-baseline justify-between"><h2 className="font-semibold">동기화 로그</h2><span className="text-[12px] text-muted-2">완제품 총 <span className="font-mono">{total}</span>건</span></div>
        <div className="overflow-x-auto border-2 border-ink bg-panel"><table className="w-full text-[13px]"><thead><tr><th className="th">시각</th><th className="th">소스</th><th className="th">키워드</th><th className="th">상태</th><th className="th text-right">건수</th><th className="th">오류</th></tr></thead><tbody>
          {jobs.map((j) => <tr key={j.id}><td className="td whitespace-nowrap text-muted-2">{j.startedAt.toLocaleString("ko-KR")}</td><td className="td font-mono">{j.source}</td><td className="td">{j.keyword}</td><td className={`td ${j.status === "failed" ? "text-red" : ""}`}>{{ success: "성공", failed: "실패", running: "실행중" }[j.status] ?? j.status}</td><td className="td text-right font-mono">{j.count}</td><td className="td text-[12px] text-red">{j.error ?? ""}</td></tr>)}
          {jobs.length === 0 && <tr><td className="td py-6 text-center text-muted-2" colSpan={6}>아직 실행 이력이 없습니다.</td></tr>}
        </tbody></table></div>
      </section>

      <section>
        <div className="mb-2 flex items-baseline justify-between"><h2 className="font-semibold">원료 미매칭 완제품 큐</h2><span className="text-[12px] text-muted-2">{unlinked.length}건 표시</span></div>
        <div className="overflow-x-auto border-2 border-ink bg-panel"><table className="w-full text-[13px]"><thead><tr><th className="th">제품명</th><th className="th">업체</th><th className="th">원재료</th><th className="th">연결</th></tr></thead><tbody>
          {unlinked.map((p) => <tr key={p.id}><td className="td">{p.name}<div className="font-mono text-[11px] text-muted-2">{p.reportNo}</div></td><td className="td text-muted">{p.company}</td><td className="td text-muted line-clamp-2 max-w-xs">{p.ingredientRaw ?? "—"}</td><td className="td"><form action={async (fd) => { "use server"; const v = Number(fd.get("ingredientId")); await linkProduct(p.id, Number.isFinite(v) && v > 0 ? v : null); }} className="flex gap-1"><select name="ingredientId" className="input-sm" defaultValue=""><option value="">선택</option>{ingredients.map((i) => <option key={i.id} value={i.id}>{i.nameKo}</option>)}</select><button className="btn py-1" type="submit">연결</button></form></td></tr>)}
          {unlinked.length === 0 && <tr><td className="td py-6 text-center text-muted-2" colSpan={4}>미매칭 건이 없습니다.</td></tr>}
        </tbody></table></div>
      </section>
    </div>
  );
}
