export function ScoreBadge({ score, size = "sm" }: { score: number | null | undefined; size?: "sm" | "lg" }) {
  const s = score ?? null;
  const cls =
    s == null ? "bg-line/50 text-muted"
    : s >= 80 ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
    : s >= 60 ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
    : "bg-line/50 text-muted";
  const pad = size === "lg" ? "px-3 py-1 text-base" : "px-2 py-0.5 text-xs";
  return (
    <span className={`inline-block rounded-full font-semibold tabular-nums ${pad} ${cls}`} title="판매 유망 점수 (0~100)">
      {s == null ? "—" : s.toFixed(1)}
    </span>
  );
}
