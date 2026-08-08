// 프리랜서 일반 회원가입 Step2 · 이메일 인증 + 비밀번호
"use client";

import { useRouter } from "next/navigation";

import { EmailOtpField } from "@/features/auth/components/EmailOtpField";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { SignupStepper } from "@/features/auth/components/SignupStepper";
import {
  SignupPasswordFields,
  isSignupPasswordValid,
} from "@/features/auth/components/SignupPasswordFields";
import { SignupStepNavigation } from "@/features/auth/components/SignupStepNavigation";
import { FREELANCER_SIGNUP_STEPS } from "@/features/auth/constants/signupSteps";
import { useFreelancerSignup } from "@/features/auth/context/FreelancerSignupContext";

const STEP = 2;
const STEP_LABELS = FREELANCER_SIGNUP_STEPS.map((s) => s.label);

export default function FreelancerSignupEmailPage() {
  const router = useRouter();
  const { form, patch } = useFreelancerSignup();

  const isValid =
    !!form.otpVerified &&
    isSignupPasswordValid(form.password ?? "", form.confirmPassword ?? "");

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <AuthHeader />

      <main className="mx-auto max-w-[560px] px-5 py-12">
        <SignupStepper
          title="프리랜서 회원가입"
          currentStep={STEP}
          labels={STEP_LABELS}
        />

        <section className="mt-8 rounded-lg border border-gray-200 bg-white px-8 py-9 shadow-sm">
          <div className="space-y-5">
            <EmailOtpField
              emailLocalPart={form.emailLocalPart ?? ""}
              emailDomain={form.emailDomain ?? ""}
              onLocalPartChange={(value) => patch({ emailLocalPart: value })}
              onDomainChange={(value) => patch({ emailDomain: value })}
              verified={form.otpVerified ?? false}
              onVerifiedChange={(verified) =>
                patch({ otpVerified: verified })
              }
              role="FREELANCER"
            />

            <SignupPasswordFields
              password={form.password ?? ""}
              confirmPassword={form.confirmPassword ?? ""}
              onPasswordChange={(value) => patch({ password: value })}
              onConfirmPasswordChange={(value) =>
                patch({ confirmPassword: value })
              }
            />
          </div>

          <SignupStepNavigation
            onPrevious={() => router.push("/signup/freelancer")}
            onNext={() => router.push("/signup/freelancer/payment")}
            nextDisabled={!isValid}
          />
        </section>
      </main>
    </div>
  );
}
