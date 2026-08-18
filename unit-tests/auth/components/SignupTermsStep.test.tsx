import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SignupTermsStep } from "@/features/auth/components/SignupTermsStep";
import { useSignupTerms } from "@/features/auth/hooks/useSignupTerms";
import type { SignupTermsItem } from "@/features/auth/types/signupApiTypes";

jest.mock("@/features/auth/hooks/useSignupTerms", () => ({
  useSignupTerms: jest.fn(),
}));

const mockedUseSignupTerms = jest.mocked(useSignupTerms);

const AGREEMENT: SignupTermsItem = {
  termsId: 1,
  code: "TOS",
  type: "AGREEMENT",
  title: "이용약관",
  version: "1",
  required: true,
  effectiveAt: "2026-01-01",
  content: "약관 내용",
};

afterEach(() => jest.clearAllMocks());

it("로딩 중이면 로딩 문구를 보여주고 다음 버튼을 비활성화한다", () => {
  mockedUseSignupTerms.mockReturnValue({
    terms: [],
    isLoading: true,
    isError: false,
    retry: jest.fn(),
  });

  render(
    <SignupTermsStep
      role="CLIENT"
      agreed={{}}
      onChange={jest.fn()}
      onPrevious={jest.fn()}
      onComplete={jest.fn()}
    />,
  );

  expect(screen.getByText("약관을 불러오는 중...")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "회원가입 완료" })).toBeDisabled();
});

it("조회에 실패하면 재시도 버튼을 보여주고 클릭 시 retry를 호출한다", async () => {
  const retry = jest.fn();
  mockedUseSignupTerms.mockReturnValue({
    terms: [],
    isLoading: false,
    isError: true,
    retry,
  });
  const user = userEvent.setup();

  render(
    <SignupTermsStep
      role="CLIENT"
      agreed={{}}
      onChange={jest.fn()}
      onPrevious={jest.fn()}
      onComplete={jest.fn()}
    />,
  );

  expect(screen.getByText("약관을 불러오지 못했습니다.")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "다시 시도" }));
  expect(retry).toHaveBeenCalledTimes(1);
});

it("필수 약관에 동의하지 않으면 완료 버튼이 비활성화된다", () => {
  mockedUseSignupTerms.mockReturnValue({
    terms: [AGREEMENT],
    isLoading: false,
    isError: false,
    retry: jest.fn(),
  });

  render(
    <SignupTermsStep
      role="CLIENT"
      agreed={{}}
      onChange={jest.fn()}
      onPrevious={jest.fn()}
      onComplete={jest.fn()}
    />,
  );

  expect(screen.getByText("이용약관")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "회원가입 완료" })).toBeDisabled();
});

it("필수 약관에 모두 동의하면 완료 버튼 클릭 시 onComplete가 terms와 함께 호출된다", async () => {
  const onComplete = jest.fn();
  mockedUseSignupTerms.mockReturnValue({
    terms: [AGREEMENT],
    isLoading: false,
    isError: false,
    retry: jest.fn(),
  });
  const user = userEvent.setup();

  render(
    <SignupTermsStep
      role="CLIENT"
      agreed={{ 1: true }}
      onChange={jest.fn()}
      onPrevious={jest.fn()}
      onComplete={onComplete}
    />,
  );

  const submitButton = screen.getByRole("button", { name: "회원가입 완료" });
  expect(submitButton).not.toBeDisabled();

  await user.click(submitButton);

  expect(onComplete).toHaveBeenCalledWith([AGREEMENT]);
});

it("제출 중이면 버튼 문구가 바뀌고 비활성화된다", () => {
  mockedUseSignupTerms.mockReturnValue({
    terms: [AGREEMENT],
    isLoading: false,
    isError: false,
    retry: jest.fn(),
  });

  render(
    <SignupTermsStep
      role="CLIENT"
      agreed={{ 1: true }}
      onChange={jest.fn()}
      onPrevious={jest.fn()}
      onComplete={jest.fn()}
      isSubmitting
    />,
  );

  expect(screen.getByRole("button", { name: "가입 중..." })).toBeDisabled();
});

it("submitError가 있으면 오류 메시지를 보여준다", () => {
  mockedUseSignupTerms.mockReturnValue({
    terms: [AGREEMENT],
    isLoading: false,
    isError: false,
    retry: jest.fn(),
  });

  render(
    <SignupTermsStep
      role="CLIENT"
      agreed={{ 1: true }}
      onChange={jest.fn()}
      onPrevious={jest.fn()}
      onComplete={jest.fn()}
      submitError="이미 사용 중인 이메일입니다."
    />,
  );

  expect(screen.getByText("이미 사용 중인 이메일입니다.")).toBeInTheDocument();
});
