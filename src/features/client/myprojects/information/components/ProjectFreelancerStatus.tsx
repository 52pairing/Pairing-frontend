"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getProjectMatchingRequests } from "@/features/client/myprojects/services/projectDetail";
import type { ProjectFreelancerStatusProps } from "@/features/client/myprojects/types/components";
import type { MatchingRequestItem } from "@/features/client/myprojects/types/projectDetail";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "요청 대기",
  REQUESTED: "요청 대기",
  REQUEST_PENDING: "요청 대기",
  REJECTED: "거절",
  ACCEPTED: "수락",
  NEGOTIATING: "협상중",
  CONTRACT_PENDING: "계약 대기",
  CONTRACTED: "계약 완료",
  IN_PROGRESS: "진행중",
  COMPLETION_PENDING: "완료 대기",
  CLOSED: "종료",
  TERMINATED: "중도 종료",
  NEGOTIATION_FAILED: "협상 결렬",
};

const AVATAR_COLORS = ["bg-[#3975ef]", "bg-[#7c3aed]", "bg-[#16a34a]"];

export function ProjectFreelancerStatus({ projectId, jobRoleLabels }: ProjectFreelancerStatusProps) {
  const [items, setItems] = useState<MatchingRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    getProjectMatchingRequests(projectId)
      .then((response) => {
        if (!cancelled) setItems(response.content);
      })
      .catch((error) => {
        if (!cancelled) setErrorMessage(error instanceof Error ? error.message : "프리랜서 현황을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [projectId]);

  return (
    <section className="mt-4 rounded-[14px] border border-theme bg-surface px-6 py-5">
      <h2 className="text-[14px] font-extrabold text-theme-primary">프리랜서 현황</h2>
      {isLoading ? <p className="py-10 text-center text-[12px] text-theme-secondary">프리랜서 현황을 불러오고 있습니다.</p> : errorMessage ? <p role="alert" className="py-10 text-center text-[12px] text-theme-danger">{errorMessage}</p> : items.length === 0 ? <p className="py-10 text-center text-[12px] text-theme-muted">매칭 요청된 프리랜서가 없습니다.</p> : (
        <div className="mt-4 space-y-3">
          {items.map((item, index) => {
            const statusLabel = STATUS_LABEL[item.status] ?? item.status;
            return (
              <article key={item.requestId} className="flex min-h-[86px] items-center justify-between rounded-[12px] border border-theme px-4 py-3">
                <div className="flex items-center gap-4">
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[17px] font-extrabold text-white ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}>{item.counterpartName.slice(0, 1)}</span>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-[15px] font-extrabold text-theme-primary">{item.counterpartName}</h3>
                      <FreelancerStatusBadge status={statusLabel} />
                    </div>
                    <p className="mt-1 text-[12px] font-semibold text-theme-muted">{jobRoleLabels[item.jobRole] ?? item.jobRole}</p>
                  </div>
                </div>
                {/* 협상중(NEGOTIATING)일 때만 협상방 진입. 매칭 수락 시 서버가 협상방을 자동 생성한다.
                    수락 전(요청 대기)이나 계약 단계에서는 버튼 없음. */}
                <div className="flex items-center gap-2"><Link href={`/client/projects/${projectId}/requests/${item.requestId}`} className="flex h-[46px] items-center rounded-[10px] border border-theme px-4 text-[12px] font-bold text-theme-secondary">상세보기</Link>{item.status === "NEGOTIATING" && item.negotiationId != null ? (
                  <Link
                    href={`/client/projects/${projectId}/negotiation/${item.negotiationId}`}
                    className="relative flex h-[46px] min-w-[100px] items-center justify-center rounded-[10px] bg-brand px-5 text-[13px] font-bold text-white hover:bg-brand"
                  >
                    협상방 가기
                    {/* 협상 시작·내부 변동 시 새 제안 빨간점 (매칭 응답 newProposalCount) */}
                    {(item.newProposalCount ?? 0) > 0 ? (
                      <span
                        aria-label="새 제안 있음"
                        className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-[#f04438]"
                      />
                    ) : null}
                  </Link>
                ) : null}</div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function FreelancerStatusBadge({ status }: { status: string }) {
  const isComplete = status === "계약 완료";
  const isNegotiating = status === "협상중";
  return <span className={`rounded-full border px-3 py-1 text-[11px] font-bold ${isComplete ? "border-[#b7ebcd] bg-success-surface text-[#16a34a]" : isNegotiating ? "border-[#f5d9a6] bg-[#fff8e9] text-[#d97706]" : "border-[#c9dcfa] bg-[#eef5ff] text-[#3478f6]"}`}>{status}</span>;
}
