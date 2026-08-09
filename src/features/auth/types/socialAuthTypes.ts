import type { SocialProvider } from "@/features/auth/types";
import type { LoginResponseData } from "@/features/auth/types";

// 소셜 인증 화면으로 이동할 때 백엔드가 돌려주는 정보입니다.
export interface SocialAuthorizeResponse {
  authorizeUrl: string;
  state: string;
}

export interface SocialCallbackRequest {
  code: string;
  state: string;
}

export type SocialCallbackResponse =
  | {
      status: "LOGIN";
      login: LoginResponseData;
    }
  | {
      status: "SIGNUP_REQUIRED";
      signUpTicket: string;
      email: string;
      name: string;
    };

export interface PendingSocialSignup {
  provider: SocialProvider;
  signUpTicket: string;
  email: string;
  name: string;
}

export type { SocialProvider };
