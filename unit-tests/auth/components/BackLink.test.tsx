import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BackLink } from "@/features/auth/components/BackLink";

it("href가 있으면 링크로 렌더링된다", () => {
  render(<BackLink label="로그인으로 돌아가기" href="/login" onClick={jest.fn()} />);

  const link = screen.getByRole("link", { name: "로그인으로 돌아가기" });
  expect(link).toHaveAttribute("href", "/login");
});

it("href가 없으면 버튼으로 렌더링되고 클릭 시 onClick을 호출한다", async () => {
  const handleClick = jest.fn();
  const user = userEvent.setup();
  render(<BackLink label="이전 단계로" href="" onClick={handleClick} />);

  const button = screen.getByRole("button", { name: "이전 단계로" });
  await user.click(button);

  expect(handleClick).toHaveBeenCalledTimes(1);
});
