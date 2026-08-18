import { apiCall } from "@/lib/api";
import { login } from "@/features/auth/services/login";
import { logout } from "@/features/auth/services/logout";
import { clearCurrentUserCache } from "@/features/auth/services/currentUser";
import type { LoginRequest, LoginResponseData } from "@/features/auth/types";

jest.mock("@/lib/api", () => ({ apiCall: jest.fn() }));
jest.mock("@/features/auth/services/currentUser", () => ({
  clearCurrentUserCache: jest.fn(),
}));

const mockedApiCall = jest.mocked(apiCall);
const mockedClearCache = jest.mocked(clearCurrentUserCache);

afterEach(() => jest.clearAllMocks());

describe("login", () => {
  const payload: LoginRequest = {
    email: "user@pairing.com",
    password: "Password1!",
    role: "CLIENT",
  };
  const response: LoginResponseData = {
    accountId: 1,
    role: "CLIENT",
    name: "김클라",
    tempPassword: false,
  };

  it("로그인 요청을 보내고 성공하면 현재 사용자 캐시를 초기화한다", async () => {
    mockedApiCall.mockResolvedValue(response);

    const result = await login(payload);

    expect(mockedApiCall).toHaveBeenCalledWith("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    expect(mockedClearCache).toHaveBeenCalledTimes(1);
    expect(result).toEqual(response);
  });

  it("로그인에 실패하면 캐시를 초기화하지 않고 에러를 그대로 던진다", async () => {
    mockedApiCall.mockRejectedValue(new Error("AU_001"));

    await expect(login(payload)).rejects.toThrow("AU_001");
    expect(mockedClearCache).not.toHaveBeenCalled();
  });
});

describe("logout", () => {
  it("로그아웃에 성공하면 현재 사용자 캐시를 초기화한다", async () => {
    mockedApiCall.mockResolvedValue(null);

    await logout();

    expect(mockedApiCall).toHaveBeenCalledWith("/api/v1/auth/logout", {
      method: "POST",
    });
    expect(mockedClearCache).toHaveBeenCalledTimes(1);
  });

  it("로그아웃 요청이 실패해도 캐시는 초기화하고 에러를 그대로 던진다", async () => {
    mockedApiCall.mockRejectedValue(new Error("네트워크 오류"));

    await expect(logout()).rejects.toThrow("네트워크 오류");
    expect(mockedClearCache).toHaveBeenCalledTimes(1);
  });
});
