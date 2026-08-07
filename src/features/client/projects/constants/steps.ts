/**
 * 클라이언트 단계
 */

export const PROJECT_REGISTER_BASE = "/client/projects/new";

export interface ProjectRegisterStep {
  step: number;
  label: string;
  path: string;
}

export const PROJECT_REGISTER_STEPS: ProjectRegisterStep[] = [
  { step: 1, label: "등록 안내", path: PROJECT_REGISTER_BASE },
  { step: 2, label: "기본 정보", path: `${PROJECT_REGISTER_BASE}/basic` },
  { step: 3, label: "직군 모집", path: `${PROJECT_REGISTER_BASE}/roles` },
  { step: 4, label: "상세정보", path: `${PROJECT_REGISTER_BASE}/details` },
  { step: 5, label: "검수", path: `${PROJECT_REGISTER_BASE}/review` },
  { step: 6, label: "최종 확인", path: `${PROJECT_REGISTER_BASE}/confirm` },
];

/** Stepper 기본 라벨 목록 */
export const PROJECT_REGISTER_STEP_LABELS = PROJECT_REGISTER_STEPS.map(
  (s) => s.label,
);

/** 지정한 단계의 이전 스텝 (없으면 undefined) */
export function prevStep(step: number): ProjectRegisterStep | undefined {
  return PROJECT_REGISTER_STEPS.find((s) => s.step === step - 1);
}

/** 지정한 단계의 다음 스텝 (없으면 undefined) */
export function nextStep(step: number): ProjectRegisterStep | undefined {
  return PROJECT_REGISTER_STEPS.find((s) => s.step === step + 1);
}
