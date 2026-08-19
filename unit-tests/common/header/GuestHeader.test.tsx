import { render, screen } from "@testing-library/react";

import { GuestHeader } from "@/features/common/components/header/GuestHeader";

jest.mock("@/features/common/theme/ThemeLogo", () => ({
  ThemeLogo: () => <span>Pairing 로고</span>,
}));

describe("GuestHeader", () => {
  it("회사 소개 링크를 노출하지 않고 비로그인 메뉴를 표시한다", () => {
    render(<GuestHeader />);

    expect(screen.queryByRole("link", { name: "회사 소개" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "클라이언트 등록" })).toHaveAttribute("href", "/signup/client");
    expect(screen.getByRole("link", { name: "프리랜서 등록" })).toHaveAttribute("href", "/signup/freelancer");
    expect(screen.getByRole("link", { name: "로그인" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "회원가입" })).toHaveAttribute("href", "/signup");
  });
});
