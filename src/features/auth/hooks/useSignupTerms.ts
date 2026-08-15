"use client";

import { useEffect, useState } from "react";

import { getSignupTerms } from "@/features/auth/services/signupTerms";
import type { LoginRole } from "@/features/auth/types";
import type { SignupTermsItem } from "@/features/auth/types/signupApiTypes";

// 역할별 약관 API의 로딩, 실패, 재시도를 관리합니다.
export const useSignupTerms = (role: LoginRole) => {
  const [terms, setTerms] = useState<SignupTermsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getSignupTerms(role)
      .then((result) => {
        if (!cancelled) {
          // 개인정보 처리방침(POLICY)은 동의 체크박스에서 제외합니다.
          setTerms(result.filter((item) => item.type === "AGREEMENT"));
        }
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
  }, [role]);

  const retry = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const result = await getSignupTerms(role);

      // 개인정보 처리방침(POLICY)은 동의 체크박스에서 제외합니다.
      setTerms(result.filter((item) => item.type === "AGREEMENT"));
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return { terms, isLoading, isError, retry };
};
