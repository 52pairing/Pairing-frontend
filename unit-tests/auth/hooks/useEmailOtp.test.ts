import { act, renderHook } from "@testing-library/react";

import { useEmailOtp } from "@/features/auth/hooks/useEmailOtp";
import {
  confirmVerificationCode,
  sendVerificationCode,
} from "@/features/auth/services/emailVerification";
import { ApiException } from "@/lib/api";

jest.mock("@/features/auth/services/emailVerification", () => ({
  sendVerificationCode: jest.fn(),
  confirmVerificationCode: jest.fn(),
}));

const mockedSend = jest.mocked(sendVerificationCode);
const mockedConfirm = jest.mocked(confirmVerificationCode);

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2026-08-18T00:00:00Z"));
});

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
});

it("발송에 성공하면 sent 상태가 되고 남은 시간을 표시한다", async () => {
  mockedSend.mockResolvedValue({
    expiresAt: "2026-08-18T00:05:00Z",
    remainingSendCount: 4,
  });
  const { result } = renderHook(() => useEmailOtp({ email: "user@pairing.com" }));

  await act(async () => {
    await result.current.handleSend();
  });

  expect(result.current.sent).toBe(true);
  expect(result.current.secondsLeft).toBe(300);
  expect(result.current.remainingSendCount).toBe(4);
  expect(mockedSend).toHaveBeenCalledWith({
    email: "user@pairing.com",
    purpose: "SIGNUP",
  });
});

it("시간이 지나면 남은 시간이 1초 단위로 줄어든다", async () => {
  mockedSend.mockResolvedValue({
    expiresAt: "2026-08-18T00:05:00Z",
    remainingSendCount: 4,
  });
  const { result } = renderHook(() => useEmailOtp({ email: "user@pairing.com" }));
  await act(async () => {
    await result.current.handleSend();
  });

  act(() => {
    jest.advanceTimersByTime(60_000);
  });

  expect(result.current.secondsLeft).toBe(240);
});

it("AU_003 오류면 남은 발송 횟수를 0으로 만든다", async () => {
  mockedSend.mockRejectedValue(
    new ApiException("AU_003", "발송 횟수를 초과했습니다.", 429),
  );
  const { result } = renderHook(() => useEmailOtp({ email: "user@pairing.com" }));

  await act(async () => {
    await result.current.handleSend();
  });

  expect(result.current.remainingSendCount).toBe(0);
  expect(result.current.error).toBe("발송 횟수를 초과했습니다.");
  expect(result.current.sent).toBe(false);
});

it("남은 발송 횟수가 0이면 재발송을 시도하지 않는다", async () => {
  mockedSend.mockRejectedValueOnce(
    new ApiException("AU_003", "발송 횟수를 초과했습니다.", 429),
  );
  const { result } = renderHook(() => useEmailOtp({ email: "user@pairing.com" }));
  await act(async () => {
    await result.current.handleSend();
  });

  await act(async () => {
    await result.current.handleSend();
  });

  expect(mockedSend).toHaveBeenCalledTimes(1);
});

it("코드 확인에 성공하면 verified 상태가 되고 타이머를 멈춘다", async () => {
  mockedSend.mockResolvedValue({
    expiresAt: "2026-08-18T00:05:00Z",
    remainingSendCount: 4,
  });
  mockedConfirm.mockResolvedValue(null);
  const { result } = renderHook(() => useEmailOtp({ email: "user@pairing.com" }));
  await act(async () => {
    await result.current.handleSend();
  });
  act(() => {
    result.current.setCode("123456");
  });

  let verifyResult: boolean | undefined;
  await act(async () => {
    verifyResult = await result.current.handleVerify();
  });

  expect(verifyResult).toBe(true);
  expect(result.current.verified).toBe(true);
  expect(result.current.secondsLeft).toBe(0);
  expect(mockedConfirm).toHaveBeenCalledWith({
    email: "user@pairing.com",
    purpose: "SIGNUP",
    code: "123456",
  });
});

it("만료·잠금 오류(AU_005/AU_012)면 남은 시간을 0으로 만든다", async () => {
  mockedSend.mockResolvedValue({
    expiresAt: "2026-08-18T00:05:00Z",
    remainingSendCount: 4,
  });
  mockedConfirm.mockRejectedValue(
    new ApiException("AU_005", "인증코드가 만료되었습니다.", 400),
  );
  const { result } = renderHook(() => useEmailOtp({ email: "user@pairing.com" }));
  await act(async () => {
    await result.current.handleSend();
  });
  act(() => {
    result.current.setCode("000000");
  });

  await act(async () => {
    await result.current.handleVerify();
  });

  expect(result.current.secondsLeft).toBe(0);
  expect(result.current.error).toBe("인증코드가 만료되었습니다.");
  expect(result.current.verified).toBe(false);
});

it("시간이 만료되면(secondsLeft<=0) 확인을 시도하지 않는다", async () => {
  mockedSend.mockResolvedValue({
    expiresAt: "2026-08-18T00:05:00Z",
    remainingSendCount: 4,
  });
  const { result } = renderHook(() => useEmailOtp({ email: "user@pairing.com" }));
  await act(async () => {
    await result.current.handleSend();
  });
  act(() => {
    result.current.setCode("123456");
    jest.advanceTimersByTime(5 * 60_000);
  });

  await act(async () => {
    await result.current.handleVerify();
  });

  expect(mockedConfirm).not.toHaveBeenCalled();
});

it("reset을 호출하면 초기 상태로 되돌아간다", async () => {
  mockedSend.mockResolvedValue({
    expiresAt: "2026-08-18T00:05:00Z",
    remainingSendCount: 4,
  });
  const { result } = renderHook(() => useEmailOtp({ email: "user@pairing.com" }));
  await act(async () => {
    await result.current.handleSend();
  });

  act(() => {
    result.current.reset();
  });

  expect(result.current.sent).toBe(false);
  expect(result.current.secondsLeft).toBe(0);
  expect(result.current.remainingSendCount).toBeNull();
});
