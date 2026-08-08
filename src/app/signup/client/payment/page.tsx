// 클라이언트 회원가입 Step4 · 카드/계좌 등록
"use client";

import { useRouter } from "next/navigation";

import {
  CardAccountFields,
  isCardAccountValid,
  type CardAccountValues,
} from "@/features/auth/components/CardAccountFields";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { SignupStepper } from "@/features/auth/components/SignupStepper";
import { SignupStepNavigation } from "@/features/auth/components/SignupStepNavigation";
import { CLIENT_SIGNUP_STEPS } from "@/features/auth/constants/signupSteps";
import { useClientSignup } from "@/features/auth/context/ClientSignupContext";

const STEP = 4;
const STEP_LABELS = CLIENT_SIGNUP_STEPS.map((s) => s.label);

export default function ClientSignupPaymentPage() {
  const router = useRouter();
  const { form, patch } = useClientSignup();

  const values: CardAccountValues = {
    cardNumber: form.cardNumber ?? "",
    cardBrand: form.cardBrand ?? "",
    bankCode: form.bankCode ?? "",
    accountNumber: form.accountNumber ?? "",
    accountHolder: form.accountHolder ?? "",
  };

  const isValid = isCardAccountValid(values);

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <AuthHeader />

      <main className="mx-auto max-w-[560px] px-5 py-12">
        <SignupStepper
          title="클라이언트 회원가입"
          currentStep={STEP}
          labels={STEP_LABELS}
        />

        <section className="mt-8 rounded-lg border border-gray-200 bg-white px-8 py-9 shadow-sm">
          <CardAccountFields values={values} onChange={(partial) => patch(partial)} />

          <SignupStepNavigation
            onPrevious={() => router.push("/signup/client/email")}
            onNext={() => router.push("/signup/client/terms")}
            nextDisabled={!isValid}
          />
        </section>
      </main>
    </div>
  );
}
