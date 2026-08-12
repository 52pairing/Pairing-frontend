"use client";

import { useEffect, useId, useState } from "react";

import { Modal } from "@/features/common/components/Modal";
import type { RecommendedCandidateItem } from "@/features/client/myprojects/types/components";

const CANDIDATES: RecommendedCandidateItem[] = [
  {
    id: 1,
    name: "김개발",
    role: "프론트엔드 개발자",
    career: "5년 경력",
    level: "시니어",
    rating: 4.8,
    reviewCount: 17,
    monthlyRate: 6_500_000,
    skills: ["React", "Next.js", "TypeScript", "Zustand"],
    reasons: ["요구 스킬 97% 일치", "경력 조건 충족", "재택 근무 선호", "시작 가능일 일치", "유사 프로젝트 3건"],
    introduction: "복잡한 비즈니스 요구사항을 사용하기 쉬운 화면으로 구현하는 프론트엔드 개발자입니다.",
    avatarClass: "bg-[#3478f6]",
  },
  {
    id: 2,
    name: "이서연",
    role: "프론트엔드 개발자",
    career: "4년 경력",
    level: "미들",
    rating: 4.7,
    reviewCount: 12,
    monthlyRate: 5_800_000,
    skills: ["React", "TypeScript", "Tailwind", "GraphQL"],
    reasons: ["요구 스킬 84% 일치", "경력 조건 충족", "재택 근무 선호", "시작 가능일 일치", "유사 프로젝트 1건"],
    introduction: "제품의 목적과 사용자 흐름을 함께 고민하며 안정적인 웹 서비스를 만듭니다.",
    avatarClass: "bg-[#7c3aed]",
  },
  {
    id: 3,
    name: "박지훈",
    role: "프론트엔드 개발자",
    career: "6년 경력",
    level: "시니어",
    rating: 4.9,
    reviewCount: 21,
    monthlyRate: 6_200_000,
    skills: ["React", "Next.js", "JavaScript", "TanStack Query"],
    reasons: ["요구 스킬 91% 일치", "경력 조건 충족", "협업 평가 우수", "시작 가능일 일치", "유사 프로젝트 2건"],
    introduction: "서비스 성능과 유지보수성을 함께 고려해 팀이 오래 운영할 수 있는 프론트엔드를 구현합니다.",
    avatarClass: "bg-[#16a34a]",
  },
];

export function RecommendedCandidates() {
  const [selectedRole, setSelectedRole] = useState("프론트엔드 개발자");
  const [recommendationRound, setRecommendationRound] = useState(1);
  const [rejectedIds, setRejectedIds] = useState<number[]>([]);
  const [requestedIds, setRequestedIds] = useState<number[]>([]);
  const [candidateToRequest, setCandidateToRequest] = useState<RecommendedCandidateItem | null>(null);
  const [candidateToReject, setCandidateToReject] = useState<RecommendedCandidateItem | null>(null);
  const [profileCandidate, setProfileCandidate] = useState<RecommendedCandidateItem | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(""), 2500);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const visibleCandidates = CANDIDATES.filter((candidate) => !rejectedIds.includes(candidate.id));
  const isCandidateExhausted = selectedRole === "프론트엔드 개발자" && visibleCandidates.length === 0;
  const isLastRecommendation = recommendationRound === 5;

  const sendRequest = () => {
    if (!candidateToRequest) return;
    setRequestedIds((current) => [...current, candidateToRequest.id]);
    setCandidateToRequest(null);
    setToastMessage("매칭 요청을 보냈습니다.");
  };

  const rejectCandidate = () => {
    if (!candidateToReject) return;
    setRejectedIds((current) => [...current, candidateToReject.id]);
    setCandidateToReject(null);
    setToastMessage("추천 후보를 거절했습니다.");
  };

  const requestMoreCandidates = () => {
    if (recommendationRound >= 5) return;
    setRecommendationRound((current) => current + 1);
    setRejectedIds([]);
    setToastMessage(`${recommendationRound + 1}회차 추천 후보를 불러왔습니다.`);
  };

  return (
    <section className="relative mt-6">
      {toastMessage ? (
        <div role="status" className="fixed left-1/2 top-24 z-40 -translate-x-1/2 rounded-lg bg-[#102a49] px-6 py-3 text-[13px] font-bold text-white shadow-lg">
          {toastMessage}
        </div>
      ) : null}

      <div className="rounded-[12px] border border-warning-border bg-warning-surface px-5 py-3.5 text-[11px] font-medium leading-5 text-theme-warning">
        현재 화면에는 매칭 시작 시점에 등록된 정보가 표시됩니다. 프로젝트 조건을 바탕으로 추천된 프리랜서를 확인해 보세요. AI가 매칭 점수와 이유를 함께 제공합니다.
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {["프론트엔드 개발자", "백엔드 개발자"].map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => setSelectedRole(role)}
            className={`rounded-full border px-4 py-2 text-[11px] font-semibold transition ${selectedRole === role ? "border-brand bg-brand text-white" : "border-theme bg-surface text-theme-secondary hover:border-theme-strong"}`}
          >
            {role} ({role === "프론트엔드 개발자" ? "2" : "1"}명 모집)
          </button>
        ))}
      </div>

      <p className="mt-5 text-[12px] font-medium text-theme-secondary">
        선택: <strong className="text-theme-primary">{requestedIds.length}/2명</strong>
        <span className="ml-3 text-theme-muted">현재 {recommendationRound}회차 추천</span>
      </p>

      {selectedRole === "백엔드 개발자" ? (
        <div className="mt-5 flex min-h-[280px] items-center justify-center rounded-[14px] border border-theme bg-surface text-center text-[13px] leading-6 text-theme-secondary">
          백엔드 개발자 추천 후보를 찾고 있습니다.<br />매칭이 완료되면 이 화면에서 확인할 수 있습니다.
        </div>
      ) : visibleCandidates.length > 0 ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleCandidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              requested={requestedIds.includes(candidate.id)}
              onReject={() => setCandidateToReject(candidate)}
              onProfile={() => setProfileCandidate(candidate)}
              onRequest={() => setCandidateToRequest(candidate)}
            />
          ))}
        </div>
      ) : (
        <div className="mt-5 flex min-h-[220px] items-center justify-center rounded-[14px] border border-theme bg-surface text-[13px] text-theme-secondary">
          현재 확인할 수 있는 추천 후보가 없습니다.
        </div>
      )}

      {rejectedIds.length === 1 ? (
        <p className="mt-5 rounded-[12px] border border-[#ff6b6b] bg-danger-surface px-5 py-4 text-[12px] font-bold text-theme-danger">
          다음 재추천부터 적합도가 낮은 후보가 포함될 수 있습니다.
        </p>
      ) : null}
      {isCandidateExhausted ? (
        <div className="mt-5">
          <p className="rounded-[12px] border border-[#ff6b6b] bg-danger-surface px-5 py-4 text-[12px] font-bold text-theme-danger">조건에 맞는 프리랜서를 모두 추천해, 더 이상 보여드릴 후보가 없습니다.</p>
          {!isLastRecommendation ? (
            <div className="mt-3 flex justify-end">
              <button type="button" onClick={requestMoreCandidates} className="rounded-[8px] bg-brand px-4 py-2.5 text-[11px] font-semibold text-white hover:bg-brand-hover">재추천 받기</button>
            </div>
          ) : null}
        </div>
      ) : null}

      {isLastRecommendation ? (
        <p className="mt-3 rounded-[12px] border border-[#ff6b6b] bg-danger-surface px-5 py-4 text-[12px] font-bold text-theme-danger">이번이 마지막 재추천이라, 이후에는 추가 후보를 받을 수 없습니다.</p>
      ) : null}

      <CompactActionModal
        open={candidateToRequest !== null}
        title="선택한 프리랜서에게 매칭 요청을 보내시겠습니까?"
        description="프리랜서는 요청을 받은 후 3일 이내에 수락 또는 거절할 수 있습니다."
        cancelText="취소"
        confirmText="요청 보내기"
        onClose={() => setCandidateToRequest(null)}
        onConfirm={sendRequest}
      />

      <CompactActionModal
        open={candidateToReject !== null}
        title="추천 프리랜서를 거절하시겠어요?"
        description="거절하면 해당 프리랜서와의 매칭은 진행되지 않으며, 다른 추천 프리랜서를 확인할 수 있습니다."
        cancelText="계속 검토하기"
        confirmText="추천 거절"
        onClose={() => setCandidateToReject(null)}
        onConfirm={rejectCandidate}
      />

      <CandidateProfileModal candidate={profileCandidate} onClose={() => setProfileCandidate(null)} />
    </section>
  );
}

function CandidateCard({ candidate, requested, onReject, onProfile, onRequest }: { candidate: RecommendedCandidateItem; requested: boolean; onReject: () => void; onProfile: () => void; onRequest: () => void }) {
  return (
    <article className="flex h-full flex-col rounded-[14px] border border-theme bg-surface p-4">
      <div className="flex items-center gap-3">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[17px] font-bold text-white ${candidate.avatarClass}`}>{candidate.name.slice(0, 1)}</span>
        <div>
          <h2 className="text-[14px] font-bold">{candidate.name}</h2>
          <p className="mt-1 text-[11px] font-medium text-theme-secondary">{candidate.role} · {candidate.career} · {candidate.level}</p>
          <p className="mt-1 text-[11px] font-semibold"><span className="text-[#f59e0b]">★</span> {candidate.rating} <span className="font-normal text-theme-muted">({candidate.reviewCount}건)</span></p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {candidate.skills.map((skill) => <span key={skill} className="rounded-[6px] border border-[#cbdcf7] bg-[#eef5ff] px-2 py-1 text-[9px] font-semibold text-[#17365d]">{skill}</span>)}
      </div>
      <div className="mt-3 rounded-[10px] bg-surface-muted p-3">
        <h3 className="text-[10px] font-bold">AI 추천 이유</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {candidate.reasons.map((reason) => <span key={reason} className="rounded-[5px] border border-theme bg-surface px-2 py-1 text-[9px] font-medium text-theme-secondary">{reason}</span>)}
        </div>
      </div>
      <div className="mt-auto pt-3">
        <strong className="text-[13px] font-bold">월 {candidate.monthlyRate.toLocaleString("ko-KR")}원</strong>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button type="button" onClick={onReject} className="min-w-0 rounded-[8px] border border-[#ff6b6b] px-2 py-2 text-[10px] font-semibold text-theme-danger hover:bg-danger-surface">거절</button>
          <button type="button" onClick={onProfile} className="min-w-0 rounded-[8px] border border-theme px-2 py-2 text-[10px] font-semibold text-theme-secondary hover:bg-surface-subtle">프로필</button>
          <button type="button" disabled={requested} onClick={onRequest} className="min-w-0 rounded-[8px] bg-brand px-2 py-2 text-[10px] font-semibold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-[#98a2b3]">{requested ? "요청 완료" : "요청"}</button>
        </div>
      </div>
    </article>
  );
}

function CandidateProfileModal({ candidate, onClose }: { candidate: RecommendedCandidateItem | null; onClose: () => void }) {
  return (
    <Modal open={candidate !== null} onClose={onClose} size="lg">
      {candidate ? (
        <div>
          <div className="flex items-center gap-4">
            <span className={`flex h-16 w-16 items-center justify-center rounded-full text-[22px] font-extrabold text-white ${candidate.avatarClass}`}>{candidate.name.slice(0, 1)}</span>
            <div><h2 className="text-xl font-extrabold">{candidate.name}</h2><p className="mt-1 text-sm text-theme-secondary">{candidate.role} · {candidate.career}</p></div>
          </div>
          <p className="mt-6 rounded-xl bg-surface-muted p-5 text-sm leading-7 text-theme-secondary">{candidate.introduction}</p>
          <div className="mt-5 flex flex-wrap gap-2">{candidate.skills.map((skill) => <span key={skill} className="rounded-lg border border-theme px-3 py-2 text-xs font-bold">{skill}</span>)}</div>
          <button type="button" onClick={onClose} className="mt-7 w-full rounded-lg bg-brand px-4 py-3 text-sm font-bold text-white hover:bg-brand-hover">확인</button>
        </div>
      ) : null}
    </Modal>
  );
}

function CompactActionModal({ open, title, description, cancelText, confirmText, onClose, onConfirm }: { open: boolean; title: string; description: string; cancelText: string; confirmText: string; onClose: () => void; onConfirm: () => void }) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Modal open={open} onClose={onClose} size="xs" labelledBy={titleId} describedBy={descriptionId}>
      <h2 id={titleId} className="text-[15px] font-bold leading-6">{title}</h2>
      <p id={descriptionId} className="mt-2 text-[11px] leading-5 text-theme-secondary">{description}</p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <button type="button" onClick={onClose} className="rounded-[8px] border border-theme px-3 py-2.5 text-[11px] font-semibold text-theme-secondary hover:bg-surface-subtle">{cancelText}</button>
        <button type="button" onClick={onConfirm} className="rounded-[8px] bg-brand px-3 py-2.5 text-[11px] font-semibold text-white hover:bg-brand-hover">{confirmText}</button>
      </div>
    </Modal>
  );
}
