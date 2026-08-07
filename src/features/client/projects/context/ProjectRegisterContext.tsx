//프로젝트 등록 여러 단계에서 입력한 값을 페이지가 바뀌어도 유지하도록 Context에 공통 저장
"use client";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import type { ProjectRegisterForm } from "@/features/client/projects/types/project";

interface ProjectRegisterContextValue {
  form: ProjectRegisterForm;
  patch: (partial: Partial<ProjectRegisterForm>) => void;
  reset: () => void;
}

const ProjectRegisterContext =
  createContext<ProjectRegisterContextValue | null>(null);

export function ProjectRegisterProvider({ children }: { children: ReactNode }) {
  const [form, setForm] = useState<ProjectRegisterForm>({});

  const patch = useCallback((partial: Partial<ProjectRegisterForm>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  }, []);

  const reset = useCallback(() => setForm({}), []);

  const value = useMemo(
    () => ({ form, patch, reset }),
    [form, patch, reset],
  );

  return (
    <ProjectRegisterContext.Provider value={value}>
      {children}
    </ProjectRegisterContext.Provider>
  );
}


export function useProjectRegister() {
  const ctx = useContext(ProjectRegisterContext);

  if (!ctx) {
    throw new Error(
      "useProjectRegister는 ProjectRegisterProvider 안에서만 사용할 수 있습니다.",
    );
  }

  return ctx;
}
