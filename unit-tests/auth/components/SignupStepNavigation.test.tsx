import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SignupStepNavigation } from "@/features/auth/components/SignupStepNavigation";

it("기본 라벨로 이전/다음 버튼을 렌더링하고 클릭 시 각 콜백을 호출한다", async () => {
  const onPrevious = jest.fn();
  const onNext = jest.fn();
  const user = userEvent.setup();
  render(<SignupStepNavigation onPrevious={onPrevious} onNext={onNext} />);

  await user.click(screen.getByRole("button", { name: "이전" }));
  await user.click(screen.getByRole("button", { name: "다음" }));

  expect(onPrevious).toHaveBeenCalledTimes(1);
  expect(onNext).toHaveBeenCalledTimes(1);
});

it("라벨을 지정하면 지정한 문구로 표시된다", () => {
  render(
    <SignupStepNavigation
      onPrevious={jest.fn()}
      onNext={jest.fn()}
      previousLabel="취소"
      nextLabel="가입 중..."
    />,
  );

  expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "가입 중..." })).toBeInTheDocument();
});

it("nextDisabled가 true면 다음 버튼이 비활성화된다", () => {
  render(<SignupStepNavigation onPrevious={jest.fn()} onNext={jest.fn()} nextDisabled />);

  expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
});
