"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { ConfirmModal, WarningIcon } from "@/features/common/components/Modal";
import { RECOMMENDED_CANDIDATES } from "@/features/matching/constants/recommendedCandidates";
import type { RecommendedCandidate } from "@/features/matching/types/candidate";

interface RecommendedCandidatesProps { projectId: number; }

const AVATAR_COLORS = ["bg-[#5275eb]", "bg-[#7337e6]", "bg-[#4ba653]"];

export function RecommendedCandidates({ projectId }: RecommendedCandidatesProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeRole, setActiveRole] = useState("프론트엔드 개발자");
  const [rejectedIds, setRejectedIds] = useState<number[]>([]);
  const [rejectCandidate, setRejectCandidate] = useState<RecommendedCandidate | null>(null);
  const searchParams = useSearchParams();
  const [isLowSuitabilityNoticeOpen, setIsLowSuitabilityNoticeOpen] = useState(searchParams.get("lowSuitability") === "true");

  const toggleCandidate = (candidateId: number) => {
    setSelectedIds((current) => current.includes(candidateId) ? current.filter((id) => id !== candidateId) : current.length < 2 ? [...current, candidateId] : current);
  };

  const confirmReject = () => {
    if (!rejectCandidate) return;
    setRejectedIds((current) => [...current, rejectCandidate.id]);
    setSelectedIds((current) => current.filter((id) => id !== rejectCandidate.id));
    setRejectCandidate(null);
  };

  const visibleCandidates = RECOMMENDED_CANDIDATES.filter((candidate) => !rejectedIds.includes(candidate.id));

  return (
    <section className="mt-6">
      <div className="rounded-[12px] border border-[#f1dfa6] bg-[#fff8d9] px-5 py-4 text-[11px] font-semibold leading-5 text-[#a15c22]">
        현재 화면에는 매칭 시작 시점에 등록된 정보가 표시됩니다. 프로젝트 조건을 바탕으로 추천된 프리랜서를 확인해 보세요. AI가 매칭 점수와 이유를 함께 제공합니다.
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {["프론트엔드 개발자", "백엔드 개발자"].map((role, index) => (
          <button key={role} type="button" onClick={() => setActiveRole(role)} className={`h-10 rounded-full border px-5 text-[11px] font-bold transition ${activeRole === role ? "border-brand bg-brand text-white" : "border-theme bg-surface text-theme-secondary hover:bg-surface-subtle"}`}>
            {role} ({index === 0 ? 2 : 1}명 모집)
          </button>
        ))}
      </div>

      <p className="mt-5 text-[11px] font-semibold text-theme-secondary">선택: <strong className="text-theme-primary">{selectedIds.length}/2명</strong><span className="ml-4 text-theme-muted">현재 1회차 추천</span></p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {visibleCandidates.map((candidate, index) => (
          <CandidateCard key={candidate.id} candidate={candidate} projectId={projectId} avatarClass={AVATAR_COLORS[index % AVATAR_COLORS.length]} isSelected={selectedIds.includes(candidate.id)} onToggle={() => toggleCandidate(candidate.id)} onReject={() => setRejectCandidate(candidate)} />
        ))}
      </div>

      <ConfirmModal
        open={rejectCandidate !== null}
        title={`${rejectCandidate?.name ?? "후보"} 님을 거절하시겠습니까?`}
        description="거절한 프리랜서는 이 프로젝트의 추천 후보 목록에서 제외되며 다시 선택할 수 없습니다."
        confirmText="거절"
        cancelText="취소"
        variant="danger"
        icon={<WarningIcon />}
        onClose={() => setRejectCandidate(null)}
        onConfirm={confirmReject}
      />
      <ConfirmModal open={isLowSuitabilityNoticeOpen} title="추천 후보를 확인해 주세요" description="조건에 맞는 후보가 부족하여 적합도가 낮은 후보가 포함될 수 있습니다." confirmText="확인" icon={<WarningIcon />} onClose={() => setIsLowSuitabilityNoticeOpen(false)} onConfirm={() => setIsLowSuitabilityNoticeOpen(false)} />
      {searchParams.get("reroll") === "complete" ? <div role="status" className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-[8px] bg-[#142f50] px-5 py-3 text-[11px] font-bold text-white shadow-lg">AI 추천이 완료되었습니다.</div> : null}
    </section>
  );
}

interface CandidateCardProps { candidate: RecommendedCandidate; projectId: number; avatarClass: string; isSelected: boolean; onToggle: () => void; onReject: () => void; }

function CandidateCard({ candidate, projectId, avatarClass, isSelected, onToggle, onReject }: CandidateCardProps) {
  return (
    <article className={`rounded-[14px] border bg-surface p-5 transition ${isSelected ? "border-brand shadow-[0_0_0_1px_var(--brand)]" : "border-theme"}`}>
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[17px] font-bold text-white ${avatarClass}`}>{candidate.name.slice(0, 1)}</div>
        <div>
          <h2 className="text-[15px] font-extrabold text-theme-primary">{candidate.name}</h2>
          <p className="mt-1 text-[11px] font-semibold text-theme-secondary">{candidate.role} · {candidate.careerYears}년 경력 · {candidate.level}</p>
          <p className="mt-1 text-[11px] font-bold text-[#e7a317]">★ {candidate.rating} <span className="font-medium text-theme-muted">({candidate.reviewCount}건)</span></p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">{candidate.skills.map((skill) => <span key={skill} className="rounded-[5px] border border-[#d6dfeb] bg-[#f1f5fa] px-2.5 py-1 text-[9px] font-bold text-[#253957]">{skill}</span>)}</div>

      <div className="mt-3 rounded-[10px] bg-[#eef1f5] px-4 py-3">
        <h3 className="text-[11px] font-extrabold text-theme-primary">AI 추천 이유</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">{candidate.recommendationReasons.map((reason) => <span key={reason} className="rounded-[5px] border border-theme bg-surface px-2.5 py-1 text-[9px] font-semibold text-theme-secondary">{reason}</span>)}</div>
      </div>

      <p className="mt-4 text-[14px] font-extrabold text-theme-primary">{candidate.desiredRate}</p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button type="button" onClick={onReject} className="h-10 rounded-[8px] border border-theme bg-surface text-[11px] font-bold text-[#b4472d] hover:bg-danger-surface">거절</button>
        <Link href={`/client/projects/${projectId}/candidates/${candidate.id}`} className="flex h-10 items-center justify-center rounded-[8px] border border-theme bg-surface text-[11px] font-bold text-theme-secondary hover:bg-surface-subtle">프로필</Link>
        <button type="button" onClick={onToggle} className={`h-10 rounded-[8px] text-[11px] font-bold transition ${isSelected ? "border border-brand bg-surface text-brand" : "bg-brand text-white hover:bg-brand-hover"}`}>{isSelected ? "선택 취소" : "요청"}</button>
      </div>
    </article>
  );
}
