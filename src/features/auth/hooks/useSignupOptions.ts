"use client";

import { useEffect, useState } from "react";

import type { SignupOption } from "@/features/auth/types/signupApiTypes";

// 선택 목록 API의 로딩, 실패, 재시도를 공통으로 관리합니다.
export const useSignupOptions = (loader: () => Promise<SignupOption[]>) => {
  const [options, setOptions] = useState<SignupOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loader()
      .then((result) => {
        if (!cancelled) setOptions(result);
      })
      .catch(() => {
        if (!cancelled) setIsError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loader]);

  const retry = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      setOptions(await loader());
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return { options, isLoading, isError, retry };
};
