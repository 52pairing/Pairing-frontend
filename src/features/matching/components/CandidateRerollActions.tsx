"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface CandidateRerollActionsProps { projectId: number; }

export function CandidateRerollActions({ projectId }: CandidateRerollActionsProps) {
  const router = useRouter();
  const [isRerollPolicyOpen, setIsRerollPolicyOpen] = useState(false);
  const usedFreeRerollCount = 0;
  const usedPaidRerollCount = 0;
  const isFreeRerollEligible = false;

  return <div className="relative flex items-center gap-2">
    <button type="button" aria-label="재추천 정책 안내" aria-expanded={isRerollPolicyOpen} onClick={() => setIsRerollPolicyOpen((open) => !open)} className={`flex h-[36px] w-[36px] items-center justify-center rounded-full border text-[15px] font-bold ${isRerollPolicyOpen ? "border-[#3478f6] bg-[#eff5ff] text-[#3478f6]" : "border-theme bg-surface text-theme-muted"}`}>?</button>
    <button type="button" disabled={!isFreeRerollEligible} className="h-[36px] rounded-[8px] border border-theme bg-surface px-4 text-[12px] font-semibold text-theme-secondary disabled:cursor-not-allowed disabled:opacity-45">무료 재추천 {usedFreeRerollCount}/1</button>
    <button type="button" onClick={() => router.push(`/client/projects/${projectId}/candidatereroll`)} className="h-[36px] rounded-[8px] bg-brand px-4 text-[12px] font-bold text-white hover:bg-brand-hover">재추천 요청 {usedPaidRerollCount}/5</button>
    {isRerollPolicyOpen ? <div className="absolute right-0 top-[44px] z-30 w-[440px] max-w-[calc(100vw-40px)] rounded-[10px] border border-[#3478f6] bg-[#eff5ff] px-4 py-3 text-[11px] font-semibold leading-5 text-[#3478f6] shadow-lg"><p>무료 재추천은 프로젝트 전체 기준 1회이며, 요청한 모든 프리랜서가 거절했거나 3일 초과 자동 만료된 경우에만 사용할 수 있습니다.</p><p className="mt-2">유료 재추천은 최대 5회, 후보 1명당 10,000원입니다. 이미 추천된 후보는 다시 노출되지 않습니다.</p></div> : null}
  </div>;
}
