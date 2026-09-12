"use client";

import { useTransition } from "react";
import { toggleCandidate } from "@/lib/actions/products";

export function CandidateButton({ id, isCandidate, compact = false }: { id: number; isCandidate: boolean; compact?: boolean }) {
  const [pending, start] = useTransition();
  const label = isCandidate ? "후보 해제" : "후보 표시";
  return (
    <button
      type="button"
      onClick={() => start(() => toggleCandidate(id))}
      disabled={pending}
      aria-pressed={isCandidate}
      title={label}
      className={compact ? `text-lg leading-none ${isCandidate ? "text-amber-500" : "text-line hover:text-amber-400"}` : `btn ${isCandidate ? "border-amber-400 text-amber-600" : ""}`}
    >
      {compact ? (isCandidate ? "★" : "☆") : <>{isCandidate ? "★" : "☆"} {label}</>}
    </button>
  );
}
