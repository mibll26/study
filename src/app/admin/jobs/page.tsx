import { prisma } from "@/lib/db";
import { rerunJob } from "@/lib/actions/jobs";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = { success: "성공", partial: "부분성공", failed: "실패", running: "실행중", pending: "대기" };
const statusCls: Record<string, string> = { success: "text-green-700 dark:text-green-300", partial: "text-amber-700 dark:text-amber-300", failed: "text-red-600", running: "text-muted" };

export default async function JobsPage() {
  const jobs = await prisma.collectJob.findMany({ orderBy: { startedAt: "desc" }, take: 100 });
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">수집 로그</h1>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead><tr><th className="th">시각</th><th className="th">키워드</th><th className="th">소스</th><th className="th">상태</th><th className="th text-right">식약처</th><th className="th text-right">네이버</th><th className="th">오류</th><th className="th"></th></tr></thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id}>
                <td className="td whitespace-nowrap tabular-nums text-xs">{j.startedAt.toLocaleString("ko-KR")}{j.finishedAt && <span className="text-muted"> ({Math.round((j.finishedAt.getTime() - j.startedAt.getTime()) / 1000)}s)</span>}</td>
                <td className="td font-medium">{j.keyword}</td>
                <td className="td text-xs">{j.sources}</td>
                <td className={`td whitespace-nowrap ${statusCls[j.status] ?? ""}`}>{statusLabel[j.status] ?? j.status}</td>
                <td className="td text-right tabular-nums">{j.mfdsCount}</td>
                <td className="td text-right tabular-nums">{j.naverCount}</td>
                <td className="td text-xs text-red-600 max-w-xs break-words">{j.error ?? ""}</td>
                <td className="td">{(j.status === "failed" || j.status === "partial") && (
                  <form action={rerunJob.bind(null, j.id)}><button className="btn text-xs" type="submit">재실행</button></form>
                )}</td>
              </tr>
            ))}
            {jobs.length === 0 && <tr><td className="td text-center text-muted py-8" colSpan={8}>수집 이력이 없습니다.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
