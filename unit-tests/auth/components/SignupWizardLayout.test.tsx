import { render, screen } from "@testing-library/react";

import { SignupWizardLayout } from "@/features/auth/components/SignupWizardLayout";

jest.mock("@/features/common/theme/ThemeLogo", () => ({
  ThemeLogo: () => <span>Pairing 로고</span>,
}));

it("헤더, 스텝퍼, children을 함께 렌더링한다", () => {
  render(
    <SignupWizardLayout title="클라이언트 회원가입" currentStep={2} labels={["약관", "정보", "완료"]}>
      <p>스텝 내용</p>
    </SignupWizardLayout>,
  );

  expect(screen.getByRole("link", { name: "Pairing 홈" })).toBeInTheDocument();
  expect(screen.getByText("클라이언트 회원가입")).toBeInTheDocument();
  expect(screen.getByText("약관")).toBeInTheDocument();
  expect(screen.getByText("정보")).toBeInTheDocument();
  expect(screen.getByText("완료")).toBeInTheDocument();
  expect(screen.getByText("스텝 내용")).toBeInTheDocument();
});
