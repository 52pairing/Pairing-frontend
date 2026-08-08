// 회원가입 검증 정책 모음 (비밀번호 규칙 / 이메일 인증번호 정책)

/** 회원가입 최소 연령(만 나이). 생년월일 select 연도 상한 계산에도 재사용 */
export const MIN_SIGNUP_AGE = 18;

export interface PasswordRule {
  key: string;
  label: string;
  test: (value: string) => boolean;
}

// 회원가입 비밀번호 규칙 (Figma 목업 기준 5개 개별 항목).
// 비밀번호 찾기 화면의 NewPasswordForm.PASSWORD_RULES(4항목·상한 없음)와는
// 화면 스펙이 달라 별도 배열로 관리합니다.
export const SIGNUP_PASSWORD_RULES: PasswordRule[] = [
  {
    key: "length",
    label: "8자 이상 20자 이하",
    test: (v) => v.length >= 8 && v.length <= 20,
  },
  {
    key: "uppercase",
    label: "영문 대문자 포함",
    test: (v) => /[A-Z]/.test(v),
  },
  {
    key: "lowercase",
    label: "영문 소문자 포함",
    test: (v) => /[a-z]/.test(v),
  },
  { key: "number", label: "숫자 포함", test: (v) => /[0-9]/.test(v) },
  {
    key: "special",
    label: "특수문자 포함",
    test: (v) => /[^A-Za-z0-9]/.test(v),
  },
];

// 이메일 인증 유효시간과 발송 제한은 실제 API 연동 작업에서 적용한다.
// 클라이언트에는 별도 정책 상수를 두지 않는다.
