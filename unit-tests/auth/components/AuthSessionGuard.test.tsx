import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AuthSessionGuard } from "@/features/auth/components/AuthSessionGuard";
import { getCurrentUser } from "@/features/auth/services/currentUser";
import { AUTH_SESSION_END_EVENT } from "@/lib/api";
import type { CurrentUserResponse } from "@/features/auth/types";

let pathname = "/";
const replaceMock = jest.fn();
const locationReplace = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ replace: replaceMock, push: jest.fn() }),
}));
jest.mock("@/features/auth/services/currentUser", () => ({ getCurrentUser: jest.fn() }));
jest.mock("@/features/auth/components/OtherDeviceLoginModal", () => ({
  DuplicateLoginModal: ({ open, onConfirm }: { open: boolean; onConfirm: () => void }) =>
    open ? <button onClick={onConfirm}>중복로그인-확인</button> : null,
}));
jest.mock("@/features/auth/components/LoginSessionExpiredModal", () => ({
  SessionExpiredModal: ({ open, onConfirm }: { open: boolean; onConfirm: () => void }) =>
    open ? <button onClick={onConfirm}>세션만료-확인</button> : null,
}));

const mockedGetCurrentUser = jest.mocked(getCurrentUser);

const baseUser: CurrentUserResponse = {
  accountId: 1,
  email: "user@pairing.com",
  role: "FREELANCER",
  name: "김프리",
  companyName: null,
  tempPassword: false,
};

beforeEach(() => {
  Object.defineProperty(window, "location", {
    value: { replace: locationReplace },
    writable: true,
  });
});

afterEach(() => jest.clearAllMocks());

it("임시 비밀번호 사용자는 비밀번호 재설정 경로로 이동시킨다", async () => {
  pathname = "/freelancer/mypage";
  mockedGetCurrentUser.mockResolvedValue({ ...baseUser, tempPassword: true });

  render(<AuthSessionGuard />);

  await waitFor(() =>
    expect(replaceMock).toHaveBeenCalledWith("/login/findpassword/reset"),
  );
});

it("다른 역할의 경로에 접근하면 자신의 역할 경로로 이동시킨다", async () => {
  pathname = "/client";
  mockedGetCurrentUser.mockResolvedValue({ ...baseUser, role: "FREELANCER" });

  render(<AuthSessionGuard />);

  await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/freelancer"));
});

it("다른 기기 로그인 이벤트를 받으면 확인 모달을 띄우고, 확인 시 로그인 페이지로 이동한다", async () => {
  pathname = "/freelancer/mypage";
  mockedGetCurrentUser.mockResolvedValue(baseUser);
  const user = userEvent.setup();

  render(<AuthSessionGuard />);
  await waitFor(() => expect(mockedGetCurrentUser).toHaveBeenCalled());

  act(() => {
    window.dispatchEvent(
      new CustomEvent(AUTH_SESSION_END_EVENT, { detail: "duplicate" }),
    );
  });

  await user.click(await screen.findByRole("button", { name: "중복로그인-확인" }));

  expect(locationReplace).toHaveBeenCalledWith(
    `/login?returnUrl=${encodeURIComponent("/freelancer/mypage")}`,
  );
});

it("보안 민감 경로에서 세션 종료 확인 시 returnUrl 없이 로그인 페이지로 이동한다", async () => {
  pathname = "/freelancer/mypage/payment-methods";
  mockedGetCurrentUser.mockResolvedValue(baseUser);
  const user = userEvent.setup();

  render(<AuthSessionGuard />);
  await waitFor(() => expect(mockedGetCurrentUser).toHaveBeenCalled());

  act(() => {
    window.dispatchEvent(
      new CustomEvent(AUTH_SESSION_END_EVENT, { detail: "expired" }),
    );
  });

  await user.click(await screen.findByRole("button", { name: "세션만료-확인" }));

  expect(locationReplace).toHaveBeenCalledWith("/login");
});
