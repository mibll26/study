import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ScoreBadge } from "@/components/ScoreBadge";
import { CandidateButton } from "@/components/CandidateButton";
import { parseScoreDetail } from "@/lib/scoring/score";
import { saveMemo } from "@/lib/actions/products";

export const dynamic = "force-dynamic";

const won = (n: number | null) => (n == null ? "—" : `${n.toLocaleString()}원`);

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2 py-1.5 border-b border-line/50 last:border-0 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="break-words">{value ?? "—"}</dd>
    </div>
  );
}

export default async function ProductPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const pid = Number(id);
  if (!Number.isFinite(pid)) notFound();
  const p = await prisma.product.findUnique({ where: { id: pid } });
  if (!p) notFound();
  const detail = parseScoreDetail(p.scoreDetail);
  const saveMemoWithId = saveMemo.bind(null, p.id);

  return (
    <div className="space-y-5">
      <Link href="/" className="text-sm text-muted hover:text-accent">← 목록</Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-4">
          {p.imageUrl && <img src={p.imageUrl} alt="" className="h-20 w-20 rounded border border-line object-cover" />}
          <div>
            <h1 className="text-xl font-bold">{p.name}</h1>
            <p className="text-sm text-muted">{[p.brand ?? p.maker ?? p.mfdsCompany, p.category, `키워드: ${p.keyword}`].filter(Boolean).join(" · ")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ScoreBadge score={p.score} size="lg" />
          <CandidateButton id={p.id} isCandidate={p.isCandidate} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card">
          <h2 className="mb-2 font-semibold">식약처 정보</h2>
          {p.mfdsReportNo ? (
            <dl>
              <Row label="신고번호" value={<code className="text-xs">{p.mfdsReportNo}</code>} />
              <Row label="업체" value={p.mfdsCompany} />
              <Row label="기능성 원료" value={p.ingredient} />
              <Row label="주된 기능성" value={p.functionality} />
              <Row label="섭취 방법" value={p.intakeMethod} />
              <Row label="신고일" value={p.mfdsReportDate} />
            </dl>
          ) : (
            <p className="text-sm text-muted">식약처 등록 정보가 연결되지 않았습니다. {p.ingredient && <>원료: {p.ingredient}</>}</p>
          )}
        </section>
        <section className="card">
          <h2 className="mb-2 font-semibold">시장 정보</h2>
          <dl>
            <Row label="최저가" value={won(p.lowestPrice)} />
            <Row label="최고가" value={won(p.highestPrice)} />
            <Row label="판매몰" value={p.mallName ? `${p.mallName}${p.mallCount && p.mallCount > 1 ? ` 외 ${p.mallCount - 1}곳` : ""}` : p.mallCount} />
            <Row label="검색 결과 수" value={p.searchTotal?.toLocaleString()} />
            <Row label="리뷰 수 / 평점" value={p.reviewCount != null || p.rating != null ? `${p.reviewCount ?? "—"} / ${p.rating ?? "—"}` : "— (관리자 수동 입력)"} />
            <Row label="상품 링크" value={p.productUrl ? <a href={p.productUrl} target="_blank" rel="noopener" className="text-accent underline break-all">{p.productUrl}</a> : null} />
          </dl>
        </section>
      </div>

      <section className="card overflow-x-auto">
        <h2 className="mb-2 font-semibold">점수 상세</h2>
        {detail ? (
          <>
            <table className="w-full text-sm">
              <thead><tr><th className="th">지표</th><th className="th text-right">원시값</th><th className="th text-right">정규화</th><th className="th text-right">가중치</th><th className="th text-right">기여 점수</th></tr></thead>
              <tbody>
                {detail.metrics.map((m) => (
                  <tr key={m.key}>
                    <td className="td">{m.label}</td>
                    <td className="td text-right tabular-nums">{m.raw == null ? <span className="text-muted">데이터 없음</span> : m.raw.toFixed(2)}</td>
                    <td className="td text-right tabular-nums">{m.normalized.toFixed(2)}</td>
                    <td className="td text-right tabular-nums">{m.weight}</td>
                    <td className="td text-right tabular-nums font-medium">{m.contribution.toFixed(1)}</td>
                  </tr>
                ))}
                <tr><td className="td font-semibold" colSpan={4}>합계</td><td className="td text-right font-semibold tabular-nums">{detail.total.toFixed(1)}</td></tr>
              </tbody>
            </table>
            <p className="mt-2 text-xs text-muted">계산 시각: {new Date(detail.computedAt).toLocaleString("ko-KR")}</p>
          </>
        ) : <p className="text-sm text-muted">아직 점수가 계산되지 않았습니다.</p>}
      </section>

      <section className="card">
        <h2 className="mb-2 font-semibold">메모</h2>
        <form action={saveMemoWithId} className="space-y-2">
          <textarea id="memo" name="memo" defaultValue={p.memo ?? ""} rows={4} className="input w-full" placeholder="검토 의견, 공급처, 마진 계산 등" />
          <button className="btn-primary" type="submit">메모 저장</button>
        </form>
      </section>
    </div>
  );
}
