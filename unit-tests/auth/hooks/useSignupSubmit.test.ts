import { act, renderHook } from "@testing-library/react";

import { useSignupSubmit } from "@/features/auth/hooks/useSignupSubmit";
import { ApiException } from "@/lib/api";

it("제출에 성공하면 true를 반환하고 제출 상태를 정리한다", async () => {
  const submitter = jest.fn().mockResolvedValue(undefined);
  const { result } = renderHook(() => useSignupSubmit(submitter));

  let submitResult: boolean | undefined;
  await act(async () => {
    submitResult = await result.current.submit({ email: "user@pairing.com" });
  });

  expect(submitResult).toBe(true);
  expect(submitter).toHaveBeenCalledWith({ email: "user@pairing.com" });
  expect(result.current.isSubmitting).toBe(false);
  expect(result.current.submitError).toBe("");
});

it("ApiException 발생 시 서버 메시지를 저장하고 onError를 호출한다", async () => {
  const error = new ApiException("AU_020", "이미 가입된 이메일입니다.", 409);
  const submitter = jest.fn().mockRejectedValue(error);
  const onError = jest.fn();
  const { result } = renderHook(() => useSignupSubmit(submitter, { onError }));

  let submitResult: boolean | undefined;
  await act(async () => {
    submitResult = await result.current.submit({});
  });

  expect(submitResult).toBe(false);
  expect(result.current.submitError).toBe("이미 가입된 이메일입니다.");
  expect(onError).toHaveBeenCalledWith(error);
});

it("ApiException이 아닌 에러는 공통 안내 문구를 보여준다", async () => {
  const submitter = jest.fn().mockRejectedValue(new Error("네트워크 오류"));
  const { result } = renderHook(() => useSignupSubmit(submitter));

  await act(async () => {
    await result.current.submit({});
  });

  expect(result.current.submitError).toBe(
    "회원가입 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
  );
});

it("제출 중에는 중복 호출을 막는다", async () => {
  let resolveSubmit!: () => void;
  const submitter = jest.fn().mockReturnValue(
    new Promise<void>((resolve) => {
      resolveSubmit = resolve;
    }),
  );
  const { result } = renderHook(() => useSignupSubmit(submitter));

  let first: Promise<boolean>;
  act(() => {
    first = result.current.submit({});
  });
  expect(result.current.isSubmitting).toBe(true);

  let second: boolean | undefined;
  await act(async () => {
    second = await result.current.submit({});
  });

  expect(second).toBe(false);
  expect(submitter).toHaveBeenCalledTimes(1);

  await act(async () => {
    resolveSubmit();
    await first;
  });
  expect(result.current.isSubmitting).toBe(false);
});
