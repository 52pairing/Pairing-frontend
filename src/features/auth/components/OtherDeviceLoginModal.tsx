// 다른 기기에서 로그인된 경우 보여주는 모달

"use client";

import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/features/common/components/Modal";

interface DuplicateLoginModalProps {
  open: boolean;
  /** 로그인 페이지로 이동하기 전에 정리할 작업(토큰 삭제 등)이 있으면 사용 */
  onConfirm?: () => void;
}

/** 동일 계정이 다른 기기·브라우저에서 로그인해 현재 세션이 종료됐을 때 */
export const DuplicateLoginModal = ({
  open,
  onConfirm,
}: DuplicateLoginModalProps) => {
  const router = useRouter();

  const handleConfirm = () => {
    onConfirm?.();
    router.push("/login");
  };

  return (
    <ConfirmModal
      open={open}
      title="다른 기기에서 로그인되었습니다."
      description="동일한 계정으로 다른 기기 또는 브라우저에서 로그인하여 현재 로그인이 종료되었습니다. 다시 로그인해 주세요."
      confirmText="확인"
      onConfirm={handleConfirm}
      onClose={handleConfirm}
      closeOnOverlayClick={false}
    />
  );
};
