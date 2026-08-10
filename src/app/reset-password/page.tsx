"use client";

import { Suspense, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { ResetPasswordConfirm } from "@/features/auth/components/ResetPasswordConfirm";
import { ResetPasswordDone } from "@/features/auth/components/ResetPasswordDone";
import { ResetPasswordInvalid } from "@/features/auth/components/ResetPasswordInvalid";
import { confirmPasswordReset } from "@/features/auth/services/resetPassword";
import { ApiException } from "@/lib/api";

type ResetPasswordStep = "idle" | "loading" | "done" | "invalid";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}

function ResetPasswordPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [step, setStep] = useState<ResetPasswordStep>("idle");
  const [message, setMessage] = useState("");
  // 토큰은 1회용이라 더블클릭으로 두 번 호출되면 두 번째 요청이 실패함 - 재시도 가능한 에러만 잠금 해제
  const submitted = useRef(false);

  const handleConfirm = async () => {
    if (submitted.current || !token) return;
    submitted.current = true;
    setStep("loading");

    try {
      await confirmPasswordReset(token);
      setStep("done");
    } catch (error) {
      if (error instanceof ApiException && error.errorCode === "AU_027") {
        // 만료·이미 사용된 링크는 재시도해도 소용없어서 잠금 유지
        setMessage(error.message);
        setStep("invalid");
        return;
      }

      // 그 외(네트워크 오류 등)는 재시도 가능하도록 잠금 해제
      submitted.current = false;
      setStep("idle");
      setMessage(
        error instanceof ApiException
          ? error.message
          : "요청 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      );
    }
  };

  return (
    <div className="min-h-screen">
      <AuthHeader />

      <main className="flex min-h-[calc(100vh-60px)] items-center justify-center px-5 py-16">
        <section className="w-full max-w-[440px] rounded-lg border border-gray-200 bg-white px-8 py-9 shadow-sm">
          {!token ? (
            <ResetPasswordInvalid message="잘못된 접근입니다. 비밀번호 찾기를 다시 진행해 주세요." />
          ) : step === "done" ? (
            <ResetPasswordDone />
          ) : step === "invalid" ? (
            <ResetPasswordInvalid message={message} />
          ) : (
            <ResetPasswordConfirm
              isLoading={step === "loading"}
              error={message}
              onConfirm={handleConfirm}
            />
          )}
        </section>
      </main>
    </div>
  );
}
