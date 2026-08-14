import { ActionWarningModal } from "@/features/common/components/ActionWarningModal";

interface NegotiationCancelModalProps {
  /** 뷰어 역할 — 안내 문구를 역할별로 분기 */
  viewerRole: "CLIENT" | "FREELANCER";
  /** 닫기 (취소) */
  onClose: () => void;
  /** 협상 포기 확정 */
  onConfirm: () => void;
}

// 클라이언트: 재추천 제외·리롤 안내 / 프리랜서: 본인 관점
const WARNING_ITEMS: Record<"CLIENT" | "FREELANCER", string[]> = {
  CLIENT: [
    "이 프리랜서는 동일 프로젝트의 재추천 대상에서 제외됩니다.",
    "협상 결렬은 무료 리롤 조건에 포함되지 않습니다.",
    "새 후보가 필요하면 유료 리롤(1인당 10,000원)을 이용하세요.",
  ],
  FREELANCER: [
    "이 프로젝트 협상에서 빠지게 됩니다.",
    "포기하면 되돌릴 수 없습니다.",
  ],
};

export function NegotiationCancelModal({
  viewerRole,
  onClose,
  onConfirm,
}: NegotiationCancelModalProps) {
  return (
    <ActionWarningModal
      open
      title="협상을 포기하시겠어요?"
      description="협상을 포기하면 해당 요청이 협상 결렬 상태로 처리됩니다."
      warningItems={WARNING_ITEMS[viewerRole]}
      confirmText="협상 포기"
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
