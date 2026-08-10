"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  BusinessFieldSelect,
  BusinessRegistrationNumberField,
  EmployeeCountSelect,
} from "@/features/auth/components/BusinessInfoFields";
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
import { CLIENT_SIGNUP_STEPS } from "@/features/auth/constants/signupSteps";
import { useSignupSubmit } from "@/features/auth/hooks/useSignupSubmit";
import { signupClient } from "@/features/auth/services/signup";
import type { ClientSignupForm } from "@/features/auth/types";
import type { SignupTermsItem } from "@/features/auth/types/signupApiTypes";
import { buildClientSignupRequest } from "@/features/auth/utils/buildSignupRequest";

const STEP_LABELS = CLIENT_SIGNUP_STEPS.map((step) => step.label);

export function ClientSignupWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [form, setForm] = useState<ClientSignupForm>({});
  const { submit, isSubmitting, submitError } =
    useSignupSubmit(signupClient);

  const patch = (partial: Partial<ClientSignupForm>) => {
    setForm((current) => ({ ...current, ...partial }));
  };

  const handleSignup = async (terms: SignupTermsItem[]) => {
    const succeeded = await submit(buildClientSignupRequest(form, terms));
    if (succeeded) setCompleted(true);
  };

  if (completed) {
    return (
      <SignupCompleteScreen
        title="클라이언트 회원가입이 완료되었습니다."
        description="이제 프로젝트를 등록하고 적합한 개발자를 찾아보세요."
        primaryLabel="로그인으로 이동"
      />
    );
  }

  return (
    <SignupWizardLayout
      title="클라이언트 회원가입"
      currentStep={step}
      labels={STEP_LABELS}
    >
      {step === 1 ? (
        <CompanyStep
          form={form}
          patch={patch}
          onPrevious={() => router.push("/signup")}
          onNext={() => setStep(2)}
        />
      ) : null}
      {step === 2 ? (
        <ManagerStep
          form={form}
          patch={patch}
          onPrevious={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      ) : null}
      {step === 3 ? (
        <EmailStep
          form={form}
          patch={patch}
          onPrevious={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      ) : null}
      {step === 4 ? (
        <PaymentStep
          form={form}
          patch={patch}
          onPrevious={() => setStep(3)}
          onNext={() => setStep(5)}
        />
      ) : null}
      {step === 5 ? (
        <SignupTermsStep
          role="CLIENT"
          agreed={form.agreedTerms ?? {}}
          onChange={(agreed) => patch({ agreedTerms: agreed })}
          onPrevious={() => setStep(4)}
          onComplete={handleSignup}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />
      ) : null}
    </SignupWizardLayout>
  );
}

interface ClientStepProps {
  form: ClientSignupForm;
  patch: (partial: Partial<ClientSignupForm>) => void;
  onPrevious: () => void;
  onNext: () => void;
}

function CompanyStep({ form, patch, onPrevious, onNext }: ClientStepProps) {
  const isValid =
    (form.companyName ?? "").trim().length > 0 &&
    !!form.businessRegistrationChecked &&
    !!form.businessField &&
    !!form.employeeCount &&
    (form.address ?? "").trim().length > 0;

  return (
    <>
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
            onChange={(event) => patch({ companyName: event.target.value })}
            placeholder="기업명을 입력해 주세요."
            className="h-11 w-full rounded-md border border-gray-200 px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#142B4A]"
          />
        </div>
        <BusinessRegistrationNumberField
          value={form.businessRegistrationNumber ?? ""}
          checked={form.businessRegistrationChecked ?? false}
          onChange={(value) => patch({ businessRegistrationNumber: value })}
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
        <div>
          <label
            htmlFor="company-address"
            className="mb-2 block text-sm font-semibold text-[#374151]"
          >
            기업 주소 <span className="text-[#356DF3]">*</span>
          </label>
          <input
            id="company-address"
            type="text"
            value={form.address ?? ""}
            onChange={(event) => patch({ address: event.target.value })}
            maxLength={255}
            placeholder="기업 주소를 입력해 주세요."
            className="h-11 w-full rounded-md border border-gray-200 px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#142B4A]"
          />
        </div>
      </div>
      <SignupStepNavigation
        onPrevious={onPrevious}
        onNext={onNext}
        nextDisabled={!isValid}
      />
    </>
  );
}

function ManagerStep({ form, patch, onPrevious, onNext }: ClientStepProps) {
  const phone = form.phone ?? "";
  const isValid =
    (form.representativeName ?? "").trim().length > 0 &&
    isPhoneNumberValid(phone) &&
    !!form.phoneChecked &&
    isSignupPasswordValid(form.password ?? "", form.confirmPassword ?? "");

  return (
    <>
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#374151]">
            이름(대표자명) <span className="text-[#356DF3]">*</span>
          </label>
          <input
            type="text"
            value={form.representativeName ?? ""}
            onChange={(event) =>
              patch({ representativeName: event.target.value })
            }
            placeholder="이름을 입력해 주세요."
            className="h-11 w-full rounded-md border border-gray-200 px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#142B4A]"
          />
        </div>
        <PhoneNumberField
          label="휴대폰번호(법인폰)"
          value={phone}
          onChange={(value) => patch({ phone: value })}
          checked={form.phoneChecked ?? false}
          onCheckedChange={(checked) => patch({ phoneChecked: checked })}
          role="CLIENT"
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

function EmailStep({ form, patch, onPrevious, onNext }: ClientStepProps) {
  return (
    <>
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
        onPrevious={onPrevious}
        onNext={onNext}
        nextDisabled={!form.otpVerified}
      />
    </>
  );
}

function PaymentStep({ form, patch, onPrevious, onNext }: ClientStepProps) {
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

function toCardAccountValues(form: ClientSignupForm): CardAccountValues {
  return {
    cardNumber: form.cardNumber ?? "",
    cardBrand: form.cardBrand ?? "",
    bankCode: form.bankCode ?? "",
    accountNumber: form.accountNumber ?? "",
    accountHolder: form.accountHolder ?? "",
  };
}
