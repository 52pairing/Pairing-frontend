import { render, screen } from "@testing-library/react";

import { AuthHeader } from "@/features/auth/components/AuthHeader";

jest.mock("@/features/common/theme/ThemeLogo", () => ({
  ThemeLogo: () => <span>Pairing 로고</span>,
}));

it("홈으로 이동하는 로고 링크를 보여준다", () => {
  render(<AuthHeader />);

  const link = screen.getByRole("link", { name: "Pairing 홈" });
  expect(link).toHaveAttribute("href", "/");
  expect(screen.getByText("Pairing 로고")).toBeInTheDocument();
});
