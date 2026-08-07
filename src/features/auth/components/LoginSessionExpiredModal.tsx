// 로그인 세션이 만료된 경우 보여주는 모달

"use client";

import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/features/common/components/Modal";

interface SessionExpiredModalProps {
  open: boolean;
  /** 로그인 페이지로 이동하기 전에 정리할 작업(토큰 삭제 등)이 있으면 사용 */
  onConfirm?: () => void;
}

/** 로그인 세션이 만료되었을 때 */
export const SessionExpiredModal = ({
  open,
  onConfirm,
}: SessionExpiredModalProps) => {
  const router = useRouter();

  const handleConfirm = () => {
    onConfirm?.();
    router.push("/login");
  };

  return (
    <ConfirmModal
      open={open}
      title="로그인 세션이 만료되었습니다."
      description="로그인 세션이 만료되었습니다. 다시 로그인해 주세요."
      confirmText="확인"
      onConfirm={handleConfirm}
      onClose={handleConfirm}
      closeOnOverlayClick={false}
    />
  );
};
