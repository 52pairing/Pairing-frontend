import { render, screen } from "@testing-library/react";

import { SignupComplete } from "@/features/auth/components/SignupComplete";

it("제목, 설명, 두 링크를 각각의 href로 렌더링한다", () => {
  render(
    <SignupComplete
      title="가입이 완료되었습니다."
      description="이제 서비스를 이용해 보세요."
      primaryHref="/login"
      primaryLabel="로그인으로 이동"
      secondaryHref="/"
      secondaryLabel="홈으로 이동"
    />,
  );

  expect(screen.getByText("가입이 완료되었습니다.")).toBeInTheDocument();
  expect(screen.getByText("이제 서비스를 이용해 보세요.")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "로그인으로 이동" })).toHaveAttribute("href", "/login");
  expect(screen.getByRole("link", { name: "홈으로 이동" })).toHaveAttribute("href", "/");
});
