import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FreelancerProfile } from "@/features/freelancer/mypage/components/FreelancerProfile";

jest.mock("@/features/auth/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({
    accountId: 1,
    email: "freelancer@example.com",
    role: "FREELANCER",
    name: "김프리",
    tempPassword: false,
  }),
}));

describe("FreelancerProfile", () => {
  it("사이드바와 기본 정보를 서로 분리해 표시한다", () => {
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
    expect(screen.getByRole("link", { name: "변경하기" })).toHaveAttribute(
      "href",
      "/freelancer/mypage/password",
    );
  });

  it("AI 매칭 설정을 화면에서 켜고 끌 수 있다", async () => {
    const user = userEvent.setup();
    render(<FreelancerProfile />);

    const matchingSwitch = screen.getByRole("switch", { name: "AI 매칭" });
    expect(matchingSwitch).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("AI 매칭 받는 중")).toBeInTheDocument();

    await user.click(matchingSwitch);

    expect(matchingSwitch).toHaveAttribute("aria-checked", "false");
    expect(screen.getByText("AI 매칭 중지됨")).toBeInTheDocument();
  });
});
