import { render, screen } from "@testing-library/react";

import { SignupCompleteScreen } from "@/features/auth/components/SignupCompleteScreen";

jest.mock("@/features/common/theme/ThemeLogo", () => ({
  ThemeLogo: () => <span>Pairing 로고</span>,
}));

it("헤더와 완료 안내, 기본 로그인 링크를 렌더링한다", () => {
  render(
    <SignupCompleteScreen
      title="클라이언트 회원가입이 완료되었습니다."
      description="이제 프로젝트를 등록해 보세요."
      primaryLabel="로그인으로 이동"
    />,
  );

  expect(screen.getByRole("link", { name: "Pairing 홈" })).toBeInTheDocument();
  expect(screen.getByText("클라이언트 회원가입이 완료되었습니다.")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "로그인으로 이동" })).toHaveAttribute("href", "/login");
  expect(screen.getByRole("link", { name: "홈으로 이동" })).toHaveAttribute("href", "/");
});

it("primaryHref를 지정하면 해당 경로로 연결한다", () => {
  render(
    <SignupCompleteScreen
      title="가입 완료"
      description="설명"
      primaryLabel="프리랜서 홈으로 이동"
      primaryHref="/freelancer"
    />,
  );

  expect(screen.getByRole("link", { name: "프리랜서 홈으로 이동" })).toHaveAttribute(
    "href",
    "/freelancer",
  );
});
