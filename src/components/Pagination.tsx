import Link from "next/link";

export function Pagination({ page, pageSize, total, params }: { page: number; pageSize: number; total: number; params: Record<string, string | undefined> }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
    sp.set("page", String(p));
    return `?${sp.toString()}`;
  };
  return (
    <nav className="flex items-center justify-between gap-2 text-sm" aria-label="페이지">
      <span className="text-muted">{total.toLocaleString()}건 중 {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}</span>
      <div className="flex gap-1">
        {page > 1 && <Link className="btn" href={href(page - 1)}>이전</Link>}
        <span className="px-2 py-1.5 tabular-nums">{page} / {pages}</span>
        {page < pages && <Link className="btn" href={href(page + 1)}>다음</Link>}
      </div>
    </nav>
  );
}
