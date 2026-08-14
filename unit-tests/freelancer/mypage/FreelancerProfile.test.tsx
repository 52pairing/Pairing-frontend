import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FreelancerProfile } from "@/features/freelancer/mypage/components/FreelancerProfile";
import { getMatchingSettings, updateMatchingSettings } from "@/features/matching/services/matching";

jest.mock("@/features/auth/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({
    accountId: 1,
    email: "freelancer@example.com",
    role: "FREELANCER",
    name: "김프리",
    tempPassword: false,
  }),
}));
jest.mock("@/features/matching/services/matching", () => ({ getMatchingSettings: jest.fn(), updateMatchingSettings: jest.fn() }));

const mockedGetSettings = jest.mocked(getMatchingSettings);
const mockedUpdateSettings = jest.mocked(updateMatchingSettings);

describe("FreelancerProfile", () => {
  beforeEach(() => {
    mockedGetSettings.mockResolvedValue({ aiMatchingAgreed: true, matchingPaused: false, matchable: true, unmatchableReason: null });
    mockedUpdateSettings.mockResolvedValue({ aiMatchingAgreed: true, matchingPaused: true, matchable: false, unmatchableReason: "매칭을 재개해야 추천 대상에 포함됩니다." });
  });

  it("사이드바와 기본 정보를 서로 분리해 표시하고 비밀번호 폼을 펼친다", async () => {
    const user = userEvent.setup();
    render(<FreelancerProfile />);

    expect(
      screen.getByRole("navigation", { name: "프리랜서 마이페이지 메뉴" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "기본 정보" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /수정/ })).toHaveAttribute(
      "href",
      "/freelancer/mypage/profile/edit",
    );
    expect(screen.getAllByText("김프리")).toHaveLength(2);
    expect(screen.getByText("freelancer@example.com")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "변경하기" }));
    expect(screen.getByRole("list", { name: "비밀번호 변경 진행 단계" })).toBeInTheDocument();
  });

  it("AI 매칭 설정을 화면에서 켜고 끌 수 있다", async () => {
    const user = userEvent.setup();
    render(<FreelancerProfile />);

    const matchingSwitch = await screen.findByRole("switch", { name: "AI 매칭" });
    await waitFor(() => expect(matchingSwitch).toHaveAttribute("aria-checked", "true"));
    expect(matchingSwitch).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("AI 매칭 받는 중")).toBeInTheDocument();

    await user.click(matchingSwitch);

    await waitFor(() => expect(mockedUpdateSettings).toHaveBeenCalledWith({ aiMatchingAgreed: true, matchingPaused: true }));
    expect(matchingSwitch).toHaveAttribute("aria-checked", "false");
    expect(screen.getByText("AI 매칭 중지됨")).toBeInTheDocument();
  });

  it("추천 제외 사유를 표시하고 AI 매칭 동의를 철회한다", async () => {
    mockedGetSettings.mockResolvedValue({ aiMatchingAgreed: true, matchingPaused: false, matchable: false, unmatchableReason: "이력서를 완성해야 추천 대상에 포함됩니다." });
    mockedUpdateSettings.mockResolvedValue({ aiMatchingAgreed: false, matchingPaused: false, matchable: false, unmatchableReason: "AI 매칭에 동의해야 추천 대상에 포함됩니다." });
    const user = userEvent.setup();

    render(<FreelancerProfile />);

    expect(await screen.findByText("이력서를 완성해야 추천 대상에 포함됩니다.")).toBeInTheDocument();
    const agreementSwitch = screen.getByRole("switch", { name: "AI 매칭 활용 동의" });
    await user.click(agreementSwitch);

    await waitFor(() => expect(mockedUpdateSettings).toHaveBeenCalledWith({ aiMatchingAgreed: false, matchingPaused: false }));
    expect(agreementSwitch).toHaveAttribute("aria-checked", "false");
    expect(screen.getByText("AI 매칭에 동의해야 추천 대상에 포함됩니다.")).toBeInTheDocument();
  });

  it("동의하지 않은 상태에서는 일시 중지 스위치를 비활성화한다", async () => {
    mockedGetSettings.mockResolvedValue({ aiMatchingAgreed: false, matchingPaused: false, matchable: false, unmatchableReason: "AI 매칭에 동의해야 추천 대상에 포함됩니다." });

    render(<FreelancerProfile />);

    expect(await screen.findByText("AI 매칭에 동의해야 추천 대상에 포함됩니다.")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "AI 매칭" })).toBeDisabled();
    expect(screen.getByRole("switch", { name: "AI 매칭 활용 동의" })).toBeEnabled();
  });

  it("일시 중지 변경 시 동의값을 포함한 두 필드를 모두 전송한다", async () => {
    const user = userEvent.setup();
    render(<FreelancerProfile />);

    await user.click(await screen.findByRole("switch", { name: "AI 매칭" }));

    await waitFor(() => expect(mockedUpdateSettings).toHaveBeenCalledWith({ aiMatchingAgreed: true, matchingPaused: true }));
  });
});
