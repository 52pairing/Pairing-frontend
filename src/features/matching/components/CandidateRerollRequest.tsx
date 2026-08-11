"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { CandidateRerollPaymentSummaryModal } from "@/features/matching/components/CandidateRerollPaymentSummaryModal";
import { CandidateRerollLoading, CandidateRerollPaymentComplete } from "@/features/matching/components/CandidateRerollStatusScreens";
import { PaymentMethodModal } from "@/features/payment/components/PaymentMethodModal";

interface CandidateRerollRequestProps { projectId: number; }
type CandidateRerollStep = "request" | "payment-complete" | "loading";
const PRICE_PER_CANDIDATE = 10_000;

export function CandidateRerollRequest({ projectId }: CandidateRerollRequestProps) {
  const router = useRouter();
  const [currentRerollStep, setCurrentRerollStep] = useState<CandidateRerollStep>("request");
  const [frontendDeveloperRecommendationCount, setFrontendDeveloperRecommendationCount] = useState(2);
  const [backendDeveloperRecommendationCount, setBackendDeveloperRecommendationCount] = useState(3);
  const [isPaymentSummaryOpen, setIsPaymentSummaryOpen] = useState(false);
  const [isPaymentMethodOpen, setIsPaymentMethodOpen] = useState(false);
  const totalCandidateCount = frontendDeveloperRecommendationCount + backendDeveloperRecommendationCount;
  const totalPaymentAmount = totalCandidateCount * PRICE_PER_CANDIDATE;

  useEffect(() => {
    if (currentRerollStep !== "loading") return;
    const completionTimer = window.setTimeout(() => router.push(`/client/projects/${projectId}?tab=candidates&reroll=complete`), 1800);
    return () => window.clearTimeout(completionTimer);
  }, [currentRerollStep, projectId, router]);

  if (currentRerollStep === "payment-complete") return <CandidateRerollPaymentComplete projectId={projectId} onContinue={() => setCurrentRerollStep("loading")} />;
  if (currentRerollStep === "loading") return <CandidateRerollLoading projectId={projectId} onContinue={() => undefined} />;

  return <main className="min-h-screen bg-surface-subtle px-5 py-10"><div className="mx-auto w-full max-w-[620px]"><Link href={`/client/projects/${projectId}?tab=candidates`} className="text-[12px] font-bold text-theme-secondary">← 추천 후보로 돌아가기</Link><h1 className="mt-6 text-[25px] font-extrabold">재추천 요청</h1><p className="mt-2 text-[12px] text-theme-secondary">B2B 주문 관리 서비스 리뉴얼</p>
    <section className="mt-6 rounded-[14px] border border-theme bg-surface p-6"><h2 className="text-[14px] font-extrabold">기존 매칭 결과</h2><div className="mt-4 space-y-2"><PreviousMatchingResult candidateName="박서희" result="거절" resultClass="bg-danger-surface text-theme-danger" /><PreviousMatchingResult candidateName="최개발" result="응답 기간 만료" resultClass="bg-surface-muted text-theme-secondary" /></div></section>
    <section className="mt-4 rounded-[14px] border border-theme bg-surface p-6"><h2 className="text-[14px] font-extrabold">추천받을 프리랜서 수</h2><p className="mt-2 text-[11px] text-theme-secondary">프로젝트 조건에 맞는 프리랜서를 몇 명 추천받을지 선택해 주세요.</p><CandidateCountSelector label="백엔드" count={backendDeveloperRecommendationCount} onChange={setBackendDeveloperRecommendationCount} /><CandidateCountSelector label="프론트엔드" count={frontendDeveloperRecommendationCount} onChange={setFrontendDeveloperRecommendationCount} /></section>
    <section className="mt-4 rounded-[14px] border border-theme bg-surface p-6"><h2 className="text-[14px] font-extrabold">재추천 정책</h2><dl className="mt-5 space-y-3 text-[12px]"><Row label="추천 받을 인원 수" value={`${totalCandidateCount}명`} /><Row label="유료 재추천 비용" value="정보 1명당 10,000원" /><Row label="재추천 사용 횟수" value="0 / 최대 5회" /></dl><p className="mt-5 rounded-[9px] border border-[#c9dcfa] bg-[#eef6ff] px-4 py-3 text-[11px] leading-5 text-theme-secondary">기존에 추천된 후보는 재추천에서 제외됩니다.<br />재추천 시 프로젝트당 최대 5회 요청할 수 있습니다.</p></section>
    <div className="mt-4 flex justify-end"><button type="button" disabled={totalCandidateCount === 0} onClick={() => setIsPaymentSummaryOpen(true)} className="h-11 rounded-[8px] bg-brand px-6 text-[12px] font-bold text-white disabled:opacity-40">결제 후 재추천</button></div></div>
    <CandidateRerollPaymentSummaryModal open={isPaymentSummaryOpen} totalCandidateCount={totalCandidateCount} totalPaymentAmount={totalPaymentAmount} onClose={() => setIsPaymentSummaryOpen(false)} onContinue={() => { setIsPaymentSummaryOpen(false); setIsPaymentMethodOpen(true); }} />
    <PaymentMethodModal open={isPaymentMethodOpen} payment={{ type: "UPFRONT_FEE", title: "프리랜서 재추천", description: "B2B 주문 관리 서비스 리뉴얼", amount: totalPaymentAmount }} onClose={() => setIsPaymentMethodOpen(false)} onPay={() => { setIsPaymentMethodOpen(false); setCurrentRerollStep("payment-complete"); }} />
  </main>;
}
function CandidateCountSelector({ label, count, onChange }: { label: string; count: number; onChange: (count: number) => void }) { return <div className="mt-5"><p className="text-[12px] font-bold text-[#3478f6]">{label}</p><div className="mt-2 flex items-center gap-3"><button type="button" onClick={() => onChange(Math.max(0, count - 1))} className="h-8 w-8 rounded-[7px] border border-theme bg-surface text-[16px]">−</button><strong className="w-5 text-center text-[13px]">{count}</strong><button type="button" onClick={() => onChange(Math.min(10, count + 1))} className="h-8 w-8 rounded-[7px] border border-theme bg-surface text-[16px]">+</button><span className="text-[11px] text-theme-secondary">명</span></div></div>; }
function Row({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4"><dt className="text-theme-muted">{label}</dt><dd className="font-bold">{value}</dd></div>; }
function PreviousMatchingResult({ candidateName, result, resultClass }: { candidateName: string; result: string; resultClass: string }) { return <div className="flex items-center justify-between rounded-[9px] bg-surface-subtle px-4 py-3"><span className="text-[12px] font-bold">{candidateName}</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${resultClass}`}>{result}</span></div>; }
