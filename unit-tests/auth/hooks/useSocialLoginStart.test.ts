import { act, renderHook } from "@testing-library/react";

import { useSocialLoginStart } from "@/features/auth/hooks/useSocialLoginStart";
import { getSocialAuthorizeUrl } from "@/features/auth/services/socialAuth";
import {
  clearPendingSocialSignup,
  saveSocialLoginAttempt,
} from "@/features/auth/utils/socialAuthFlow";
import { ApiException } from "@/lib/api";

jest.mock("@/features/auth/services/socialAuth", () => ({
  getSocialAuthorizeUrl: jest.fn(),
}));
jest.mock("@/features/auth/utils/socialAuthFlow", () => ({
  clearPendingSocialSignup: jest.fn(),
  saveSocialLoginAttempt: jest.fn(),
}));

const mockedGetAuthorizeUrl = jest.mocked(getSocialAuthorizeUrl);
const mockedClearPending = jest.mocked(clearPendingSocialSignup);
const mockedSaveAttempt = jest.mocked(saveSocialLoginAttempt);
const assignMock = jest.fn();

beforeEach(() => {
  Object.defineProperty(window, "location", {
    value: { assign: assignMock },
    writable: true,
  });
});

afterEach(() => jest.clearAllMocks());

it("앱 내부 returnUrl이면 그대로 사용해 인가 URL로 이동한다", async () => {
  mockedGetAuthorizeUrl.mockResolvedValue({
    authorizeUrl: "https://kauth.kakao.com/authorize",
    state: "s1",
  });

  const { result } = renderHook(() => useSocialLoginStart("/freelancer/mypage"));
  await act(async () => {
    await result.current.start("kakao");
  });

  expect(mockedGetAuthorizeUrl).toHaveBeenCalledWith("kakao", "/freelancer/mypage");
  expect(mockedClearPending).toHaveBeenCalledTimes(1);
  expect(mockedSaveAttempt).toHaveBeenCalledWith("kakao", "/freelancer/mypage");
  expect(assignMock).toHaveBeenCalledWith("https://kauth.kakao.com/authorize");
});

it("외부 URL이 returnUrl로 오면 기본 경로로 대체한다", async () => {
  mockedGetAuthorizeUrl.mockResolvedValue({
    authorizeUrl: "https://kauth.kakao.com/authorize",
    state: "s1",
  });

  const { result } = renderHook(() => useSocialLoginStart("//evil.example.com"));
  await act(async () => {
    await result.current.start("kakao");
  });

  expect(mockedGetAuthorizeUrl).toHaveBeenCalledWith("kakao", "/freelancer");
});

it("이미 시작 중이면 중복 호출을 무시한다", async () => {
  let resolveAuthorize!: (value: { authorizeUrl: string; state: string }) => void;
  mockedGetAuthorizeUrl.mockReturnValue(
    new Promise((resolve) => {
      resolveAuthorize = resolve;
    }),
  );
  const { result } = renderHook(() => useSocialLoginStart());

  act(() => {
    void result.current.start("kakao");
    void result.current.start("google");
  });

  expect(mockedGetAuthorizeUrl).toHaveBeenCalledTimes(1);
  expect(mockedGetAuthorizeUrl).toHaveBeenCalledWith("kakao", "/freelancer");

  await act(async () => {
    resolveAuthorize({ authorizeUrl: "https://kauth", state: "s1" });
  });
});

it("요청이 실패하면 서버 오류 메시지를 표시하고 다시 시도할 수 있게 한다", async () => {
  mockedGetAuthorizeUrl.mockRejectedValue(
    new ApiException("AU_030", "소셜 로그인에 실패했습니다.", 502),
  );
  const { result } = renderHook(() => useSocialLoginStart());

  await act(async () => {
    await result.current.start("google");
  });

  expect(result.current.error).toBe("소셜 로그인에 실패했습니다.");
  expect(result.current.loadingProvider).toBeNull();
  expect(assignMock).not.toHaveBeenCalled();
});
