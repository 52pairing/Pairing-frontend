"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * 클라이언트 하이드레이션 완료 여부를 반환합니다.
 * SSR과 하이드레이션 첫 렌더에서는 false를 반환하므로,
 * Portal처럼 서버에서 렌더링하면 안 되는 요소를 안전하게 감쌀 수 있습니다.
 * (typeof document 체크와 달리 hydration mismatch를 일으키지 않음)
 */
export const useHydrated = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
