import { apiCall } from "@/lib/api";
import type { SignupOption } from "@/features/auth/types/signupApiTypes";

// 회원가입 기업 정보에서 사용할 사업 분야 목록을 가져옵니다.
export const getBusinessFields = () =>
  apiCall<SignupOption[]>("/api/v1/meta/business-fields");

// 회원가입 기업 정보에서 사용할 직원 수 목록을 가져옵니다.
export const getEmployeeCounts = () =>
  apiCall<SignupOption[]>("/api/v1/meta/employee-counts");

// 계좌 정보에서 사용할 은행 목록을 가져옵니다.
export const getBanks = () =>
  apiCall<SignupOption[]>("/api/v1/meta/banks");
