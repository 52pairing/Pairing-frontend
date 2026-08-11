"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  downloadContractPdf,
  getContractDetail,
} from "@/features/contract/services/contracts";
import type {
  ContractDetailResponse,
  ContractPartyRole,
  ContractSignature,
} from "@/features/contract/types/contractDetail";
import {
  getProjectJobRoles,
  getProjectWorkConditions,
} from "@/features/client/projects/services/projectPreReview";

interface ContractOverviewProps {
  role: "client" | "freelancer";
}

const DRAFT_POLL_INTERVAL = 2_000;
const DRAFT_MAX_POLL_COUNT = 10;

const formatDate = (value: string) => value.slice(0, 10).replaceAll("-", ".");
const formatDateTime = (value: string | null) => value ? formatDate(value) : "-";
const formatAmount = (value: number) => `${value.toLocaleString("ko-KR")}원`;

export function ContractOverview({ role }: ContractOverviewProps) {
  const params = useParams<{ projectId?: string; contractId: string }>();
  const contractId = Number(params.contractId);
  const [contract, setContract] = useState<ContractDetailResponse | null>(null);
  const [jobRoleLabels, setJobRoleLabels] = useState<Record<string, string>>({});
  const [workStyleLabels, setWorkStyleLabels] = useState<Record<string, string>>({});
  const [workFormLabels, setWorkFormLabels] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const pollCountRef = useRef(0);

  const contractPath = role === "client"
    ? `/client/projects/${params.projectId}/contracts/${params.contractId}`
    : `/freelancer/contracts/${params.contractId}`;
  const signPath = `${contractPath}/sign`;
  const backHref = role === "client"
    ? `/client/projects/${params.projectId}?tab=계약`
    : "/freelancer/contracts";
  const myPartyRole: ContractPartyRole = role === "client" ? "CLIENT" : "FREELANCER";

  const loadContract = useCallback(async (showLoading = true) => {
    if (!Number.isInteger(contractId) || contractId <= 0) {
      setErrorMessage("계약 정보를 확인할 수 없습니다.");
      setIsLoading(false);
      return;
    }

    if (showLoading) setIsLoading(true);
    setErrorMessage("");

    try {
      const [detail, jobRoles, workConditions] = await Promise.all([
        getContractDetail(contractId),
        getProjectJobRoles(),
        getProjectWorkConditions(),
      ]);
      setContract(detail);
      setJobRoleLabels(Object.fromEntries(jobRoles.map((item) => [item.code, item.label])));
      setWorkStyleLabels(Object.fromEntries(workConditions.workStyles.map((item) => [item.code, item.label])));
      setWorkFormLabels(Object.fromEntries(workConditions.workForms.map((item) => [item.code, item.label])));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "계약 상세를 불러오지 못했습니다.");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) void loadContract();
    });
    return () => {
      cancelled = true;
    };
  }, [loadContract]);

  useEffect(() => {
    if (contract?.status !== "DRAFT") {
      pollCountRef.current = 0;
      return;
    }
    if (pollCountRef.current >= DRAFT_MAX_POLL_COUNT) return;

    const timer = window.setTimeout(() => {
      pollCountRef.current += 1;
      void loadContract(false);
    }, DRAFT_POLL_INTERVAL);

    return () => window.clearTimeout(timer);
  }, [contract, loadContract]);

  const downloadPdf = async () => {
    if (!contract || contract.status === "DRAFT" || isDownloading) return;
    setIsDownloading(true);
    setErrorMessage("");
    try {
      const blob = await downloadContractPdf(contract.contractId);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${contract.contractNo}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "계약서 PDF를 다운로드하지 못했습니다.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-sm text-theme-secondary">계약 상세를 불러오고 있습니다.</div>;
  }

  if (!contract) {
    return <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4"><p role="alert" className="text-sm text-theme-danger">{errorMessage || "계약을 찾을 수 없습니다."}</p><button type="button" onClick={() => void loadContract()} className="rounded-lg bg-brand px-5 py-3 text-sm font-bold text-white">다시 시도</button></main>;
  }

  const mySignature = contract.signatures.find((signature) => signature.partyRole === myPartyRole);
  const canSign = contract.status === "SIGN_PENDING" && mySignature?.status === "PENDING";
  const isWaitingForCounterpart = contract.status === "SIGN_PENDING" && mySignature?.status === "SIGNED";
  const jobRoleLabel = jobRoleLabels[contract.jobRole] ?? contract.jobRole;
  const workStyleLabel = workStyleLabels[contract.workStyle] ?? contract.workStyle;
  const workFormLabel = workFormLabels[contract.workForm] ?? contract.workForm;

  return (
    <main className="min-h-screen bg-background px-5 py-5 text-theme-primary">
      <div className="mx-auto w-full max-w-[960px]">
        <Link href={backHref} className="text-[12px] font-semibold text-theme-secondary hover:underline">← 내 계약</Link>

        <header className="mt-7">
          <h1 className="text-[20px] font-extrabold tracking-[-0.04em]">{contract.projectTitle}</h1>
          <p className="mt-4 text-[11px] font-medium text-theme-muted">{contract.clientName} · {jobRoleLabel}</p>
        </header>

        {errorMessage ? <p role="alert" className="mt-4 rounded-lg border border-theme bg-danger-surface px-4 py-3 text-[12px] text-theme-danger">{errorMessage}</p> : null}

        {contract.status === "DRAFT" ? (
          <div className="mt-4 rounded-[10px] border border-theme bg-warning-surface px-5 py-4 text-[12px] font-semibold text-theme-warning">계약서를 준비하고 있습니다. 잠시 후 자동으로 갱신됩니다.</div>
        ) : null}

        <section className="mt-4 grid gap-2.5 md:grid-cols-3">
          <SignatureCard title="클라이언트 서명" signature={contract.signatures.find((item) => item.partyRole === "CLIENT")} />
          <SignatureCard title="프리랜서 서명" signature={contract.signatures.find((item) => item.partyRole === "FREELANCER")} />
          <StatusCard contract={contract} />
        </section>

        <section className="mt-3 rounded-[10px] border border-theme bg-surface px-6 py-5">
          <h2 className="text-[13px] font-bold">계약 조건</h2>
          <dl className="mt-4 grid gap-x-12 gap-y-3 md:grid-cols-2">
            <InfoRow label="프로젝트" value={contract.projectTitle} />
            <InfoRow label="역할" value={jobRoleLabel} />
            <InfoRow label="기간" value={`${formatDate(contract.startDate)} ~ ${formatDate(contract.endDate)}`} />
            <InfoRow label="클라이언트" value={contract.clientName} />
            <InfoRow label="금액" value={`월 ${formatAmount(contract.payAmount)}`} />
            <InfoRow label="근무 형태" value={`${workStyleLabel} / ${workFormLabel}`} />
            {contract.workLocation ? <InfoRow label="근무 장소" value={contract.workLocation} /> : null}
          </dl>
        </section>

        <section className="mt-3 rounded-[10px] border border-theme bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[13px] font-bold">계약서</h2>
              <p className="mt-1 text-[11px] text-theme-muted">계약 내용을 확인한 후 서명을 진행해 주세요.</p>
            </div>
            {contract.status !== "DRAFT" ? <button type="button" disabled={isDownloading} onClick={() => void downloadPdf()} className="h-8 rounded-[7px] border border-theme px-3 text-[11px] font-semibold text-theme-secondary transition hover:bg-surface-subtle disabled:cursor-not-allowed disabled:text-theme-muted">{isDownloading ? "다운로드 중..." : "PDF 다운로드"}</button> : null}
          </div>

          <ContractPreview contract={contract} jobRoleLabel={jobRoleLabel} />

          <div className="mt-4 rounded-[8px] border border-theme bg-surface-subtle px-4 py-3.5">
            <p className="text-[12px] font-bold text-theme-secondary">{getActionTitle(contract, mySignature)}</p>
            <p className="mt-2 text-[11px] leading-5 text-theme-secondary">서명은 전자 서명으로 처리되며 법적 효력이 있습니다. 계약 내용에 동의하는 경우에만 서명해 주세요.</p>
            {canSign ? <Link href={signPath} className="mt-3 flex h-9 w-fit items-center rounded-[7px] bg-brand px-4 text-[11px] font-bold text-white transition hover:bg-brand-hover">계약서 서명하기</Link> : <span aria-disabled="true" className="mt-3 flex h-9 w-fit cursor-not-allowed items-center rounded-[7px] bg-surface-muted px-4 text-[11px] font-bold text-theme-muted">{isWaitingForCounterpart ? "상대방 서명 대기" : contract.status === "SIGNED" ? "계약 체결 완료" : "계약서 준비 중"}</span>}
          </div>
        </section>
      </div>

    </main>
  );
}

function SignatureCard({ title, signature }: { title: string; signature?: ContractSignature }) {
  const signed = signature?.status === "SIGNED";
  return <article className={`min-h-[116px] rounded-[10px] border p-4 ${signed ? "border-theme bg-success-surface" : "border-theme bg-surface"}`}><p className={`text-[10px] font-semibold ${signed ? "text-theme-success" : "text-theme-muted"}`}>{signed ? "✓ " : ""}{title}</p><p className="mt-3 text-[12px] font-bold">{signature?.name ?? "-"}</p><p className={`mt-1.5 text-[10px] font-semibold ${signed ? "text-theme-success" : "text-theme-muted"}`}>{signed ? `서명 완료 · ${formatDateTime(signature.signedAt)}` : "서명 대기 중"}</p></article>;
}

function StatusCard({ contract }: { contract: ContractDetailResponse }) {
  const signed = contract.status === "SIGNED";
  return <article className={`min-h-[116px] rounded-[10px] border p-4 ${signed ? "border-theme bg-success-surface" : "border-theme bg-surface"}`}><p className={`text-[10px] font-semibold ${signed ? "text-theme-success" : "text-theme-muted"}`}>{signed ? "✓ " : ""}계약 확정</p><p className="mt-3 text-[12px] font-bold">{signed ? "계약 최종 확정" : contract.status === "DRAFT" ? "계약서 준비 중" : "서명 대기 중"}</p><p className={`mt-1.5 text-[10px] font-semibold ${signed ? "text-theme-success" : "text-theme-muted"}`}>{signed ? `확정일: ${formatDateTime(contract.signedAt)}` : "양측 서명 완료 시 확정"}</p></article>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="grid grid-cols-[100px_1fr] text-[11px]"><dt className="text-theme-muted">{label}</dt><dd className="font-bold text-theme-primary">{value}</dd></div>;
}

function ContractPreview({ contract, jobRoleLabel }: { contract: ContractDetailResponse; jobRoleLabel: string }) {
  return <div className="mx-auto mt-5 max-w-[700px] rounded-[9px] border border-theme bg-surface-subtle p-4"><div className="mx-auto max-w-[600px] bg-surface px-8 py-8 shadow-[0_1px_5px_rgba(15,23,42,0.08)]"><h3 className="text-center text-[16px] font-bold">프리랜서 용역 계약서</h3><p className="mt-2 text-center text-[9px] text-theme-muted">계약 번호: {contract.contractNo} · 작성일: {formatDate(contract.createdAt)}</p><PartySection contract={contract} jobRoleLabel={jobRoleLabel} />{contract.clauses.map((clause) => <section key={clause.no} className="mt-6"><h4 className="border-b border-theme-strong pb-2 text-[11px] font-bold">제{clause.no}조 ({clause.title})</h4><p className="mt-3 whitespace-pre-line text-[10px] leading-5 text-theme-secondary">{clause.content}</p></section>)}</div></div>;
}

function PartySection({ contract, jobRoleLabel }: { contract: ContractDetailResponse; jobRoleLabel: string }) {
  return <section className="mt-7"><h4 className="border-b border-theme-strong pb-2 text-[11px] font-bold">계약 당사자</h4><div className="mt-3 grid gap-3 md:grid-cols-2"><div className="rounded-[6px] bg-surface-subtle p-3 text-[9px]"><p className="text-theme-muted">갑 · 클라이언트</p><p className="mt-2 font-bold">{contract.client.companyName}</p><p className="mt-1 whitespace-pre-line text-theme-secondary">사업자번호 {contract.client.businessNo}{"\n"}대표 {contract.client.representative}{"\n"}{contract.client.address}{"\n"}{contract.client.phone}</p></div><div className="rounded-[6px] bg-surface-subtle p-3 text-[9px]"><p className="text-theme-muted">을 · 프리랜서</p><p className="mt-2 font-bold">{contract.freelancer.name}</p><p className="mt-1 whitespace-pre-line text-theme-secondary">{jobRoleLabel}{"\n"}{contract.freelancer.phone}{"\n"}{contract.freelancer.settlementAccount}</p></div></div></section>;
}

function getActionTitle(contract: ContractDetailResponse, mySignature?: ContractSignature) {
  if (contract.status === "DRAFT") return "계약서를 준비하고 있습니다.";
  if (contract.status === "SIGNED") return "계약 체결이 완료되었습니다.";
  if (mySignature?.status === "SIGNED") return "내 서명이 완료되었습니다. 상대방의 서명을 기다리고 있습니다.";
  return "계약 내용을 확인하고 서명해 주세요.";
}
