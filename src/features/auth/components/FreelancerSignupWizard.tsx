"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  BirthDateSelect,
  isBirthDateValid,
} from "@/features/auth/components/BirthDateSelect";
import {
  CardAccountFields,
  isCardAccountValid,
  type CardAccountValues,
} from "@/features/auth/components/CardAccountFields";
import { EmailOtpField } from "@/features/auth/components/EmailOtpField";
import {
  PhoneNumberField,
  isPhoneNumberValid,
} from "@/features/auth/components/PhoneNumberField";
import { SignupCompleteScreen } from "@/features/auth/components/SignupCompleteScreen";
import { SignupStepNavigation } from "@/features/auth/components/SignupStepNavigation";
import { SignupTermsStep } from "@/features/auth/components/SignupTermsStep";
import {
  SignupPasswordFields,
  isSignupPasswordValid,
} from "@/features/auth/components/SignupPasswordFields";
import { SignupWizardLayout } from "@/features/auth/components/SignupWizardLayout";
import { FREELANCER_SIGNUP_STEPS } from "@/features/auth/constants/signupSteps";
import { signupFreelancer } from "@/features/auth/services/signup";
import type { FreelancerSignupForm } from "@/features/auth/types";
import type { SignupTermsItem } from "@/features/auth/types/signupApiTypes";
import { buildFreelancerSignupRequest } from "@/features/auth/utils/buildSignupRequest";
import { ApiException } from "@/lib/api";

const STEP_LABELS = FREELANCER_SIGNUP_STEPS.map((step) => step.label);

export function FreelancerSignupWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState<FreelancerSignupForm>({});
  const [today] = useState(() => new Date());

  const patch = (partial: Partial<FreelancerSignupForm>) => {
    setForm((current) => ({ ...current, ...partial }));
  };

  const handleSignup = async (terms: SignupTermsItem[]) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError("");

    try {
      await signupFreelancer(buildFreelancerSignupRequest(form, terms));
      setCompleted(true);
    } catch (error) {
      setSubmitError(
        error instanceof ApiException
          ? error.message
          : "회원가입 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setIsSubmitting(false);
    }
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
        <BasicStep
          form={form}
          patch={patch}
          today={today}
          onPrevious={() => router.push("/signup")}
          onNext={() => setStep(2)}
        />
      ) : null}
      {step === 2 ? (
        <EmailStep
          form={form}
          patch={patch}
          onPrevious={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      ) : null}
      {step === 3 ? (
        <PaymentStep
          form={form}
          patch={patch}
          onPrevious={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      ) : null}
      {step === 4 ? (
        <SignupTermsStep
          role="FREELANCER"
          agreed={form.agreedTerms ?? {}}
          onChange={(agreed) => patch({ agreedTerms: agreed })}
          onPrevious={() => setStep(3)}
          onComplete={handleSignup}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />
      ) : null}
    </SignupWizardLayout>
  );
}

interface FreelancerStepProps {
  form: FreelancerSignupForm;
  patch: (partial: Partial<FreelancerSignupForm>) => void;
  onPrevious: () => void;
  onNext: () => void;
}

function BasicStep({
  form,
  patch,
  today,
  onPrevious,
  onNext,
}: FreelancerStepProps & { today: Date }) {
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
            onChange={(event) => patch({ name: event.target.value })}
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

function EmailStep({ form, patch, onPrevious, onNext }: FreelancerStepProps) {
  const isValid =
    !!form.otpVerified &&
    isSignupPasswordValid(form.password ?? "", form.confirmPassword ?? "");

  return (
    <>
      <div className="space-y-5">
        <EmailOtpField
          emailLocalPart={form.emailLocalPart ?? ""}
          emailDomain={form.emailDomain ?? ""}
          onLocalPartChange={(value) => patch({ emailLocalPart: value })}
          onDomainChange={(value) => patch({ emailDomain: value })}
          verified={form.otpVerified ?? false}
          onVerifiedChange={(verified) => patch({ otpVerified: verified })}
          role="FREELANCER"
        />
        <SignupPasswordFields
          password={form.password ?? ""}
          confirmPassword={form.confirmPassword ?? ""}
          onPasswordChange={(value) => patch({ password: value })}
          onConfirmPasswordChange={(value) => patch({ confirmPassword: value })}
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

function PaymentStep({ form, patch, onPrevious, onNext }: FreelancerStepProps) {
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

function toCardAccountValues(form: FreelancerSignupForm): CardAccountValues {
  return {
    cardNumber: form.cardNumber ?? "",
    cardBrand: form.cardBrand ?? "",
    bankCode: form.bankCode ?? "",
    accountNumber: form.accountNumber ?? "",
    accountHolder: form.accountHolder ?? "",
  };
}
