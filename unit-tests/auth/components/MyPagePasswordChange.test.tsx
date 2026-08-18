import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MyPagePasswordChange } from "@/features/auth/components/MyPagePasswordChange";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useEmailOtp } from "@/features/auth/hooks/useEmailOtp";
import { changePassword } from "@/features/auth/services/changePassword";
import type { CurrentUserResponse } from "@/features/auth/types";

jest.mock("@/features/auth/hooks/useCurrentUser", () => ({ useCurrentUser: jest.fn() }));
jest.mock("@/features/auth/hooks/useEmailOtp", () => ({ useEmailOtp: jest.fn() }));
jest.mock("@/features/auth/services/changePassword", () => ({ changePassword: jest.fn() }));

const mockedUseCurrentUser = jest.mocked(useCurrentUser);
const mockedUseEmailOtp = jest.mocked(useEmailOtp);
const mockedChangePassword = jest.mocked(changePassword);

const user: CurrentUserResponse = {
  accountId: 1,
  email: "user@pairing.com",
  role: "FREELANCER",
  name: "김프리",
  companyName: null,
  tempPassword: false,
};

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

it("임시 비밀번호 사용자는 이메일 인증 단계 없이 비밀번호 설정 화면으로 시작한다", () => {
  mockedUseCurrentUser.mockReturnValue({ ...user, tempPassword: true });
  mockedUseEmailOtp.mockReturnValue(otpState());

  render(<MyPagePasswordChange role="FREELANCER" embedded />);

  expect(screen.getByLabelText("새 비밀번호")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "인증 코드 발송" })).not.toBeInTheDocument();
});

it("이메일 인증 완료 후 비밀번호 변경에 성공하면 완료 화면을 보여준다", async () => {
  mockedUseCurrentUser.mockReturnValue({ ...user, tempPassword: false });
  mockedUseEmailOtp.mockReturnValue(otpState({ verified: true, sent: true }));
  mockedChangePassword.mockResolvedValue(null);
  const testUser = userEvent.setup();

  render(<MyPagePasswordChange role="FREELANCER" embedded />);

  await testUser.click(screen.getByRole("button", { name: "다음" }));
  await testUser.type(screen.getByLabelText("새 비밀번호"), "Passw0rd!");
  await testUser.type(screen.getByLabelText("새 비밀번호 확인"), "Passw0rd!");
  await testUser.click(screen.getByRole("button", { name: "변경 완료" }));

  expect(await screen.findByText("비밀번호가 변경되었습니다.")).toBeInTheDocument();
  expect(mockedChangePassword).toHaveBeenCalledWith({
    newPassword: "Passw0rd!",
    newPasswordConfirm: "Passw0rd!",
  });
});
