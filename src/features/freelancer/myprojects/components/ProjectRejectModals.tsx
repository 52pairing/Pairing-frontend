"use client";

import { useState } from "react";

import { ConfirmModal } from "@/features/common/components/Modal";

interface ProjectRejectModalsProps {
  open: boolean;
  projectTitle: string;
  onClose: () => void;
}

export function ProjectRejectModals({
  open,
  projectTitle,
  onClose,
}: ProjectRejectModalsProps) {
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);

  const confirmReject = () => {
    onClose();
    setIsCompleteOpen(true);
  };

  return (
    <>
      <ConfirmModal
        open={open}
        title="프로젝트 제안을 거절하시겠습니까?"
        description={`${projectTitle} 제안을 거절하면 다시 수락할 수 없습니다.`}
        confirmText="거절"
        cancelText="취소"
        variant="danger"
        onClose={onClose}
        onConfirm={confirmReject}
      />
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
