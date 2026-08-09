type NegotiationResultCardProps = {
  result: "complete" | "failed";
};

export function NegotiationResultCard({ result }: NegotiationResultCardProps) {
  const isComplete = result === "complete";

  return (
    <section className={`mx-auto flex min-h-[180px] w-full max-w-[500px] flex-col items-center justify-center rounded-[18px] border px-7 py-6 text-center ${isComplete ? "border-[#86efac] bg-[#ecfdf3]" : "border-[#fda29b] bg-[#fef3f2]"}`}>
      <div className={`flex h-[64px] w-[64px] items-center justify-center rounded-full text-[34px] font-medium ${isComplete ? "bg-[#d1fadf] text-[#039855]" : "bg-[#fee4e2] text-[#d92d20]"}`}>
        {isComplete ? "✓" : "×"}
      </div>
      <h3 className={`mt-5 text-[22px] font-extrabold tracking-[-0.03em] ${isComplete ? "text-[#027a48]" : "text-[#b42318]"}`}>
        {isComplete ? "협상이 완료되었습니다" : "협상이 결렬되었습니다"}
      </h3>
      <p className="mt-4 text-[15px] font-medium text-[#475467]">
        {isComplete
          ? "연봉 350만 원 · 기간 6개월 · 혼합 근무"
          : "상대방과 최종 조건에 합의하지 못했습니다."}
      </p>
    </section>
  );
}
