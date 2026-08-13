"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getMatchingRequestDetail } from "@/features/matching/services/matching";
import type { MatchingRequestResponse } from "@/features/matching/types/matching";

const STATUS_LABEL: Record<string, string> = { REQUEST_PENDING: "요청 대기", REJECTED: "거절", ACCEPTED: "수락", NEGOTIATING: "협상 중", NEGOTIATION_FAILED: "협상 결렬", CONTRACT_PENDING: "계약 대기", CONTRACTED: "계약 완료", IN_PROGRESS: "진행 중", COMPLETION_PENDING: "완료 대기", CLOSED: "종료", TERMINATED: "중도 종료" };
export function ClientMatchingRequestDetail() {
  const params = useParams<{ projectId: string; requestId: string }>();
  const requestId = Number(params.requestId);
  const [item, setItem] = useState<MatchingRequestResponse | null>(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); try { setItem(await getMatchingRequestDetail(requestId)); setError(""); } catch (e) { setError(e instanceof Error ? e.message : "매칭 요청을 불러오지 못했습니다."); } finally { setLoading(false); } }, [requestId]);
  useEffect(() => { let cancelled = false; Promise.resolve().then(() => { if (!cancelled) void load(); }); return () => { cancelled = true; }; }, [load]);
  if (loading) return <p className="p-10 text-center">매칭 요청을 불러오고 있습니다.</p>;
  if (!item) return <main className="p-10 text-center"><p role="alert">{error}</p><button onClick={() => void load()} className="mt-3 underline">다시 시도</button></main>;
  return <main className="min-h-screen bg-surface-subtle px-5 py-8"><div className="mx-auto max-w-[900px]"><Link href={`/client/projects/${params.projectId}`} className="text-sm font-bold text-brand">← 프로젝트로 돌아가기</Link><section className="mt-5 rounded-xl border border-theme bg-surface p-6"><div className="flex justify-between gap-3"><div><h1 className="text-xl font-extrabold">{item.projectTitle}</h1><p className="mt-2 text-sm text-theme-secondary">{item.counterpartName}</p></div><span className="h-fit rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-bold text-brand">{STATUS_LABEL[item.status] ?? item.status}</span></div><dl className="mt-6 grid gap-4 sm:grid-cols-2"><Info label="직무" value={item.jobRole}/><Info label="예산" value={item.budgetAmount == null ? "-" : `${item.budgetAmount.toLocaleString("ko-KR")}원`}/><Info label="기간" value={item.periodLabel ?? "-"}/><Info label="시작일" value={item.startDesiredDate ?? "-"}/><Info label="근무" value={item.workLabel ?? "-"}/><Info label="최소 경력" value={item.minCareerYears == null ? "-" : `${item.minCareerYears}년`}/></dl>{item.mainTask ? <div className="mt-6"><h2 className="font-bold">주요 담당 업무</h2><p className="mt-2 whitespace-pre-wrap text-sm text-theme-secondary">{item.mainTask}</p></div> : null}{item.rejectReason ? <p className="mt-5 rounded bg-danger-surface p-3 text-sm text-theme-danger">{item.rejectReason === "EXPIRED" ? "응답 기한이 만료되었습니다." : item.rejectReason === "DIRECT_REJECT" ? "프리랜서가 요청을 거절했습니다." : "협상이 결렬되었습니다."}</p> : null}{item.status === "NEGOTIATING" && item.negotiationId ? <Link href={`/client/projects/${item.projectId}/negotiation/${item.negotiationId}`} className="mt-6 inline-flex rounded-lg bg-brand px-5 py-3 text-sm font-bold text-white">협상방 가기</Link> : null}</section></div></main>;
}
const Info = ({ label, value }: { label: string; value: string }) => <div><dt className="text-xs text-theme-muted">{label}</dt><dd className="mt-1 text-sm font-semibold">{value}</dd></div>;
