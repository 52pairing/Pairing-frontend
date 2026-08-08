// 클라이언트 회원가입 Step2 · 담당자 정보
"use client";

import { useRouter } from "next/navigation";

import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { PhoneNumberField, isPhoneNumberValid } from "@/features/auth/components/PhoneNumberField";
import { SignupStepper } from "@/features/auth/components/SignupStepper";
import {
  SignupPasswordFields,
  isSignupPasswordValid,
} from "@/features/auth/components/SignupPasswordFields";
import { SignupStepNavigation } from "@/features/auth/components/SignupStepNavigation";
import { CLIENT_SIGNUP_STEPS } from "@/features/auth/constants/signupSteps";
import { useClientSignup } from "@/features/auth/context/ClientSignupContext";

const STEP = 2;
const STEP_LABELS = CLIENT_SIGNUP_STEPS.map((s) => s.label);

export default function ClientSignupManagerPage() {
  const router = useRouter();
  const { form, patch } = useClientSignup();

  const phone = form.phone ?? "";
  const isPhoneValid = isPhoneNumberValid(phone);
  const isValid =
    (form.representativeName ?? "").trim().length > 0 &&
    isPhoneValid &&
    isSignupPasswordValid(form.password ?? "", form.confirmPassword ?? "");

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
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#374151]">
                이름(대표자명) <span className="text-[#356DF3]">*</span>
              </label>
              <input
                type="text"
                value={form.representativeName ?? ""}
                onChange={(e) =>
                  patch({ representativeName: e.target.value })
                }
                placeholder="이름을 입력해 주세요."
                className="h-11 w-full rounded-md border border-gray-200 px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#142B4A]"
              />
            </div>

            <PhoneNumberField
              label="휴대폰번호(법인폰)"
              value={phone}
              onChange={(value) => patch({ phone: value })}
              role="CLIENT"
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
            onPrevious={() => router.push("/signup/client")}
            onNext={() => router.push("/signup/client/email")}
            nextDisabled={!isValid}
          />
        </section>
      </main>
    </div>
  );
}
