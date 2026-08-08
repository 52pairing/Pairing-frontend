// 프리랜서 일반 회원가입 위저드 여러 단계에서 입력한 값을 페이지가 바뀌어도
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

import type { FreelancerSignupForm } from "@/features/auth/types";

interface FreelancerSignupContextValue {
  form: FreelancerSignupForm;
  patch: (partial: Partial<FreelancerSignupForm>) => void;
  reset: () => void;
}

const FreelancerSignupContext =
  createContext<FreelancerSignupContextValue | null>(null);

export function FreelancerSignupProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [form, setForm] = useState<FreelancerSignupForm>({});

  const patch = useCallback((partial: Partial<FreelancerSignupForm>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  }, []);

  const reset = useCallback(() => setForm({}), []);

  const value = useMemo(() => ({ form, patch, reset }), [form, patch, reset]);

  return (
    <FreelancerSignupContext.Provider value={value}>
      {children}
    </FreelancerSignupContext.Provider>
  );
}

export function useFreelancerSignup() {
  const ctx = useContext(FreelancerSignupContext);

  if (!ctx) {
    throw new Error(
      "useFreelancerSignup은 FreelancerSignupProvider 안에서만 사용할 수 있습니다.",
    );
  }

  return ctx;
}
