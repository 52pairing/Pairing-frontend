import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FindPasswordSent } from "@/features/auth/components/FindPasswordSent";

beforeEach(() => {
  jest.useFakeTimers({ legacyFakeTimers: false });
});

afterEach(() => {
  jest.useRealTimers();
});

it("입력한 이메일을 보여주고 재발송 버튼은 대기시간 동안 비활성화된다", () => {
  render(<FindPasswordSent email="user@pairing.com" onResend={jest.fn()} />);

  expect(screen.getByText("user@pairing.com")).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /이메일 다시 보내기 \(180s\)/ }),
  ).toBeDisabled();
});

it("대기시간이 끝나면 재발송 버튼이 활성화되고 클릭 시 onResend가 호출되며 다시 대기시간이 시작된다", async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  const onResend = jest.fn();
  render(<FindPasswordSent email="user@pairing.com" onResend={onResend} />);

  await user.click(screen.getByRole("button", { name: "이메일 다시 보내기 (180s)" }));
  expect(onResend).not.toHaveBeenCalled();

  act(() => {
    jest.advanceTimersByTime(180_000);
  });

  const resendButton = await screen.findByRole("button", { name: "이메일 다시 보내기" });
  expect(resendButton).toBeEnabled();

  await user.click(resendButton);

  expect(onResend).toHaveBeenCalledTimes(1);
  expect(
    screen.getByRole("button", { name: /이메일 다시 보내기 \(180s\)/ }),
  ).toBeDisabled();
});
