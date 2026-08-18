import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { NewPasswordForm } from "@/features/auth/components/NewPasswordForm";

const renderForm = (overrides: Partial<React.ComponentProps<typeof NewPasswordForm>> = {}) => {
  const onSubmit = jest.fn();
  const props: React.ComponentProps<typeof NewPasswordForm> = {
    isSubmitting: false,
    onSubmit,
    ...overrides,
  };
  render(<NewPasswordForm {...props} />);
  return { onSubmit };
};

it("임시 비밀번호 안내 문구는 temporaryPassword 기본값(true)일 때 표시된다", () => {
  renderForm();

  expect(
    screen.getByText("보안을 위해 새로운 비밀번호를 등록해야 합니다. 등록 전까지 다른 서비스에 접근할 수 없습니다."),
  ).toBeInTheDocument();
});

it("temporaryPassword가 false면 안내 문구가 없고 설명이 달라진다", () => {
  renderForm({ temporaryPassword: false });

  expect(screen.getByText("현재와 다른 새로운 비밀번호를 입력해 주세요.")).toBeInTheDocument();
  expect(screen.queryByText(/등록 전까지 다른 서비스에 접근할 수 없습니다/)).not.toBeInTheDocument();
});

it("정책을 만족하지 않는 비밀번호면 제출 버튼이 비활성화된다", async () => {
  const user = userEvent.setup();
  renderForm();

  await user.type(screen.getByPlaceholderText("새 비밀번호를 입력해 주세요."), "abc12345");

  expect(screen.getByRole("button", { name: "새 비밀번호 등록" })).toBeDisabled();
});

it("비밀번호 확인이 일치하지 않으면 불일치 메시지를 보여주고 제출이 막힌다", async () => {
  const user = userEvent.setup();
  const { onSubmit } = renderForm();

  await user.type(screen.getByPlaceholderText("새 비밀번호를 입력해 주세요."), "Abcd1234!");
  await user.type(screen.getByLabelText(/새 비밀번호 확인/), "Abcd1234?");

  expect(screen.getByText("비밀번호가 일치하지 않습니다.")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "새 비밀번호 등록" })).toBeDisabled();

  await user.click(screen.getByRole("button", { name: "새 비밀번호 등록" }));
  expect(onSubmit).not.toHaveBeenCalled();
});

it("정책을 만족하고 비밀번호가 일치하면 제출 시 onSubmit이 비밀번호와 함께 호출된다", async () => {
  const user = userEvent.setup();
  const { onSubmit } = renderForm();

  await user.type(screen.getByPlaceholderText("새 비밀번호를 입력해 주세요."), "Abcd1234!");
  await user.type(screen.getByLabelText(/새 비밀번호 확인/), "Abcd1234!");

  expect(screen.getByText("비밀번호가 일치합니다.")).toBeInTheDocument();

  const submitButton = screen.getByRole("button", { name: "새 비밀번호 등록" });
  expect(submitButton).toBeEnabled();

  await user.click(submitButton);

  expect(onSubmit).toHaveBeenCalledWith("Abcd1234!");
});

it("보기 버튼을 클릭하면 비밀번호 입력 타입이 text로 바뀐다", async () => {
  const user = userEvent.setup();
  renderForm();

  const passwordInput = screen.getByPlaceholderText("새 비밀번호를 입력해 주세요.");
  expect(passwordInput).toHaveAttribute("type", "password");

  await user.click(screen.getAllByRole("button", { name: "보기" })[0]);

  expect(passwordInput).toHaveAttribute("type", "text");
});

it("제출 중에는 버튼 문구가 바뀌고 비활성화된다", async () => {
  const user = userEvent.setup();
  renderForm({ isSubmitting: true });

  await user.type(screen.getByPlaceholderText("새 비밀번호를 입력해 주세요."), "Abcd1234!");
  await user.type(screen.getByLabelText(/새 비밀번호 확인/), "Abcd1234!");

  expect(screen.getByRole("button", { name: "등록 중..." })).toBeDisabled();
});

it("error가 있으면 에러 메시지를 보여준다", () => {
  renderForm({ error: "만료된 링크입니다." });

  expect(screen.getByText("만료된 링크입니다.")).toBeInTheDocument();
});
