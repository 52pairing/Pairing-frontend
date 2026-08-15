"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { ContractCompleteModal } from "@/features/contract/components/common/ContractCompleteModal";
import { ConfirmModal, WarningIcon } from "@/features/common/components/Modal";
import {
  downloadContractPdf,
  getContractDetail,
  signContract,
  uploadContractSignature,
} from "@/features/contract/services/contracts";
import type {
  ContractDetailResponse,
  ContractPartyRole,
} from "@/features/contract/types/contractDetail";
import { ApiException } from "@/lib/api";

interface ContractDocumentProps {
  role: "client" | "freelancer";
}

const canvasToBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("서명 이미지를 만들지 못했습니다."));
    }, "image/png");
  });

export function ContractDocument({ role }: ContractDocumentProps) {
  const router = useRouter();
  const params = useParams<{ projectId?: string; contractId: string }>();
  const contractId = Number(params.contractId);
  const myPartyRole: ContractPartyRole = role === "client" ? "CLIENT" : "FREELANCER";
  const detailPath = role === "client"
    ? `/client/projects/${params.projectId}/contracts/${params.contractId}`
    : `/freelancer/contracts/${params.contractId}`;
  const backPath = role === "client"
    ? `/client/projects/${params.projectId}?tab=계약`
    : "/freelancer/contracts";

  const [contract, setContract] = useState<ContractDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");
  const [pdfErrorMessage, setPdfErrorMessage] = useState("");
  const [isSignaturePadOpen, setIsSignaturePadOpen] = useState(false);
  const [signatureBlob, setSignatureBlob] = useState<Blob | null>(null);
  const [signaturePreviewUrl, setSignaturePreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [signedContract, setSignedContract] = useState<ContractDetailResponse | null>(null);
  const submitLockRef = useRef(false);

  const loadContract = useCallback(async () => {
    if (!Number.isInteger(contractId) || contractId <= 0) {
      setErrorMessage("계약 정보를 확인할 수 없습니다.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setErrorMessage("");
    try {
      const detail = await getContractDetail(contractId);
      setContract(detail);

      try {
        const pdf = await downloadContractPdf(contractId);
        setPdfPreviewUrl((current) => {
          if (current) URL.revokeObjectURL(current);
          return URL.createObjectURL(pdf);
        });
        setPdfErrorMessage("");
      } catch (error) {
        setPdfErrorMessage(error instanceof Error ? error.message : "계약서 미리보기를 불러오지 못했습니다.");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "계약서를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
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

  useEffect(() => () => {
    if (signaturePreviewUrl) URL.revokeObjectURL(signaturePreviewUrl);
  }, [signaturePreviewUrl]);

  useEffect(() => () => {
    if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
  }, [pdfPreviewUrl]);

  const saveSignature = (blob: Blob) => {
    if (signaturePreviewUrl) URL.revokeObjectURL(signaturePreviewUrl);
    setSignatureBlob(blob);
    setSignaturePreviewUrl(URL.createObjectURL(blob));
    setIsSignaturePadOpen(false);
  };

  const submitSignature = async () => {
    if (!contract || submitLockRef.current) return;
    const mySignature = contract.signatures.find((item) => item.partyRole === myPartyRole);
    if (
      contract.status !== "SIGN_PENDING" ||
      mySignature?.status !== "PENDING" ||
      !signatureBlob
    ) return;

    submitLockRef.current = true;
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const uploaded = await uploadContractSignature(signatureBlob);
      const updated = await signContract(contract.contractId, uploaded.fileId);
      setContract(updated);
      setSignedContract(updated);
      setIsConfirmOpen(false);
    } catch (error) {
      setErrorMessage(getSignatureErrorMessage(error));
      setIsConfirmOpen(false);
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  const downloadPdf = async () => {
    const current = signedContract ?? contract;
    if (!current || current.status === "DRAFT") return;
    try {
      const blob = await downloadContractPdf(current.contractId);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${current.contractNo}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "계약서를 다운로드하지 못했습니다.");
    }
  };

  if (isLoading) return <div className="flex min-h-[60vh] items-center justify-center text-sm text-theme-secondary">계약서를 불러오고 있습니다.</div>;
  if (!contract) return <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4"><p role="alert" className="text-sm text-theme-danger">{errorMessage || "계약서를 찾을 수 없습니다."}</p><button type="button" onClick={() => void loadContract()} className="rounded-lg bg-brand px-5 py-3 text-sm font-bold text-white">다시 시도</button></main>;

  const mySignature = contract.signatures.find((item) => item.partyRole === myPartyRole);
  const canSign = contract.status === "SIGN_PENDING" && mySignature?.status === "PENDING";

  return (
    <main className="min-h-screen bg-background text-theme-primary">
      <header className="border-b border-theme bg-surface">
        <div className="mx-auto flex h-[52px] max-w-[860px] items-center gap-3 px-5">
          <Link href={detailPath} className="text-[13px] font-medium text-theme-muted hover:text-theme-secondary">&lt; 계약 상세로</Link>
          <span className="text-theme-muted">|</span>
          <h1 className="text-[15px] font-bold">계약서 미리보기</h1>
        </div>
      </header>

      <div className="mx-auto max-w-[860px] px-5 py-6">
        <div className="mb-4 rounded-[9px] border border-warning-border bg-warning-surface px-4 py-2.5 text-[12px] font-medium text-theme-warning">계약서 내용을 최종 확인해 주세요. 전자 서명 후에는 되돌릴 수 없습니다.</div>
        {errorMessage ? <p role="alert" className="mb-4 rounded-[9px] border border-theme bg-danger-surface px-4 py-3 text-[12px] text-theme-danger">{errorMessage}</p> : null}

        <section className="overflow-hidden rounded-[15px] border border-theme bg-surface shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="flex items-center justify-between border-b border-theme px-5 py-4">
            <div>
              <h2 className="text-[15px] font-bold">프리랜서 용역 계약서</h2>
              <p className="mt-1 text-[11px] text-theme-muted">계약 번호 {contract.contractNo}</p>
            </div>
            <button type="button" onClick={() => void downloadPdf()} className="h-9 rounded-[8px] border border-theme px-4 text-[11px] font-semibold text-theme-secondary hover:bg-surface-subtle">PDF 다운로드</button>
          </div>
          {pdfPreviewUrl ? (
            <iframe title="프리랜서 용역 계약서 PDF 미리보기" src={`${pdfPreviewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} className="h-[76vh] min-h-[720px] w-full bg-surface" />
          ) : (
            <div className="flex min-h-[520px] flex-col items-center justify-center gap-3 px-5 text-center text-[12px] text-theme-secondary">
              <p role={pdfErrorMessage ? "alert" : undefined}>{pdfErrorMessage || "계약서 PDF를 불러오고 있습니다."}</p>
              {pdfErrorMessage ? <button type="button" onClick={() => void loadContract()} className="rounded-[8px] bg-brand px-4 py-2 font-bold text-white">다시 시도</button> : null}
            </div>
          )}
        </section>

        <section className="mt-5 rounded-[15px] bg-surface px-6 py-7 shadow-[0_1px_2px_rgba(16,24,40,0.04)] md:px-10">
          <h2 className="text-[15px] font-bold">전자서명</h2>
          <button type="button" disabled={!canSign} onClick={() => setIsSignaturePadOpen(true)} className="mt-5 block w-full max-w-[380px] rounded-[12px] border border-theme px-7 py-6 text-left transition hover:bg-surface-subtle disabled:cursor-not-allowed disabled:hover:bg-transparent">
            <p className="text-center text-[14px] text-theme-muted">{role === "client" ? "갑 (클라이언트)" : "을 (프리랜서)"}</p>
            <p className="mt-2 text-center text-[17px] font-bold">{mySignature?.name ?? (role === "client" ? contract.client.companyName : contract.freelancer.name)}</p>
            <div className="mt-7 flex justify-center">{signaturePreviewUrl ? <Image unoptimized src={signaturePreviewUrl} alt="작성한 전자서명" width={220} height={88} className="h-[88px] max-w-[220px] object-contain" /> : <span className="flex h-[88px] w-[160px] items-center justify-center rounded-[10px] border border-dashed border-theme text-[13px] text-theme-muted">전자서명</span>}</div>
          </button>
        </section>

        <div className="mt-5 flex gap-3">
          <button type="button" onClick={() => router.push(detailPath)} className="h-[46px] w-[200px] rounded-[11px] border border-theme bg-surface text-[14px] font-semibold text-theme-secondary transition hover:bg-surface-subtle">취소하기</button>
          {contract.status === "SIGN_PENDING" ? <button type="button" disabled={!canSign || !signatureBlob || isSubmitting} onClick={() => setIsConfirmOpen(true)} className="h-[46px] flex-1 rounded-[11px] bg-brand text-[14px] font-bold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-theme-muted">{isSubmitting ? "서명 처리 중..." : signatureBlob ? "전자 서명 및 계약 체결" : "전자서명을 먼저 작성해 주세요"}</button> : null}
        </div>
      </div>

      {isSignaturePadOpen ? <SignaturePadModal onCancel={() => setIsSignaturePadOpen(false)} onSave={saveSignature} /> : null}
      <ConfirmModal
        open={isConfirmOpen}
        title="계약서에 서명하시겠습니까?"
        description={<>서명 후에는 취소하거나 되돌릴 수 없습니다.<br />계약 내용을 확인했다면 서명을 진행해 주세요.</>}
        confirmText={isSubmitting ? "서명 처리 중..." : "서명하기"}
        cancelText="취소"
        icon={<WarningIcon />}
        onClose={() => { if (!isSubmitting) setIsConfirmOpen(false); }}
        onConfirm={() => void submitSignature()}
        closeOnOverlayClick={!isSubmitting}
        confirmDisabled={isSubmitting}
        cancelDisabled={isSubmitting}
      />
      {signedContract ? <ContractCompleteModal contract={signedContract} onBackToProject={() => router.push(backPath)} onDownload={() => void downloadPdf()} backLabel={role === "client" ? "프로젝트로 돌아가기" : "내 계약으로 돌아가기"} /> : null}
    </main>
  );
}

function SignaturePadModal({ onCancel, onSave }: { onCancel: () => void; onSave: (blob: Blob) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const [hasStroke, setHasStroke] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const context = canvas.getContext("2d");
    context?.scale(ratio, ratio);
    if (context) {
      context.lineWidth = 2;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = "#172033";
    }
  }, []);

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const context = event.currentTarget.getContext("2d");
    if (!context) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const current = point(event);
    context.beginPath();
    context.moveTo(current.x, current.y);
    isDrawingRef.current = true;
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const context = event.currentTarget.getContext("2d");
    if (!context) return;
    const current = point(event);
    context.lineTo(current.x, current.y);
    context.stroke();
    setHasStroke(true);
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height);
    setHasStroke(false);
  };

  const save = async () => {
    if (!canvasRef.current || !hasStroke) return;
    onSave(await canvasToBlob(canvasRef.current));
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-theme-overlay px-4"><section role="dialog" aria-modal="true" aria-labelledby="signature-pad-title" className="w-full max-w-[620px] rounded-[16px] bg-surface p-6 shadow-[0_24px_60px_rgba(15,23,42,0.22)]"><h2 id="signature-pad-title" className="text-[17px] font-bold">전자서명 작성</h2><p className="mt-2 text-[12px] text-theme-secondary">아래 영역에 마우스나 손가락으로 서명해 주세요.</p><canvas ref={canvasRef} onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={stopDrawing} onPointerCancel={stopDrawing} className="mt-5 h-[220px] w-full touch-none rounded-[10px] border border-theme bg-transparent" /><div className="mt-5 flex justify-between gap-2"><button type="button" onClick={clear} className="h-10 rounded-[8px] border border-theme px-4 text-[12px] font-semibold text-theme-secondary">지우기</button><div className="flex gap-2"><button type="button" onClick={onCancel} className="h-10 rounded-[8px] border border-theme px-4 text-[12px] font-semibold text-theme-secondary">취소</button><button type="button" disabled={!hasStroke} onClick={() => void save()} className="h-10 rounded-[8px] bg-brand px-5 text-[12px] font-bold text-white disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-theme-muted">서명 적용</button></div></div></section></div>;
}

function getSignatureErrorMessage(error: unknown) {
  if (!(error instanceof ApiException)) return error instanceof Error ? error.message : "전자 서명에 실패했습니다.";
  if (error.errorCode === "CONTRACT_NOT_FOUND") return "계약을 찾을 수 없습니다.";
  if (error.errorCode === "NOT_CONTRACT_PARTY") return "이 계약에 서명할 권한이 없습니다.";
  if (error.errorCode === "INVALID_CONTRACT_STATUS") return "계약서가 아직 작성 중이거나 서명할 수 없는 상태입니다.";
  if (error.errorCode === "ALREADY_SIGNED") return "이미 서명이 완료된 계약입니다.";
  return error.message;
}
