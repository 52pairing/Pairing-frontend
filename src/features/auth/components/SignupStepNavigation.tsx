// 회원가입 위저드 입력 단계에서 사용하는 공통 하단 내비게이션.
// client/projects의 ProjectStepNavigation과 동일한 구조, 색상 토큰만 auth 팔레트로 교체.

interface SignupStepNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  previousLabel?: string;
  nextLabel?: string;
}

export function SignupStepNavigation({
  onPrevious,
  onNext,
  nextDisabled = false,
  previousLabel = "이전",
  nextLabel = "다음",
}: SignupStepNavigationProps) {
  return (
    <div className="mt-8 border-t border-[#E4E7EC] pt-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevious}
          className="h-11 rounded-md border border-gray-200 px-5 text-sm font-semibold text-gray-500 transition hover:bg-gray-50"
        >
          {previousLabel}
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className={`h-11 min-w-[120px] rounded-md px-5 text-sm font-bold text-white transition ${
            nextDisabled
              ? "cursor-not-allowed bg-gray-300"
              : "cursor-pointer bg-[#142B4A] hover:bg-[#0f2138]"
          }`}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
