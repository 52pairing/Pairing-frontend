// 클라이언트 회원가입 Step1 · 기업 정보
"use client";

import { useRouter } from "next/navigation";

import { AuthHeader } from "@/features/auth/components/AuthHeader";
import {
  BusinessFieldSelect,
  BusinessRegistrationNumberField,
  EmployeeCountSelect,
} from "@/features/auth/components/BusinessInfoFields";
import { SignupStepNavigation } from "@/features/auth/components/SignupStepNavigation";
import { SignupStepper } from "@/features/auth/components/SignupStepper";
import { CLIENT_SIGNUP_STEPS } from "@/features/auth/constants/signupSteps";
import { useClientSignup } from "@/features/auth/context/ClientSignupContext";

const STEP = 1;
const STEP_LABELS = CLIENT_SIGNUP_STEPS.map((s) => s.label);

export default function ClientSignupCompanyPage() {
  const router = useRouter();
  const { form, patch } = useClientSignup();

  const isValid =
    (form.companyName ?? "").trim().length > 0 &&
    !!form.businessRegistrationChecked &&
    !!form.businessField &&
    !!form.employeeCount;

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
          <p className="mb-6 rounded-md bg-[#EEF3F8] px-4 py-3 text-xs text-[#374151]">
            클라이언트 회원가입은 국내 사업자등록번호를 보유한 기업만 가능합니다.
          </p>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#374151]">
                기업명 <span className="text-[#356DF3]">*</span>
              </label>
              <input
                type="text"
                value={form.companyName ?? ""}
                onChange={(e) => patch({ companyName: e.target.value })}
                placeholder="기업명을 입력해 주세요."
                className="h-11 w-full rounded-md border border-gray-200 px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#142B4A]"
              />
            </div>

            <BusinessRegistrationNumberField
              value={form.businessRegistrationNumber ?? ""}
              checked={form.businessRegistrationChecked ?? false}
              onChange={(value) =>
                patch({ businessRegistrationNumber: value })
              }
              onCheckedChange={(checked) =>
                patch({ businessRegistrationChecked: checked })
              }
            />

            <BusinessFieldSelect
              value={form.businessField ?? ""}
              onChange={(value) => patch({ businessField: value })}
            />

            <EmployeeCountSelect
              value={form.employeeCount}
              onChange={(value) => patch({ employeeCount: value })}
            />
          </div>

          <SignupStepNavigation
            onPrevious={() => router.push("/signup")}
            onNext={() => router.push("/signup/client/manager")}
            nextDisabled={!isValid}
          />
        </section>
      </main>
    </div>
  );
}
