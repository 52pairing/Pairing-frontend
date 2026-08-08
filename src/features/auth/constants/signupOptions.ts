// 회원가입 UI 확인을 위한 임시 선택지입니다.
// 실제 API 연동 시 서버 응답으로 교체합니다.

export interface SignupOption {
  code: string;
  label: string;
}

export const BUSINESS_FIELD_OPTIONS: SignupOption[] = [
  { code: "IT", label: "IT·소프트웨어" },
  { code: "FINANCE", label: "금융·보험" },
  { code: "COMMERCE", label: "유통·커머스" },
  { code: "CONTENT", label: "미디어·콘텐츠" },
  { code: "ETC", label: "기타" },
];

export const EMPLOYEE_COUNT_OPTIONS: SignupOption[] = [
  { code: "UNDER_10", label: "1~9명" },
  { code: "UNDER_50", label: "10~49명" },
  { code: "UNDER_100", label: "50~99명" },
  { code: "OVER_100", label: "100명 이상" },
];

export const BANK_OPTIONS: SignupOption[] = [
  { code: "KB", label: "KB국민은행" },
  { code: "SHINHAN", label: "신한은행" },
  { code: "WOORI", label: "우리은행" },
  { code: "HANA", label: "하나은행" },
  { code: "NH", label: "NH농협은행" },
  { code: "KAKAO", label: "카카오뱅크" },
];

// 이메일 인증 Step "@" 뒤 도메인 프리셋
export const EMAIL_DOMAIN_OPTIONS: string[] = [
  "naver.com",
  "gmail.com",
  "daum.net",
  "nate.com",
];
