"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { getChatRoomByNegotiation } from "@/features/chat/services/chatRooms";
import { getClientProjectContracts } from "@/features/contract/services/clientContracts";
import type { ProgressContract, ProjectProgressProps } from "@/features/client/myprojects/types/components";
import { getContractDetail } from "@/features/contract/services/contracts";

const STATUS_LABEL: Record<string, string> = {
  IN_PROGRESS: "진행중",
  COMPLETION_PENDING: "정산 대기",
  COMPLETED: "완료",
  TERMINATED: "중도 종료",
};

const AVATAR_COLORS = ["bg-[#3777f6]", "bg-[#7839ee]", "bg-[#16a34a]"];

export function ProjectProgress({ project, jobRoleLabels, workStyleLabel }: ProjectProgressProps) {
  const router = useRouter();
  const [contracts, setContracts] = useState<ProgressContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [openingChatContractId, setOpeningChatContractId] = useState<number | null>(null);

  const loadContracts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const page = await getClientProjectContracts(project.projectId, 0, 100);
      const progressItems = page.content.filter((contract) =>
        ["IN_PROGRESS", "COMPLETION_PENDING", "COMPLETED", "TERMINATED"].includes(contract.status),
      );
      const details = await Promise.all(
        progressItems.map((contract) => getContractDetail(contract.contractId)),
      );
      setContracts(progressItems.map((contract, index) => ({
        ...contract,
        negotiationId: details[index].negotiationId,
      })));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "계약 진행 현황을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [project.projectId]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) void loadContracts();
    });
    return () => {
      cancelled = true;
    };
  }, [loadContracts]);

  const openChat = async (contract: ProgressContract) => {
    if (openingChatContractId != null) return;
    setOpeningChatContractId(contract.contractId);
    setErrorMessage("");
    try {
      const room = await getChatRoomByNegotiation(contract.negotiationId);
      router.push(`/chat?chatRoomId=${room.chatRoomId}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "채팅방을 불러오지 못했습니다.");
    } finally {
      setOpeningChatContractId(null);
    }
  };

  return (
    <section className="mt-6 grid items-start gap-5 lg:grid-cols-[1fr_320px]">
      <div>
        {errorMessage ? <p role="alert" className="mb-3 rounded-[10px] border border-theme bg-danger-surface px-4 py-3 text-[12px] text-theme-danger">{errorMessage}</p> : null}
        {isLoading ? (
          <div className="flex h-[220px] items-center justify-center rounded-[14px] border border-theme bg-surface text-[12px] text-theme-secondary">계약 진행 현황을 불러오고 있습니다.</div>
        ) : contracts.length === 0 ? (
          <div className="flex h-[220px] flex-col items-center justify-center gap-4 rounded-[14px] border border-theme bg-surface text-[12px] text-theme-muted"><p>진행 중인 계약이 없습니다.</p>{errorMessage ? <button type="button" onClick={() => void loadContracts()} className="rounded-[8px] bg-brand px-4 py-2 font-bold text-white">다시 시도</button> : null}</div>
        ) : (
          <div className="flex flex-col gap-3">
            {contracts.map((contract, index) => (
              <article key={contract.contractId} className="flex min-h-[104px] flex-wrap items-center justify-between gap-4 rounded-[14px] border border-theme bg-surface px-6 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
                <div className="flex min-w-0 items-center gap-4">
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[16px] font-bold text-white ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}>{contract.counterpartName.slice(0, 1)}</span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-[14px] font-bold text-theme-primary">{contract.counterpartName}</h2>
                      <span className="rounded-full border border-theme bg-surface-subtle px-2.5 py-1 text-[10px] font-bold text-theme-secondary">{STATUS_LABEL[contract.status] ?? contract.status}</span>
                    </div>
                    <p className="mt-2 text-[12px] font-semibold text-theme-secondary">{jobRoleLabels[contract.jobRole] ?? contract.jobRole} · 월 {contract.payAmount.toLocaleString("ko-KR")}원</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/client/projects/${project.projectId}/contracts/${contract.contractId}`} className="flex h-9 items-center gap-1.5 rounded-[8px] border border-theme px-4 text-[12px] font-semibold text-theme-secondary transition hover:bg-surface-subtle"><span aria-hidden="true">▧</span> 계약서</Link>
                  <button type="button" disabled={openingChatContractId != null} onClick={() => void openChat(contract)} className="h-9 rounded-[8px] bg-brand px-4 text-[12px] font-bold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-theme-muted">{openingChatContractId === contract.contractId ? "이동 중..." : "채팅"}</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <aside className="rounded-[14px] border border-theme bg-surface px-7 py-6">
        <h2 className="text-[14px] font-bold text-theme-primary">프로젝트 정보</h2>
        <ProjectStatusStepper status={project.status} />
        <dl className="mt-6 space-y-5 text-[12px]">
          <InfoRow label="시작일" value={project.startDesiredDate?.replaceAll("-", ".") ?? "-"} />
          <InfoRow label="예산" value={`${project.budgetAmount.toLocaleString("ko-KR")}원`} />
          <InfoRow label="계약 인원" value={`${project.confirmedHeadcount}명`} />
          <InfoRow label="근무 방식" value={workStyleLabel} />
        </dl>
      </aside>
    </section>
  );
}

function ProjectStatusStepper({ status }: { status: string }) {
  const steps = [
    { code: "IN_PROGRESS", label: "진행중" },
    { code: "COMPLETION_PENDING", label: "정산 대기" },
    { code: "CLOSED", label: "완료" },
  ];
  const currentIndex = Math.max(0, steps.findIndex((step) => step.code === status));

  return <ol className="mt-5 flex items-start overflow-hidden">{steps.map((step, index) => { const reached = index <= currentIndex; return <li key={step.code} className="relative flex min-w-0 flex-1 flex-col items-center text-center"><span className={`relative z-10 h-3 w-3 rounded-full ${reached ? "bg-brand" : "bg-surface-muted"}`} />{index < steps.length - 1 ? <span className={`absolute left-1/2 top-[5px] h-0.5 w-full ${index < currentIndex ? "bg-brand" : "bg-surface-muted"}`} /> : null}<span className={`mt-2 whitespace-nowrap text-[9px] font-semibold ${reached ? "text-brand" : "text-theme-muted"}`}>{step.label}</span></li>; })}</ol>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4"><dt className="font-semibold text-theme-muted">{label}</dt><dd className="text-right font-bold text-theme-primary">{value}</dd></div>;
}
