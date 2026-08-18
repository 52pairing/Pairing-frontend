import { render, screen } from "@testing-library/react";

import { SignupStepper } from "@/features/auth/components/SignupStepper";

const LABELS = ["약관 동의", "정보 입력", "가입 완료"] as const;

describe("SignupStepper", () => {
  it("제목과 모든 스텝 라벨을 렌더링한다", () => {
    render(<SignupStepper title="클라이언트 회원가입" currentStep={1} labels={LABELS} />);

    expect(screen.getByText("클라이언트 회원가입")).toBeInTheDocument();
    LABELS.forEach((label) => expect(screen.getByText(label)).toBeInTheDocument());
  });

  it("현재 단계 이전은 체크 아이콘으로, 이후는 번호로 표시한다", () => {
    const { container } = render(
      <SignupStepper title="타이틀" currentStep={2} labels={LABELS} />,
    );

    // 1번 스텝(완료)은 숫자 대신 체크 아이콘으로 대체된다.
    expect(screen.queryByText("1")).not.toBeInTheDocument();
    expect(container.querySelectorAll("img")).toHaveLength(1);

    // 현재 단계(2)와 다음 단계(3)는 숫자를 그대로 보여준다.
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("첫 단계가 진행 중일 때는 완료 처리된 스텝이 없다", () => {
    const { container } = render(
      <SignupStepper title="타이틀" currentStep={1} labels={LABELS} />,
    );

    expect(container.querySelectorAll("img")).toHaveLength(0);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("모든 단계를 지나면 마지막 단계까지 체크 아이콘으로 표시한다", () => {
    const { container } = render(
      <SignupStepper title="타이틀" currentStep={4} labels={LABELS} />,
    );

    expect(container.querySelectorAll("img")).toHaveLength(LABELS.length);
  });
});
