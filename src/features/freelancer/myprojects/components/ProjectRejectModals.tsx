"use client";

import { useState } from "react";

import { ConfirmModal } from "@/features/common/components/Modal";

interface ProjectRejectModalsProps {
  open: boolean;
  projectTitle: string;
  onClose: () => void;
  onConfirm?: (reason: string) => void | Promise<void>;
  errorMessage?: string;
}

export function ProjectRejectModals({
  open,
  projectTitle,
  onClose,
  onConfirm,
  errorMessage,
}: ProjectRejectModalsProps) {
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const confirmReject = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirm?.(reason);
      setReason("");
      onClose();
      setIsCompleteOpen(true);
    } catch {
      // 호출 화면이 전달한 오류 문구를 모달 안에 유지한다.
    } finally { setIsSubmitting(false); }
  };

  return (
    <>
      <ConfirmModal
        open={open}
        title="프로젝트 제안을 거절하시겠습니까?"
        description={`${projectTitle} 제안을 거절하면 다시 수락할 수 없습니다.`}
        confirmText={isSubmitting ? "처리 중" : "거절"}
        cancelText="취소"
        variant="danger"
        onClose={onClose}
        onConfirm={() => void confirmReject()}
      >
        <label htmlFor="matching-reject-reason" className="mt-4 block text-[12px] font-bold text-theme-primary">거절 사유 (선택)</label>
        <textarea id="matching-reject-reason" value={reason} maxLength={255} onChange={(event) => setReason(event.target.value)} placeholder="거절 사유를 입력해 주세요." className="mt-2 min-h-24 w-full resize-none rounded-lg border border-theme bg-surface px-3 py-2 text-[12px] outline-none focus:border-brand" />
        <p className="mt-1 text-right text-[10px] text-theme-muted">{reason.length}/255</p>
        {errorMessage ? <p role="alert" className="mt-2 text-[11px] font-semibold text-theme-danger">{errorMessage}</p> : null}
      </ConfirmModal>
      <ConfirmModal
        open={isCompleteOpen}
        title="거절이 완료되었습니다."
        description="프로젝트 제안이 종료됨 상태로 변경되었습니다."
        confirmText="확인"
        onClose={() => setIsCompleteOpen(false)}
        onConfirm={() => setIsCompleteOpen(false)}
      />
    </>
  );
}
