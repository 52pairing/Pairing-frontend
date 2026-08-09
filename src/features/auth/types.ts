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

// 이메일 인증코드 확인 요청
export interface ConfirmVerificationCodeRequest {
  email: string;
  purpose: VerificationPurpose;
  code: string;
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

// ============================================================
// 회원가입 위저드에서 단계별 입력값을 유지하기 위한 UI 상태 타입
// ============================================================

export type SignupRole = "client" | "freelancer";

export type SocialProvider = "kakao" | "google";

export interface ClientSignupForm {
  // ── Step1 기업 정보 ──
  companyName?: string;
  businessRegistrationNumber?: string;
  /** "중복 확인" 버튼으로 사용 가능 여부를 확인했는지 */
  businessRegistrationChecked?: boolean;
  /** 사업 분야 선택값 */
  businessField?: string;
  /** 직원 수 선택값 */
  employeeCount?: string;

  // ── Step2 담당자 정보 ──
  representativeName?: string;
  phone?: string;
  phoneChecked?: boolean;
  password?: string;
  confirmPassword?: string;

  // ── Step3 이메일 인증 ──
  emailLocalPart?: string;
  emailDomain?: string;
  otpVerified?: boolean;

  // ── Step4 카드/계좌 등록 ──
  cardNumber?: string;
  cardBrand?: string;
  /** 은행 선택값 */
  bankCode?: string;
  accountNumber?: string;
  accountHolder?: string;

  // ── Step5 약관 동의 (key: termsId) ──
  agreedTerms?: Record<number, boolean>;
}

export interface FreelancerSignupForm {
  // ── Step1 기본 정보 ──
  name?: string;
  birthYear?: string;
  birthMonth?: string;
  birthDay?: string;
  phone?: string;
  phoneChecked?: boolean;

  // ── Step2 이메일 인증 + 비밀번호 ──
  emailLocalPart?: string;
  emailDomain?: string;
  otpVerified?: boolean;
  password?: string;
  confirmPassword?: string;

  // ── Step3 카드/계좌 등록 ──
  cardNumber?: string;
  cardBrand?: string;
  bankCode?: string;
  accountNumber?: string;
  accountHolder?: string;

  // ── Step4 약관 동의 (key: termsId) ──
  agreedTerms?: Record<number, boolean>;
}

export interface FreelancerSocialSignupForm {
  // ── Step1 추가 정보 입력 ──
  provider?: SocialProvider;
  /** 소셜 콜백에서 받은 가입 티켓 (POST 회원가입 요청에 그대로 전달) */
  signUpTicket?: string;
  name?: string;
  /** 소셜 제공자가 내려준 값, 화면에서 readonly로 표시 */
  email?: string;
  birthYear?: string;
  birthMonth?: string;
  birthDay?: string;
  phone?: string;
  phoneChecked?: boolean;

  // ── Step2 카드/계좌 등록 ──
  cardNumber?: string;
  cardBrand?: string;
  bankCode?: string;
  accountNumber?: string;
  accountHolder?: string;

  // ── Step3 약관 동의 (key: termsId) ──
  agreedTerms?: Record<number, boolean>;
}

