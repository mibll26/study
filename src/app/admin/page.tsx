import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = { success: "성공", partial: "부분성공", failed: "실패", running: "실행중", pending: "대기" };

export default async function AdminHome() {
  const [products, candidates, failed, recent, mfdsKey, naverKey] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isCandidate: true } }),
    prisma.collectJob.count({ where: { status: "failed" } }),
    prisma.collectJob.findMany({ orderBy: { startedAt: "desc" }, take: 5 }),
    Promise.resolve(Boolean(process.env.MFDS_API_KEY)),
    Promise.resolve(Boolean(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET)),
  ]);
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">관리자 대시보드</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[["총 제품", products], ["후보", candidates], ["실패 수집", failed], ["최근 수집", recent.length]].map(([l, v]) => (
          <div key={String(l)} className="card"><div className="text-xs text-muted">{l}</div><div className="text-2xl font-bold tabular-nums">{v}</div></div>
        ))}
      </div>
      {(!mfdsKey || !naverKey) && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-900/30 dark:text-amber-100 dark:border-amber-700">
          API 키가 설정되지 않았습니다: {[!mfdsKey && "MFDS_API_KEY", !naverKey && "NAVER_CLIENT_ID/SECRET"].filter(Boolean).join(", ")}. <code>.env</code>에 입력 후 서버를 재시작하세요.
        </div>
      )}
      <section className="card">
        <div className="mb-2 flex items-center justify-between"><h2 className="font-semibold">최근 수집</h2><Link href="/admin/jobs" className="text-sm text-accent underline">전체 로그</Link></div>
        {recent.length === 0 ? <p className="text-sm text-muted">아직 수집 이력이 없습니다. <Link href="/admin/collect" className="underline">수집 실행</Link></p> : (
          <ul className="divide-y divide-line/60 text-sm">
            {recent.map((j) => (
              <li key={j.id} className="flex flex-wrap justify-between gap-2 py-1.5">
                <span><b>{j.keyword}</b> <span className="text-muted">({j.sources})</span></span>
                <span className="tabular-nums text-muted">식약처 {j.mfdsCount} · 네이버 {j.naverCount} · {statusLabel[j.status] ?? j.status} · {j.startedAt.toLocaleString("ko-KR")}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
