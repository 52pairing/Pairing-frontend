import { headers } from "next/headers";
import { getServerCurrentUser } from "@/features/auth/services/serverCurrentUser";
import type { CurrentUserResponse } from "@/features/auth/types";

jest.mock("next/headers", () => ({ headers: jest.fn() }));

const mockedHeaders = jest.mocked(headers);
const mockedFetch = jest.fn();

const user: CurrentUserResponse = {
  accountId: 1,
  email: "user@pairing.com",
  role: "CLIENT",
  name: "김클라",
  companyName: null,
  tempPassword: false,
};

function cookieHeaders(cookie: string | null) {
  return { get: (name: string) => (name === "cookie" ? cookie : null) } as unknown as Headers;
}

beforeEach(() => {
  global.fetch = mockedFetch as unknown as typeof fetch;
});

afterEach(() => jest.clearAllMocks());

it("요청에 쿠키가 없으면 fetch 없이 null을 반환한다", async () => {
  mockedHeaders.mockResolvedValue(cookieHeaders(null));

  const result = await getServerCurrentUser();

  expect(result).toBeNull();
  expect(mockedFetch).not.toHaveBeenCalled();
});

it("쿠키를 그대로 전달해 조회하고 성공하면 사용자 정보를 반환한다", async () => {
  mockedHeaders.mockResolvedValue(cookieHeaders("session=abc123"));
  mockedFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ code: "OK", message: "성공", data: user }),
  });

  const result = await getServerCurrentUser();

  expect(mockedFetch).toHaveBeenCalledWith(
    expect.stringContaining("/api/v1/auth/me"),
    expect.objectContaining({
      headers: { cookie: "session=abc123" },
      cache: "no-store",
    }),
  );
  expect(result).toEqual(user);
});

it("응답이 실패하면 null을 반환한다", async () => {
  mockedHeaders.mockResolvedValue(cookieHeaders("session=abc123"));
  mockedFetch.mockResolvedValue({ ok: false });

  const result = await getServerCurrentUser();

  expect(result).toBeNull();
});

it("요청 중 예외가 발생해도 던지지 않고 null을 반환한다", async () => {
  mockedHeaders.mockResolvedValue(cookieHeaders("session=abc123"));
  mockedFetch.mockRejectedValue(new Error("네트워크 오류"));

  const result = await getServerCurrentUser();

  expect(result).toBeNull();
});
