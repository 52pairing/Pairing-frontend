import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AccountLockedAlert } from "@/features/auth/components/AccountLockedAlert";

it("이메일 인증하기 버튼을 클릭하면 onVerifyEmail이 호출된다", async () => {
  const user = userEvent.setup();
  const onVerifyEmail = jest.fn();
  render(<AccountLockedAlert onVerifyEmail={onVerifyEmail} />);

  await user.click(screen.getByRole("button", { name: "이메일 인증하기" }));

  expect(onVerifyEmail).toHaveBeenCalledTimes(1);
});
