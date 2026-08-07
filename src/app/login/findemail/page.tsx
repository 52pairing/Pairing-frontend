"use client";

import { useState } from "react";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { FindEmailForm } from "@/features/auth/components/FindEmailForm";
import { FindEmailResult } from "@/features/auth/components/FindEmailResult";

type FindEmailStep = "form" | "result";

export default function FindEmailPage() {
  const [step, setStep] = useState<FindEmailStep>("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");

  const isFormValid = name.trim() !== "" && phone.length === 13;

  // 전화번호 자동 하이픈
  const handlePhoneChange = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);

    let formattedPhone = numbers;
    if (numbers.length > 7) {
      formattedPhone = `${numbers.slice(0, 3)}-${numbers.slice(
        3,
        7,
      )}-${numbers.slice(7)}`;
    } else if (numbers.length > 3) {
      formattedPhone = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    }

    setPhone(formattedPhone);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isFormValid) return;

    // TODO: 아이디 찾기 API 연동 (확인 필요: 요청/응답 필드)
    // mock데이터
    setMaskedEmail("ju****@gmail.com");
    setStep("result");
  };

  return (
    <div className="min-h-screen">
      <AuthHeader />

      <main className="flex min-h-[calc(100vh-60px)] items-center justify-center px-5 py-16">
        <section className="w-full max-w-[440px] rounded-lg border border-gray-200 bg-white px-8 py-9 shadow-sm">
          {step === "form" ? (
            <FindEmailForm
              name={name}
              phone={phone}
              isFormValid={isFormValid}
              onNameChange={setName}
              onPhoneChange={handlePhoneChange}
              onSubmit={handleSubmit}
            />
          ) : (
            <FindEmailResult
              maskedEmail={maskedEmail}
              onBack={() => setStep("form")}
            />
          )}
        </section>
      </main>
    </div>
  );
}
