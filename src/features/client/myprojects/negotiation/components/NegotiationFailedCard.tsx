interface NegotiationFailedCardProps {
  onBack: () => void;
}

/** 협상 성공 결과 카드와 동일한 규격을 사용하는 실패 결과 카드입니다. */
export function NegotiationFailedCard({ onBack }: NegotiationFailedCardProps) {
  return (
    <section className="w-full max-w-[360px] rounded-[14px] border border-[#fecdca] bg-[#fef3f2] px-6 py-6 text-center shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#fee4e2] text-[22px] font-medium text-[#d92d20]">
        ×
      </div>

      <h2 className="mt-3 text-[15px] font-extrabold text-[#b42318]">
        협상이 성립되지 않았어요
      </h2>

      <p className="mt-2 text-[11px] leading-5 text-[#475467]">
        15회 소진 또는 협상 포기로 종료되었습니다.
      </p>

      <button
        type="button"
        onClick={onBack}
        className="mt-5 h-[40px] w-full cursor-pointer rounded-[8px] border border-[#fda29b] bg-white text-[12px] font-bold text-[#b42318] transition hover:bg-[#fff5f4]"
      >
        제안 목록으로 돌아가기
      </button>
    </section>
  );
}
