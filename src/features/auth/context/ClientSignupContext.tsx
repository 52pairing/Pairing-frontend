// 클라이언트 회원가입 위저드 여러 단계에서 입력한 값을 페이지가 바뀌어도
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

import type { ClientSignupForm } from "@/features/auth/types";

interface ClientSignupContextValue {
  form: ClientSignupForm;
  patch: (partial: Partial<ClientSignupForm>) => void;
  reset: () => void;
}

const ClientSignupContext = createContext<ClientSignupContextValue | null>(
  null,
);

export function ClientSignupProvider({ children }: { children: ReactNode }) {
  const [form, setForm] = useState<ClientSignupForm>({});

  const patch = useCallback((partial: Partial<ClientSignupForm>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  }, []);

  const reset = useCallback(() => setForm({}), []);

  const value = useMemo(() => ({ form, patch, reset }), [form, patch, reset]);

  return (
    <ClientSignupContext.Provider value={value}>
      {children}
    </ClientSignupContext.Provider>
  );
}

export function useClientSignup() {
  const ctx = useContext(ClientSignupContext);

  if (!ctx) {
    throw new Error(
      "useClientSignup은 ClientSignupProvider 안에서만 사용할 수 있습니다.",
    );
  }

  return ctx;
}
