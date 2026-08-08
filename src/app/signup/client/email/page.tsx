// 클라이언트 회원가입 Step3 · 이메일 인증
"use client";

import { useRouter } from "next/navigation";

import { EmailOtpField } from "@/features/auth/components/EmailOtpField";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { SignupStepper } from "@/features/auth/components/SignupStepper";
import { SignupStepNavigation } from "@/features/auth/components/SignupStepNavigation";
import { CLIENT_SIGNUP_STEPS } from "@/features/auth/constants/signupSteps";
import { useClientSignup } from "@/features/auth/context/ClientSignupContext";

const STEP = 3;
const STEP_LABELS = CLIENT_SIGNUP_STEPS.map((s) => s.label);

export default function ClientSignupEmailPage() {
  const router = useRouter();
  const { form, patch } = useClientSignup();

  const isValid = !!form.otpVerified;

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
          <EmailOtpField
            emailLocalPart={form.emailLocalPart ?? ""}
            emailDomain={form.emailDomain ?? ""}
            onLocalPartChange={(value) => patch({ emailLocalPart: value })}
            onDomainChange={(value) => patch({ emailDomain: value })}
            verified={form.otpVerified ?? false}
            onVerifiedChange={(verified) => patch({ otpVerified: verified })}
            role="CLIENT"
          />

          <SignupStepNavigation
            onPrevious={() => router.push("/signup/client/manager")}
            onNext={() => router.push("/signup/client/payment")}
            nextDisabled={!isValid}
          />
        </section>
      </main>
    </div>
  );
}
