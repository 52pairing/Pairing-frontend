"use client";

import { useRef, useState } from "react";

import { getSocialAuthorizeUrl } from "@/features/auth/services/socialAuth";
import type { SocialProvider } from "@/features/auth/types";
import {
  clearPendingSocialSignup,
  saveSocialLoginAttempt,
} from "@/features/auth/utils/socialAuthFlow";
import { resolveSafeReturnUrl } from "@/features/auth/utils/safeReturnUrl";
import { ApiException } from "@/lib/api";

const DEFAULT_RETURN_URL = "/freelancer";

// 로그인·회원가입 화면에서 같은 소셜 인증 시작 흐름을 사용합니다.
export const useSocialLoginStart = (returnUrl?: string | null) => {
  const [loadingProvider, setLoadingProvider] =
    useState<SocialProvider | null>(null);
  const [error, setError] = useState("");
  const startingRef = useRef(false);

  const start = async (provider: SocialProvider) => {
    if (startingRef.current) return;
    startingRef.current = true;
    setLoadingProvider(provider);
    setError("");

    // 외부 주소나 보안 민감 경로가 returnUrl로 전달되지 않도록 걸러냅니다.
    const safeReturnUrl = resolveSafeReturnUrl(returnUrl, DEFAULT_RETURN_URL);

    try {
      const result = await getSocialAuthorizeUrl(provider, safeReturnUrl);
      clearPendingSocialSignup();
      saveSocialLoginAttempt(provider, safeReturnUrl);
      window.location.assign(result.authorizeUrl);
    } catch (startError) {
      setError(
        startError instanceof ApiException
          ? startError.message
          : "소셜 로그인을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
      startingRef.current = false;
      setLoadingProvider(null);
    }
  };

  return { start, loadingProvider, error };
};
