import type { TermsItem } from "@/features/auth/types";

// 회원가입 디자인 확인용 임시 약관입니다. 실제 연동 시 서버 약관으로 교체합니다.
export const SIGNUP_TERMS_ITEMS: TermsItem[] = [
  {
    termsId: 1,
    code: "SERVICE",
    type: "AGREEMENT",
    title: "서비스 이용약관 동의",
    version: "UI 목업",
    required: true,
    effectiveAt: "",
    content: "서비스 이용약관 내용이 표시되는 영역입니다.",
  },
  {
    termsId: 2,
    code: "PRIVACY",
    type: "AGREEMENT",
    title: "개인정보 수집 및 이용 동의",
    version: "UI 목업",
    required: true,
    effectiveAt: "",
    content: "개인정보 수집 및 이용 안내가 표시되는 영역입니다.",
  },
  {
    termsId: 3,
    code: "MARKETING",
    type: "AGREEMENT",
    title: "마케팅 정보 수신 동의",
    version: "UI 목업",
    required: false,
    effectiveAt: "",
    content: "마케팅 정보 수신 안내가 표시되는 영역입니다.",
  },
];
