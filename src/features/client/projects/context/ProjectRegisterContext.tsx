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

/**
 * 프로젝트 등록 위저드의 스텝 간 공유 상태.
 * `/client/projects/new` 세그먼트의 layout.tsx에서 Provider로 감싸면,
 * 스텝 라우트를 오가도 (layout은 리마운트되지 않으므로) 값이 유지됩니다.
 *
 * 나중에 백엔드 연동 시:
 * - 값 저장/제출 로직만 services 계층 호출로 바꾸면 됩니다(컴포넌트 구조 유지).
 * - 예: patch()는 그대로 두고, 스텝 이동 시 saveDraft() 호출 / confirm에서 createProject() 호출.
 */
interface ProjectRegisterContextValue {
  form: ProjectRegisterForm;
  /** 현재 스텝에서 입력한 값 일부를 병합 */
  patch: (partial: Partial<ProjectRegisterForm>) => void;
  /** 전체 초기화 */
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

/** 위저드 스텝 컴포넌트에서 공유 폼 상태에 접근 */
export function useProjectRegister() {
  const ctx = useContext(ProjectRegisterContext);

  if (!ctx) {
    throw new Error(
      "useProjectRegister는 ProjectRegisterProvider 안에서만 사용할 수 있습니다.",
    );
  }

  return ctx;
}
