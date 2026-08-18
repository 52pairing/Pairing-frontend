import { act, renderHook, waitFor } from "@testing-library/react";

import { useSignupOptions } from "@/features/auth/hooks/useSignupOptions";

afterEach(() => jest.clearAllMocks());

it("로더가 성공하면 옵션 목록을 채우고 로딩을 끝낸다", async () => {
  const loader = jest.fn().mockResolvedValue([{ code: "IT", label: "IT" }]);
  const { result } = renderHook(() => useSignupOptions(loader));

  expect(result.current.isLoading).toBe(true);
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  expect(result.current.options).toEqual([{ code: "IT", label: "IT" }]);
  expect(result.current.isError).toBe(false);
});

it("로더가 실패하면 에러 상태가 되고 로딩을 끝낸다", async () => {
  const loader = jest.fn().mockRejectedValue(new Error("네트워크 오류"));
  const { result } = renderHook(() => useSignupOptions(loader));

  await waitFor(() => expect(result.current.isError).toBe(true));
  expect(result.current.isLoading).toBe(false);
  expect(result.current.options).toEqual([]);
});

it("retry를 호출하면 다시 조회해 실패 상태를 복구한다", async () => {
  const loader = jest
    .fn()
    .mockRejectedValueOnce(new Error("실패"))
    .mockResolvedValueOnce([{ code: "IT", label: "IT" }]);
  const { result } = renderHook(() => useSignupOptions(loader));
  await waitFor(() => expect(result.current.isError).toBe(true));

  await act(async () => {
    await result.current.retry();
  });

  expect(result.current.isError).toBe(false);
  expect(result.current.options).toEqual([{ code: "IT", label: "IT" }]);
  expect(loader).toHaveBeenCalledTimes(2);
});

it("언마운트 이후 응답이 도착해도 상태를 갱신하지 않는다", async () => {
  let resolveLoader!: (value: { code: string; label: string }[]) => void;
  const loader = jest.fn().mockReturnValue(
    new Promise<{ code: string; label: string }[]>((resolve) => {
      resolveLoader = resolve;
    }),
  );
  const { unmount } = renderHook(() => useSignupOptions(loader));

  unmount();
  expect(() => {
    resolveLoader([{ code: "IT", label: "IT" }]);
  }).not.toThrow();
});
