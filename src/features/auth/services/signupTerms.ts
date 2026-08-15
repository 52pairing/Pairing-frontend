import { apiCall } from "@/lib/api";
import type { LoginRole } from "@/features/auth/types";
import type { SignupTermsItem } from "@/features/auth/types/signupApiTypes";

// 역할에 맞는 회원가입 약관 목록을 가져옵니다.
export const getSignupTerms = (role: LoginRole) =>
  apiCall<SignupTermsItem[]>(`/api/v1/terms?role=${role}`);
