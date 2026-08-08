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
import {
  SignupPasswordFields,
  isSignupPasswordValid,
} from "@/features/auth/components/SignupPasswordFields";
import { SignupWizardLayout } from "@/features/auth/components/SignupWizardLayout";
import {
  TermsChecklist,
  areRequiredTermsAgreed,
} from "@/features/auth/components/TermsChecklist";
import { CLIENT_SIGNUP_STEPS } from "@/features/auth/constants/signupSteps";
import { SIGNUP_TERMS_ITEMS } from "@/features/auth/constants/signupTerms";
import type { ClientSignupForm } from "@/features/auth/types";

const STEP_LABELS = CLIENT_SIGNUP_STEPS.map((step) => step.label);

export function ClientSignupWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [form, setForm] = useState<ClientSignupForm>({});

  const patch = (partial: Partial<ClientSignupForm>) => {
    setForm((current) => ({ ...current, ...partial }));
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
        <TermsStep
          form={form}
          patch={patch}
          onPrevious={() => setStep(4)}
          onComplete={() => setCompleted(true)}
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
    !!form.employeeCount;

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

function TermsStep({
  form,
  patch,
  onPrevious,
  onComplete,
}: Omit<ClientStepProps, "onNext"> & { onComplete: () => void }) {
  const agreedTerms = form.agreedTerms ?? {};
  const isValid = areRequiredTermsAgreed(SIGNUP_TERMS_ITEMS, agreedTerms);

  return (
    <>
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
        onPrevious={onPrevious}
        onNext={onComplete}
        nextDisabled={!isValid}
        nextLabel="회원가입 완료"
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
