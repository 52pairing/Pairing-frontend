"use client";

import { useState } from "react";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { FindEmailForm } from "@/features/auth/components/FindEmailForm";
import { FindEmailResult } from "@/features/auth/components/FindEmailResult";
import { findEmail } from "@/features/auth/services/findEmail";
import { ApiException } from "@/lib/api";
import { FindEmailAccount } from "@/features/auth/types";

type FindEmailStep = "form" | "result";

export default function FindEmailPage() {
  const [step, setStep] = useState<FindEmailStep>("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [accounts, setAccounts] = useState<FindEmailAccount[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setFormError("");

    try {
      const result = await findEmail({ name, phone });
      setAccounts(result.accounts);
      setStep("result");
    } catch (error) {
      if (error instanceof ApiException) {
        setFormError(error.message);
      } else {
        setFormError(
          "아이디 찾기 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
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
              isSubmitting={isSubmitting}
              error={formError}
              onNameChange={setName}
              onPhoneChange={handlePhoneChange}
              onSubmit={handleSubmit}
            />
          ) : (
            <FindEmailResult accounts={accounts} />
          )}
        </section>
      </main>
    </div>
  );
}
