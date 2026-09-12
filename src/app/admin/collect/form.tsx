"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Result = { jobId: number; keyword: string; status: string; mfdsCount: number; naverCount: number; error?: string };
const statusLabel: Record<string, string> = { success: "성공", partial: "부분성공", failed: "실패" };

export function CollectForm() {
  const router = useRouter();
  const [keywords, setKeywords] = useState("");
  const [mfds, setMfds] = useState(true);
  const [naver, setNaver] = useState(true);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<Result[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    const list = keywords.split("\n").map((s) => s.trim()).filter(Boolean);
    const sources = [mfds && "mfds", naver && "naver"].filter(Boolean);
    if (list.length === 0) return setError("키워드를 1개 이상 입력하세요");
    if (sources.length === 0) return setError("수집 소스를 1개 이상 선택하세요");
    setError(null); setRunning(true); setResults(null);
    try {
      const res = await fetch("/api/collect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ keywords: list, sources }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setResults(json.results);
      router.refresh();
    } catch (err) { setError((err as Error).message); }
    finally { setRunning(false); }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={run} className="card space-y-3">
        <label className="block text-sm">키워드
          <textarea id="keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} rows={5} className="input mt-1 w-full font-mono" placeholder={"오메가3\n밀크씨슬\n프로바이오틱스"} />
        </label>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <label className="flex items-center gap-1"><input id="src-mfds" type="checkbox" checked={mfds} onChange={(e) => setMfds(e.target.checked)} /> 식약처</label>
          <label className="flex items-center gap-1"><input id="src-naver" type="checkbox" checked={naver} onChange={(e) => setNaver(e.target.checked)} /> 네이버 쇼핑</label>
          <button className="btn-primary ml-auto" type="submit" disabled={running}>{running ? "수집 중…" : "수집 실행"}</button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
      {running && <p className="text-sm text-muted">외부 API를 호출하고 있습니다. 키워드 수에 따라 수십 초가 걸릴 수 있습니다.</p>}
      {results && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead><tr><th className="th">키워드</th><th className="th">상태</th><th className="th text-right">식약처</th><th className="th text-right">네이버</th><th className="th">오류</th></tr></thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.jobId}>
                  <td className="td font-medium">{r.keyword}</td>
                  <td className="td">{statusLabel[r.status] ?? r.status}</td>
                  <td className="td text-right tabular-nums">{r.mfdsCount}</td>
                  <td className="td text-right tabular-nums">{r.naverCount}</td>
                  <td className="td text-xs text-red-600">{r.error ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
