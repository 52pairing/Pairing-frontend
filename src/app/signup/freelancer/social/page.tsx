// 프리랜서 소셜 회원가입 Step1 · 추가 정보 입력
// 실제 OAuth SDK 연동 전이라 ?provider 쿼리로만 화면을 분기하고, 이메일은 mock 값을 사용합니다.
"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { AuthHeader } from "@/features/auth/components/AuthHeader";
import {
  BirthDateSelect,
  isBirthDateValid,
} from "@/features/auth/components/BirthDateSelect";
import { SignupStepNavigation } from "@/features/auth/components/SignupStepNavigation";
import { SignupStepper } from "@/features/auth/components/SignupStepper";
import { FREELANCER_SOCIAL_SIGNUP_STEPS } from "@/features/auth/constants/signupSteps";
import { useFreelancerSocialSignup } from "@/features/auth/context/FreelancerSocialSignupContext";
import type { SocialProvider } from "@/features/auth/types";
import { formatPhoneNumber } from "@/features/auth/utils/formatPhoneNumber";

const STEP = 1;
const STEP_LABELS = FREELANCER_SOCIAL_SIGNUP_STEPS.map((s) => s.label);
const PHONE_LENGTH = 13; // "010-0000-0000"

// TODO: 실제 OAuth 연동 전까지 사용하는 mock 이메일
const MOCK_EMAIL: Record<SocialProvider, string> = {
  kakao: "user@kakao.com",
  google: "user@gmail.com",
};

function FreelancerSocialSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { form, patch } = useFreelancerSocialSignup();
  const [today] = useState(() => new Date());

  const provider: SocialProvider =
    searchParams.get("provider") === "kakao" ? "kakao" : "google";

  useEffect(() => {
    if (form.provider) return; // 이미 초기화된 경우 덮어쓰지 않음

    patch({ provider, email: MOCK_EMAIL[provider] });
    // 최초 진입 시 1회만 초기화하면 됨
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const phone = form.phone ?? "";
  const isPhoneValid = phone.length === PHONE_LENGTH;
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
            {provider === "kakao" ? "카카오" : "구글"} 계정 연결 완료. 추가
            정보를 입력해 주세요.
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

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#374151]">
                이메일
              </label>
              <div className="flex h-11 items-center gap-2 rounded-md border border-gray-200 bg-[#F9FAFB] px-4 text-sm text-gray-500">
                <Image
                  src={
                    provider === "kakao"
                      ? "/icons/KakaoIcon.svg"
                      : "/icons/GoogleIcon.svg"
                  }
                  alt=""
                  width={16}
                  height={16}
                  aria-hidden="true"
                />
                {form.email ?? MOCK_EMAIL[provider]}
              </div>
              <p className="mt-2 text-xs text-gray-400">
                소셜 계정에서 제공된 이메일은 변경할 수 없습니다.
              </p>
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

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#374151]">
                휴대폰번호 <span className="text-[#356DF3]">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={phone}
                onChange={(e) =>
                  patch({ phone: formatPhoneNumber(e.target.value) })
                }
                placeholder="010-0000-0000"
                className={`h-11 w-full rounded-md border px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#142B4A] ${
                  phone && !isPhoneValid ? "border-red-400" : "border-gray-200"
                }`}
              />
              {phone && !isPhoneValid ? (
                <p className="mt-2 text-xs text-red-500">
                  올바른 휴대폰 번호를 입력해 주세요.
                </p>
              ) : null}
            </div>
          </div>

          <SignupStepNavigation
            onPrevious={() => router.push("/signup/freelancer")}
            onNext={() => router.push("/signup/freelancer/social/payment")}
            nextDisabled={!isValid}
          />
        </section>
      </main>
    </div>
  );
}

export default function FreelancerSocialSignupPage() {
  return (
    <Suspense fallback={null}>
      <FreelancerSocialSignupContent />
    </Suspense>
  );
}
