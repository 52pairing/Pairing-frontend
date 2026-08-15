import { apiCall } from "@/lib/api";
import type { LoginRole } from "@/features/auth/types";
import type { SignupTermsItem } from "@/features/auth/types/signupApiTypes";

export const getTermsDocuments = (role: LoginRole) =>
  apiCall<SignupTermsItem[]>(`/api/v1/terms/documents?role=${role}`);
