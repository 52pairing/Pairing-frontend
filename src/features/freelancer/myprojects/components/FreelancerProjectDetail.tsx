"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { getProjectJobRoles, getProjectSkills } from "@/features/client/projects/services/projectPreReview";
import { acceptMatchingRequest, getMatchingRequestDetail, rejectMatchingRequest } from "@/features/matching/services/matching";
import type { MatchingRequestResponse } from "@/features/matching/types/matching";
import { ProjectRejectModals } from "./ProjectRejectModals";
import { ApiException } from "@/lib/api";

const STATUS_LABEL: Record<string, string> = { REQUEST_PENDING: "검토 중", REJECTED: "거절됨", ACCEPTED: "수락됨", NEGOTIATING: "협상 중", NEGOTIATION_FAILED: "협상 결렬", CONTRACT_PENDING: "계약 대기", CONTRACTED: "계약 완료", IN_PROGRESS: "진행 중", COMPLETION_PENDING: "완료 대기", CLOSED: "종료됨", TERMINATED: "중도 종료" };

// 재조회로 상태를 최신화해야 하는 매칭 에러 코드 (가이드 7장 권고)
const REFRESH_ON_ERROR_CODES = new Set(["MT_006", "MT_007", "MT_016"]);

// 수락/거절 응답은 목록과 같은 모양이라 상세 전용 필드가 null로 옵니다.
// 화면에 이미 표시 중이던 상세 전용 값을 잃지 않도록 이전 값을 그대로 유지합니다.
function withPreservedDetailFields(current: MatchingRequestResponse, result: MatchingRequestResponse): MatchingRequestResponse {
  return {
    ...result,
    mainTask: current.mainTask,
    currentSituation: current.currentSituation,
    startNegotiable: current.startNegotiable,
    periodValue: current.periodValue,
    periodUnit: current.periodUnit,
    totalHeadcount: current.totalHeadcount,
    detailScope: current.detailScope,
    extraNote: current.extraNote,
    workLocation: current.workLocation,
  };
}

export function FreelancerProjectDetail() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const requestId = Number(params.projectId);
  const [project, setProject] = useState<MatchingRequestResponse | null>(null);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [error, setError] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [processing, setProcessing] = useState(false);

  const load = useCallback(async () => {
    try { setProject(await getMatchingRequestDetail(requestId)); setError(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "요청 상세를 불러오지 못했습니다."); }
  }, [requestId]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => { if (!cancelled) void load(); });
    void Promise.all([getProjectJobRoles(), getProjectSkills()])
      .then(([roles, skills]) => setLabels(Object.fromEntries([...roles, ...skills].map(({ code, label }) => [code, label]))))
      .catch(() => setLabels({}));
    return () => { cancelled = true; };
  }, [load]);

  if (!project) return <main className="min-h-screen bg-surface-subtle px-4 py-6 text-center text-[12px] text-theme-muted">{error || "프로젝트 제안을 불러오고 있습니다."}</main>;

  const accept = async () => {
    if (processing) return;
    setProcessing(true);
    try {
      const result = await acceptMatchingRequest(requestId);
      setProject((current) => current ? withPreservedDetailFields(current, result) : result);
      if (result.status === "NEGOTIATING" && result.negotiationId) router.push(`/freelancer/projects/${result.projectId}/negotiation/${result.negotiationId}`);
    } catch (cause) { const message = cause instanceof Error ? cause.message : "수락하지 못했습니다."; if (cause instanceof ApiException && REFRESH_ON_ERROR_CODES.has(cause.errorCode)) await load(); setError(message); }
    finally { setProcessing(false); }
  };

  return (
    <main className="min-h-screen bg-surface-subtle px-4 py-6 text-theme-primary sm:px-5">
      <div className="mx-auto w-full max-w-[1000px]">
        <Link href="/freelancer/projects" className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3478f6] hover:text-[#1f62d1]"><span aria-hidden="true">←</span> 제안 목록</Link>
        {error ? <p role="alert" className="mt-4 text-[11px] font-semibold text-theme-danger">{error}</p> : null}
        <section className="mt-5 rounded-xl border border-theme bg-surface px-6 py-7"><h1 className="text-[16px] font-bold tracking-[-0.4px]">{project.projectTitle}</h1><p className="mt-3 text-[11px] font-semibold text-theme-secondary">{project.companyName ?? project.counterpartName}{project.companyProfile ? ` · ${project.companyProfile}` : ""}</p></section>
        <section className="mt-4 rounded-xl border border-theme bg-surface px-6 py-6"><h2 className="text-[14px] font-bold">프로젝트 정보</h2><dl className="mt-5 grid grid-cols-1 gap-x-20 gap-y-4 text-[11px] sm:grid-cols-2"><DetailInfo label="역할" value={labels[project.jobRole] ?? project.jobRole} /><DetailInfo label="예산" value={project.budgetAmount == null ? "협의" : `총 ${project.budgetAmount.toLocaleString("ko-KR")}원`} /><DetailInfo label="기간" value={project.periodLabel ?? "확인 필요"} /><DetailInfo label="시작일" value={project.startNegotiable ? "협의 가능" : (project.startDesiredDate ?? "확인 필요")} /><DetailInfo label="근무 형태" value={project.workLabel ?? "협의"} />{!(project.workLabel ?? "").includes("재택") && project.workLocation ? <DetailInfo label="근무 장소" value={project.workLocation} /> : null}<DetailInfo label="경력 요건" value={project.minCareerYears == null ? "무관" : `${project.minCareerYears}년 이상`} /><DetailInfo label="전체 모집 인원" value={project.totalHeadcount == null ? "확인 필요" : `${project.totalHeadcount}명`} /></dl></section>
        <section className="mt-4 rounded-xl border border-theme bg-surface px-6 py-6"><h2 className="text-[14px] font-bold">상세 정보</h2><dl className="mt-5 space-y-5 text-[11px]">{project.currentSituation ? <LongTextInfo label="진행 상황" value={project.currentSituation} /> : null}<LongTextInfo label="담당 업무" value={project.mainTask ?? "확인 필요"} />{project.detailScope ? <LongTextInfo label="세부 업무 범위" value={project.detailScope} /> : null}{project.extraNote ? <LongTextInfo label="우대사항" value={project.extraNote} /> : null}<div><dt className="text-theme-muted">요구 기술</dt><dd className="mt-3 flex flex-wrap gap-2">{project.skills.map((skill) => <span key={skill} className="rounded-md bg-[#eef3f8] px-3 py-1.5 font-semibold text-brand">{labels[skill] ?? skill}</span>)}</dd></div></dl></section>
        <section className="mt-4 rounded-xl border border-theme bg-surface px-6 py-4"><p className="text-[11px] text-theme-muted">현재 상태</p><p className="mt-1 text-[13px] font-bold text-theme-primary">{STATUS_LABEL[project.status] ?? project.status}</p>{project.rejectReason ? <p className="mt-2 text-[11px] font-semibold text-theme-danger">{project.rejectReason === "EXPIRED" ? "응답 기한이 만료되었습니다." : project.rejectReason === "DIRECT_REJECT" ? "거절한 제안입니다." : "협상이 결렬되었습니다."}</p> : null}{(project.status === "NEGOTIATING" || project.status === "CONTRACT_PENDING" || project.status === "ACCEPTED") && project.negotiationId ? <Link href={`/freelancer/projects/${project.projectId}/negotiation/${project.negotiationId}`} className="mt-3 inline-flex h-9 items-center rounded-lg bg-brand px-5 text-[11px] font-bold text-white">협상방 입장</Link> : null}</section>
        {project.status === "REQUEST_PENDING" ? <div className="mt-4 flex gap-2"><button type="button" disabled={processing} onClick={() => { setRejectError(""); setIsRejectOpen(true); }} className="h-9 rounded-lg border border-[#f04438] bg-surface px-5 text-[11px] font-bold text-theme-danger hover:bg-danger-surface disabled:opacity-40">거절</button><button type="button" disabled={processing} onClick={() => void accept()} className="h-9 rounded-lg bg-brand px-5 text-[11px] font-bold text-white hover:bg-brand disabled:opacity-40">{processing ? "처리 중" : "수락 및 협상 시작"}</button></div> : null}
      </div>
      <ProjectRejectModals open={isRejectOpen} projectTitle={project.projectTitle} errorMessage={rejectError} onClose={() => setIsRejectOpen(false)} onConfirm={async (reason) => { try { const result = await rejectMatchingRequest(requestId, reason); setProject((current) => current ? withPreservedDetailFields(current, result) : result); } catch (cause) { setRejectError(cause instanceof Error ? cause.message : "거절하지 못했습니다."); if (cause instanceof ApiException && REFRESH_ON_ERROR_CODES.has(cause.errorCode)) await load(); throw cause; } }} />
    </main>
  );
}

function DetailInfo({ label, value }: { label: string; value: string }) { return <div className="grid grid-cols-[90px_1fr] gap-3"><dt className="text-theme-muted">{label}</dt><dd className="font-semibold text-theme-primary">{value}</dd></div>; }
function LongTextInfo({ label, value }: { label: string; value: string }) { return <div><dt className="text-theme-muted">{label}</dt><dd className="mt-2 block w-full whitespace-pre-wrap rounded-md border border-theme bg-surface-subtle px-4 py-3 font-semibold leading-6 text-theme-primary">{value}</dd></div>; }
