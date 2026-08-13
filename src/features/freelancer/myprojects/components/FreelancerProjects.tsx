"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getProjectJobRoles, getProjectSkills } from "@/features/client/projects/services/projectPreReview";
import { acceptMatchingRequest, getReceivedMatchingRequests, rejectMatchingRequest } from "@/features/matching/services/matching";
import type { MatchingRequestResponse, MatchingRequestTab } from "@/features/matching/types/matching";
import { FreelancerProjectCard, type FreelancerProjectCardProps, type FreelancerProjectState } from "./FreelancerProjectCard";
import { FreelancerProjectStatusTabs, type FreelancerProjectStatus } from "./FreelancerProjectStatusTabs";
import { ProjectRejectModals } from "./ProjectRejectModals";
import { ApiException } from "@/lib/api";

const TAB_MAP: Record<FreelancerProjectStatus, MatchingRequestTab> = { "전체": "ALL", "검토 중": "REVIEWING", "협상 중": "NEGOTIATING", "종료됨": "CLOSED" };

function stateOf(status: MatchingRequestResponse["status"]): FreelancerProjectState {
  if (status === "REQUEST_PENDING") return "검토 중";
  if (status === "NEGOTIATING" || status === "ACCEPTED" || status === "CONTRACT_PENDING") return "협상 중";
  return "종료됨";
}

export function FreelancerProjects() {
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState<FreelancerProjectStatus>("전체");
  const [items, setItems] = useState<MatchingRequestResponse[]>([]);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [rejectItem, setRejectItem] = useState<MatchingRequestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [renderedAt] = useState(() => Date.now());
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [rejectError, setRejectError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getReceivedMatchingRequests({ tab: TAB_MAP[activeStatus], page, size: 10 });
      setItems(response.content);
      setTotalPages(response.totalPages);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "프로젝트 제안을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [activeStatus, page]);

  useEffect(() => {
    void Promise.all([getProjectJobRoles(), getProjectSkills()])
      .then(([roles, skills]) => setLabels(Object.fromEntries([...roles, ...skills].map(({ code, label }) => [code, label]))))
      .catch(() => setLabels({}));
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => { if (!cancelled) void load(); });
    return () => { cancelled = true; };
  }, [load]);

  const toCard = (item: MatchingRequestResponse): FreelancerProjectCardProps => {
    const expiresAt = new Date(item.expiresAt).getTime();
    const daysLeft = Math.max(0, Math.ceil((expiresAt - renderedAt) / 86400000));
    return {
      id: String(item.requestId),
      title: item.projectTitle,
      state: stateOf(item.status),
      result: item.rejectReason === "EXPIRED" ? "응답 기한 마감" : item.status === "REJECTED" ? "거절함" : undefined,
      deadline: item.status === "REQUEST_PENDING" ? `D-${daysLeft} 남음` : undefined,
      notice: item.status === "REQUEST_PENDING" ? "3일 내 응답 없으면 자동 거절 처리됩니다" : item.newProposalCount ? `새 AI 제안 ${item.newProposalCount}건` : undefined,
      industry: item.companyName ?? item.counterpartName,
      companySize: item.companyProfile ?? "회사 정보 확인 필요",
      position: labels[item.jobRole] ?? item.jobRole,
      budget: item.budgetAmount == null ? "협의" : `월 ${item.budgetAmount.toLocaleString("ko-KR")}원`,
      duration: item.periodLabel ?? "확인 필요",
      startDate: item.startDesiredDate ?? "협의",
      workType: item.workLabel ?? "협의",
      experience: item.minCareerYears == null ? "무관" : `${item.minCareerYears}년 이상`,
      skills: item.skills.map((skill) => labels[skill] ?? skill),
      receivedAt: item.requestedAt.slice(0, 10),
      round: item.currentRound && item.maxRound ? `${item.currentRound}/${item.maxRound}` : undefined,
      negotiationHref: item.negotiationId ? `/freelancer/projects/${item.projectId}/negotiation/${item.negotiationId}` : undefined,
      onReject: () => { setRejectError(""); setRejectItem(item); },
      onAccept: () => void acceptMatchingRequest(item.requestId).then(async (result) => { if (result.status === "NEGOTIATING" && result.negotiationId) router.push(`/freelancer/projects/${result.projectId}/negotiation/${result.negotiationId}`); else await load(); }).catch(async (cause) => { const message = cause instanceof Error ? cause.message : "수락하지 못했습니다."; if (cause instanceof ApiException && cause.errorCode === "MT_016") await load(); setError(message); }),
    };
  };

  return (
    <main className="min-h-screen bg-surface-subtle pb-8">
      <div className="mx-auto w-full max-w-[1000px] px-4 pt-6 sm:px-5">
        <h1 className="text-[20px] font-bold tracking-[-0.6px] text-theme-primary">프로젝트 제안</h1>
        <FreelancerProjectStatusTabs activeStatus={activeStatus} onStatusChange={(status) => { setActiveStatus(status); setPage(0); }} />
        {error ? <p role="alert" className="mt-5 rounded-xl border border-[#fda29b] bg-danger-surface p-4 text-[12px] text-theme-danger">{error}</p> : null}
        {loading ? <div className="mt-5 flex h-32 items-center justify-center rounded-xl border border-theme bg-surface text-[12px] text-theme-muted">프로젝트 제안을 불러오고 있습니다.</div> : items.length ? (
          <><div className="mt-5 flex flex-col gap-3">{items.map((item) => <FreelancerProjectCard key={item.requestId} {...toCard(item)} />)}</div>{totalPages > 1 ? <div className="mt-5 flex items-center justify-center gap-3"><button type="button" disabled={page === 0 || loading} onClick={() => setPage((value) => value - 1)} className="h-8 rounded-[7px] border border-theme bg-surface px-4 text-[11px] font-semibold disabled:opacity-40">이전</button><span className="text-[11px] font-semibold text-theme-muted">{page + 1} / {totalPages}</span><button type="button" disabled={page + 1 >= totalPages || loading} onClick={() => setPage((value) => value + 1)} className="h-8 rounded-[7px] border border-theme bg-surface px-4 text-[11px] font-semibold disabled:opacity-40">다음</button></div> : null}</>
        ) : <div className="mt-5 flex h-32 items-center justify-center rounded-xl border border-theme bg-surface text-[12px] text-theme-muted">해당 상태의 프로젝트가 없습니다.</div>}
      </div>
      <ProjectRejectModals open={rejectItem !== null} projectTitle={rejectItem?.projectTitle ?? "프로젝트"} errorMessage={rejectError} onClose={() => setRejectItem(null)} onConfirm={async (reason) => { if (!rejectItem) return; try { await rejectMatchingRequest(rejectItem.requestId, reason); await load(); } catch (cause) { const message = cause instanceof Error ? cause.message : "거절하지 못했습니다."; setRejectError(message); if (cause instanceof ApiException && cause.errorCode === "MT_016") await load(); throw cause; } }} />
    </main>
  );
}
