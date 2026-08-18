import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ResetPasswordConfirm } from "@/features/auth/components/ResetPasswordConfirm";

it("버튼 클릭 시 onConfirm이 호출된다", async () => {
  const user = userEvent.setup();
  const onConfirm = jest.fn();
  render(<ResetPasswordConfirm isLoading={false} onConfirm={onConfirm} />);

  await user.click(screen.getByRole("button", { name: "임시 비밀번호 받기" }));

  expect(onConfirm).toHaveBeenCalledTimes(1);
});

it("로딩 중에는 버튼이 비활성화되고 문구가 바뀐다", () => {
  render(<ResetPasswordConfirm isLoading onConfirm={jest.fn()} />);

  expect(screen.getByRole("button", { name: "확인 중..." })).toBeDisabled();
});

it("error가 있으면 에러 메시지를 보여준다", () => {
  render(
    <ResetPasswordConfirm
      isLoading={false}
      error="유효하지 않은 링크입니다."
      onConfirm={jest.fn()}
    />,
  );

  expect(screen.getByText("유효하지 않은 링크입니다.")).toBeInTheDocument();
});
