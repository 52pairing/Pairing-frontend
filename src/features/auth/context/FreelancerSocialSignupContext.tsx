// 프리랜서 소셜 회원가입 위저드 여러 단계에서 입력한 값을 페이지가 바뀌어도
// 유지하도록 Context에 공통 저장 (client/projects의 ProjectRegisterContext와 동일 패턴)
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import type { FreelancerSocialSignupForm } from "@/features/auth/types";

interface FreelancerSocialSignupContextValue {
  form: FreelancerSocialSignupForm;
  patch: (partial: Partial<FreelancerSocialSignupForm>) => void;
  reset: () => void;
}

const FreelancerSocialSignupContext =
  createContext<FreelancerSocialSignupContextValue | null>(null);

export function FreelancerSocialSignupProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [form, setForm] = useState<FreelancerSocialSignupForm>({});

  const patch = useCallback(
    (partial: Partial<FreelancerSocialSignupForm>) => {
      setForm((prev) => ({ ...prev, ...partial }));
    },
    [],
  );

  const reset = useCallback(() => setForm({}), []);

  const value = useMemo(() => ({ form, patch, reset }), [form, patch, reset]);

  return (
    <FreelancerSocialSignupContext.Provider value={value}>
      {children}
    </FreelancerSocialSignupContext.Provider>
  );
}

export function useFreelancerSocialSignup() {
  const ctx = useContext(FreelancerSocialSignupContext);

  if (!ctx) {
    throw new Error(
      "useFreelancerSocialSignup은 FreelancerSocialSignupProvider 안에서만 사용할 수 있습니다.",
    );
  }

  return ctx;
}
