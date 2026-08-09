import type {
  ClientSignupForm,
  FreelancerSignupForm,
} from "@/features/auth/types";
import type {
  ClientSignupRequest,
  FreelancerSignupRequest,
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
const buildBirthDate = (form: FreelancerSignupForm) =>
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
