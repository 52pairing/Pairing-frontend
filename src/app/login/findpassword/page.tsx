"use client";

import { useState } from "react";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { FindPasswordForm } from "@/features/auth/components/FindPasswordForm";
import { FindPasswordSent } from "@/features/auth/components/FindPasswordSent";
import { formatPhoneNumber } from "@/features/auth/utils/formatPhoneNumber";
import { requestPasswordReset } from "@/features/auth/services/findPassword";
import type { LoginRole } from "@/features/auth/types";
import { ApiException } from "@/lib/api";

type FindPasswordStep = "form" | "sent";

export default function FindPasswordPage() {
  const [step, setStep] = useState<FindPasswordStep>("form");
  const [role, setRole] = useState<LoginRole>("CLIENT");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const isFormValid =
    email.trim() !== "" && name.trim() !== "" && phone.length === 13;

  // 인증 링크 발송 요청 (최초 제출과 재발송이 같은 요청을 공유)
  const submitRequest = async () => {
    setIsSubmitting(true);
    setFormError("");

    try {
      await requestPasswordReset({ email, role, name, phone });
      // 정보 일치 여부와 무관하게 항상 200이 와서, 성공 시 그대로 발송완료 화면으로 이동
      setStep("sent");
    } catch (error) {
      if (error instanceof ApiException) {
        setFormError(error.message);
      } else {
        setFormError(
          "요청 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isFormValid || isSubmitting) return;
    submitRequest();
  };

  const handleResend = () => {
    if (isSubmitting) return;
    submitRequest();
  };

  return (
    <div className="min-h-screen">
      <AuthHeader />

      <main className="flex min-h-[calc(100vh-60px)] items-center justify-center px-5 py-16">
        <section className="w-full max-w-[440px] rounded-lg border border-gray-200 bg-white px-8 py-9 shadow-sm">
          {step === "form" ? (
            <FindPasswordForm
              role={role}
              email={email}
              name={name}
              phone={phone}
              isFormValid={isFormValid}
              isSubmitting={isSubmitting}
              error={formError}
              onRoleChange={setRole}
              onEmailChange={setEmail}
              onNameChange={setName}
              onPhoneChange={(value) => setPhone(formatPhoneNumber(value))}
              onSubmit={handleSubmit}
            />
          ) : (
            <FindPasswordSent email={email} onResend={handleResend} />
          )}
        </section>
      </main>
    </div>
  );
}
