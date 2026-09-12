"use client";

import { useState } from "react";

export function Tabs({ tabs, initial = 0 }: { tabs: { label: string; content: React.ReactNode; count?: number }[]; initial?: number }) {
  const [i, setI] = useState(initial);
  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-[2px] border-b-2 border-ink" role="tablist">
        {tabs.map((t, idx) => (
          <button key={t.label} role="tab" aria-selected={i === idx} type="button" onClick={() => setI(idx)}
            className={`-mb-[2px] border-0 border-b-2 px-4 py-2.5 text-[13.5px] cursor-pointer ${i === idx ? "border-ink bg-panel text-ink" : "border-transparent bg-transparent text-muted-2 hover:text-ink"}`}>
            {t.label}{t.count != null && <span className="ml-1.5 font-mono text-[11px] text-muted-2">{t.count}</span>}
          </button>
        ))}
      </div>
      <div role="tabpanel">{tabs[i]?.content}</div>
    </div>
  );
}
