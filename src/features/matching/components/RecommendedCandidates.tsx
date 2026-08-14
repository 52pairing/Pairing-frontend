"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import type { ProjectDetailPosition } from "@/features/client/myprojects/types/projectDetail";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { ConfirmModal, WarningIcon } from "@/features/common/components/Modal";
import {
  createMatchingRequests,
  getRecommendedCandidates,
  rejectRecommendedCandidate,
  requestRerecommendation,
} from "@/features/matching/services/matching";
import type {
  CandidateListResponse,
  CandidateResponse,
  PayUnit,
} from "@/features/matching/types/matching";
import type { MatchingNotification } from "@/features/matching/types/matching";
import { useMatchingNotifications } from "@/features/matching/stomp/useMatchingNotifications";
import { ApiException } from "@/lib/api";

interface RecommendedCandidatesProps {
  projectId: number;
  positions: ProjectDetailPosition[];
  jobRoleLabels: Record<string, string>;
  skillLabels: Record<string, string>;
}

const PAY_UNIT_LABEL: Record<PayUnit, string> = {
  HOURLY: "시급",
  DAILY: "일급",
  MONTHLY: "월",
};

const GRADE_LABEL: Record<string, string> = {
  JUNIOR: "주니어",
  SENIOR: "시니어",
  MASTER: "마스터",
};

const getErrorMessage = (error: unknown) => {
  if (!(error instanceof ApiException)) {
    return error instanceof Error ? error.message : "요청을 처리하지 못했습니다.";
  }
  if (error.errorCode === "MT_005") return "모집 가능한 인원을 초과해 선택할 수 없습니다.";
  if (error.errorCode === "MT_014") return "모집이 종료되었거나 취소된 프로젝트입니다.";
  if (error.errorCode === "MT_017") return "현재 선택할 수 없는 후보입니다. 후보 목록을 새로고침했습니다.";
  return error.message;
};

export function RecommendedCandidates({
  projectId,
  positions,
  jobRoleLabels,
  skillLabels,
}: RecommendedCandidatesProps) {
  const user = useCurrentUser();
  const [activePositionId, setActivePositionId] = useState(positions[0]?.positionId ?? 0);
  const [candidateList, setCandidateList] = useState<CandidateListResponse | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [rejectCandidate, setRejectCandidate] = useState<CandidateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(positions.length > 0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRerecommending, setIsRerecommending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const requestSequence = useRef(0);

  const loadCandidates = useCallback(async (positionId: number) => {
    if (!positionId) return;
    const sequence = ++requestSequence.current;
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await getRecommendedCandidates(positionId);
      if (sequence !== requestSequence.current) return;
      setCandidateList(response);
      setSelectedIds([]);
      setIsRerecommending(response.preparing);
    } catch (error) {
      if (sequence !== requestSequence.current) return;
      setCandidateList(null);
      setErrorMessage(getErrorMessage(error));
    } finally {
      if (sequence === requestSequence.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) void loadCandidates(activePositionId);
    });
    return () => {
      cancelled = true;
    };
  }, [activePositionId, loadCandidates]);

  const handleMatchingNotification = useCallback((notification: MatchingNotification) => {
    if (notification.type !== "MATCHING_RECOMMENDED" || !notification.linkUrl.includes(`/positions/${activePositionId}/`)) return;
    setIsRerecommending(false);
    setSuccessMessage("AI 추천이 완료되었습니다.");
    void loadCandidates(activePositionId);
  }, [activePositionId, loadCandidates]);
  useMatchingNotifications(user?.accountId, handleMatchingNotification);

  const selectPosition = (positionId: number) => {
    setActivePositionId(positionId);
    setSuccessMessage("");
  };

  const toggleCandidate = (candidateId: number) => {
    if (!candidateList) return;
    setSelectedIds((current) => {
      if (current.includes(candidateId)) {
        return current.filter((id) => id !== candidateId);
      }
      return current.length < candidateList.headcount
        ? [...current, candidateId]
        : current;
    });
  };

  const confirmReject = async () => {
    if (!rejectCandidate || isProcessing) return;
    setIsProcessing(true);
    setErrorMessage("");
    try {
      const response = await rejectRecommendedCandidate(rejectCandidate.candidateId);
      setCandidateList(response);
      setSelectedIds((current) => current.filter((id) => id !== rejectCandidate.candidateId));
      setRejectCandidate(null);
      setSuccessMessage("후보를 관심 없음으로 처리했습니다.");
    } catch (error) {
      setRejectCandidate(null);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const sendRequests = async () => {
    if (!candidateList || selectedIds.length === 0 || isProcessing) return;
    setIsProcessing(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await createMatchingRequests({
        positionId: candidateList.positionId,
        candidateIds: selectedIds,
      });
      await loadCandidates(candidateList.positionId);
      setSuccessMessage("선택한 프리랜서에게 매칭 요청을 보냈습니다.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      if (error instanceof ApiException && error.errorCode === "MT_017") {
        await loadCandidates(candidateList.positionId);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const requestFreeRerecommendation = async () => {
    if (!candidateList || isRerecommending) return;
    setIsRerecommending(true); setErrorMessage("");
    try { await requestRerecommendation(candidateList.positionId, { type: "FREE" }); setSuccessMessage("재추천 요청을 접수했습니다. 완료되면 알림으로 알려드릴게요."); }
    catch (error) { setErrorMessage(getErrorMessage(error)); setIsRerecommending(false); }
  };

  if (positions.length === 0) {
    return <EmptyState message="등록된 모집 포지션이 없습니다." />;
  }

  return (
    <section className="mt-6">
      <div className="rounded-[12px] border border-[#f1dfa6] bg-[#fff8d9] px-5 py-4 text-[11px] font-semibold leading-5 text-[#a15c22]">
        현재 화면에는 매칭 시작 시점에 등록된 정보가 표시됩니다. 프로젝트 조건을 바탕으로 추천된 프리랜서를 확인해 보세요.
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {positions.map((position) => (
          <button key={position.positionId} type="button" onClick={() => selectPosition(position.positionId)} disabled={isProcessing} className={`h-10 rounded-full border px-5 text-[11px] font-bold transition disabled:cursor-not-allowed ${activePositionId === position.positionId ? "border-brand bg-brand text-white" : "border-theme bg-surface text-theme-secondary hover:bg-surface-subtle"}`}>
            {jobRoleLabels[position.jobRole] ?? position.jobRole} ({position.headcount}명 모집)
          </button>
        ))}
      </div>

      {errorMessage ? <p role="alert" className="mt-4 rounded-lg border border-[#fda29b] bg-danger-surface px-4 py-3 text-[12px] font-semibold text-theme-danger">{errorMessage}</p> : null}
      {successMessage ? <p role="status" className="mt-4 rounded-lg border border-[#a6d8b1] bg-[#edf9f0] px-4 py-3 text-[12px] font-semibold text-[#287a3a]">{successMessage}</p> : null}

      {isLoading ? (
        <div className="flex min-h-48 items-center justify-center text-[12px] font-semibold text-theme-secondary">추천 후보를 불러오고 있습니다.</div>
      ) : candidateList ? (
        <>
          {candidateList.preparing && candidateList.candidates.length === 0 ? (
            <div className="mt-5 flex min-h-48 flex-col items-center justify-center rounded-xl border border-theme bg-surface px-5 text-center"><span className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" aria-hidden="true" /><p className="mt-3 text-[12px] font-semibold text-theme-secondary">새 추천 후보를 만들고 있습니다. 잠시만 기다려 주세요.</p></div>
          ) : <>
          {candidateList.preparing ? <p role="status" className="mt-4 rounded-[10px] border border-[#c9dcfa] bg-[#eef6ff] px-4 py-3 text-[11px] font-semibold text-theme-secondary">새 추천 후보를 만들고 있습니다. 잠시만 기다려 주세요.</p> : null}
          <CandidateWarnings candidateList={candidateList} />
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] font-semibold text-theme-secondary">선택: <strong className="text-theme-primary">{selectedIds.length}/{candidateList.headcount}명</strong><span className="ml-4 text-theme-muted">현재 {candidateList.roundNo}회차 추천</span></p>
            <div className="flex gap-2"><button type="button" disabled={!candidateList.freeRerecommendAvailable || isRerecommending} onClick={() => void requestFreeRerecommendation()} className="h-10 rounded-[8px] border border-theme px-4 text-[11px] font-bold disabled:opacity-40">{isRerecommending ? "추천 후보를 찾고 있어요" : "무료 재추천"}</button>{isRerecommending ? <span className="flex h-10 items-center rounded-[8px] border border-theme px-4 text-[11px] font-bold text-theme-muted">재추천 진행 중</span> : <Link href={`/client/projects/${projectId}/candidatereroll?positionId=${candidateList.positionId}`} className="flex h-10 items-center rounded-[8px] border border-brand px-4 text-[11px] font-bold text-brand">유료 재추천 ({candidateList.paidRerecommendRemaining}회)</Link>}<button type="button" disabled={selectedIds.length === 0 || isProcessing} onClick={() => void sendRequests()} className="h-10 rounded-[8px] bg-brand px-5 text-[11px] font-bold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-[#aeb9c7]">{isProcessing ? "처리 중..." : `선택한 후보에게 요청 (${selectedIds.length})`}</button></div>
          </div>

          {candidateList.candidates.length === 0 ? (
            <EmptyState message="현재 추천할 수 있는 프리랜서가 없습니다. 잠시 후 다시 확인하거나 프로젝트 조건을 조정해 주세요." />
          ) : (
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {candidateList.candidates.map((candidate) => (
                <CandidateCard key={candidate.candidateId} candidate={candidate} projectId={projectId} jobRoleLabel={jobRoleLabels[candidate.jobRole] ?? candidate.jobRole} skillLabels={skillLabels} isSelected={selectedIds.includes(candidate.candidateId)} isProcessing={isProcessing} onToggle={() => toggleCandidate(candidate.candidateId)} onReject={() => setRejectCandidate(candidate)} />
              ))}
            </div>
          )}
          </>}
        </>
      ) : (
        <div className="mt-5 flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border border-theme bg-surface">
          <p className="text-[12px] text-theme-secondary">추천 후보를 불러오지 못했습니다.</p>
          <button type="button" onClick={() => void loadCandidates(activePositionId)} className="rounded-lg bg-brand px-4 py-2 text-[11px] font-bold text-white">다시 시도</button>
        </div>
      )}

      <ConfirmModal open={rejectCandidate !== null} title={`${rejectCandidate?.name ?? "후보"} 님을 거절하시겠습니까?`} description="거절한 프리랜서는 이 프로젝트의 추천 후보 목록에서 제외되며 다시 선택할 수 없습니다." confirmText={isProcessing ? "처리 중..." : "거절"} cancelText="취소" variant="danger" icon={<WarningIcon />} closeOnOverlayClick={!isProcessing} onClose={() => !isProcessing && setRejectCandidate(null)} onConfirm={() => void confirmReject()} />
    </section>
  );
}

const CandidateWarnings = ({ candidateList }: { candidateList: CandidateListResponse }) => (
  <div className="mt-4 space-y-2">
    {candidateList.lowScoreWarned ? <p className="rounded-[10px] border border-[#f1dfa6] bg-[#fff8d9] px-4 py-3 text-[11px] font-semibold text-[#a15c22]">현재 후보를 모두 거절하면, 다음 순번 후보 중 적합도가 낮은 후보가 포함될 수 있어요.</p> : null}
    {candidateList.budgetWarned ? <p className="rounded-[10px] border border-[#f1dfa6] bg-[#fff8d9] px-4 py-3 text-[11px] font-semibold text-[#a15c22]">추천된 후보들의 희망 단가 합계가 남은 예산을 넘습니다. 협상에서 조정이 필요할 수 있어요.</p> : null}
  </div>
);

interface CandidateCardProps {
  candidate: CandidateResponse;
  projectId: number;
  jobRoleLabel: string;
  skillLabels: Record<string, string>;
  isSelected: boolean;
  isProcessing: boolean;
  onToggle: () => void;
  onReject: () => void;
}

const CandidateCard = ({ candidate, projectId, jobRoleLabel, skillLabels, isSelected, isProcessing, onToggle, onReject }: CandidateCardProps) => {
  const disabled = candidate.requested || candidate.rejected || isProcessing;
  return (
    <article className={`rounded-[14px] border bg-surface p-5 transition ${candidate.rejected ? "opacity-55" : ""} ${isSelected ? "border-brand shadow-[0_0_0_1px_var(--brand)]" : "border-theme"}`}>
      <div className="flex items-center gap-4">
        {candidate.profileImageUrl ? <Image src={candidate.profileImageUrl} alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-full object-cover" /> : <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-[17px] font-bold text-white">{candidate.name.slice(0, 1)}</div>}
        <div>
          <h2 className="text-[15px] font-extrabold text-theme-primary">{candidate.name}</h2>
          <p className="mt-1 text-[11px] font-semibold text-theme-secondary">{jobRoleLabel} · {candidate.careerYears}년 경력 · {GRADE_LABEL[candidate.grade] ?? candidate.grade}</p>
          {candidate.ratingAverage != null ? <p className="mt-1 text-[11px] font-bold text-[#e7a317]">★ {candidate.ratingAverage.toFixed(1)} <span className="font-medium text-theme-muted">({candidate.reviewCount}건)</span></p> : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">{candidate.skills.map((skill) => <span key={skill} className="rounded-[5px] border border-[#d6dfeb] bg-[#f1f5fa] px-2.5 py-1 text-[9px] font-bold text-[#253957]">{skillLabels[skill] ?? skill}</span>)}</div>
      <div className="mt-3 rounded-[10px] bg-[#eef1f5] px-4 py-3"><h3 className="text-[11px] font-extrabold text-theme-primary">AI 추천 이유</h3><div className="mt-2 flex flex-wrap gap-1.5">{candidate.fitReasons.map((reason) => <span key={reason} className="rounded-[5px] border border-theme bg-surface px-2.5 py-1 text-[9px] font-semibold text-theme-secondary">{reason}</span>)}</div></div>
      <p className="mt-4 text-[14px] font-extrabold text-theme-primary">{PAY_UNIT_LABEL[candidate.payUnit]} {candidate.payAmount.toLocaleString("ko-KR")}원</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <button type="button" onClick={onReject} disabled={disabled} className="h-10 rounded-[8px] border border-theme bg-surface text-[11px] font-bold text-[#b4472d] hover:bg-danger-surface disabled:cursor-not-allowed disabled:text-theme-muted">{candidate.rejected ? "거절됨" : "거절"}</button>
        <Link href={`/client/projects/${projectId}/candidates/${candidate.candidateId}`} className="flex h-10 items-center justify-center rounded-[8px] border border-theme bg-surface text-[11px] font-bold text-theme-secondary hover:bg-surface-subtle">프로필</Link>
        <button type="button" onClick={onToggle} disabled={disabled} className={`h-10 rounded-[8px] text-[11px] font-bold transition disabled:cursor-not-allowed disabled:bg-[#aeb9c7] disabled:text-white ${isSelected ? "border border-brand bg-surface text-brand" : "bg-brand text-white hover:bg-brand-hover"}`}>{candidate.requested ? "요청 완료" : isSelected ? "선택 취소" : "선택"}</button>
      </div>
    </article>
  );
};

const EmptyState = ({ message }: { message: string }) => <div className="mt-5 flex min-h-40 items-center justify-center rounded-xl border border-theme bg-surface px-5 text-center text-[12px] text-theme-secondary">{message}</div>;
