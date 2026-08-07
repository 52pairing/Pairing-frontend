import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/features/common/components/SharedUI";

interface ProjectStepNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  previousLabel?: string;
  nextLabel?: string;
}

/** 프로젝트 등록 입력 단계에서 사용하는 공통 하단 내비게이션입니다. */
export function ProjectStepNavigation({
  onPrevious,
  onNext,
  nextDisabled = false,
  previousLabel = "이전",
  nextLabel = "다음",
}: ProjectStepNavigationProps) {
  return (
    <div className="mt-8 border-t border-[#e2e7ec] pt-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevious}
          className="flex h-[42px] cursor-pointer items-center gap-1 rounded-[8px] border border-[#dce2e8] bg-white px-5 text-[11px] font-semibold text-[#596579] transition hover:bg-[#f8fafc]"
        >
          <ChevronLeftIcon size={13} />
          {previousLabel}
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className={`flex h-[42px] min-w-[99px] items-center justify-center gap-1 rounded-[8px] px-5 text-[12px] font-bold text-white transition ${
            nextDisabled
              ? "cursor-not-allowed bg-[#a7b0bf]"
              : "cursor-pointer bg-[#17365d] hover:bg-[#102a49]"
          }`}
        >
          {nextLabel}
          <ChevronRightIcon size={13} />
        </button>
      </div>
    </div>
  );
}
