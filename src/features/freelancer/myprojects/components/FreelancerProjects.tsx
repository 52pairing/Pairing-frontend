"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { getProjectJobRoles, getProjectSkills } from "@/features/client/projects/services/projectPreReview";
import { acceptMatchingRequest, getReceivedMatchingRequests, rejectMatchingRequest } from "@/features/matching/services/matching";
import type { MatchingRequestResponse, MatchingRequestTab } from "@/features/matching/types/matching";
import { getNegotiation, getWorkConditionsMeta } from "@/features/negotiation/services/negotiation";
import type { ConditionType, NegotiationDetail } from "@/features/negotiation/types/negotiation";
import { EMPTY_WORK_CONDITION_LABELS, formatConditionValue, toLabelMap, type WorkConditionLabels } from "@/features/negotiation/utils/conditionFormat";
import { FreelancerProjectCard, type FreelancerProjectCardProps, type FreelancerProjectState } from "./FreelancerProjectCard";
import { FreelancerProjectStatusTabs, type FreelancerProjectStatus } from "./FreelancerProjectStatusTabs";
import { ProjectRejectModals } from "./ProjectRejectModals";
import { ApiException } from "@/lib/api";

const TAB_MAP: Record<FreelancerProjectStatus, MatchingRequestTab> = { "전체": "ALL", "검토 중": "REVIEWING", "협상 중": "NEGOTIATING", "종료됨": "CLOSED" };

// 재조회로 상태를 최신화해야 하는 매칭 에러 코드 (가이드 7장: 목록을 새로고침해 최신 상태를 보여주는 게 맞는 처리)
const REFRESH_ON_ERROR_CODES = new Set(["MT_006", "MT_007", "MT_016"]);

// 종료됨 탭 중 거절·결렬이 아닌 상태(계약 이후 흐름)의 카드 칩 라벨
const CLOSED_STATUS_CHIP_LABEL: Partial<Record<MatchingRequestResponse["status"], string>> = {
  CONTRACTED: "계약 완료",
  IN_PROGRESS: "진행 중",
  COMPLETION_PENDING: "완료 대기",
  CLOSED: "종료",
  TERMINATED: "중도 종료",
};

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
  const [negotiationSummaries, setNegotiationSummaries] = useState<Record<number, NegotiationDetail>>({});
  const [workLabels, setWorkLabels] = useState<WorkConditionLabels>(EMPTY_WORK_CONDITION_LABELS);
  const fetchedNegotiationIds = useRef<Set<number>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getReceivedMatchingRequests({ tab: TAB_MAP[activeStatus], page, size: 10 });
      setItems(response.content);
      setTotalPages(response.totalPages);
      setError("");
      // 목록을 새로 받을 때마다 협상 요약도 다시 받는다 — 캐시를 그대로 두면 탭을 오갈 때
      // 이미 불러온 negotiationId의 라운드·대기 상태가 최신 값으로 안 바뀐다.
      fetchedNegotiationIds.current = new Set();
      setNegotiationSummaries({});
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "프로젝트 제안을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [activeStatus, page]);

  // 목록/상세에 공통으로 필요한 라벨(직군·기술)과, 협상 조건 값 라벨(근무 방식·형태·기간 단위)을 각각 로드
  useEffect(() => {
    void Promise.all([getProjectJobRoles(), getProjectSkills()])
      .then(([roles, skills]) => setLabels(Object.fromEntries([...roles, ...skills].map(({ code, label }) => [code, label]))))
      .catch(() => setLabels({}));
  }, []);

  useEffect(() => {
    void getWorkConditionsMeta()
      .then((meta) => setWorkLabels({ workStyles: toLabelMap(meta.workStyles), workForms: toLabelMap(meta.workForms), periodUnits: toLabelMap(meta.periodUnits) }))
      .catch(() => setWorkLabels(EMPTY_WORK_CONDITION_LABELS));
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => { if (!cancelled) void load(); });
    return () => { cancelled = true; };
  }, [load]);

  // "협상 중" 카드의 "AI 최종 협의 조건" 블록을 위해, 아직 안 불러온 협상 상세만 지연 로드
  useEffect(() => {
    const targets = items
      .map((item) => item.negotiationId)
      .filter((id): id is number => id != null && !fetchedNegotiationIds.current.has(id));
    if (!targets.length) return;
    targets.forEach((id) => fetchedNegotiationIds.current.add(id));

    let cancelled = false;
    void Promise.all(targets.map((id) => getNegotiation(id).then((detail) => [id, detail] as const).catch(() => null)))
      .then((results) => {
        if (cancelled) return;
        const next = Object.fromEntries(results.filter((r): r is readonly [number, NegotiationDetail] => r !== null));
        if (Object.keys(next).length) setNegotiationSummaries((prev) => ({ ...prev, ...next }));
      });
    return () => { cancelled = true; };
  }, [items]);

  // 수락/거절 요청이 진행되는 동안 탭을 바꿔도 최신 탭 기준으로 판단하도록 ref로 읽는다
  // (activeStatus를 그대로 클로저로 캡처하면, 응답이 늦게 오는 사이 탭을 바꿨을 때 이전 탭 기준으로 잘못 반영될 수 있음)
  const activeStatusRef = useRef(activeStatus);
  useEffect(() => {
    activeStatusRef.current = activeStatus;
  }, [activeStatus]);

  // 검토 중/전체가 아닌 탭에서는 상태가 바뀐 카드가 더 이상 그 탭에 속하지 않으므로 목록에서 제거,
  // 전체 탭이면 카드만 최신 데이터로 교체 (가이드 1.2.1: 전체 재조회로 스크롤이 튀는 것을 피함)
  const applyUpdatedItem = useCallback((updated: MatchingRequestResponse) => {
    setItems((prev) => (activeStatusRef.current === "전체" ? prev.map((it) => (it.requestId === updated.requestId ? updated : it)) : prev.filter((it) => it.requestId !== updated.requestId)));
  }, []);

  const buildProposedTerms = (item: MatchingRequestResponse): FreelancerProjectCardProps["proposedTerms"] => {
    if (!item.negotiationId) return undefined;
    const detail = negotiationSummaries[item.negotiationId];
    if (!detail) return undefined;

    const condition = (type: ConditionType) => detail.conditions.find((c) => c.type === type);

    const amountCondition = condition("AMOUNT");
    const parsedAmount = amountCondition?.agreedValue ? Number(amountCondition.agreedValue) : null;
    const amountWon = detail.agreedAmount ?? (parsedAmount != null && Number.isFinite(parsedAmount) ? parsedAmount : null);
    const monthlyPay = amountWon == null ? "협의" : `월 ${amountWon.toLocaleString("ko-KR")}원`;

    const periodCondition = condition("PERIOD");
    const duration = periodCondition?.agreedValue ? formatConditionValue("PERIOD", periodCondition.agreedValue, workLabels) : item.periodLabel ?? "확인 필요";

    const workStyleValue = condition("WORK_STYLE")?.agreedValue;
    const workFormValue = condition("WORK_FORM")?.agreedValue;
    const workStyleLabel = workStyleValue ? formatConditionValue("WORK_STYLE", workStyleValue, workLabels) : null;
    const workFormLabel = workFormValue ? formatConditionValue("WORK_FORM", workFormValue, workLabels) : null;
    const workType = workStyleLabel && workFormLabel ? `${workStyleLabel} / ${workFormLabel}` : workStyleLabel ?? workFormLabel ?? item.workLabel ?? "협의";

    // 3.3: waitingForMe=true면 내 차례, false면 상대 응답 대기
    const note = detail.waitingForMe ? "내 확인이 필요합니다" : "상대방 응답을 기다리고 있습니다";

    // 모집 인원은 서버 응답에 없는 필드(가이드 8장 ③) — 임의로 채우지 않고 확인 필요로 표시
    return { monthlyPay, duration, workType, headcount: "확인 필요", note };
  };

  const toCard = (item: MatchingRequestResponse): FreelancerProjectCardProps => {
    const expiresAt = new Date(item.expiresAt).getTime();
    const daysLeft = Math.max(0, Math.ceil((expiresAt - renderedAt) / 86400000));
    const resultNote = item.status === "REJECTED" || item.status === "NEGOTIATION_FAILED" ? "이 프로젝트에는 다시 지원할 수 없습니다" : undefined;
    return {
      id: String(item.requestId),
      title: item.projectTitle,
      state: stateOf(item.status),
      result: item.status === "REJECTED" ? (item.rejectReason === "EXPIRED" ? "응답 기한 마감" : "거절함") : item.status === "NEGOTIATION_FAILED" ? "협상 결렬" : CLOSED_STATUS_CHIP_LABEL[item.status],
      resultNote,
      deadline: item.status === "REQUEST_PENDING" ? `D-${daysLeft} 남음` : undefined,
      notice: item.status === "REQUEST_PENDING" ? "3일 내 응답 없으면 자동 거절 처리됩니다" : item.newProposalCount ? `새 AI 제안 ${item.newProposalCount}건` : undefined,
      industry: item.companyName ?? item.counterpartName,
      companySize: item.companyProfile ?? "회사 정보 확인 필요",
      position: labels[item.jobRole] ?? item.jobRole,
      // budgetAmount는 계약 기간 전체 총액이다(가이드 8장 ②). 월 단가(budgetCap)가 없어 "월" 표기로 오인시키지 않도록 총액으로 라벨링
      budget: item.budgetAmount == null ? "협의" : `총 ${item.budgetAmount.toLocaleString("ko-KR")}원`,
      duration: item.periodLabel ?? "확인 필요",
      startDate: item.startDesiredDate ?? "협의",
      workType: item.workLabel ?? "협의",
      experience: item.minCareerYears == null ? "무관" : `${item.minCareerYears}년 이상`,
      skills: item.skills.map((skill) => labels[skill] ?? skill),
      receivedAt: item.requestedAt.slice(0, 10),
      round: item.currentRound && item.maxRound ? `${item.currentRound}/${item.maxRound}` : undefined,
      negotiationHref: item.negotiationId ? `/freelancer/projects/${item.projectId}/negotiation/${item.negotiationId}` : undefined,
      proposedTerms: stateOf(item.status) === "협상 중" ? buildProposedTerms(item) : undefined,
      onReject: () => { setRejectError(""); setRejectItem(item); },
      onAccept: () => void acceptMatchingRequest(item.requestId).then(async (result) => { if (result.negotiationId) router.push(`/freelancer/projects/${result.projectId}/negotiation/${result.negotiationId}`); else applyUpdatedItem(result); }).catch(async (cause) => { const message = cause instanceof Error ? cause.message : "수락하지 못했습니다."; if (cause instanceof ApiException && REFRESH_ON_ERROR_CODES.has(cause.errorCode)) await load(); setError(message); }),
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
      <ProjectRejectModals open={rejectItem !== null} projectTitle={rejectItem?.projectTitle ?? "프로젝트"} errorMessage={rejectError} onClose={() => setRejectItem(null)} onConfirm={async (reason) => { if (!rejectItem) return; try { const updated = await rejectMatchingRequest(rejectItem.requestId, reason); applyUpdatedItem(updated); } catch (cause) { const message = cause instanceof Error ? cause.message : "거절하지 못했습니다."; setRejectError(message); if (cause instanceof ApiException && REFRESH_ON_ERROR_CODES.has(cause.errorCode)) await load(); throw cause; } }} />
    </main>
  );
}
