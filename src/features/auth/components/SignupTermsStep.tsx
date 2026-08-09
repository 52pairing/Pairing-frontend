"use client";

import { SignupStepNavigation } from "@/features/auth/components/SignupStepNavigation";
import {
  TermsChecklist,
  areRequiredTermsAgreed,
} from "@/features/auth/components/TermsChecklist";
import { useSignupTerms } from "@/features/auth/hooks/useSignupTerms";
import type { LoginRole } from "@/features/auth/types";
import type { SignupTermsItem } from "@/features/auth/types/signupApiTypes";

interface SignupTermsStepProps {
  role: LoginRole;
  agreed: Record<number, boolean>;
  onChange: (agreed: Record<number, boolean>) => void;
  onPrevious: () => void;
  onComplete: (terms: SignupTermsItem[]) => void;
  isSubmitting?: boolean;
  submitError?: string;
}

// 역할별 약관을 불러오고 동의 상태를 관리하는 공통 단계입니다.
export function SignupTermsStep({
  role,
  agreed,
  onChange,
  onPrevious,
  onComplete,
  isSubmitting = false,
  submitError = "",
}: SignupTermsStepProps) {
  const { terms, isLoading, isError, retry } = useSignupTerms(role);
  const isValid =
    terms.length > 0 && areRequiredTermsAgreed(terms, agreed);

  return (
    <>
      <p className="mb-6 text-sm font-semibold text-[#111827]">
        서비스 이용을 위한 약관에 동의해 주세요.
      </p>

      {isLoading ? (
        <p className="text-sm text-gray-400">약관을 불러오는 중...</p>
      ) : null}

      {isError ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
          <p>약관을 불러오지 못했습니다.</p>
          <button
            type="button"
            onClick={retry}
            className="mt-2 font-semibold underline"
          >
            다시 시도
          </button>
        </div>
      ) : null}

      {!isLoading && !isError ? (
        <TermsChecklist
          items={terms}
          agreed={agreed}
          onChange={onChange}
          emphasizeAll
        />
      ) : null}

      {submitError ? (
        <p className="mt-4 text-sm text-red-500">{submitError}</p>
      ) : null}

      <SignupStepNavigation
        onPrevious={onPrevious}
        onNext={() => onComplete(terms)}
        nextDisabled={!isValid || isLoading || isError || isSubmitting}
        nextLabel={isSubmitting ? "가입 중..." : "회원가입 완료"}
      />
    </>
  );
}
