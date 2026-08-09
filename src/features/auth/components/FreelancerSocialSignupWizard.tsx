"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import {
  BirthDateSelect,
  isBirthDateValid,
} from "@/features/auth/components/BirthDateSelect";
import {
  CardAccountFields,
  isCardAccountValid,
  type CardAccountValues,
} from "@/features/auth/components/CardAccountFields";
import { SignupCompleteScreen } from "@/features/auth/components/SignupCompleteScreen";
import {
  PhoneNumberField,
  isPhoneNumberValid,
} from "@/features/auth/components/PhoneNumberField";
import { SignupStepNavigation } from "@/features/auth/components/SignupStepNavigation";
import { SignupTermsStep } from "@/features/auth/components/SignupTermsStep";
import { SignupWizardLayout } from "@/features/auth/components/SignupWizardLayout";
import { FREELANCER_SOCIAL_SIGNUP_STEPS } from "@/features/auth/constants/signupSteps";
import type {
  FreelancerSocialSignupForm,
  SocialProvider,
} from "@/features/auth/types";

const STEP_LABELS = FREELANCER_SOCIAL_SIGNUP_STEPS.map((step) => step.label);
const MOCK_EMAIL: Record<SocialProvider, string> = {
  kakao: "user@kakao.com",
  google: "user@gmail.com",
};

export function FreelancerSocialSignupWizard() {
  return (
    <Suspense fallback={null}>
      <FreelancerSocialSignupContent />
    </Suspense>
  );
}

function FreelancerSocialSignupContent() {
  const searchParams = useSearchParams();
  const provider: SocialProvider =
    searchParams.get("provider") === "kakao" ? "kakao" : "google";
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [today] = useState(() => new Date());
  const [form, setForm] = useState<FreelancerSocialSignupForm>(() => ({
    provider,
    email: MOCK_EMAIL[provider],
  }));

  const patch = (partial: Partial<FreelancerSocialSignupForm>) => {
    setForm((current) => ({ ...current, ...partial }));
  };

  if (completed) {
    return (
      <SignupCompleteScreen
        title="프리랜서 회원가입이 완료되었습니다."
        description="프로필을 등록하면 적합한 프로젝트를 추천받을 수 있습니다."
        primaryLabel="로그인하러 가기"
      />
    );
  }

  return (
    <SignupWizardLayout
      title="프리랜서 회원가입"
      currentStep={step}
      labels={STEP_LABELS}
    >
      {step === 1 ? (
        <SocialInfoStep
          form={form}
          patch={patch}
          provider={provider}
          today={today}
          onNext={() => setStep(2)}
        />
      ) : null}
      {step === 2 ? (
        <PaymentStep
          form={form}
          patch={patch}
          onPrevious={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      ) : null}
      {step === 3 ? (
        <SignupTermsStep
          role="FREELANCER"
          agreed={form.agreedTerms ?? {}}
          onChange={(agreed) => patch({ agreedTerms: agreed })}
          onPrevious={() => setStep(2)}
          onComplete={() => setCompleted(true)}
        />
      ) : null}
    </SignupWizardLayout>
  );
}

interface SocialStepProps {
  form: FreelancerSocialSignupForm;
  patch: (partial: Partial<FreelancerSocialSignupForm>) => void;
}

function SocialInfoStep({
  form,
  patch,
  provider,
  today,
  onNext,
}: SocialStepProps & {
  provider: SocialProvider;
  today: Date;
  onNext: () => void;
}) {
  const phone = form.phone ?? "";
  const isValid =
    (form.name ?? "").trim().length > 0 &&
    isBirthDateValid(
      form.birthYear ?? "",
      form.birthMonth ?? "",
      form.birthDay ?? "",
      today,
    ) &&
    isPhoneNumberValid(phone) &&
    !!form.phoneChecked;

  return (
    <>
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
            onChange={(event) => patch({ name: event.target.value })}
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
            {form.email}
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
        <PhoneNumberField
          label="휴대폰번호"
          value={phone}
          onChange={(value) => patch({ phone: value })}
          checked={form.phoneChecked ?? false}
          onCheckedChange={(checked) => patch({ phoneChecked: checked })}
          role="FREELANCER"
        />
      </div>
      <SignupStepNavigation
        onPrevious={() => window.history.back()}
        onNext={onNext}
        nextDisabled={!isValid}
      />
    </>
  );
}

function PaymentStep({
  form,
  patch,
  onPrevious,
  onNext,
}: SocialStepProps & { onPrevious: () => void; onNext: () => void }) {
  const values = toCardAccountValues(form);

  return (
    <>
      <CardAccountFields values={values} onChange={patch} />
      <SignupStepNavigation
        onPrevious={onPrevious}
        onNext={onNext}
        nextDisabled={!isCardAccountValid(values)}
      />
    </>
  );
}

function toCardAccountValues(
  form: FreelancerSocialSignupForm,
): CardAccountValues {
  return {
    cardNumber: form.cardNumber ?? "",
    cardBrand: form.cardBrand ?? "",
    bankCode: form.bankCode ?? "",
    accountNumber: form.accountNumber ?? "",
    accountHolder: form.accountHolder ?? "",
  };
}
