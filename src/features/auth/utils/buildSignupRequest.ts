import type {
  ClientSignupForm,
  FreelancerSignupForm,
  FreelancerSocialSignupForm,
} from "@/features/auth/types";
import type {
  ClientSignupRequest,
  FreelancerSignupRequest,
  FreelancerSocialSignupRequest,
  SignupAgreement,
  SignupTermsItem,
} from "@/features/auth/types/signupApiTypes";
import { normalizeDigits } from "@/features/auth/utils/normalizeDigits";

const buildAgreements = (
  terms: SignupTermsItem[],
  agreed: Record<number, boolean>,
): SignupAgreement[] =>
  terms.map((term) => ({
    termsId: term.termsId,
    agreed: agreed[term.termsId] ?? false,
  }));

// 화면에 나뉘어 저장된 클라이언트 입력값을 서버 요청 형태로 모읍니다.
export const buildClientSignupRequest = (
  form: ClientSignupForm,
  terms: SignupTermsItem[],
): ClientSignupRequest => ({
  companyName: form.companyName ?? "",
  businessNo: normalizeDigits(form.businessRegistrationNumber ?? ""),
  businessField: form.businessField ?? "",
  employeeCount: form.employeeCount ?? "",
  address: {
    sido: form.address?.sido ?? "",
    sigungu: form.address?.sigungu ?? "",
    roadAddress: form.address?.roadAddress ?? "",
    addressDetail: form.address?.addressDetail ?? "",
    zipCode: form.address?.zipCode ?? "",
  },
  email: `${form.emailLocalPart ?? ""}@${form.emailDomain ?? ""}`,
  name: form.representativeName ?? "",
  phone: normalizeDigits(form.phone ?? ""),
  password: form.password ?? "",
  passwordConfirm: form.confirmPassword ?? "",
  card: {
    cardNumber: form.cardNumber ?? "",
    cardBrand: form.cardBrand ?? "",
  },
  bankAccount: {
    bankCode: form.bankCode ?? "",
    accountNo: form.accountNumber ?? "",
    accountHolder: form.accountHolder ?? "",
  },
  agreements: buildAgreements(terms, form.agreedTerms ?? {}),
});

// 생년월일을 API에서 요구하는 YYYY-MM-DD 형태로 만듭니다.
const buildBirthDate = (form: {
  birthYear?: string;
  birthMonth?: string;
  birthDay?: string;
}) =>
  [form.birthYear, form.birthMonth, form.birthDay]
    .map((value, index) =>
      index === 0 ? (value ?? "") : (value ?? "").padStart(2, "0"),
    )
    .join("-");

// 화면에 나뉘어 저장된 프리랜서 입력값을 서버 요청 형태로 모읍니다.
export const buildFreelancerSignupRequest = (
  form: FreelancerSignupForm,
  terms: SignupTermsItem[],
): FreelancerSignupRequest => ({
  name: form.name ?? "",
  phone: normalizeDigits(form.phone ?? ""),
  email: `${form.emailLocalPart ?? ""}@${form.emailDomain ?? ""}`,
  password: form.password ?? "",
  passwordConfirm: form.confirmPassword ?? "",
  birthDate: buildBirthDate(form),
  address: {
    sido: form.address?.sido ?? "",
    sigungu: form.address?.sigungu ?? "",
    roadAddress: form.address?.roadAddress ?? "",
    addressDetail: form.address?.addressDetail ?? "",
    zipCode: form.address?.zipCode ?? "",
  },
  card: {
    cardNumber: form.cardNumber ?? "",
    cardBrand: form.cardBrand ?? "",
  },
  bankAccount: {
    bankCode: form.bankCode ?? "",
    accountNo: form.accountNumber ?? "",
    accountHolder: form.accountHolder ?? "",
  },
  agreements: buildAgreements(terms, form.agreedTerms ?? {}),
});

// 콜백 티켓과 소셜 추가 입력값을 서버 요청 형태로 모읍니다.
export const buildFreelancerSocialSignupRequest = (
  form: FreelancerSocialSignupForm,
  terms: SignupTermsItem[],
): FreelancerSocialSignupRequest => ({
  signUpTicket: form.signUpTicket ?? "",
  name: form.name ?? "",
  phone: normalizeDigits(form.phone ?? ""),
  birthDate: buildBirthDate(form),
  address: {
    sido: form.address?.sido ?? "",
    sigungu: form.address?.sigungu ?? "",
    roadAddress: form.address?.roadAddress ?? "",
    addressDetail: form.address?.addressDetail ?? "",
    zipCode: form.address?.zipCode ?? "",
  },
  card: {
    cardNumber: form.cardNumber ?? "",
    cardBrand: form.cardBrand ?? "",
  },
  bankAccount: {
    bankCode: form.bankCode ?? "",
    accountNo: form.accountNumber ?? "",
    accountHolder: form.accountHolder ?? "",
  },
  agreements: buildAgreements(terms, form.agreedTerms ?? {}),
});
