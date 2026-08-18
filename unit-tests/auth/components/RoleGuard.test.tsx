import { render, screen, waitFor } from "@testing-library/react";

import { RoleGuard } from "@/features/auth/components/RoleGuard";
import { getCurrentUser } from "@/features/auth/services/currentUser";
import { ApiException } from "@/lib/api";
import type { CurrentUserResponse } from "@/features/auth/types";

let pathname = "/client";
const redirectMock = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => pathname,
  redirect: (url: string) => redirectMock(url),
}));
jest.mock("@/features/auth/services/currentUser", () => ({ getCurrentUser: jest.fn() }));

const mockedGetCurrentUser = jest.mocked(getCurrentUser);

const user: CurrentUserResponse = {
  accountId: 1,
  email: "user@pairing.com",
  role: "CLIENT",
  name: "김클라",
  companyName: null,
  tempPassword: false,
};

afterEach(() => jest.clearAllMocks());

it("역할 제한이 없는 경로는 조회 없이 그대로 children을 렌더링한다", () => {
  pathname = "/";

  render(<RoleGuard>보호되지 않는 화면</RoleGuard>);

  expect(screen.getByText("보호되지 않는 화면")).toBeInTheDocument();
  expect(mockedGetCurrentUser).not.toHaveBeenCalled();
});

it("역할이 일치하면 children을 렌더링한다", async () => {
  pathname = "/client";
  mockedGetCurrentUser.mockResolvedValue(user);

  render(<RoleGuard>클라이언트 화면</RoleGuard>);

  expect(await screen.findByText("클라이언트 화면")).toBeInTheDocument();
  expect(redirectMock).not.toHaveBeenCalled();
});

it("역할이 다르면 /forbidden으로 리다이렉트한다", async () => {
  pathname = "/client";
  mockedGetCurrentUser.mockResolvedValue({ ...user, role: "FREELANCER" });

  render(<RoleGuard>클라이언트 화면</RoleGuard>);

  await waitFor(() => expect(redirectMock).toHaveBeenCalledWith("/forbidden"));
});

it("401이면 로그인 페이지로 리다이렉트한다", async () => {
  pathname = "/client";
  mockedGetCurrentUser.mockRejectedValue(
    new ApiException("AU_401", "인증이 필요합니다.", 401),
  );

  render(<RoleGuard>클라이언트 화면</RoleGuard>);

  await waitFor(() =>
    expect(redirectMock).toHaveBeenCalledWith(
      `/login?returnUrl=${encodeURIComponent("/client")}`,
    ),
  );
});
