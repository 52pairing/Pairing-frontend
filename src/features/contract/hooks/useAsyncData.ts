import { useCallback, useEffect, useRef, useState } from "react";

interface AsyncData<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * 계약 목록류 화면의 공통 비동기 로드 패턴.
 * - `loader` 참조가 바뀌면(=호출부 useCallback deps 변경) 자동 재요청
 * - `requestId`로 늦게 도착한 이전 응답을 폐기(경쟁 방지)
 * - 마운트 해제/의존성 변경 시 이전 요청 결과 반영 차단
 * - `reload`는 재시도 버튼용
 *
 * 호출부는 `loader`를 반드시 useCallback으로 감싸 deps를 관리한다.
 */
export function useAsyncData<T>(
  loader: () => Promise<T>,
  fallbackMessage = "불러오지 못했습니다.",
): AsyncData<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const run = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const result = await loader();
      if (requestId === requestIdRef.current) setData(result);
    } catch (cause) {
      if (requestId === requestIdRef.current) {
        setError(cause instanceof Error ? cause.message : fallbackMessage);
      }
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [loader, fallbackMessage]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) void run();
    });
    return () => {
      cancelled = true;
      requestIdRef.current += 1;
    };
  }, [run]);

  return { data, isLoading, error, reload: run };
}
