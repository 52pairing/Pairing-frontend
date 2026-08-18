import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FindEmailForm } from "@/features/auth/components/FindEmailForm";

const renderForm = (overrides: Partial<React.ComponentProps<typeof FindEmailForm>> = {}) => {
  const onNameChange = jest.fn();
  const onPhoneChange = jest.fn();
  const onSubmit = jest.fn((event: React.FormEvent) => event.preventDefault());

  const props: React.ComponentProps<typeof FindEmailForm> = {
    name: "",
    phone: "",
    isFormValid: true,
    isSubmitting: false,
    onNameChange,
    onPhoneChange,
    onSubmit,
    ...overrides,
  };

  render(<FindEmailForm {...props} />);

  return { onNameChange, onPhoneChange, onSubmit };
};

it("이름과 전화번호를 입력하면 각각의 변경 핸들러가 호출된다", async () => {
  const user = userEvent.setup();
  const { onNameChange, onPhoneChange } = renderForm();

  await user.type(screen.getByLabelText("이름 *"), "김");
  await user.type(screen.getByLabelText("전화번호 *"), "0");

  expect(onNameChange).toHaveBeenCalledWith("김");
  expect(onPhoneChange).toHaveBeenCalledWith("0");
});

it("폼이 유효하면 제출 시 onSubmit이 호출된다", async () => {
  const user = userEvent.setup();
  const { onSubmit } = renderForm({ isFormValid: true, name: "김리액", phone: "010-0000-0000" });

  await user.click(screen.getByRole("button", { name: "아이디 찾기" }));

  expect(onSubmit).toHaveBeenCalledTimes(1);
});

it("폼이 유효하지 않으면 제출 버튼이 비활성화된다", () => {
  renderForm({ isFormValid: false });

  expect(screen.getByRole("button", { name: "아이디 찾기" })).toBeDisabled();
});

it("제출 중에는 버튼이 비활성화되고 문구가 바뀐다", () => {
  renderForm({ isSubmitting: true });

  const button = screen.getByRole("button", { name: "확인 중..." });
  expect(button).toBeDisabled();
});

it("error가 있으면 에러 메시지를 보여준다", () => {
  renderForm({ error: "일치하는 계정을 찾을 수 없습니다." });

  expect(screen.getByText("일치하는 계정을 찾을 수 없습니다.")).toBeInTheDocument();
});
