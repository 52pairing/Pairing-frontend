/**
 * 클라이언트 프로젝트 등록 위저드의 단계 정의 (단일 소스).
 * 상단 Stepper 표시와 스텝 라우팅이 이 상수를 함께 사용합니다.
 */

export const PROJECT_REGISTER_BASE = "/client/projects/new";

export interface ProjectRegisterStep {
  /** 1부터 시작하는 단계 번호 */
  step: number;
  /** Stepper에 표시되는 라벨 */
  label: string;
  /** 해당 스텝의 라우트 경로 */
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
