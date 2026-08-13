"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getRecommendedCandidates } from "@/features/matching/services/matching";
import type { CandidateListResponse } from "@/features/matching/types/matching";

export function MatchingCandidateNotificationTarget() {
  const params = useParams<{ positionId: string }>();
  const positionId = Number(params.positionId);
  const [result, setResult] = useState<CandidateListResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!Number.isInteger(positionId)) return;
    void getRecommendedCandidates(positionId).then(setResult).catch((cause) => setError(cause instanceof Error ? cause.message : "추천 결과를 불러오지 못했습니다."));
  }, [positionId]);

  const invalid = !Number.isInteger(positionId);
  return <main className="flex min-h-screen items-center justify-center bg-surface-subtle px-5"><section className="w-full max-w-[520px] rounded-[14px] border border-theme bg-surface p-7 text-center"><h1 className="text-[20px] font-extrabold">재추천 결과</h1>{invalid || error ? <p role="alert" className="mt-4 text-[12px] font-semibold text-theme-danger">{invalid ? "올바르지 않은 포지션입니다." : error}</p> : result ? <p className="mt-4 text-[12px] leading-6 text-theme-secondary">{result.candidates.length ? `새로운 추천 후보 ${result.candidates.length}명을 확인할 수 있습니다.` : "현재 추가로 추천할 수 있는 프리랜서가 없습니다."}</p> : <p className="mt-4 text-[12px] text-theme-muted">추천 결과를 불러오고 있습니다.</p>}<Link href="/client/projects" className="mt-6 inline-flex h-10 items-center rounded-[8px] bg-brand px-5 text-[12px] font-bold text-white">내 프로젝트에서 확인하기</Link></section></main>;
}
