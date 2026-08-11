import type { ReactNode } from "react";

interface ErrorStateProps {
  /** 에러 제목 */
  title?: string;
  /** 상세 설명 */
  description?: ReactNode;
  /** 재시도 버튼 문구 */
  retryText?: string;
  /** 재시도 핸들러. 없으면 버튼을 표시하지 않음 */
  onRetry?: () => void;
  /** 추가 클래스 (영역 높이 등 조정) */
  className?: string;
}

/**
 * 데이터 로드 실패 등으로 내용을 표시하지 못할 때 쓰는 공통 에러 상태.
 * 특정 영역 안에 넣어 쓰며, onRetry를 주면 "다시 시도" 버튼이 나타납니다.
 */
export const ErrorState = ({
  title = "문제가 발생했습니다",
  description = "잠시 후 다시 시도해 주세요.",
  retryText = "다시 시도",
  onRetry,
  className = "",
}: ErrorStateProps) => {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center gap-3 px-4 py-10 text-center ${className}`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6 text-red-500"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      </span>

      <div>
        <p className="text-base font-semibold text-theme-primary">{title}</p>
        {description ? (
          <p className="mt-1 text-sm leading-relaxed text-theme-secondary">
            {description}
          </p>
        ) : null}
      </div>

      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-lg border border-theme bg-surface px-4 py-2 text-sm font-semibold text-theme-secondary hover:bg-surface-subtle"
        >
          {retryText}
        </button>
      ) : null}
    </div>
  );
};
