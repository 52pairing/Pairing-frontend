import { HeaderShell } from "./HeaderShell";

// 사용자 조회가 끝나기 전(정적 페이지 하드 진입 등) 잠깐 보여주는 헤더.
// 게스트/로그인 어느 쪽도 단정하지 않고 우측 액션 영역만 중립 placeholder로 둬,
// "게스트 헤더가 떴다가 로그인 헤더로 교체되는" 깜빡임을 없앤다.
export function HeaderSkeleton() {
  return (
    <HeaderShell
      homeHref="/"
      nav={null}
      actions={
        <span
          className="h-9 w-[120px] animate-pulse rounded-md bg-surface-muted"
          aria-hidden="true"
        />
      }
    />
  );
}
