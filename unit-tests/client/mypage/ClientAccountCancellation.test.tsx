import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ClientAccountCancellation } from "@/features/client/mypage/components/ClientAccountCancellation";
import {
  getWithdrawalEligibility,
  withdrawAccount,
} from "@/features/common/services/withdrawal";
import { ApiException } from "@/lib/api";

jest.mock("@/features/common/services/withdrawal", () => ({
  getWithdrawalEligibility: jest.fn(),
  withdrawAccount: jest.fn(),
}));

const mockGetEligibility = jest.mocked(getWithdrawalEligibility);
const mockWithdrawAccount = jest.mocked(withdrawAccount);

const fillAndSubmit = async (
  user: ReturnType<typeof userEvent.setup>,
  { reason }: { reason?: string } = {},
) => {
  await user.click(screen.getByRole("checkbox"));
  if (reason) {
    await user.type(screen.getByLabelText(/탈퇴 사유/), reason);
  }
  await user.type(screen.getByLabelText(/탈퇴하겠습니다/), "탈퇴하겠습니다");
  await user.click(screen.getByRole("button", { name: "회원 탈퇴" }));
};

describe("ClientAccountCancellation", () => {
  const originalReplace = window.location.replace;

  beforeEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, replace: jest.fn() },
    });
  });

  afterAll(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, replace: originalReplace },
    });
  });

  it("탈퇴할 수 없는 상태면 차단 사유를 나열하고 탈퇴 신청을 막는다", async () => {
    mockGetEligibility.mockResolvedValue({
      withdrawable: false,
      blockers: [
        { type: "PROJECT", label: "진행 중인 프로젝트", count: 2, linkUrl: "/my-projects" },
      ],
    });

    render(<ClientAccountCancellation />);

    expect(await screen.findByText("현재 탈퇴할 수 없는 상태입니다.")).toBeInTheDocument();
    expect(screen.getByText(/진행 중인 프로젝트 2건/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "확인하기" })).toHaveAttribute("href", "/my-projects");
    expect(screen.getByRole("button", { name: "회원 탈퇴 신청" })).toBeDisabled();
  });

  it("동의와 확인 문구를 입력하면 탈퇴를 요청하고 완료 모달을 보여준다", async () => {
    mockGetEligibility.mockResolvedValue({ withdrawable: true, blockers: [] });
    mockWithdrawAccount.mockResolvedValue(null);
    const user = userEvent.setup();

    render(<ClientAccountCancellation />);
    await screen.findByRole("button", { name: "회원 탈퇴" });

    await fillAndSubmit(user, { reason: "서비스를 더 이용하지 않습니다." });

    await waitFor(() =>
      expect(mockWithdrawAccount).toHaveBeenCalledWith({
        agreed: true,
        confirmText: "탈퇴하겠습니다",
        reason: "서비스를 더 이용하지 않습니다.",
      }),
    );
    expect(await screen.findByText("탈퇴가 완료되었습니다")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "확인" }));
    expect(window.location.replace).toHaveBeenCalledWith("/");
  });

  it("확인 문구가 서버에서 거절되면 오류를 보여주고 입력값을 유지한다", async () => {
    mockGetEligibility.mockResolvedValue({ withdrawable: true, blockers: [] });
    mockWithdrawAccount.mockRejectedValue(
      new ApiException("AC_009", "확인 문구가 일치하지 않습니다.", 400),
    );
    const user = userEvent.setup();

    render(<ClientAccountCancellation />);
    await screen.findByRole("button", { name: "회원 탈퇴" });
    await fillAndSubmit(user);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "확인 문구가 일치하지 않습니다. 다시 입력해 주세요.",
    );
    expect(screen.getByLabelText(/탈퇴하겠습니다/)).toHaveValue("탈퇴하겠습니다");
  });

  it("진행 중인 프로젝트로 탈퇴가 거절되면 탈퇴 가능 여부를 다시 조회한다", async () => {
    mockGetEligibility
      .mockResolvedValueOnce({ withdrawable: true, blockers: [] })
      .mockResolvedValueOnce({
        withdrawable: false,
        blockers: [
          { type: "PROJECT", label: "진행 중인 프로젝트", count: 1, linkUrl: "/my-projects" },
        ],
      });
    mockWithdrawAccount.mockRejectedValue(
      new ApiException("AC_010", "진행 중인 프로젝트가 있습니다.", 409),
    );
    const user = userEvent.setup();

    render(<ClientAccountCancellation />);
    await screen.findByRole("button", { name: "회원 탈퇴" });
    await fillAndSubmit(user);

    expect(await screen.findByText("현재 탈퇴할 수 없는 상태입니다.")).toBeInTheDocument();
    expect(mockGetEligibility).toHaveBeenCalledTimes(2);
  });

  it("미납 수수료가 있으면 건수 없이 안내만 표시한다", async () => {
    mockGetEligibility.mockResolvedValue({
      withdrawable: false,
      blockers: [
        {
          type: "UNPAID_SETTLEMENT",
          label: "미납 수수료",
          count: 1,
          linkUrl: "/mypage/settlements",
        },
      ],
    });

    render(<ClientAccountCancellation />);

    const item = await screen.findByText(/미납 수수료/);
    expect(item.textContent).not.toMatch(/\d건/);
  });

  it("이미 탈퇴한 계정이면 완료 모달을 보여준다", async () => {
    mockGetEligibility.mockResolvedValue({ withdrawable: true, blockers: [] });
    mockWithdrawAccount.mockRejectedValue(
      new ApiException("AC_008", "이미 탈퇴한 계정입니다.", 409),
    );
    const user = userEvent.setup();

    render(<ClientAccountCancellation />);
    await screen.findByRole("button", { name: "회원 탈퇴" });
    await fillAndSubmit(user);

    expect(await screen.findByText("탈퇴가 완료되었습니다")).toBeInTheDocument();
  });
});
