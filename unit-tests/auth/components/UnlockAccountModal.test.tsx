import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { UnlockAccountModal } from "@/features/auth/components/UnlockAccountModal";
import { sendVerificationCode } from "@/features/auth/services/emailVerification";
import { unlockAccount } from "@/features/auth/services/unlockAccount";
import { ApiException } from "@/lib/api";

jest.mock("@/features/auth/services/emailVerification", () => ({
  sendVerificationCode: jest.fn(),
}));
jest.mock("@/features/auth/services/unlockAccount", () => ({ unlockAccount: jest.fn() }));

const mockedSend = jest.mocked(sendVerificationCode);
const mockedUnlock = jest.mocked(unlockAccount);
const futureIso = () => new Date(Date.now() + 300_000).toISOString();

afterEach(() => jest.clearAllMocks());

it("인증코드 발송에 성공하면 입력창과 남은 발송 횟수를 보여준다", async () => {
  mockedSend.mockResolvedValue({ expiresAt: futureIso(), remainingSendCount: 4 });
  const user = userEvent.setup();

  render(
    <UnlockAccountModal
      open
      email="user@pairing.com"
      role="CLIENT"
      onClose={jest.fn()}
      onUnlocked={jest.fn()}
    />,
  );
  await user.click(screen.getByRole("button", { name: "인증코드 받기" }));

  expect(await screen.findByPlaceholderText("인증코드 6자리")).toBeInTheDocument();
  expect(screen.getByText("남은 발송 횟수: 4회")).toBeInTheDocument();
  expect(mockedSend).toHaveBeenCalledWith({ email: "user@pairing.com", purpose: "UNLOCK" });
});

it("인증코드 확인에 성공하면 onUnlocked를 호출한다", async () => {
  mockedSend.mockResolvedValue({ expiresAt: futureIso(), remainingSendCount: 4 });
  mockedUnlock.mockResolvedValue(null);
  const onUnlocked = jest.fn();
  const user = userEvent.setup();

  render(
    <UnlockAccountModal
      open
      email="user@pairing.com"
      role="CLIENT"
      onClose={jest.fn()}
      onUnlocked={onUnlocked}
    />,
  );
  await user.click(screen.getByRole("button", { name: "인증코드 받기" }));
  await user.type(await screen.findByPlaceholderText("인증코드 6자리"), "123456");
  await user.click(screen.getByRole("button", { name: "확인" }));

  await waitFor(() => expect(onUnlocked).toHaveBeenCalledTimes(1));
  expect(mockedUnlock).toHaveBeenCalledWith({
    email: "user@pairing.com",
    role: "CLIENT",
    code: "123456",
  });
});

it("발송 횟수를 초과하면 발송 버튼이 비활성화된다", async () => {
  mockedSend.mockRejectedValue(
    new ApiException("AU_003", "발송 횟수를 초과했습니다.", 429),
  );
  const user = userEvent.setup();

  render(
    <UnlockAccountModal
      open
      email="user@pairing.com"
      role="CLIENT"
      onClose={jest.fn()}
      onUnlocked={jest.fn()}
    />,
  );
  await user.click(screen.getByRole("button", { name: "인증코드 받기" }));

  expect(await screen.findByText("발송 횟수를 초과했습니다.")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "인증코드 받기" })).toBeDisabled();
});
