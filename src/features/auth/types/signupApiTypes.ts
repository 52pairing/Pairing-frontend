// 서버가 선택 목록에 공통으로 사용하는 코드와 표시 이름입니다.
export interface SignupOption {
  code: string;
  label: string;
}

// 서버에서 내려주는 회원가입 약관 한 건입니다.
export interface SignupTermsItem {
  termsId: number;
  code: string;
  type: "AGREEMENT" | "POLICY";
  title: string;
  version: string;
  required: boolean;
  effectiveAt: string;
  content: string;
}

// 중복 확인 API가 돌려주는 공통 결과입니다.
export interface DuplicateCheckResponse {
  duplicated: boolean;
}

export interface SignupCard {
  cardNumber: string;
  cardBrand: string;
}

export interface SignupBankAccount {
  bankCode: string;
  accountNo: string;
  accountHolder: string;
}

export interface SignupAgreement {
  termsId: number;
  agreed: boolean;
}

// 클라이언트 최종 회원가입 요청입니다.
export interface ClientSignupRequest {
  companyName: string;
  businessNo: string;
  businessField: string;
  employeeCount: string;
  email: string;
  name: string;
  phone: string;
  password: string;
  passwordConfirm: string;
  card: SignupCard;
  bankAccount: SignupBankAccount;
  agreements: SignupAgreement[];
}

// 일반 프리랜서 최종 회원가입 요청입니다.
export interface FreelancerSignupRequest {
  name: string;
  phone: string;
  email: string;
  password: string;
  passwordConfirm: string;
  birthDate: string;
  card: SignupCard;
  bankAccount: SignupBankAccount;
  agreements: SignupAgreement[];
}

// 소셜 인증을 마친 프리랜서의 추가 회원가입 요청입니다.
export interface FreelancerSocialSignupRequest {
  signUpTicket: string;
  name: string;
  phone: string;
  birthDate: string;
  card: SignupCard;
  bankAccount: SignupBankAccount;
  agreements: SignupAgreement[];
}

export interface SignupResponse {
  accountId: number;
  role: "CLIENT" | "FREELANCER";
}
