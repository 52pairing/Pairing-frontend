import { renderHook, waitFor } from "@testing-library/react";

import {
  useCurrentUser,
  useCurrentUserState,
} from "@/features/auth/hooks/useCurrentUser";
import {
  getCachedCurrentUser,
  getCurrentUser,
} from "@/features/auth/services/currentUser";
import type { CurrentUserResponse } from "@/features/auth/types";

jest.mock("@/features/auth/services/currentUser", () => ({
  getCachedCurrentUser: jest.fn(),
  getCurrentUser: jest.fn(),
}));

const mockedGetCached = jest.mocked(getCachedCurrentUser);
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

it("initialUser가 주어지면 즉시 사용하고 로딩 상태가 아니다", () => {
  mockedGetCurrentUser.mockResolvedValue(user);

  const { result } = renderHook(() => useCurrentUserState(user));

  expect(result.current.user).toEqual(user);
  expect(result.current.isLoading).toBe(false);
});

it("initialUser와 캐시가 모두 없으면 로딩 상태로 시작해 조회 후 값을 채운다", async () => {
  mockedGetCached.mockReturnValue(null);
  mockedGetCurrentUser.mockResolvedValue(user);

  const { result } = renderHook(() => useCurrentUserState());

  expect(result.current.isLoading).toBe(true);
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.user).toEqual(user);
});

it("캐시된 사용자가 있으면 초기부터 로딩 상태가 아니다", () => {
  mockedGetCached.mockReturnValue(user);
  mockedGetCurrentUser.mockResolvedValue(user);

  const { result } = renderHook(() => useCurrentUserState());

  expect(result.current.isLoading).toBe(false);
  expect(result.current.user).toEqual(user);
});

it("조회에 실패해도 에러를 던지지 않고 로딩만 종료한다", async () => {
  mockedGetCached.mockReturnValue(null);
  mockedGetCurrentUser.mockRejectedValue(new Error("네트워크 오류"));

  const { result } = renderHook(() => useCurrentUserState());

  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.user).toBeNull();
});

it("useCurrentUser는 user 값만 반환한다", async () => {
  mockedGetCached.mockReturnValue(user);
  mockedGetCurrentUser.mockResolvedValue(user);

  const { result } = renderHook(() => useCurrentUser());

  expect(result.current).toEqual(user);
});
