import type {
  ClientSignupRequest,
  FreelancerSignupRequest,
  FreelancerSocialSignupRequest,
  SignupResponse,
} from "@/features/auth/types/signupApiTypes";
import { apiCall } from "@/lib/api";

// 클라이언트 일반 회원가입을 완료합니다.
export const signupClient = (payload: ClientSignupRequest) =>
  apiCall<SignupResponse>("/api/v1/auth/signup/client", {
    method: "POST",
    body: JSON.stringify(payload),
  });

// 프리랜서 일반 회원가입을 완료합니다.
export const signupFreelancer = (payload: FreelancerSignupRequest) =>
  apiCall<SignupResponse>("/api/v1/auth/signup/freelancer", {
    method: "POST",
    body: JSON.stringify(payload),
  });

// 소셜 인증을 마친 프리랜서 회원가입을 완료합니다.
export const signupFreelancerSocial = (
  payload: FreelancerSocialSignupRequest,
) =>
  apiCall<SignupResponse>("/api/v1/auth/signup/freelancer/social", {
    method: "POST",
    body: JSON.stringify(payload),
  });
