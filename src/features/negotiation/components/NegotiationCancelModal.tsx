interface NegotiationCancelModalProps {
  /** 닫기 (취소) */
  onClose: () => void;
  /** 협상 포기 확정 */
  onConfirm: () => void;
}

export function NegotiationCancelModal({
  onClose,
  onConfirm,
}: NegotiationCancelModalProps) {
  return (
    <ActionWarningModal
      open
      title="협상을 포기하시겠어요?"
      description={
        <>
          협상을 포기하면 해당 요청이 협상 결렬
          <br />
          <span className="font-semibold">(NEGOTIATION_FAILED)</span> 상태로
          처리됩니다.
        </>
      }
      warningItems={["이 프리랜서는 동일 프로젝트의 재추천 대상에서 제외됩니다.", "협상 결렬은 무료 리롤 조건에 포함되지 않습니다.", "새 후보가 필요하면 유료 리롤(1인당 10,000원)을 이용하세요."]}
      confirmText="협상 포기"
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
import { ActionWarningModal } from "@/features/common/components/ActionWarningModal";
