"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { completeSocialLogin } from "@/features/auth/services/socialAuth";
import { reactivateStomp } from "@/features/negotiation/stomp/client";
import {
  clearSocialLoginAttempt,
  getSocialLoginAttempt,
  savePendingSocialSignup,
} from "@/features/auth/utils/socialAuthFlow";
import { ApiException } from "@/lib/api";

const DEFAULT_RETURN_URL = "/freelancer";

export function SocialCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startedRef = useRef(false);
  const [attempt] = useState(() => getSocialLoginAttempt());
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const missingCallbackMessage =
    !code || !state || !attempt
      ? "소셜 로그인 정보가 없거나 만료되었습니다. 다시 시도해 주세요."
      : "";
  const [error, setError] = useState(missingCallbackMessage);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (!code || !state || !attempt) {
      clearSocialLoginAttempt();
      return;
    }

    completeSocialLogin(attempt.provider, { code, state })
      .then(async (result) => {
        clearSocialLoginAttempt();

        if (result.status === "LOGIN") {
          // 로그인 전(쿠키 없음) 죽은 STOMP 소켓을 새 쿠키로 되살린다.
          await reactivateStomp();
          router.replace(attempt.returnUrl || DEFAULT_RETURN_URL);
          return;
        }

        savePendingSocialSignup({
          provider: attempt.provider,
          signUpTicket: result.signUpTicket,
          email: result.email,
          name: result.name,
        });
        router.replace("/signup/freelancer/social");
      })
      .catch((callbackError: unknown) => {
        clearSocialLoginAttempt();
        setError(
          callbackError instanceof ApiException
            ? callbackError.message
            : "소셜 로그인 처리 중 문제가 발생했습니다.",
        );
      });
  }, [attempt, code, router, state]);

  if (error) {
    return <SocialCallbackStatus error={error} />;
  }

  return <SocialCallbackStatus />;
}

export function SocialCallbackStatus({ error = "" }: { error?: string }) {
  return (
    <div className="min-h-screen bg-surface">
      <AuthHeader />
      <main className="flex min-h-[calc(100vh-60px)] items-center justify-center px-5">
        <section className="w-full max-w-[440px] rounded-lg border border-theme bg-surface px-8 py-9 text-center shadow-sm">
          <h1 className="text-lg font-bold text-theme-primary">
            {error ? "소셜 로그인을 완료하지 못했습니다." : "로그인 처리 중"}
          </h1>
          <p
            className={`mt-3 text-sm ${error ? "text-red-500" : "text-theme-secondary"}`}
          >
            {error || "인증 정보를 확인하고 있습니다. 잠시만 기다려 주세요."}
          </p>
          {error ? (
            <a
              href="/login"
              className="mt-6 inline-flex h-11 items-center rounded-md bg-brand px-5 text-sm font-bold text-white"
            >
              로그인으로 돌아가기
            </a>
          ) : null}
        </section>
      </main>
    </div>
  );
}
