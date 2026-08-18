import { apiCall } from "@/lib/api";
import {
  signupClient,
  signupFreelancer,
  signupFreelancerSocial,
} from "@/features/auth/services/signup";
import { changePassword } from "@/features/auth/services/changePassword";
import { findEmail } from "@/features/auth/services/findEmail";
import { requestPasswordReset } from "@/features/auth/services/findPassword";
import { confirmPasswordReset } from "@/features/auth/services/resetPassword";
import { unlockAccount } from "@/features/auth/services/unlockAccount";
import {
  confirmVerificationCode,
  sendVerificationCode,
} from "@/features/auth/services/emailVerification";
import { getSignupTerms } from "@/features/auth/services/signupTerms";
import { getTermsDocuments } from "@/features/auth/services/termsDocuments";
import {
  completeSocialLogin,
  getSocialAuthorizeUrl,
} from "@/features/auth/services/socialAuth";
import {
  getBanks,
  getBusinessFields,
  getCardCompanies,
  getEmployeeCounts,
} from "@/features/auth/services/signupMeta";
import type {
  ChangePasswordRequest,
  ConfirmVerificationCodeRequest,
  FindEmailRequest,
  FindPasswordRequest,
  SendVerificationCodeRequest,
  UnlockAccountRequest,
} from "@/features/auth/types";
import type {
  ClientSignupRequest,
  FreelancerSignupRequest,
  FreelancerSocialSignupRequest,
} from "@/features/auth/types/signupApiTypes";
import type { SocialCallbackRequest } from "@/features/auth/types/socialAuthTypes";

jest.mock("@/lib/api", () => ({ apiCall: jest.fn() }));

const mockedApiCall = jest.mocked(apiCall);

const SIGNUP_ADDRESS = {
  sido: "서울",
  sigungu: "강남구",
  roadAddress: "테헤란로 1",
  addressDetail: "1층",
  zipCode: "06134",
};
const SIGNUP_CARD = { cardNumber: "1234123412341234", cardBrand: "SHINHAN" };
const SIGNUP_BANK_ACCOUNT = {
  bankCode: "004",
  accountNo: "12345678901",
  accountHolder: "김프리",
};
const SIGNUP_AGREEMENTS = [{ termsId: 1, agreed: true }];

afterEach(() => jest.clearAllMocks());

describe("signup", () => {
  it("signupClient는 클라이언트 회원가입 엔드포인트로 요청한다", async () => {
    const payload: ClientSignupRequest = {
      companyName: "페어링",
      businessNo: "1234567890",
      businessField: "IT",
      employeeCount: "10-49",
      address: SIGNUP_ADDRESS,
      email: "client@pairing.com",
      name: "김클라",
      phone: "01012345678",
      password: "Password1!",
      passwordConfirm: "Password1!",
      card: SIGNUP_CARD,
      bankAccount: SIGNUP_BANK_ACCOUNT,
      agreements: SIGNUP_AGREEMENTS,
    };
    mockedApiCall.mockResolvedValue({ accountId: 1, role: "CLIENT" });

    const result = await signupClient(payload);

    expect(mockedApiCall).toHaveBeenCalledWith("/api/v1/auth/signup/client", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    expect(result).toEqual({ accountId: 1, role: "CLIENT" });
  });

  it("signupFreelancer는 프리랜서 회원가입 엔드포인트로 요청한다", async () => {
    const payload: FreelancerSignupRequest = {
      name: "김프리",
      phone: "01012345678",
      email: "freelancer@pairing.com",
      password: "Password1!",
      passwordConfirm: "Password1!",
      birthDate: "1990-01-01",
      address: SIGNUP_ADDRESS,
      card: SIGNUP_CARD,
      bankAccount: SIGNUP_BANK_ACCOUNT,
      agreements: SIGNUP_AGREEMENTS,
    };
    mockedApiCall.mockResolvedValue({ accountId: 2, role: "FREELANCER" });

    await signupFreelancer(payload);

    expect(mockedApiCall).toHaveBeenCalledWith(
      "/api/v1/auth/signup/freelancer",
      { method: "POST", body: JSON.stringify(payload) },
    );
  });

  it("signupFreelancerSocial은 소셜 프리랜서 회원가입 엔드포인트로 요청한다", async () => {
    const payload: FreelancerSocialSignupRequest = {
      signUpTicket: "ticket-1",
      name: "김프리",
      phone: "01012345678",
      birthDate: "1990-01-01",
      address: SIGNUP_ADDRESS,
      card: SIGNUP_CARD,
      bankAccount: SIGNUP_BANK_ACCOUNT,
      agreements: SIGNUP_AGREEMENTS,
    };
    mockedApiCall.mockResolvedValue({ accountId: 3, role: "FREELANCER" });

    await signupFreelancerSocial(payload);

    expect(mockedApiCall).toHaveBeenCalledWith(
      "/api/v1/auth/signup/freelancer/social",
      { method: "POST", body: JSON.stringify(payload) },
    );
  });
});

it("changePassword는 PATCH로 새 비밀번호를 전송한다", async () => {
  const payload: ChangePasswordRequest = {
    newPassword: "NewPassword1!",
    newPasswordConfirm: "NewPassword1!",
  };
  mockedApiCall.mockResolvedValue(null);

  await changePassword(payload);

  expect(mockedApiCall).toHaveBeenCalledWith("/api/v1/auth/password", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
});

it("findEmail은 이름·전화번호로 아이디 찾기를 요청한다", async () => {
  const payload: FindEmailRequest = { name: "김클라", phone: "01012345678" };
  mockedApiCall.mockResolvedValue({ accounts: [] });

  const result = await findEmail(payload);

  expect(mockedApiCall).toHaveBeenCalledWith("/api/v1/auth/find-email", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  expect(result).toEqual({ accounts: [] });
});

it("requestPasswordReset은 비밀번호 재설정 링크 발송을 요청한다", async () => {
  const payload: FindPasswordRequest = {
    email: "user@pairing.com",
    role: "CLIENT",
    name: "김클라",
    phone: "01012345678",
  };
  mockedApiCall.mockResolvedValue(null);

  await requestPasswordReset(payload);

  expect(mockedApiCall).toHaveBeenCalledWith(
    "/api/v1/auth/password/reset-requests",
    { method: "POST", body: JSON.stringify(payload) },
  );
});

it("confirmPasswordReset은 토큰을 본문에 담아 확인을 요청한다", async () => {
  mockedApiCall.mockResolvedValue(null);

  await confirmPasswordReset("reset-token-1");

  expect(mockedApiCall).toHaveBeenCalledWith(
    "/api/v1/auth/password/reset-confirm",
    { method: "POST", body: JSON.stringify({ token: "reset-token-1" }) },
  );
});

it("unlockAccount는 인증코드를 포함해 잠금 해제를 요청한다", async () => {
  const payload: UnlockAccountRequest = {
    email: "user@pairing.com",
    role: "CLIENT",
    code: "123456",
  };
  mockedApiCall.mockResolvedValue(null);

  await unlockAccount(payload);

  expect(mockedApiCall).toHaveBeenCalledWith("/api/v1/auth/unlock", {
    method: "POST",
    body: JSON.stringify(payload),
  });
});

describe("emailVerification", () => {
  it("sendVerificationCode는 이메일 인증코드 발송을 요청한다", async () => {
    const payload: SendVerificationCodeRequest = {
      email: "user@pairing.com",
      purpose: "SIGNUP",
    };
    mockedApiCall.mockResolvedValue({
      expiresAt: "2026-08-18T00:05:00",
      remainingSendCount: 4,
    });

    const result = await sendVerificationCode(payload);

    expect(mockedApiCall).toHaveBeenCalledWith(
      "/api/v1/auth/email-verifications",
      { method: "POST", body: JSON.stringify(payload) },
    );
    expect(result.remainingSendCount).toBe(4);
  });

  it("confirmVerificationCode는 발송된 코드 확인을 요청한다", async () => {
    const payload: ConfirmVerificationCodeRequest = {
      email: "user@pairing.com",
      purpose: "SIGNUP",
      code: "123456",
    };
    mockedApiCall.mockResolvedValue(null);

    await confirmVerificationCode(payload);

    expect(mockedApiCall).toHaveBeenCalledWith(
      "/api/v1/auth/email-verifications/confirm",
      { method: "POST", body: JSON.stringify(payload) },
    );
  });
});

it("getSignupTerms는 역할별 약관 목록을 조회한다", async () => {
  mockedApiCall.mockResolvedValue([]);

  await getSignupTerms("FREELANCER");

  expect(mockedApiCall).toHaveBeenCalledWith("/api/v1/terms?role=FREELANCER");
});

it("getTermsDocuments는 역할별 약관 전문 목록을 조회한다", async () => {
  mockedApiCall.mockResolvedValue([]);

  await getTermsDocuments("CLIENT");

  expect(mockedApiCall).toHaveBeenCalledWith(
    "/api/v1/terms/documents?role=CLIENT",
  );
});

describe("socialAuth", () => {
  it("getSocialAuthorizeUrl은 provider와 returnUrl로 인가 URL을 조회한다", async () => {
    mockedApiCall.mockResolvedValue({ authorizeUrl: "https://kauth", state: "s1" });

    await getSocialAuthorizeUrl("kakao", "https://pairing.kro.kr/auth/callback");

    expect(mockedApiCall).toHaveBeenCalledWith(
      "/api/v1/auth/social/kakao/authorize?returnUrl=https%3A%2F%2Fpairing.kro.kr%2Fauth%2Fcallback",
    );
  });

  it("completeSocialLogin은 code·state를 provider 콜백 엔드포인트로 전달한다", async () => {
    const payload: SocialCallbackRequest = { code: "auth-code", state: "s1" };
    mockedApiCall.mockResolvedValue({
      status: "SIGNUP_REQUIRED",
      signUpTicket: "ticket-1",
      email: "user@gmail.com",
      name: "김구글",
    });

    const result = await completeSocialLogin("google", payload);

    expect(mockedApiCall).toHaveBeenCalledWith(
      "/api/v1/auth/social/google/callback",
      { method: "POST", body: JSON.stringify(payload) },
    );
    expect(result.status).toBe("SIGNUP_REQUIRED");
  });
});

describe("signupMeta", () => {
  it("getBusinessFields는 사업 분야 메타를 조회한다", async () => {
    mockedApiCall.mockResolvedValue([]);
    await getBusinessFields();
    expect(mockedApiCall).toHaveBeenCalledWith("/api/v1/meta/business-fields");
  });

  it("getEmployeeCounts는 직원 수 메타를 조회한다", async () => {
    mockedApiCall.mockResolvedValue([]);
    await getEmployeeCounts();
    expect(mockedApiCall).toHaveBeenCalledWith("/api/v1/meta/employee-counts");
  });

  it("getBanks는 은행 메타를 조회한다", async () => {
    mockedApiCall.mockResolvedValue([]);
    await getBanks();
    expect(mockedApiCall).toHaveBeenCalledWith("/api/v1/meta/banks");
  });

  it("getCardCompanies는 카드사 메타를 조회한다", async () => {
    mockedApiCall.mockResolvedValue([]);
    await getCardCompanies();
    expect(mockedApiCall).toHaveBeenCalledWith("/api/v1/meta/card-companies");
  });
});
