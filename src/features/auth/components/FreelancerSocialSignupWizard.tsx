"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthHeader } from "@/features/auth/components/AuthHeader";
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
import { useSignupSubmit } from "@/features/auth/hooks/useSignupSubmit";
import { signupFreelancerSocial } from "@/features/auth/services/signup";
import type {
  FreelancerSocialSignupForm,
  SocialProvider,
} from "@/features/auth/types";
import type { SignupTermsItem } from "@/features/auth/types/signupApiTypes";
import { buildFreelancerSocialSignupRequest } from "@/features/auth/utils/buildSignupRequest";
import {
  clearPendingSocialSignup,
  getPendingSocialSignup,
} from "@/features/auth/utils/socialAuthFlow";

const STEP_LABELS = FREELANCER_SOCIAL_SIGNUP_STEPS.map((step) => step.label);
export function FreelancerSocialSignupWizard() {
  const router = useRouter();
  const [signup] = useState(() => getPendingSocialSignup());
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [today] = useState(() => new Date());
  const [form, setForm] = useState<FreelancerSocialSignupForm>(() => ({
    provider: signup?.provider,
    signUpTicket: signup?.signUpTicket,
    email: signup?.email,
    name: signup?.name,
  }));
  const { submit, isSubmitting, submitError } = useSignupSubmit(
    signupFreelancerSocial,
  );

  const patch = (partial: Partial<FreelancerSocialSignupForm>) => {
    setForm((current) => ({ ...current, ...partial }));
  };

  const handleSignup = async (terms: SignupTermsItem[]) => {
    const succeeded = await submit(
      buildFreelancerSocialSignupRequest(form, terms),
    );

    if (succeeded) {
      clearPendingSocialSignup();
      setCompleted(true);
    }
  };

  if (!signup) {
    return <MissingSocialSignup />;
  }

  if (completed) {
    return (
      <SignupCompleteScreen
        title="프리랜서 회원가입이 완료되었습니다."
        description="프로필을 등록하면 적합한 프로젝트를 추천받을 수 있습니다."
        primaryLabel="프리랜서 홈으로 이동"
        primaryHref="/freelancer"
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
          provider={signup.provider}
          today={today}
          onPrevious={() => router.push("/login")}
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
          onComplete={handleSignup}
          isSubmitting={isSubmitting}
          submitError={submitError}
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
  onPrevious,
}: SocialStepProps & {
  provider: SocialProvider;
  today: Date;
  onNext: () => void;
  onPrevious: () => void;
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
      <p className="mb-6 rounded-md bg-surface-muted px-4 py-3 text-xs text-theme-secondary">
        {provider === "kakao" ? "카카오" : "구글"} 계정 연결 완료. 추가
        정보를 입력해 주세요.
      </p>
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-theme-secondary">
            이름 <span className="text-[#356DF3]">*</span>
          </label>
          <input
            type="text"
            value={form.name ?? ""}
            onChange={(event) => patch({ name: event.target.value })}
            placeholder="이름을 입력해 주세요."
            className="h-11 w-full rounded-md border border-theme px-4 text-sm text-theme-primary outline-none placeholder:text-theme-muted focus:border-brand"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-theme-secondary">
            이메일
          </label>
          <div className="flex h-11 items-center gap-2 rounded-md border border-theme bg-[#F9FAFB] px-4 text-sm text-theme-secondary">
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
          <p className="mt-2 text-xs text-theme-muted">
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
        onPrevious={onPrevious}
        onNext={onNext}
        nextDisabled={!isValid}
      />
    </>
  );
}

function MissingSocialSignup() {
  return (
    <div className="min-h-screen bg-surface">
      <AuthHeader />
      <main className="flex min-h-[calc(100vh-60px)] items-center justify-center px-5">
        <section className="w-full max-w-[440px] rounded-lg border border-theme bg-surface px-8 py-9 text-center shadow-sm">
          <h1 className="text-lg font-bold text-theme-primary">
            소셜 회원가입 정보가 없습니다.
          </h1>
          <p className="mt-3 text-sm text-theme-secondary">
            가입 시간이 만료됐거나 페이지가 새로고침되었습니다. 소셜 로그인을
            다시 시작해 주세요.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex h-11 items-center rounded-md bg-brand px-5 text-sm font-bold text-white"
          >
            로그인으로 돌아가기
          </Link>
        </section>
      </main>
    </div>
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
