import type { ReactNode } from "react";

interface ListStateProps {
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  onRetry: () => void;
  loadingText: string;
  emptyText: string;
  /** 상태 박스의 화면별 프레임(여백/높이/모서리). 예: "mt-6 h-[180px] rounded-[14px]" */
  frameClassName: string;
  /** 에러 박스 스타일. danger: 붉은 테두리+아웃라인 버튼 / plain: 기본 테두리+브랜드 버튼 */
  errorVariant?: "danger" | "plain";
  children: ReactNode;
}

/**
 * 계약 목록류 화면의 로딩/에러/빈 상태 스캐폴드.
 * 데이터가 있을 때만 children(목록)을 렌더한다.
 * 상태들은 실제로 상호 배타적이라 error → loading → empty 순으로 판정한다.
 */
export function ListState({
  isLoading,
  error,
  isEmpty,
  onRetry,
  loadingText,
  emptyText,
  frameClassName,
  errorVariant = "danger",
  children,
}: ListStateProps) {
  if (error) {
    if (errorVariant === "plain") {
      return (
        <div className={`${frameClassName} flex flex-col items-center justify-center gap-4 border border-theme bg-surface`}>
          <p role="alert" className="text-[12px] text-theme-danger">{error}</p>
          <button type="button" onClick={onRetry} className="rounded-[8px] bg-brand px-4 py-2 text-[12px] font-bold text-white">다시 시도</button>
        </div>
      );
    }
    return (
      <div role="alert" className={`${frameClassName} flex flex-col items-center justify-center gap-3 border border-danger-border bg-surface text-[12px] text-theme-danger`}>
        <p>{error}</p>
        <button type="button" onClick={onRetry} className="rounded-[8px] border border-theme-danger px-4 py-2 font-bold">다시 시도</button>
      </div>
    );
  }

  if (isLoading) {
    return <div className={`${frameClassName} flex items-center justify-center border border-theme bg-surface text-[12px] text-theme-secondary`}>{loadingText}</div>;
  }

  if (isEmpty) {
    return <div className={`${frameClassName} flex items-center justify-center border border-theme bg-surface text-[12px] text-theme-muted`}>{emptyText}</div>;
  }

  return <>{children}</>;
}
