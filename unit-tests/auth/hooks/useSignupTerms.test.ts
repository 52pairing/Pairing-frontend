import { act, renderHook, waitFor } from "@testing-library/react";

import { useSignupTerms } from "@/features/auth/hooks/useSignupTerms";
import { getSignupTerms } from "@/features/auth/services/signupTerms";
import type { LoginRole } from "@/features/auth/types";
import type { SignupTermsItem } from "@/features/auth/types/signupApiTypes";

jest.mock("@/features/auth/services/signupTerms", () => ({
  getSignupTerms: jest.fn(),
}));

const mockedGetSignupTerms = jest.mocked(getSignupTerms);

const AGREEMENT: SignupTermsItem = {
  termsId: 1,
  code: "TOS",
  type: "AGREEMENT",
  title: "이용약관",
  version: "1",
  required: true,
  effectiveAt: "2026-01-01",
  content: "...",
};
const POLICY: SignupTermsItem = {
  ...AGREEMENT,
  termsId: 2,
  code: "PRIVACY",
  type: "POLICY",
  title: "개인정보처리방침",
};

afterEach(() => jest.clearAllMocks());

it("AGREEMENT 타입만 남기고 POLICY는 제외한다", async () => {
  mockedGetSignupTerms.mockResolvedValue([AGREEMENT, POLICY]);

  const { result } = renderHook(() => useSignupTerms("CLIENT"));
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  expect(result.current.terms).toEqual([AGREEMENT]);
  expect(mockedGetSignupTerms).toHaveBeenCalledWith("CLIENT");
});

it("role이 바뀌면 새 역할로 다시 조회한다", async () => {
  mockedGetSignupTerms.mockResolvedValue([]);
  const { result, rerender } = renderHook(
    ({ role }: { role: LoginRole }) => useSignupTerms(role),
    { initialProps: { role: "CLIENT" } },
  );
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  rerender({ role: "FREELANCER" });

  await waitFor(() =>
    expect(mockedGetSignupTerms).toHaveBeenLastCalledWith("FREELANCER"),
  );
});

it("조회 실패 시 에러 상태가 된다", async () => {
  mockedGetSignupTerms.mockRejectedValue(new Error("네트워크 오류"));

  const { result } = renderHook(() => useSignupTerms("CLIENT"));

  await waitFor(() => expect(result.current.isError).toBe(true));
  expect(result.current.terms).toEqual([]);
});

it("retry를 호출하면 다시 조회해 실패 상태를 복구한다", async () => {
  mockedGetSignupTerms
    .mockRejectedValueOnce(new Error("실패"))
    .mockResolvedValueOnce([AGREEMENT]);
  const { result } = renderHook(() => useSignupTerms("CLIENT"));
  await waitFor(() => expect(result.current.isError).toBe(true));

  await act(async () => {
    await result.current.retry();
  });

  expect(result.current.isError).toBe(false);
  expect(result.current.terms).toEqual([AGREEMENT]);
});
