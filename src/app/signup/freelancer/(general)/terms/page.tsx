// 프리랜서 일반 회원가입 Step4 · 약관 동의 (+ 최종 제출)
"use client";

import { useRouter } from "next/navigation";

import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { SignupStepNavigation } from "@/features/auth/components/SignupStepNavigation";
import { SignupStepper } from "@/features/auth/components/SignupStepper";
import {
  TermsChecklist,
  areRequiredTermsAgreed,
} from "@/features/auth/components/TermsChecklist";
import { FREELANCER_SIGNUP_STEPS } from "@/features/auth/constants/signupSteps";
import { SIGNUP_TERMS_ITEMS } from "@/features/auth/constants/signupTerms";
import { useFreelancerSignup } from "@/features/auth/context/FreelancerSignupContext";

const STEP = 4;
const STEP_LABELS = FREELANCER_SIGNUP_STEPS.map((s) => s.label);

export default function FreelancerSignupTermsPage() {
  const router = useRouter();
  const { form, patch, reset } = useFreelancerSignup();
  const agreedTerms = form.agreedTerms ?? {};
  const isValid = areRequiredTermsAgreed(SIGNUP_TERMS_ITEMS, agreedTerms);

  const handleSubmit = () => {
    if (!isValid) return;
    reset();
    router.push("/signup/freelancer/complete");
  };

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
          <p className="mb-6 text-sm font-semibold text-[#111827]">
            서비스 이용을 위한 약관에 동의해 주세요.
          </p>

          <TermsChecklist
            items={SIGNUP_TERMS_ITEMS}
            agreed={agreedTerms}
            onChange={(agreed) => patch({ agreedTerms: agreed })}
            emphasizeAll
          />

          <SignupStepNavigation
            onPrevious={() => router.push("/signup/freelancer/payment")}
            onNext={handleSubmit}
            nextDisabled={!isValid}
            nextLabel="회원가입 완료"
          />
        </section>
      </main>
    </div>
  );
}
