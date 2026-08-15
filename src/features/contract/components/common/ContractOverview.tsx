"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { downloadContractPdf, getContractDetail } from "@/features/contract/services/contracts";
import type {
  ContractDetailResponse,
  ContractPartyRole,
  ContractSignature,
} from "@/features/contract/types/contractDetail";
import { formatContractDate, formatKrw } from "@/features/contract/utils/format";
import { ApiException } from "@/lib/api";

interface ContractOverviewProps {
  role: "client" | "freelancer";
}

const STATUS_LABELS: Partial<Record<ContractDetailResponse["status"], string>> = {
  DRAFT: "작성 중",
  SIGN_PENDING: "서명 대기",
  SIGNED: "계약 체결 완료",
  IN_PROGRESS: "진행 중",
  COMPLETION_PENDING: "정산 대기",
  COMPLETED: "완료",
};

const WORK_STYLE_LABELS: Record<string, string> = {
  REMOTE: "재택",
  ONSITE: "상주",
  ANY: "모두 가능",
};

const WORK_FORM_LABELS: Record<string, string> = {
  FULL_TIME: "풀타임",
  PART_TIME: "파트타임",
  ANY: "모두 가능",
};

export function ContractOverview({ role }: ContractOverviewProps) {
  const params = useParams<{ projectId?: string; contractId: string }>();
  const contractId = Number(params.contractId);
  const [contract, setContract] = useState<ContractDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const contractPath = role === "client"
    ? `/client/projects/${params.projectId}/contracts/${params.contractId}`
    : `/freelancer/contracts/${params.contractId}`;
  const signPath = `${contractPath}/sign`;
  const backHref = role === "client"
    ? "/client/contracts"
    : "/freelancer/contracts";
  const myPartyRole: ContractPartyRole = role === "client" ? "CLIENT" : "FREELANCER";

  const loadContract = useCallback(async () => {
    if (!Number.isInteger(contractId) || contractId <= 0) {
      setErrorMessage("계약 정보를 확인할 수 없습니다.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      setContract(await getContractDetail(contractId));
    } catch (error) {
      setErrorMessage(getContractErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) void loadContract();
    });
    return () => { cancelled = true; };
  }, [loadContract]);

  const downloadPdf = async () => {
    if (!contract || !areBothPartiesSigned(contract.signatures) || isDownloading) return;
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
      setErrorMessage(getContractErrorMessage(error, true));
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) return <div className="flex min-h-[60vh] items-center justify-center text-sm text-theme-secondary">계약 상세를 불러오고 있습니다.</div>;

  if (!contract) {
    return <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4"><p role="alert" className="text-sm text-theme-danger">{errorMessage || "계약을 찾을 수 없습니다."}</p><button type="button" onClick={() => void loadContract()} className="rounded-lg bg-brand px-5 py-3 text-sm font-bold text-white">다시 시도</button></main>;
  }

  const mySignature = contract.signatures.find((signature) => signature.partyRole === myPartyRole);
  const clientSignature = contract.signatures.find((signature) => signature.partyRole === "CLIENT");
  const freelancerSignature = contract.signatures.find((signature) => signature.partyRole === "FREELANCER");
  const canDownload = areBothPartiesSigned(contract.signatures);
  const canSign = contract.status === "SIGN_PENDING" && mySignature?.status === "PENDING";
  const isWaitingForCounterpart = contract.status === "SIGN_PENDING" && mySignature?.status === "SIGNED";
  const statusLabel = STATUS_LABELS[contract.status] ?? contract.status;
  const workStyleLabel = WORK_STYLE_LABELS[contract.workStyle] ?? contract.workStyle;
  const workFormLabel = WORK_FORM_LABELS[contract.workForm] ?? contract.workForm;

  return (
    <main className="min-h-screen bg-surface-subtle px-5 py-6 text-theme-primary">
      <div className="mx-auto w-full max-w-[960px]">
        <Link href={backHref} className="text-[12px] font-semibold text-brand hover:underline">← 내 계약</Link>

        <header className="mt-7">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[20px] font-extrabold tracking-[-0.04em]">{contract.projectTitle}</h1>
            <span className="rounded-full border border-theme bg-surface px-2.5 py-1 text-[10px] font-semibold text-theme-secondary">{statusLabel}</span>
          </div>
          <p className="mt-3 text-[11px] font-medium text-theme-muted">{contract.clientName} · {contract.jobRole}</p>
        </header>

        {errorMessage ? <p role="alert" className="mt-4 rounded-lg border border-danger-border bg-danger-surface px-4 py-3 text-[12px] text-theme-danger">{errorMessage}</p> : null}

        <ContractStatusNotice status={contract.status} />

        <section className="mt-4 grid gap-3 md:grid-cols-3">
          <SignatureCard title="프리랜서 서명" signature={freelancerSignature} />
          <SignatureCard title="클라이언트 서명" signature={clientSignature} />
          <ConfirmationCard contract={contract} />
        </section>

        <section className="mt-4 rounded-[12px] border border-theme bg-surface px-6 py-6">
          <h2 className="text-[13px] font-bold">계약 조건</h2>
          <dl className="mt-5 grid gap-x-16 gap-y-4 md:grid-cols-2">
            <InfoRow label="프로젝트" value={contract.projectTitle} />
            <InfoRow label="역할" value={contract.jobRole} />
            <InfoRow label="기간" value={`${formatContractDate(contract.startDate)} ~ ${formatContractDate(contract.endDate)}`} />
            <InfoRow label="서명일" value={formatContractDate(contract.signedAt)} />
            <InfoRow label="클라이언트" value={contract.clientName} />
            <InfoRow label="금액" value={`월 ${formatKrw(contract.payAmount)}`} />
            <InfoRow label="근무 형태" value={`${workStyleLabel} / ${workFormLabel}`} />
          </dl>
        </section>

        <section className="mt-4 overflow-hidden rounded-[12px] border border-theme bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
            <h2 className="text-[13px] font-bold">계약서 내용</h2>
            {canDownload ? <button type="button" disabled={isDownloading} onClick={() => void downloadPdf()} className="h-9 rounded-[8px] border border-theme bg-surface px-4 text-[11px] font-semibold text-theme-secondary transition hover:bg-surface-subtle disabled:cursor-not-allowed disabled:text-theme-muted">{isDownloading ? "다운로드 중..." : "PDF 다운로드"}</button> : null}
          </div>

          <div className="space-y-6 px-6 pb-7">
            {contract.clauses.map((clause) => (
              <article key={clause.no}>
                <h3 className="text-[12px] font-bold">제{clause.no}조 ({clause.title})</h3>
                <p className="mt-2 whitespace-pre-line text-[11px] leading-6 text-theme-secondary">{clause.content}</p>
              </article>
            ))}
            {contract.specialTerms ? (
              <article className="border-t border-theme pt-5">
                <h3 className="text-[12px] font-bold">특약사항</h3>
                <p className="mt-2 whitespace-pre-line text-[11px] leading-6 text-theme-secondary">{contract.specialTerms}</p>
              </article>
            ) : null}
          </div>

          <div className="border-t border-info-border bg-info-surface px-6 py-6">
            <p className="text-[12px] font-bold text-theme-secondary">{getActionTitle(contract, mySignature)}</p>
            <p className="mt-2 text-[11px] leading-5 text-theme-secondary">서명은 전자 서명으로 처리되며 법적 효력이 있습니다. 계약 내용에 동의하는 경우에만 서명해 주세요.</p>
            {canSign ? (
              <Link href={signPath} className="mt-4 flex h-10 w-fit items-center rounded-[8px] bg-brand px-5 text-[11px] font-bold text-white transition hover:bg-brand-hover">계약서 서명하기</Link>
            ) : (
              <span aria-disabled="true" className="mt-4 flex h-10 w-fit cursor-not-allowed items-center rounded-[8px] bg-surface-muted px-5 text-[11px] font-bold text-theme-muted">{isWaitingForCounterpart ? "상대방 서명 대기" : contract.status === "DRAFT" ? "계약서 준비 중" : "계약 체결 완료"}</span>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function ContractStatusNotice({ status }: { status: ContractDetailResponse["status"] }) {
  if (status === "DRAFT") return <div className="mt-5 rounded-[12px] border border-theme bg-warning-surface px-5 py-4 text-[12px] font-semibold text-theme-warning">계약서를 작성하고 있습니다.</div>;
  if (status === "SIGN_PENDING") return <div className="mt-5 rounded-[12px] border border-info-border bg-info-surface px-5 py-4 text-[12px] font-semibold text-theme-secondary">계약서 서명이 필요합니다. 아래 계약 내용을 확인하고 서명해 주세요.</div>;
  return <div className="mt-5 rounded-[12px] border border-success-border bg-success-surface px-5 py-4 text-[12px] font-semibold text-theme-success">계약 체결이 완료되었습니다.</div>;
}

function SignatureCard({ title, signature }: { title: string; signature?: ContractSignature }) {
  const signed = signature?.status === "SIGNED";
  const statusLabel = signature?.status === "REJECTED" ? "서명 거절" : signed ? "서명 완료" : "서명 대기 중";
  return <article className={`min-h-[116px] rounded-[10px] border p-4 ${signed ? "border-success-border bg-success-surface" : "border-theme bg-surface"}`}><p className={`text-[10px] font-semibold ${signed ? "text-theme-success" : "text-theme-muted"}`}>{signed ? "✓ " : "○ "}{title}</p><p className="mt-3 text-[12px] font-bold">{signature?.name ?? "-"}</p><p className={`mt-1.5 text-[10px] font-semibold ${signed ? "text-theme-success" : "text-theme-muted"}`}>{statusLabel}{signed ? ` · ${formatContractDate(signature?.signedAt)}` : ""}</p></article>;
}

function ConfirmationCard({ contract }: { contract: ContractDetailResponse }) {
  const pending = contract.status === "SIGN_PENDING";
  return <article className={`min-h-[116px] rounded-[10px] border p-4 ${pending ? "border-theme bg-surface" : "border-success-border bg-success-surface"}`}><p className={`text-[10px] font-semibold ${pending ? "text-theme-muted" : "text-theme-success"}`}>{pending ? "○ " : "✓ "}계약 확정</p><p className="mt-3 text-[12px] font-bold">{pending ? "서명 대기 중" : "계약 최종 확정"}</p><p className={`mt-1.5 text-[10px] font-semibold ${pending ? "text-theme-muted" : "text-theme-success"}`}>{pending ? "양측 서명 완료 시 확정" : `확정일: ${formatContractDate(contract.signedAt)}`}</p></article>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="grid grid-cols-[90px_1fr] text-[11px]"><dt className="text-theme-muted">{label}</dt><dd className="font-bold text-theme-primary">{value}</dd></div>;
}

function getActionTitle(contract: ContractDetailResponse, mySignature?: ContractSignature) {
  if (contract.status === "DRAFT") return "계약서를 준비하고 있습니다.";
  if (contract.status === "SIGN_PENDING" && mySignature?.status === "PENDING") return "위 계약 내용을 확인하고 서명해 주세요.";
  if (contract.status === "SIGN_PENDING") return "내 서명이 완료되었습니다. 상대방의 서명을 기다리고 있습니다.";
  return "계약 체결이 완료되었습니다.";
}

function areBothPartiesSigned(signatures: ContractSignature[]) {
  return (["CLIENT", "FREELANCER"] as const).every((partyRole) =>
    signatures.some((signature) => signature.partyRole === partyRole && signature.status === "SIGNED"),
  );
}

function getContractErrorMessage(error: unknown, isPdf = false) {
  if (!(error instanceof ApiException)) return error instanceof Error ? error.message : isPdf ? "계약서 PDF를 다운로드하지 못했습니다." : "계약 상세를 불러오지 못했습니다.";
  if (error.errorCode === "CONTRACT_NOT_FOUND") return "계약을 찾을 수 없습니다.";
  if (error.errorCode === "NOT_CONTRACT_PARTY") return "이 계약을 조회할 권한이 없습니다.";
  if (error.errorCode === "PDF_RENDER_FAILED") return "계약서 PDF 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.";
  return error.message;
}
