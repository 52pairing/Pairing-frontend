"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { ContractCompleteModal } from "@/features/contract/components/ContractCompleteModal";
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
import { getProjectJobRoles } from "@/features/client/projects/services/projectPreReview";

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
  const [jobRoleLabels, setJobRoleLabels] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSignaturePadOpen, setIsSignaturePadOpen] = useState(false);
  const [signatureBlob, setSignatureBlob] = useState<Blob | null>(null);
  const [signaturePreviewUrl, setSignaturePreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signedContract, setSignedContract] = useState<ContractDetailResponse | null>(null);

  const loadContract = useCallback(async () => {
    if (!Number.isInteger(contractId) || contractId <= 0) {
      setErrorMessage("계약 정보를 확인할 수 없습니다.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setErrorMessage("");
    try {
      const [detail, jobRoles] = await Promise.all([
        getContractDetail(contractId),
        getProjectJobRoles(),
      ]);
      setContract(detail);
      setJobRoleLabels(Object.fromEntries(jobRoles.map((item) => [item.code, item.label])));
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

  const saveSignature = (blob: Blob) => {
    if (signaturePreviewUrl) URL.revokeObjectURL(signaturePreviewUrl);
    setSignatureBlob(blob);
    setSignaturePreviewUrl(URL.createObjectURL(blob));
    setIsSignaturePadOpen(false);
  };

  const submitSignature = async () => {
    if (!contract || isSubmitting) return;
    const mySignature = contract.signatures.find((item) => item.partyRole === myPartyRole);
    if (
      contract.status !== "SIGN_PENDING" ||
      mySignature?.status !== "PENDING" ||
      !signatureBlob
    ) return;

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const uploaded = await uploadContractSignature(signatureBlob);
      const updated = await signContract(contract.contractId, uploaded.fileId);
      setContract(updated);
      setSignedContract(updated);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "전자 서명에 실패했습니다.");
    } finally {
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
  const jobRoleLabel = jobRoleLabels[contract.jobRole] ?? contract.jobRole;

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

        <article className="rounded-[15px] bg-surface px-6 py-8 shadow-[0_1px_2px_rgba(16,24,40,0.04)] md:px-10">
          <div className="text-center">
            <h2 className="text-[22px] font-bold tracking-[-0.02em]">프리랜서 용역 계약서</h2>
            <p className="mt-2 text-[12px] text-theme-muted">계약 번호: {contract.contractNo} · 작성일: {contract.createdAt.slice(0, 10).replaceAll("-", ".")}</p>
          </div>

          <SectionTitle title="당사자 표시" className="mt-8" />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <PartyCard title="갑 (클라이언트)" rows={[["기업명", contract.client.companyName], ["사업자등록번호", contract.client.businessNo], ["대표자", contract.client.representative], ["주소", contract.client.address], ["연락처", contract.client.phone]]} />
            <PartyCard title="을 (프리랜서)" rows={[["성명", contract.freelancer.name], ["연락처", contract.freelancer.phone], ["직군", jobRoleLabel], ["정산 계좌", contract.freelancer.settlementAccount]]} />
          </div>

          {contract.clauses.map((clause) => <section key={clause.no} className="mt-9"><h3 className="border-b-2 border-theme-strong pb-2 text-[15px] font-bold">제{clause.no}조 ({clause.title})</h3><p className="mt-3 whitespace-pre-line text-[14px] leading-7 text-theme-secondary">{clause.content}</p></section>)}

          <SectionTitle title="서명" className="mt-11" />
          <button type="button" disabled={!canSign} onClick={() => setIsSignaturePadOpen(true)} className="mt-5 block w-full max-w-[380px] rounded-[12px] border border-theme px-7 py-6 text-left transition hover:bg-surface-subtle disabled:cursor-not-allowed disabled:hover:bg-transparent">
            <p className="text-center text-[14px] text-theme-muted">{role === "client" ? "갑 (클라이언트)" : "을 (프리랜서)"}</p>
            <p className="mt-2 text-center text-[17px] font-bold">{mySignature?.name ?? (role === "client" ? contract.client.companyName : contract.freelancer.name)}</p>
            <div className="mt-7 flex justify-center">{signaturePreviewUrl ? <Image unoptimized src={signaturePreviewUrl} alt="작성한 전자서명" width={220} height={88} className="h-[88px] max-w-[220px] object-contain" /> : <span className="flex h-[88px] w-[160px] items-center justify-center rounded-[10px] border border-dashed border-theme text-[13px] text-theme-muted">전자서명</span>}</div>
          </button>
        </article>

        <div className="mt-5 flex gap-3">
          <button type="button" onClick={() => router.push(detailPath)} className="h-[46px] w-[200px] rounded-[11px] border border-theme bg-surface text-[14px] font-semibold text-theme-secondary transition hover:bg-surface-subtle">취소하기</button>
          <button type="button" disabled={!canSign || !signatureBlob || isSubmitting} onClick={() => void submitSignature()} className="h-[46px] flex-1 rounded-[11px] bg-brand text-[14px] font-bold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-theme-muted">{isSubmitting ? "서명 처리 중..." : signatureBlob ? "전자 서명 및 계약 체결" : "전자서명을 먼저 작성해 주세요"}</button>
        </div>
      </div>

      {isSignaturePadOpen ? <SignaturePadModal onCancel={() => setIsSignaturePadOpen(false)} onSave={saveSignature} /> : null}
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

function SectionTitle({ title, className = "" }: { title: string; className?: string }) {
  return <div className={`${className} flex items-center gap-2 border-b-2 border-theme-strong pb-2`}><span className="h-2.5 w-2.5 bg-brand" /><h3 className="text-[15px] font-bold">{title}</h3></div>;
}

function PartyCard({ title, rows }: { title: string; rows: string[][] }) {
  return <div className="rounded-[12px] bg-surface-subtle px-5 py-4"><p className="mb-2 text-[13px] font-semibold text-theme-muted">{title}</p>{rows.map(([label, value]) => <div key={label} className="grid grid-cols-[110px_1fr] border-b border-theme py-2.5 last:border-b-0"><span className="text-[13px] text-theme-muted">{label}</span><span className="break-words text-[14px] font-semibold leading-6 text-theme-secondary">{value}</span></div>)}</div>;
}
