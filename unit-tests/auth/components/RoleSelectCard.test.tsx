import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RoleSelectCard } from "@/features/auth/components/RoleSelectCard";
import { useSocialLoginStart } from "@/features/auth/hooks/useSocialLoginStart";

jest.mock("@/features/auth/hooks/useSocialLoginStart", () => ({
  useSocialLoginStart: jest.fn(),
}));

const mockedUseSocialLoginStart = jest.mocked(useSocialLoginStart);

const start = jest.fn();

beforeEach(() => {
  mockedUseSocialLoginStart.mockReturnValue({
    start,
    loadingProvider: null,
    error: "",
  });
});

afterEach(() => jest.clearAllMocks());

it("이메일 방법은 href로 이동하는 링크로 렌더링된다", () => {
  render(
    <RoleSelectCard
      href="/signup/freelancer"
      title="프리랜서로 가입"
      description="설명"
      icon={<span>icon</span>}
      iconBgClassName="bg-blue-100"
      methods={["email"]}
    />,
  );

  const link = screen.getByRole("link", { name: "이메일로 프리랜서로 가입 가입" });
  expect(link).toHaveAttribute("href", "/signup/freelancer");
});

it("소셜 방법 버튼을 클릭하면 useSocialLoginStart의 start를 호출한다", async () => {
  const user = userEvent.setup();
  render(
    <RoleSelectCard
      href="/signup/freelancer"
      title="프리랜서로 가입"
      description="설명"
      icon={<span>icon</span>}
      iconBgClassName="bg-blue-100"
      methods={["kakao", "google"]}
    />,
  );

  await user.click(screen.getByRole("button", { name: "카카오로 프리랜서 가입" }));

  expect(start).toHaveBeenCalledWith("kakao");
});

it("로딩 중인 provider가 있으면 안내 문구가 바뀌고 버튼이 비활성화된다", () => {
  mockedUseSocialLoginStart.mockReturnValue({
    start,
    loadingProvider: "kakao",
    error: "",
  });

  render(
    <RoleSelectCard
      href="/signup/freelancer"
      title="프리랜서로 가입"
      description="설명"
      icon={<span>icon</span>}
      iconBgClassName="bg-blue-100"
      methods={["kakao"]}
    />,
  );

  expect(screen.getByText("카카오 인증 화면으로 이동 중입니다.")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "카카오로 프리랜서 가입" })).toBeDisabled();
});

it("에러가 있으면 에러 메시지를 보여준다", () => {
  mockedUseSocialLoginStart.mockReturnValue({
    start,
    loadingProvider: null,
    error: "소셜 로그인에 실패했습니다.",
  });

  render(
    <RoleSelectCard
      href="/signup/freelancer"
      title="프리랜서로 가입"
      description="설명"
      icon={<span>icon</span>}
      iconBgClassName="bg-blue-100"
      methods={["kakao"]}
    />,
  );

  expect(screen.getByText("소셜 로그인에 실패했습니다.")).toBeInTheDocument();
});
