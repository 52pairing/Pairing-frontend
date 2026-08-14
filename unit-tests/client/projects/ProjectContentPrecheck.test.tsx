import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ProjectContentPrecheck } from "@/features/client/projects/components/ProjectContentPrecheck";
import { runProjectContentPrecheck } from "@/features/client/projects/utils/projectContentPrecheck";

jest.mock("@/features/client/projects/utils/projectContentPrecheck", () => ({
  runProjectContentPrecheck: jest.fn(),
}));

const mockRunPrecheck = jest.mocked(runProjectContentPrecheck);

describe("ProjectContentPrecheck", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockRunPrecheck.mockReturnValue({ findings: [], checkedAt: 1 });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test("점검 전에는 외부 미전송 안내를 표시한다", () => {
    render(<ProjectContentPrecheck mainTask="주문 API 개발" />);

    expect(screen.getByRole("button", { name: "작성 내용 점검하기" })).toBeEnabled();
    expect(screen.getByText(/외부 분석 서비스로 전송하지 않습니다/)).toBeInTheDocument();
  });

  test("점검 중 중복 클릭을 막고 완료 결과를 표시한다", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<ProjectContentPrecheck mainTask="주문 API를 개발합니다." />);

    await user.click(screen.getByRole("button", { name: "작성 내용 점검하기" }));
    expect(screen.getByRole("button", { name: "점검 중..." })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("점검하고 있습니다");

    act(() => jest.advanceTimersByTime(100));

    expect(mockRunPrecheck).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "다시 점검하기" })).toBeEnabled();
    expect(screen.getByRole("status")).toHaveTextContent("점검을 완료했습니다");
  });

  test("개인정보 경고는 마스킹된 값과 필드 질문을 표시한다", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    mockRunPrecheck.mockReturnValue({
      checkedAt: 1,
      findings: [
        {
          id: "privacy-mainTask-email-0",
          kind: "privacy",
          field: "mainTask",
          title: "주요 업무에서 이메일 주소 후보를 발견했습니다.",
          description: "개인정보를 확인해 주세요.",
          maskedValue: "de***@example.com",
          questions: ["별도 안전한 경로로 전달할 수 있나요?"],
        },
      ],
    });
    render(<ProjectContentPrecheck mainTask="연락처 포함" />);

    await user.click(screen.getByRole("button", { name: "작성 내용 점검하기" }));
    act(() => jest.advanceTimersByTime(100));

    expect(screen.getByText("de***@example.com", { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/별도 안전한 경로/)).toBeInTheDocument();
  });

  test("규칙 실행 실패 시 건너뛰기 안내 후 다시 시도할 수 있다", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    mockRunPrecheck.mockImplementation(() => {
      throw new Error("rule failure");
    });
    render(<ProjectContentPrecheck mainTask="주문 API 개발" />);

    await user.click(screen.getByRole("button", { name: "작성 내용 점검하기" }));
    act(() => jest.advanceTimersByTime(100));

    expect(screen.getByRole("alert")).toHaveTextContent("등록에는 영향이 없습니다");
    expect(screen.getByRole("button", { name: "다시 점검하기" })).toBeEnabled();
  });
});
