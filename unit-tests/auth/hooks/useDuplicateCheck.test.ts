import { act, renderHook } from "@testing-library/react";

import { useDuplicateCheck } from "@/features/auth/hooks/useDuplicateCheck";
import { ApiException } from "@/lib/api";

it("초기값이 없으면 idle, 있으면 available로 시작한다", () => {
  const { result: idle } = renderHook(() => useDuplicateCheck(jest.fn()));
  expect(idle.current.status).toBe("idle");

  const { result: withInitial } = renderHook(() =>
    useDuplicateCheck(jest.fn(), "user@pairing.com"),
  );
  expect(withInitial.current.status).toBe("available");
  expect(withInitial.current.isAvailable("user@pairing.com")).toBe(true);
});

it("중복이 아니면 available 상태가 되고 true를 반환한다", async () => {
  const checker = jest.fn().mockResolvedValue({ duplicated: false });
  const { result } = renderHook(() => useDuplicateCheck(checker));

  let checkResult: boolean | undefined;
  await act(async () => {
    checkResult = await result.current.check("user@pairing.com");
  });

  expect(checkResult).toBe(true);
  expect(result.current.status).toBe("available");
  expect(result.current.isAvailable("user@pairing.com")).toBe(true);
});

it("중복이면 duplicated 상태가 되고 false를 반환한다", async () => {
  const checker = jest.fn().mockResolvedValue({ duplicated: true });
  const { result } = renderHook(() => useDuplicateCheck(checker));

  let checkResult: boolean | undefined;
  await act(async () => {
    checkResult = await result.current.check("user@pairing.com");
  });

  expect(checkResult).toBe(false);
  expect(result.current.status).toBe("duplicated");
});

it("ApiException 발생 시 서버 메시지를 오류로 표시한다", async () => {
  const checker = jest
    .fn()
    .mockRejectedValue(new ApiException("AU_010", "이미 사용 중인 이메일입니다.", 409));
  const { result } = renderHook(() => useDuplicateCheck(checker));

  await act(async () => {
    await result.current.check("user@pairing.com");
  });

  expect(result.current.status).toBe("error");
  expect(result.current.errorMessage).toBe("이미 사용 중인 이메일입니다.");
});

it("ApiException이 아닌 에러는 공통 안내 문구를 보여준다", async () => {
  const checker = jest.fn().mockRejectedValue(new Error("네트워크 오류"));
  const { result } = renderHook(() => useDuplicateCheck(checker));

  await act(async () => {
    await result.current.check("user@pairing.com");
  });

  expect(result.current.errorMessage).toBe("중복 확인 중 문제가 발생했습니다.");
});

it("나중에 시작된 확인이 먼저 끝나면 뒤늦게 도착한 이전 응답은 무시한다", async () => {
  let resolveFirst!: (value: { duplicated: boolean }) => void;
  const checker = jest
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise<{ duplicated: boolean }>((resolve) => {
          resolveFirst = resolve;
        }),
    )
    .mockResolvedValueOnce({ duplicated: false });
  const { result } = renderHook(() => useDuplicateCheck(checker));

  let firstCheck: Promise<boolean>;
  act(() => {
    firstCheck = result.current.check("a@pairing.com");
  });
  await act(async () => {
    await result.current.check("b@pairing.com");
  });

  expect(result.current.status).toBe("available");
  expect(result.current.isAvailable("b@pairing.com")).toBe(true);

  await act(async () => {
    resolveFirst({ duplicated: true });
    await firstCheck;
  });

  expect(result.current.status).toBe("available");
  expect(result.current.isAvailable("b@pairing.com")).toBe(true);
});

it("reset을 호출하면 idle 상태로 되돌아간다", async () => {
  const checker = jest.fn().mockResolvedValue({ duplicated: false });
  const { result } = renderHook(() => useDuplicateCheck(checker));
  await act(async () => {
    await result.current.check("user@pairing.com");
  });

  act(() => {
    result.current.reset();
  });

  expect(result.current.status).toBe("idle");
  expect(result.current.isAvailable("user@pairing.com")).toBe(false);
});
