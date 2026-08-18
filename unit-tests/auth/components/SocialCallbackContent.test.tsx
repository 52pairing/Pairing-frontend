import { render, screen, waitFor } from "@testing-library/react";

import { SocialCallbackContent } from "@/features/auth/components/SocialCallbackContent";
import { completeSocialLogin } from "@/features/auth/services/socialAuth";
import { clearCurrentUserCache } from "@/features/auth/services/currentUser";
import {
  getSocialLoginAttempt,
  savePendingSocialSignup,
} from "@/features/auth/utils/socialAuthFlow";

let searchParamsMap: Record<string, string> = {};
const routerReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerReplace }),
  useSearchParams: () => ({ get: (key: string) => searchParamsMap[key] ?? null }),
}));
jest.mock("@/features/auth/components/AuthHeader", () => ({ AuthHeader: () => null }));
jest.mock("@/features/auth/services/socialAuth", () => ({
  completeSocialLogin: jest.fn(),
}));
jest.mock("@/features/auth/services/currentUser", () => ({
  clearCurrentUserCache: jest.fn(),
}));
jest.mock("@/features/auth/utils/socialAuthFlow", () => ({
  getSocialLoginAttempt: jest.fn(),
  clearSocialLoginAttempt: jest.fn(),
  savePendingSocialSignup: jest.fn(),
}));
jest.mock("@/features/negotiation/stomp/client", () => ({
  reactivateStomp: jest.fn().mockResolvedValue(undefined),
}));

const mockedCompleteSocialLogin = jest.mocked(completeSocialLogin);
const mockedGetAttempt = jest.mocked(getSocialLoginAttempt);
const mockedClearCache = jest.mocked(clearCurrentUserCache);
const mockedSavePending = jest.mocked(savePendingSocialSignup);

afterEach(() => jest.clearAllMocks());

it("정상 로그인이면 현재 사용자 캐시를 초기화하고 원래 페이지로 이동한다", async () => {
  searchParamsMap = { code: "auth-code", state: "s1" };
  mockedGetAttempt.mockReturnValue({ provider: "kakao", returnUrl: "/freelancer/mypage" });
  mockedCompleteSocialLogin.mockResolvedValue({
    status: "LOGIN",
    login: { accountId: 1, role: "FREELANCER", name: "김프리", tempPassword: false },
  });

  render(<SocialCallbackContent />);

  await waitFor(() => expect(routerReplace).toHaveBeenCalledWith("/freelancer/mypage"));
  expect(mockedClearCache).toHaveBeenCalledTimes(1);
  expect(mockedCompleteSocialLogin).toHaveBeenCalledWith("kakao", {
    code: "auth-code",
    state: "s1",
  });
});

it("보안 민감 경로가 returnUrl로 저장돼 있으면 기본 경로로 이동한다", async () => {
  searchParamsMap = { code: "auth-code", state: "s1" };
  mockedGetAttempt.mockReturnValue({
    provider: "kakao",
    returnUrl: "/freelancer/mypage/payment-methods",
  });
  mockedCompleteSocialLogin.mockResolvedValue({
    status: "LOGIN",
    login: { accountId: 1, role: "FREELANCER", name: "김프리", tempPassword: false },
  });

  render(<SocialCallbackContent />);

  await waitFor(() => expect(routerReplace).toHaveBeenCalledWith("/freelancer"));
});

it("추가 정보가 필요하면 가입 대기 정보를 저장하고 소셜 회원가입 화면으로 이동한다", async () => {
  searchParamsMap = { code: "auth-code", state: "s1" };
  mockedGetAttempt.mockReturnValue({ provider: "google", returnUrl: "/freelancer" });
  mockedCompleteSocialLogin.mockResolvedValue({
    status: "SIGNUP_REQUIRED",
    signUpTicket: "ticket-1",
    email: "user@gmail.com",
    name: "김구글",
  });

  render(<SocialCallbackContent />);

  await waitFor(() => expect(routerReplace).toHaveBeenCalledWith("/signup/freelancer/social"));
  expect(mockedSavePending).toHaveBeenCalledWith({
    provider: "google",
    signUpTicket: "ticket-1",
    email: "user@gmail.com",
    name: "김구글",
  });
});

it("콜백 정보가 없으면 오류 메시지를 보여주고 로그인 완료 요청을 시도하지 않는다", () => {
  searchParamsMap = {};
  mockedGetAttempt.mockReturnValue(null);

  render(<SocialCallbackContent />);

  expect(
    screen.getByText("소셜 로그인 정보가 없거나 만료되었습니다. 다시 시도해 주세요."),
  ).toBeInTheDocument();
  expect(mockedCompleteSocialLogin).not.toHaveBeenCalled();
});
