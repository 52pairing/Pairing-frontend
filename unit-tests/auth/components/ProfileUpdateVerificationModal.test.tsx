import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ProfileUpdateVerificationModal } from "@/features/auth/components/ProfileUpdateVerificationModal";
import { useEmailOtp } from "@/features/auth/hooks/useEmailOtp";

jest.mock("@/features/auth/hooks/useEmailOtp", () => ({ useEmailOtp: jest.fn() }));

const mockedUseEmailOtp = jest.mocked(useEmailOtp);

function otpState(overrides: Partial<ReturnType<typeof useEmailOtp>> = {}) {
  return {
    sent: false,
    verified: false,
    secondsLeft: 0,
    remainingSendCount: null,
    code: "",
    setCode: jest.fn(),
    error: null,
    isSending: false,
    isConfirming: false,
    reset: jest.fn(),
    handleSend: jest.fn(),
    handleVerify: jest.fn(),
    ...overrides,
  };
}

afterEach(() => jest.clearAllMocks());

it("발송 전이면 발송 버튼으로 인증코드 발송을 요청한다", async () => {
  const handleSend = jest.fn();
  mockedUseEmailOtp.mockReturnValue(otpState({ handleSend }));
  const user = userEvent.setup();

  render(
    <ProfileUpdateVerificationModal
      open
      email="user@pairing.com"
      onVerified={jest.fn()}
      onClose={jest.fn()}
    />,
  );

  await user.click(screen.getByRole("button", { name: "인증코드 발송" }));

  expect(handleSend).toHaveBeenCalledTimes(1);
});

it("인증 확인에 성공하면 상태를 초기화하고 onVerified를 호출한다", async () => {
  const handleVerify = jest.fn().mockResolvedValue(true);
  const reset = jest.fn();
  const onVerified = jest.fn();
  mockedUseEmailOtp.mockReturnValue(
    otpState({ sent: true, secondsLeft: 120, code: "123456", handleVerify, reset }),
  );
  const user = userEvent.setup();

  render(
    <ProfileUpdateVerificationModal
      open
      email="user@pairing.com"
      onVerified={onVerified}
      onClose={jest.fn()}
    />,
  );

  await user.click(screen.getByRole("button", { name: "인증 확인" }));

  expect(handleVerify).toHaveBeenCalledTimes(1);
  await waitFor(() => expect(onVerified).toHaveBeenCalledTimes(1));
  expect(reset).toHaveBeenCalledTimes(1);
});
