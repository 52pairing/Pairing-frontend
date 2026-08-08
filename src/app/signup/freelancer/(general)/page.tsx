// 프리랜서 일반 회원가입 Step1 · 기본 정보
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  BirthDateSelect,
  isBirthDateValid,
} from "@/features/auth/components/BirthDateSelect";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { PhoneNumberField, isPhoneNumberValid } from "@/features/auth/components/PhoneNumberField";
import { SignupStepper } from "@/features/auth/components/SignupStepper";
import { SignupStepNavigation } from "@/features/auth/components/SignupStepNavigation";
import { FREELANCER_SIGNUP_STEPS } from "@/features/auth/constants/signupSteps";
import { useFreelancerSignup } from "@/features/auth/context/FreelancerSignupContext";

const STEP = 1;
const STEP_LABELS = FREELANCER_SIGNUP_STEPS.map((s) => s.label);

export default function FreelancerSignupBasicPage() {
  const router = useRouter();
  const { form, patch } = useFreelancerSignup();
  const [today] = useState(() => new Date());

  const phone = form.phone ?? "";
  const isPhoneValid = isPhoneNumberValid(phone);
  const isValid =
    (form.name ?? "").trim().length > 0 &&
    isBirthDateValid(
      form.birthYear ?? "",
      form.birthMonth ?? "",
      form.birthDay ?? "",
      today,
    ) &&
    isPhoneValid;

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
          <p className="mb-6 rounded-md bg-[#EEF3F8] px-4 py-3 text-xs text-[#374151]">
            프리랜서 회원은 만 18세 이상만 가입할 수 있습니다.
          </p>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#374151]">
                이름 <span className="text-[#356DF3]">*</span>
              </label>
              <input
                type="text"
                value={form.name ?? ""}
                onChange={(e) => patch({ name: e.target.value })}
                placeholder="이름을 입력해 주세요."
                className="h-11 w-full rounded-md border border-gray-200 px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#142B4A]"
              />
            </div>

            <BirthDateSelect
              year={form.birthYear ?? ""}
              month={form.birthMonth ?? ""}
              day={form.birthDay ?? ""}
              onYearChange={(value) => patch({ birthYear: value })}
              onMonthChange={(value) => patch({ birthMonth: value })}
              onDayChange={(value) => patch({ birthDay: value })}
              today={today}
            />

            <PhoneNumberField
              label="휴대폰번호"
              value={phone}
              onChange={(value) => patch({ phone: value })}
              role="FREELANCER"
            />
          </div>

          <SignupStepNavigation
            onPrevious={() => router.push("/signup")}
            onNext={() => router.push("/signup/freelancer/email")}
            nextDisabled={!isValid}
          />
        </section>
      </main>
    </div>
  );
}
