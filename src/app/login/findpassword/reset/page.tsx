// 새 비밀번호 등록 화면

"use client";

import { useState } from "react";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { NewPasswordForm } from "@/features/auth/components/NewPasswordForm";
import { NewPasswordDone } from "@/features/auth/components/NewPasswordDone";
import { changePassword } from "@/features/auth/services/changePassword";
import { ApiException } from "@/lib/api";

type ResetPasswordStep = "form" | "done";

export default function ResetPasswordPage() {
  const [step, setStep] = useState<ResetPasswordStep>("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (newPassword: string) => {
    setIsSubmitting(true);
    setFormError("");

    try {
      // 폼에서 이미 두 입력값 일치를 확인했으므로 같은 값을 그대로 confirm에 사용
      await changePassword({
        newPassword,
        newPasswordConfirm: newPassword,
      });
      // 성공하면 서버가 세션을 끊으므로 완료 화면에서 재로그인으로 안내
      setStep("done");
    } catch (error) {
      setFormError(
        error instanceof ApiException
          ? error.message
          : "등록 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <AuthHeader />

      <main className="flex min-h-[calc(100vh-60px)] items-center justify-center px-5 py-16">
        <section className="w-full max-w-[440px] rounded-lg border border-theme bg-surface px-8 py-9 shadow-sm">
          {step === "form" ? (
            <NewPasswordForm
              isSubmitting={isSubmitting}
              error={formError}
              onSubmit={handleSubmit}
            />
          ) : (
            <NewPasswordDone />
          )}
        </section>
      </main>
    </div>
  );
}
