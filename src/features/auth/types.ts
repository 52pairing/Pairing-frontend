// 로그인 사용자 역할
export type LoginRole = "CLIENT" | "FREELANCER";

// 로그인 요청 데이터
export interface LoginRequest {
  email: string;
  password: string;
  role: LoginRole;
}

// 로그인 성공 응답
export interface LoginResponseData {
  accountId: number;
  role: LoginRole;
  name: string;
  tempPassword: boolean;
}

// 아이디(이메일) 찾기 요청
export interface FindEmailRequest {
  name: string;
  phone: string;
}

// 아이디 찾기 결과에 포함되는 계정 정보
export interface FindEmailAccount {
  role: LoginRole;
  maskedEmail: string;
}

// 아이디 찾기 성공
export interface FindEmailResponseData {
  accounts: FindEmailAccount[];
}

// 비밀번호 찾기(인증 링크 발송) 요청 - email/name/phone 일치 여부와 무관하게 항상 200 응답
export interface FindPasswordRequest {
  email: string;
  role: LoginRole;
  name: string;
  phone: string;
}

// 이메일 인증코드 발송 용도 (가입/잠금해제/비밀번호변경/프로필변경 공통)
export type VerificationPurpose =
  | "SIGNUP"
  | "UNLOCK"
  | "PASSWORD_CHANGE"
  | "PROFILE_UPDATE";

// 이메일 인증코드 발송 요청
export interface SendVerificationCodeRequest {
  email: string;
  purpose: VerificationPurpose;
}

// 이메일 인증코드 발송 성공 - expiresAt 기준으로 카운트다운 표시
export interface SendVerificationCodeResponseData {
  expiresAt: string;
  remainingSendCount: number;
}

// 계정 잠금 해제 요청 - /email-verifications/confirm을 거치지 않고 코드를 여기 바로 넣음
export interface UnlockAccountRequest {
  email: string;
  role: LoginRole;
  code: string;
}

// 새 비밀번호 등록 요청 - 임시 비밀번호 로그인 직후/마이페이지 변경이 같은 엔드포인트를 씀
export interface ChangePasswordRequest {
  newPassword: string;
  newPasswordConfirm: string;
}

