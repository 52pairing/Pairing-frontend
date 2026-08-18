import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SessionExpiredModal } from "@/features/auth/components/LoginSessionExpiredModal";

const push = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: jest.fn() }),
}));

beforeEach(() => {
  push.mockClear();
});

it("open이 false면 아무것도 렌더링하지 않는다", () => {
  render(<SessionExpiredModal open={false} />);

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

it("확인 버튼을 클릭하면 onConfirm 호출 후 로그인 페이지로 이동한다", async () => {
  const user = userEvent.setup();
  const onConfirm = jest.fn();
  render(<SessionExpiredModal open onConfirm={onConfirm} />);

  await user.click(screen.getByRole("button", { name: "확인" }));

  expect(onConfirm).toHaveBeenCalledTimes(1);
  expect(push).toHaveBeenCalledWith("/login");
});

it("onConfirm 없이도 확인 클릭 시 로그인 페이지로 이동한다", async () => {
  const user = userEvent.setup();
  render(<SessionExpiredModal open />);

  await user.click(screen.getByRole("button", { name: "확인" }));

  expect(push).toHaveBeenCalledWith("/login");
});
