import { apiCall } from "@/lib/api";

import type { LoginRole } from "@/features/auth/types";
import type { DuplicateCheckResponse } from "@/features/auth/types/signupApiTypes";

const onlyNumbers = (value: string) => value.replace(/\D/g, "");

// 이메일은 역할별로 중복 여부를 확인합니다.
export const checkEmailDuplicate = (email: string, role: LoginRole) => {
  const query = new URLSearchParams({ email, role });
  return apiCall<DuplicateCheckResponse>(`/api/v1/auth/exists/email?${query}`);
};

// 휴대폰번호는 하이픈을 제거한 뒤 역할별로 확인합니다.
export const checkPhoneDuplicate = (phone: string, role: LoginRole) => {
  const query = new URLSearchParams({ phone: onlyNumbers(phone), role });
  return apiCall<DuplicateCheckResponse>(`/api/v1/auth/exists/phone?${query}`);
};

// 사업자등록번호는 역할과 관계없이 전체 계정에서 확인합니다.
export const checkBusinessNoDuplicate = (businessNo: string) => {
  const query = new URLSearchParams({ businessNo: onlyNumbers(businessNo) });
  return apiCall<DuplicateCheckResponse>(
    `/api/v1/auth/exists/business-no?${query}`,
  );
};
