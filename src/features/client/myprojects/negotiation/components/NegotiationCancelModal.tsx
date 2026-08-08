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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="협상 포기 확인"
        className="w-[440px] rounded-[14px] bg-white px-8 pb-8 pt-9 shadow-xl"
      >
        {/* 제목 */}
        <h2 className="text-[21px] font-bold text-[#151b2b]">
          협상을 포기하시겠어요?
        </h2>

        {/* 설명 */}
        <p className="mt-4 text-[14px] leading-6 text-[#657084]">
          협상을 포기하면 해당 요청이 협상 결렬
          <br />
          <span className="font-semibold">(NEGOTIATION_FAILED)</span> 상태로
          처리됩니다.
        </p>

        {/* 안내 박스 */}
        <div className="mt-5 rounded-[10px] border border-[#ffd46a] bg-[#fff5d6] px-4 py-4">
          <div className="space-y-2 text-[13px] font-semibold leading-6 text-[#a64b12]">
            <p>• 이 프리랜서는 동일 프로젝트의 재추천 대상에서 제외됩니다.</p>

            <p>• 협상 결렬은 무료 리롤 조건에 포함되지 않습니다.</p>

            <p>• 새 후보가 필요하면 유료 리롤(1인당 10,000원)을 이용하세요.</p>
          </div>
        </div>

        {/* 버튼 */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-[52px] flex-1 rounded-[10px] border border-[#dde2e8] bg-white text-[15px] font-semibold text-[#737f91] transition hover:bg-[#f8f9fb]"
          >
            취소
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="h-[52px] flex-1 rounded-[10px] bg-[#ef2024] text-[15px] font-bold text-white transition hover:bg-[#d91d20]"
          >
            협상 포기
          </button>
        </div>
      </div>
    </div>
  );
}
