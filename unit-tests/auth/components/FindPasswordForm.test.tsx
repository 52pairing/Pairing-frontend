import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FindPasswordForm } from "@/features/auth/components/FindPasswordForm";
import type { LoginRole } from "@/features/auth/types";

const renderForm = (overrides: Partial<React.ComponentProps<typeof FindPasswordForm>> = {}) => {
  const onRoleChange = jest.fn();
  const onEmailChange = jest.fn();
  const onNameChange = jest.fn();
  const onPhoneChange = jest.fn();
  const onSubmit = jest.fn((event: React.FormEvent) => event.preventDefault());

  const props: React.ComponentProps<typeof FindPasswordForm> = {
    role: "CLIENT" as LoginRole,
    email: "",
    name: "",
    phone: "",
    isFormValid: true,
    isSubmitting: false,
    onRoleChange,
    onEmailChange,
    onNameChange,
    onPhoneChange,
    onSubmit,
    ...overrides,
  };

  render(<FindPasswordForm {...props} />);

  return { onRoleChange, onEmailChange, onNameChange, onPhoneChange, onSubmit };
};

it("프리랜서 탭을 클릭하면 onRoleChange가 FREELANCER로 호출된다", async () => {
  const user = userEvent.setup();
  const { onRoleChange } = renderForm({ role: "CLIENT" });

  await user.click(screen.getByRole("button", { name: "프리랜서" }));

  expect(onRoleChange).toHaveBeenCalledWith("FREELANCER");
});

it("클라이언트 탭을 클릭하면 onRoleChange가 CLIENT로 호출된다", async () => {
  const user = userEvent.setup();
  const { onRoleChange } = renderForm({ role: "FREELANCER" });

  await user.click(screen.getByRole("button", { name: "클라이언트" }));

  expect(onRoleChange).toHaveBeenCalledWith("CLIENT");
});

it("입력값을 변경하면 각 변경 핸들러가 호출된다", async () => {
  const user = userEvent.setup();
  const { onEmailChange, onNameChange, onPhoneChange } = renderForm();

  await user.type(screen.getByLabelText("이메일 *"), "a");
  await user.type(screen.getByLabelText("이름 *"), "김");
  await user.type(screen.getByLabelText("전화번호 *"), "0");

  expect(onEmailChange).toHaveBeenCalledWith("a");
  expect(onNameChange).toHaveBeenCalledWith("김");
  expect(onPhoneChange).toHaveBeenCalledWith("0");
});

it("폼이 유효하면 제출 시 onSubmit이 호출된다", async () => {
  const user = userEvent.setup();
  const { onSubmit } = renderForm({ isFormValid: true });

  await user.click(screen.getByRole("button", { name: "인증 링크 받기" }));

  expect(onSubmit).toHaveBeenCalledTimes(1);
});

it("폼이 유효하지 않으면 제출 버튼이 비활성화된다", () => {
  renderForm({ isFormValid: false });

  expect(screen.getByRole("button", { name: "인증 링크 받기" })).toBeDisabled();
});

it("제출 중에는 버튼이 비활성화되고 문구가 바뀐다", () => {
  renderForm({ isSubmitting: true });

  expect(screen.getByRole("button", { name: "요청 중..." })).toBeDisabled();
});

it("error가 있으면 에러 메시지를 보여준다", () => {
  renderForm({ error: "일치하는 회원 정보가 없습니다." });

  expect(screen.getByText("일치하는 회원 정보가 없습니다.")).toBeInTheDocument();
});
