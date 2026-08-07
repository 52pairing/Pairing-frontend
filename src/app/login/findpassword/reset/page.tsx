// 새 비밀번호 등록 화면

"use client";

import { useState } from "react";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { NewPasswordForm } from "@/features/auth/components/NewPasswordForm";
import { NewPasswordDone } from "@/features/auth/components/NewPasswordDone";

type ResetPasswordStep = "form" | "done";

export default function ResetPasswordPage() {
  const [step, setStep] = useState<ResetPasswordStep>("form");

  return (
    <div className="min-h-screen">
      <AuthHeader />

      <main className="flex min-h-[calc(100vh-60px)] items-center justify-center px-5 py-16">
        <section className="w-full max-w-[440px] rounded-lg border border-gray-200 bg-white px-8 py-9 shadow-sm">
          {step === "form" ? (
            // TODO: 새 비밀번호 등록 API 연동
            <NewPasswordForm onSubmit={() => setStep("done")} />
          ) : (
            <NewPasswordDone />
          )}
        </section>
      </main>
    </div>
  );
}
