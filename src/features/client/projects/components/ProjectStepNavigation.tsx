import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/features/common/components/SharedUI";
import type { ProjectStepNavigationProps } from "@/features/client/projects/types/components";

/** 프로젝트 등록 입력 단계에서 사용하는 공통 하단 내비게이션입니다. */
export function ProjectStepNavigation({
  onPrevious,
  onNext,
  nextDisabled = false,
  previousLabel = "이전",
  nextLabel = "다음",
}: ProjectStepNavigationProps) {
  return (
    <div className="mt-8 border-t border-theme pt-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevious}
          className="flex h-[42px] cursor-pointer items-center gap-1 rounded-[8px] border border-theme bg-surface px-5 text-[11px] font-semibold text-theme-secondary transition hover:bg-surface-subtle"
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
              : "cursor-pointer bg-brand hover:bg-brand"
          }`}
        >
          {nextLabel}
          <ChevronRightIcon size={13} />
        </button>
      </div>
    </div>
  );
}
