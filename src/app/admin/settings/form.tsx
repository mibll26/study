"use client";

import { useState, useTransition } from "react";
import type { Credentials } from "@/lib/credentials";

type Status = { ok: boolean; message: string } | { ok: null; message: string } | null;

function StatusLine({ s }: { s: Status }) {
  if (!s) return null;
  const cls = s.ok === true ? "text-green-700 dark:text-green-300" : s.ok === false ? "text-red-600" : "text-muted";
  return <p className={`text-sm ${cls}`}>{s.ok === true ? "✓ " : s.ok === false ? "✕ " : ""}{s.message}</p>;
}

export function CredentialsForm({ initial, save }: { initial: Credentials; save: (fd: FormData) => Promise<void> }) {
  const [v, setV] = useState(initial);
  const [mfds, setMfds] = useState<Status>(null);
  const [naver, setNaver] = useState<Status>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  async function test(source: "mfds" | "naver") {
    const set = source === "mfds" ? setMfds : setNaver;
    set({ ok: null, message: "확인 중…" });
    const res = await fetch("/api/test-connection", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source, ...v }) });
    set(await res.json());
  }

  return (
    <form action={(fd) => start(async () => { await save(fd); setSaved(true); setTimeout(() => setSaved(false), 2500); })} className="space-y-4">
      <section className="card space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-semibold">식약처 (식품안전나라)</h2>
          <a className="text-sm text-accent underline" href="https://www.foodsafetykorea.go.kr/api/" target="_blank" rel="noopener">키 발급 페이지 열기 ↗</a>
        </div>
        <ol className="list-decimal pl-5 text-sm text-muted space-y-0.5">
          <li>위 링크 → 로그인(회원가입) → 상단 <b>인증키 발급</b> 클릭</li>
          <li>발급된 인증키(영문+숫자 32자)를 아래에 붙여넣기</li>
        </ol>
        <div className="flex flex-wrap gap-2">
          <input id="mfdsApiKey" name="mfdsApiKey" value={v.mfdsApiKey} onChange={(e) => setV({ ...v, mfdsApiKey: e.target.value })} className="input flex-1 min-w-60 font-mono" placeholder="식약처 인증키" autoComplete="off" />
          <button type="button" className="btn" onClick={() => test("mfds")} disabled={!v.mfdsApiKey}>연결 테스트</button>
        </div>
        <StatusLine s={mfds} />
      </section>

      <section className="card space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-semibold">네이버 쇼핑 검색</h2>
          <a className="text-sm text-accent underline" href="https://developers.naver.com/apps/#/register" target="_blank" rel="noopener">애플리케이션 등록 페이지 열기 ↗</a>
        </div>
        <ol className="list-decimal pl-5 text-sm text-muted space-y-0.5">
          <li>위 링크 → 네이버 로그인 → 애플리케이션 이름 아무거나(예: 건기식수배)</li>
          <li>사용 API에서 <b>검색</b> 선택, 환경은 <b>WEB 설정</b> → 서비스 URL에 <code>http://localhost:3210</code></li>
          <li>등록 후 표시되는 <b>Client ID</b>와 <b>Client Secret</b>을 아래에 붙여넣기</li>
        </ol>
        <div className="grid gap-2 sm:grid-cols-2">
          <input id="naverClientId" name="naverClientId" value={v.naverClientId} onChange={(e) => setV({ ...v, naverClientId: e.target.value })} className="input font-mono" placeholder="Client ID" autoComplete="off" />
          <input id="naverClientSecret" name="naverClientSecret" value={v.naverClientSecret} onChange={(e) => setV({ ...v, naverClientSecret: e.target.value })} className="input font-mono" placeholder="Client Secret" autoComplete="off" />
        </div>
        <div><button type="button" className="btn" onClick={() => test("naver")} disabled={!v.naverClientId || !v.naverClientSecret}>연결 테스트</button></div>
        <StatusLine s={naver} />
      </section>

      <div className="flex items-center gap-3">
        <button className="btn-primary" type="submit" disabled={pending}>{pending ? "저장 중…" : "저장"}</button>
        {saved && <span className="text-sm text-green-700 dark:text-green-300">저장했습니다. 이제 수집 실행에서 바로 쓸 수 있습니다.</span>}
      </div>
    </form>
  );
}
