import type { ReactNode } from "react";

type NegotiationResultCardProps = {
  result: "complete" | "failed";
  /** 합의 조건 요약 (타결 시). 없으면 기본 안내 문구 */
  summary?: string;
  /** 타결 시 [채팅으로 이어가기] 버튼 또는 안내 문구 (chatRoomId 유무에 따라) */
  actionSlot?: ReactNode;
};

export function NegotiationResultCard({
  result,
  summary,
  actionSlot,
}: NegotiationResultCardProps) {
  const isComplete = result === "complete";

  return (
    <section className={`mx-auto flex min-h-[180px] w-full max-w-[500px] flex-col items-center justify-center rounded-[18px] border px-7 py-6 text-center ${isComplete ? "border-[#86efac] bg-[#ecfdf3]" : "border-[#fda29b] bg-[#fef3f2]"}`}>
      <div className={`flex h-[64px] w-[64px] items-center justify-center rounded-full text-[34px] font-medium ${isComplete ? "bg-[#d1fadf] text-[#039855]" : "bg-[#fee4e2] text-[#d92d20]"}`}>
        {isComplete ? "✓" : "×"}
      </div>
      <h3 className={`mt-5 text-[22px] font-extrabold tracking-[-0.03em] ${isComplete ? "text-[#027a48]" : "text-[#b42318]"}`}>
        {isComplete ? "모든 조건에 합의했습니다" : "협상이 성립되지 않았어요"}
      </h3>
      <p className="mt-4 text-[15px] font-medium text-[#475467]">
        {isComplete
          ? (summary ?? "모든 조건에 합의했습니다.")
          : "15회 소진 또는 협상 포기로 종료되었습니다."}
      </p>
      {actionSlot ? <div className="mt-5">{actionSlot}</div> : null}
    </section>
  );
}
