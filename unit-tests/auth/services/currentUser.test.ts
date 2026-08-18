import { apiCall } from "@/lib/api";
import {
  clearCurrentUserCache,
  getCachedCurrentUser,
  getCurrentUser,
} from "@/features/auth/services/currentUser";
import type { CurrentUserResponse } from "@/features/auth/types";

jest.mock("@/lib/api", () => ({ apiCall: jest.fn() }));

const mockedApiCall = jest.mocked(apiCall);

const user: CurrentUserResponse = {
  accountId: 1,
  email: "user@pairing.com",
  role: "CLIENT",
  name: "김클라",
  companyName: null,
  tempPassword: false,
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

beforeEach(() => {
  clearCurrentUserCache();
});

afterEach(() => {
  jest.useRealTimers();
});

it("조회에 성공하면 캐시 유효시간(5초) 동안 재조회 없이 같은 값을 반환한다", async () => {
  jest.useFakeTimers();
  jest.setSystemTime(0);
  mockedApiCall.mockResolvedValue(user);

  const first = await getCurrentUser();
  jest.setSystemTime(4_999);
  const second = await getCurrentUser();

  expect(first).toBe(second);
  expect(mockedApiCall).toHaveBeenCalledTimes(1);
  expect(getCachedCurrentUser()).toEqual(user);
});

it("캐시 유효시간이 지나면 다시 조회한다", async () => {
  jest.useFakeTimers();
  jest.setSystemTime(0);
  mockedApiCall.mockResolvedValue(user);

  await getCurrentUser();
  jest.setSystemTime(5_001);
  await getCurrentUser();

  expect(mockedApiCall).toHaveBeenCalledTimes(2);
});

it("동시에 호출하면 진행 중인 요청 하나를 공유한다", async () => {
  const { promise, resolve } = deferred<CurrentUserResponse>();
  mockedApiCall.mockReturnValue(promise);

  const [first, second] = await Promise.all([
    (async () => {
      const p1 = getCurrentUser();
      const p2 = getCurrentUser();
      resolve(user);
      return Promise.all([p1, p2]);
    })(),
  ]).then(([pair]) => pair);

  expect(first).toBe(second);
  expect(mockedApiCall).toHaveBeenCalledTimes(1);
});

it("clearCurrentUserCache 호출 후에는 캐시 대신 새로 조회한다", async () => {
  mockedApiCall.mockResolvedValue(user);
  await getCurrentUser();

  clearCurrentUserCache();
  expect(getCachedCurrentUser()).toBeNull();

  await getCurrentUser();

  expect(mockedApiCall).toHaveBeenCalledTimes(2);
});

it("진행 중인 요청이 끝나기 전에 캐시가 초기화되면 그 결과를 캐시에 반영하지 않는다", async () => {
  const { promise, resolve } = deferred<CurrentUserResponse>();
  mockedApiCall.mockReturnValueOnce(promise);

  const pending = getCurrentUser();
  clearCurrentUserCache();
  resolve(user);
  await pending;

  expect(getCachedCurrentUser()).toBeNull();

  mockedApiCall.mockResolvedValueOnce(user);
  await getCurrentUser();

  expect(mockedApiCall).toHaveBeenCalledTimes(2);
});
