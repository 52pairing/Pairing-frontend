"use client";

import { useState } from "react";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { FindPasswordForm } from "@/features/auth/components/FindPasswordForm";
import { FindPasswordSent } from "@/features/auth/components/FindPasswordSent";
import { formatPhoneNumber } from "@/features/auth/utils/formatPhoneNumber";

type FindPasswordStep = "form" | "sent";

export default function FindPasswordPage() {
  const [step, setStep] = useState<FindPasswordStep>("form");
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");

  const isFormValid =
    userId.trim() !== "" && name.trim() !== "" && phone.length === 13;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isFormValid) return;

    // TODO: 비밀번호 찾기(인증 링크 발송) API 연동 (확인 필요: 요청/응답 필드)
    // 백엔드가 마스킹해서 내려준 이메일을 그대로 저장합니다. 지금은 화면 확인용 임시값입니다.
    setMaskedEmail("te***@test.com");
    setStep("sent");
  };

  const handleResend = () => {
    // TODO: 인증 링크 재발송 API 연동
  };

  return (
    <div className="min-h-screen">
      <AuthHeader />

      <main className="flex min-h-[calc(100vh-60px)] items-center justify-center px-5 py-16">
        <section className="w-full max-w-[440px] rounded-lg border border-gray-200 bg-white px-8 py-9 shadow-sm">
          {step === "form" ? (
            <FindPasswordForm
              userId={userId}
              name={name}
              phone={phone}
              isFormValid={isFormValid}
              onUserIdChange={setUserId}
              onNameChange={setName}
              onPhoneChange={(value) => setPhone(formatPhoneNumber(value))}
              onSubmit={handleSubmit}
            />
          ) : (
            <FindPasswordSent
              maskedEmail={maskedEmail}
              onResend={handleResend}
            />
          )}
        </section>
      </main>
    </div>
  );
}
