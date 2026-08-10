//프로젝트 등록 여러 단계에서 입력한 값을 페이지가 바뀌어도 유지하도록 Context에 공통 저장
"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import type { ProjectRegisterForm } from "@/features/client/projects/types/project";
import type { ProjectResponse } from "@/features/client/projects/services/projectRegistration";

const PROJECT_REGISTER_STORAGE_KEY = "pairing:project-register-form";

const readStoredForm = (): ProjectRegisterForm => {
  try {
    const stored = sessionStorage.getItem(PROJECT_REGISTER_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as ProjectRegisterForm) : {};
  } catch {
    sessionStorage.removeItem(PROJECT_REGISTER_STORAGE_KEY);
    return {};
  }
};

const storeForm = (form: ProjectRegisterForm) => {
  sessionStorage.setItem(PROJECT_REGISTER_STORAGE_KEY, JSON.stringify(form));
};

interface ProjectRegisterContextValue {
  form: ProjectRegisterForm;
  patch: (partial: Partial<ProjectRegisterForm>) => void;
  registeredProject: ProjectResponse | null;
  setRegisteredProject: (project: ProjectResponse) => void;
  clearDraft: () => void;
  reset: () => void;
}

const ProjectRegisterContext =
  createContext<ProjectRegisterContextValue | null>(null);

export function ProjectRegisterProvider({ children }: { children: ReactNode }) {
  const [form, setForm] = useState<ProjectRegisterForm>({});
  const [isHydrated, setIsHydrated] = useState(false);
  const [registeredProject, setRegisteredProjectState] =
    useState<ProjectResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    const storedForm = readStoredForm();

    Promise.resolve().then(() => {
      if (cancelled) return;
      setForm(storedForm);
      setIsHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const patch = useCallback((partial: Partial<ProjectRegisterForm>) => {
    setForm((prev) => {
      const next = { ...prev, ...partial };
      storeForm(next);
      return next;
    });
  }, []);

  const setRegisteredProject = useCallback((project: ProjectResponse) => {
    setRegisteredProjectState(project);
  }, []);

  const clearDraft = useCallback(() => {
    setForm({});
    sessionStorage.removeItem(PROJECT_REGISTER_STORAGE_KEY);
  }, []);

  const reset = useCallback(() => {
    setForm({});
    setRegisteredProjectState(null);
    sessionStorage.removeItem(PROJECT_REGISTER_STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      form,
      patch,
      registeredProject,
      setRegisteredProject,
      clearDraft,
      reset,
    }),
    [form, patch, registeredProject, setRegisteredProject, clearDraft, reset],
  );

  if (!isHydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-[#667085]">
        작성 중인 프로젝트 정보를 불러오고 있습니다.
      </div>
    );
  }

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
