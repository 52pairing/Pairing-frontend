/**
 * 회원가입 위저드 스텝 정의 (역할별). client/projects의 steps.ts 패턴과 동일한 구조.
 */

export interface SignupStep {
  step: number;
  label: string;
  path: string;
}

const CLIENT_SIGNUP_BASE = "/signup/client";

export const CLIENT_SIGNUP_STEPS: SignupStep[] = [
  { step: 1, label: "기업 정보", path: CLIENT_SIGNUP_BASE },
  { step: 2, label: "담당자 정보", path: `${CLIENT_SIGNUP_BASE}/manager` },
  { step: 3, label: "이메일 인증", path: `${CLIENT_SIGNUP_BASE}/email` },
  { step: 4, label: "카드/계좌 등록", path: `${CLIENT_SIGNUP_BASE}/payment` },
  { step: 5, label: "약관 동의", path: `${CLIENT_SIGNUP_BASE}/terms` },
];

const FREELANCER_SIGNUP_BASE = "/signup/freelancer";

export const FREELANCER_SIGNUP_STEPS: SignupStep[] = [
  { step: 1, label: "기본 정보", path: FREELANCER_SIGNUP_BASE },
  { step: 2, label: "이메일 인증", path: `${FREELANCER_SIGNUP_BASE}/email` },
  { step: 3, label: "카드/계좌 등록", path: `${FREELANCER_SIGNUP_BASE}/payment` },
  { step: 4, label: "약관 동의", path: `${FREELANCER_SIGNUP_BASE}/terms` },
];

const FREELANCER_SOCIAL_SIGNUP_BASE = "/signup/freelancer/social";

export const FREELANCER_SOCIAL_SIGNUP_STEPS: SignupStep[] = [
  { step: 1, label: "추가 정보 입력", path: FREELANCER_SOCIAL_SIGNUP_BASE },
  {
    step: 2,
    label: "카드/계좌 등록",
    path: `${FREELANCER_SOCIAL_SIGNUP_BASE}/payment`,
  },
  { step: 3, label: "약관 동의", path: `${FREELANCER_SOCIAL_SIGNUP_BASE}/terms` },
];

/** 지정한 단계의 이전 스텝 (없으면 undefined) */
export function prevSignupStep(
  steps: SignupStep[],
  step: number,
): SignupStep | undefined {
  return steps.find((s) => s.step === step - 1);
}

/** 지정한 단계의 다음 스텝 (없으면 undefined) */
export function nextSignupStep(
  steps: SignupStep[],
  step: number,
): SignupStep | undefined {
  return steps.find((s) => s.step === step + 1);
}
