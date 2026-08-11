type SpinnerSize = "sm" | "md" | "lg";

interface SpinnerProps {
  size?: SpinnerSize;
  label?: string;
  className?: string;
}

const SIZE_STYLE: Record<SpinnerSize, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-4",
};

export const Spinner = ({
  size = "md",
  label = "로딩 중",
  className = "",
}: SpinnerProps) => {
  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-flex items-center justify-center ${className}`}
    >
      <span
        className={`animate-spin rounded-full border-solid border-current border-r-transparent ${SIZE_STYLE[size]}`}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
};

interface LoadingOverlayProps {
  label?: string;
  fullScreen?: boolean;
}


export const LoadingOverlay = ({
  label = "로딩 중",
  fullScreen = true,
}: LoadingOverlayProps) => {
  const positionClass = fullScreen ? "fixed inset-0" : "absolute inset-0";

  return (
    <div
      className={`${positionClass} z-40 flex flex-col items-center justify-center gap-3 bg-black/30`}
    >
      <Spinner size="lg" label={label || "로딩 중"} className="text-white" />
      {label ? (
        <p className="text-sm text-white" aria-hidden="true">
          {label}
        </p>
      ) : null}
    </div>
  );
};

interface LoadingStateProps {
  /** 스피너 아래 표시할 안내 문구 (상황에 맞게 지정). 줄바꿈은 \n 사용 */
  message?: string;
  /** 스피너 크기 */
  size?: SpinnerSize;
  /** 추가 클래스 (영역 높이 등 조정) */
  className?: string;
}

/**
 * 스피너 + 안내 문구를 세로로 표시하는 로딩 상태.
 * 특정 영역 안에 넣어 쓰며, message를 상황에 맞게 지정합니다.
 *
 * @example
 * <LoadingState message="업로드하는 중입니다. 잠시만 기다려 주세요." />
 */
export const LoadingState = ({
  message = "불러오는 중입니다. 잠시만 기다려 주세요.",
  size = "md",
  className = "",
}: LoadingStateProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 px-4 py-10 text-center ${className}`}
    >
      <Spinner
        size={size}
        label={message || "로딩 중"}
        className="text-brand"
      />
      {message ? (
        <p className="whitespace-pre-line text-sm text-theme-secondary" aria-hidden="true">
          {message}
        </p>
      ) : null}
    </div>
  );
};
