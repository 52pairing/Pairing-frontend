"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useToast } from "@/features/common/hooks/useToast";
import { getClientProjectDetail } from "@/features/client/myprojects/services/projectDetail";
import type { ProjectDetailPosition } from "@/features/client/myprojects/types/projectDetail";
import { getProjectJobRoles } from "@/features/client/projects/services/projectPreReview";
import { CandidateRerollPaymentSummaryModal } from "@/features/matching/components/CandidateRerollPaymentSummaryModal";
import {
  CandidateRerollLoading,
  CandidateRerollPaymentComplete,
} from "@/features/matching/components/CandidateRerollStatusScreens";
import {
  getSentMatchingRequests,
  getRecommendedCandidates,
  requestRerecommendation,
} from "@/features/matching/services/matching";
import { useMatchingNotifications } from "@/features/matching/stomp/useMatchingNotifications";
import type {
  MatchingNotification,
  MatchingRequestResponse,
} from "@/features/matching/types/matching";
import { PaymentMethodModal } from "@/features/payment/components/PaymentMethodModal";

interface CandidateRerollRequestProps {
  projectId: number;
}
type CandidateRerollStep = "request" | "payment-complete" | "loading";
const PRICE_PER_CANDIDATE = 10_000;

export function CandidateRerollRequest({
  projectId,
}: CandidateRerollRequestProps) {
  const router = useRouter();
  const user = useCurrentUser();
  const toast = useToast();
  const [currentRerollStep, setCurrentRerollStep] =
    useState<CandidateRerollStep>("request");
  const [recommendationCounts, setRecommendationCounts] = useState<
    Record<number, number>
  >({});
  const [isPaymentSummaryOpen, setIsPaymentSummaryOpen] = useState(false);
  const [isPaymentMethodOpen, setIsPaymentMethodOpen] = useState(false);
  const [positions, setPositions] = useState<ProjectDetailPosition[]>([]);
  const [projectTitle, setProjectTitle] = useState("");
  const [pendingPositionIds, setPendingPositionIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [positionMaximums, setPositionMaximums] = useState<
    Record<number, number>
  >({});
  const [jobRoleLabels, setJobRoleLabels] = useState<Record<string, string>>(
    {},
  );
  const [previousRequests, setPreviousRequests] = useState<
    MatchingRequestResponse[]
  >([]);
  const [paidRemaining, setPaidRemaining] = useState(0);
  const [loadError, setLoadError] = useState("");
  const totalCandidateCount = Object.values(recommendationCounts).reduce(
    (sum, count) => sum + count,
    0,
  );
  const totalPaymentAmount = totalCandidateCount * PRICE_PER_CANDIDATE;

  useEffect(() => {
    let cancelled = false;
    Promise.all([getClientProjectDetail(projectId), getProjectJobRoles()])
      .then(([project, jobRoles]) => {
        if (cancelled) return;
        setPositions(project.positions);
        setProjectTitle(project.title);
        setJobRoleLabels(
          Object.fromEntries(jobRoles.map((role) => [role.code, role.label])),
        );
        return Promise.all(
          project.positions.map(async (position) => {
            const [requests, candidates] = await Promise.all([getSentMatchingRequests({ positionId: position.positionId, size: 100 }), getRecommendedCandidates(position.positionId)]);
            const occupied = requests.content.filter(
              (request) =>
                !["REJECTED", "NEGOTIATION_FAILED", "TERMINATED"].includes(
                  request.status,
                ),
            ).length;
            return {
              position,
              remaining: Math.max(0, position.headcount - occupied),
              requests: requests.content,
              paidRemaining: candidates.paidRerecommendRemaining,
            };
          }),
        ).then((results) => {
          if (cancelled) return;
          setPreviousRequests(
            results
              .flatMap((result) => result.requests)
              .filter(
                (request) =>
                  request.status === "REJECTED" ||
                  request.status === "NEGOTIATION_FAILED",
              ),
          );
          setPaidRemaining(results.length ? Math.min(...results.map((result) => result.paidRemaining)) : 0);
          setPositionMaximums(
            Object.fromEntries(
              results.map(({ position, remaining }) => [
                position.positionId,
                remaining,
              ]),
            ),
          );
          setRecommendationCounts(
            Object.fromEntries(
              results.map(({ position, remaining }) => [
                position.positionId,
                Math.min(position.headcount, remaining),
              ]),
            ),
          );
        });
      })
      .catch(() => {
        if (!cancelled) { setPositions([]); setLoadError("재추천 정보를 불러오지 못했습니다."); }
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const handleMatchingNotification = useCallback(
    (notification: MatchingNotification) => {
      if (notification.type !== "MATCHING_RECOMMENDED") return;
      const completedPositionId = pendingPositionIds.find((positionId) =>
        notification.linkUrl.includes(`/positions/${positionId}/`),
      );
      if (!completedPositionId) return;
      const remainingPositionIds = pendingPositionIds.filter(
        (positionId) => positionId !== completedPositionId,
      );
      setPendingPositionIds(remainingPositionIds);
      if (remainingPositionIds.length === 0)
        router.push(
          `/client/projects/${projectId}?tab=candidates&reroll=complete`,
        );
    },
    [pendingPositionIds, projectId, router],
  );
  useMatchingNotifications(user?.accountId, handleMatchingNotification);

  const submitRerecommendations = async () => {
    const selectedPositions = positions.filter(
      (position) => (recommendationCounts[position.positionId] ?? 0) > 0,
    );
    const requests = selectedPositions.map((position) =>
      requestRerecommendation(position.positionId, {
        type: "PAID",
        quantity: recommendationCounts[position.positionId],
      }),
    );
    if (requests.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    setPendingPositionIds(selectedPositions.map((position) => position.positionId));
    try {
      await Promise.all(requests);
      setIsPaymentMethodOpen(false);
      setCurrentRerollStep("payment-complete");
    } catch (error) {
      setIsPaymentMethodOpen(false);
      toast.error(
        error instanceof Error
          ? error.message
          : "재추천 요청을 접수하지 못했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentRerollStep === "payment-complete")
    return (
      <CandidateRerollPaymentComplete
        projectId={projectId}
        onContinue={() => setCurrentRerollStep("loading")}
      />
    );
  if (currentRerollStep === "loading")
    return (
      <CandidateRerollLoading
        projectId={projectId}
        onContinue={() => undefined}
        positionLabels={positions.filter((position) => pendingPositionIds.includes(position.positionId)).map((position) => jobRoleLabels[position.jobRole] ?? position.jobRole)}
      />
    );

  return (
    <main className="min-h-screen bg-surface-subtle px-5 py-10">
      <div className="mx-auto w-full max-w-[620px]">
        <Link
          href={`/client/projects/${projectId}?tab=candidates`}
          className="text-[12px] font-bold text-theme-secondary"
        >
          ← 추천 후보로 돌아가기
        </Link>
        <h1 className="mt-6 text-[25px] font-extrabold">재추천 요청</h1>
        <p className="mt-2 text-[12px] text-theme-secondary">
          {projectTitle || "프로젝트 정보를 불러오는 중입니다."}
        </p>
        {loadError ? <p role="alert" className="mt-4 rounded-lg border border-[#fda29b] bg-danger-surface px-4 py-3 text-[11px] font-semibold text-theme-danger">{loadError}</p> : null}

        <section className="mt-6 rounded-[14px] border border-theme bg-surface p-6">
          <h2 className="text-[14px] font-extrabold">기존 매칭 결과</h2>
          <div className="mt-4 space-y-2">
            {previousRequests.length > 0 ? (
              previousRequests.map((request) => (
                <PreviousMatchingResult
                  key={request.requestId}
                  candidateName={request.counterpartName}
                  result={
                    request.rejectReason === "EXPIRED"
                      ? "응답 기간 만료"
                      : request.status === "NEGOTIATION_FAILED"
                        ? "협상 결렬"
                        : "거절"
                  }
                  resultClass={
                    request.rejectReason === "EXPIRED"
                      ? "bg-surface-muted text-theme-secondary"
                      : "bg-danger-surface text-theme-danger"
                  }
                />
              ))
            ) : (
              <p className="text-[11px] text-theme-muted">
                종료된 기존 매칭 결과가 없습니다.
              </p>
            )}
          </div>
        </section>

        <section className="mt-4 rounded-[14px] border border-theme bg-surface p-6">
          <h2 className="text-[14px] font-extrabold">추천받을 프리랜서 수</h2>
          <p className="mt-2 text-[11px] text-theme-secondary">
            프로젝트 조건에 맞는 프리랜서를 몇 명 추천받을지 선택해 주세요.
          </p>
          {positions.map((position) => (
            <CandidateCountSelector
              key={position.positionId}
              label={jobRoleLabels[position.jobRole] ?? position.jobRole}
              count={recommendationCounts[position.positionId] ?? 0}
              maximum={positionMaximums[position.positionId] ?? 0}
              onChange={(count) =>
                setRecommendationCounts((current) => ({
                  ...current,
                  [position.positionId]: count,
                }))
              }
            />
          ))}
        </section>
        <section className="mt-4 rounded-[14px] border border-theme bg-surface p-6">
          <h2 className="text-[14px] font-extrabold">재추천 정책</h2>
          <dl className="mt-5 space-y-3 text-[12px]">
            <Row label="추천 받을 인원 수" value={`${totalCandidateCount}명`} />
            <Row label="유료 재추천 비용" value="정보 1명당 10,000원" />
            <Row label="재추천 사용 횟수" value={`${5 - paidRemaining} / 최대 5회`} />
          </dl>
          <p className="mt-5 rounded-[9px] border border-[#c9dcfa] bg-[#eef6ff] px-4 py-3 text-[11px] leading-5 text-theme-secondary">
            기존에 추천된 후보는 재추천에서 제외됩니다.
            <br />
            재추천 시 프로젝트당 최대 5회 요청할 수 있습니다.
          </p>
        </section>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            disabled={totalCandidateCount === 0 || paidRemaining === 0 || isSubmitting}
            onClick={() => setIsPaymentSummaryOpen(true)}
            className="h-11 rounded-[8px] bg-brand px-6 text-[12px] font-bold text-white disabled:opacity-40"
          >
            결제 후 재추천
          </button>
        </div>
      </div>
      <CandidateRerollPaymentSummaryModal
        open={isPaymentSummaryOpen}
        totalCandidateCount={totalCandidateCount}
        totalPaymentAmount={totalPaymentAmount}
        onClose={() => setIsPaymentSummaryOpen(false)}
        onContinue={() => {
          setIsPaymentSummaryOpen(false);
          setIsPaymentMethodOpen(true);
        }}
      />
      <PaymentMethodModal
        open={isPaymentMethodOpen}
        payment={{
          type: "UPFRONT_FEE",
          title: "프리랜서 재추천",
          description: projectTitle || "프로젝트 재추천",
          amount: totalPaymentAmount,
        }}
        onClose={() => !isSubmitting && setIsPaymentMethodOpen(false)}
        onPay={() => void submitRerecommendations()}
      />
    </main>
  );
}
export function CandidateCountSelector({
  label,
  count,
  maximum,
  onChange,
}: {
  label: string;
  count: number;
  maximum: number;
  onChange: (count: number) => void;
}) {
  return (
    <div className="mt-5">
      <p className="text-[12px] font-bold text-[#3478f6]">{label}</p>
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, count - 1))}
          className="h-8 w-8 rounded-[7px] border border-theme bg-surface text-[16px]"
        >
          −
        </button>
        <strong className="w-5 text-center text-[13px]">{count}</strong>
        <button
          type="button"
          aria-label={`${label} 추천 인원 추가`}
          disabled={count >= maximum}
          onClick={() => onChange(Math.min(maximum, count + 1))}
          className="h-8 w-8 rounded-[7px] border border-theme bg-surface text-[16px] disabled:cursor-not-allowed disabled:opacity-40"
        >
          +
        </button>
        <span className="text-[11px] text-theme-secondary">명</span>
      </div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-theme-muted">{label}</dt>
      <dd className="font-bold">{value}</dd>
    </div>
  );
}
function PreviousMatchingResult({
  candidateName,
  result,
  resultClass,
}: {
  candidateName: string;
  result: string;
  resultClass: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-[9px] bg-surface-subtle px-4 py-3">
      <span className="text-[12px] font-bold">{candidateName}</span>
      <span
        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${resultClass}`}
      >
        {result}
      </span>
    </div>
  );
}
