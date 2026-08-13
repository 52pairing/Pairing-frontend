import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { SupportChatbot } from "@/features/support/components/SupportChatbot";
import {
  getChatbotMessages,
  getChatbotQuota,
  getSuggestedQuestions,
  sendChatbotQuestion,
} from "@/features/support/services/support";
import { ApiException } from "@/lib/api";
import {
  chatbotHistory,
  chatbotQuota,
  chatbotResponse,
} from "./chatbotFixtures";

jest.mock("@/features/common/components/header/Header", () => ({
  Header: () => null,
}));
jest.mock("@/features/auth/hooks/useCurrentUser", () => ({
  useCurrentUser: jest.fn(),
}));
jest.mock("@/features/support/services/support", () => ({
  getChatbotMessages: jest.fn(),
  getChatbotQuota: jest.fn(),
  getSuggestedQuestions: jest.fn(),
  sendChatbotQuestion: jest.fn(),
}));

const mockUseCurrentUser = jest.mocked(useCurrentUser);
const mockGetMessages = jest.mocked(getChatbotMessages);
const mockGetQuota = jest.mocked(getChatbotQuota);
const mockGetSuggestions = jest.mocked(getSuggestedQuestions);
const mockSendQuestion = jest.mocked(sendChatbotQuestion);

const setInitialSuccess = () => {
  mockGetSuggestions.mockResolvedValue([
    "프로젝트 등록 방법을 알려주세요.",
    "수수료 정책을 알려주세요.",
  ]);
  mockGetQuota.mockResolvedValue(chatbotQuota);
  mockGetMessages.mockResolvedValue([]);
};

const getReadyInput = async () => {
  const input = screen.getByLabelText("챗봇 질문");
  await waitFor(() => expect(input).toBeEnabled());
  return input;
};

describe("SupportChatbot", () => {
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: jest.fn(),
    });
  });

  beforeEach(() => {
    setInitialSuccess();
    mockUseCurrentUser.mockReturnValue({ role: "CLIENT" } as ReturnType<typeof useCurrentUser>);
  });

  test("초기 데이터를 조회하고 추천 질문과 잔여 횟수를 표시한다", async () => {
    render(<SupportChatbot />);

    expect(screen.getByRole("status")).toHaveTextContent("오늘의 대화를 불러오고 있습니다.");
    expect(await screen.findByRole("button", { name: "프로젝트 등록 방법을 알려주세요." })).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("/ 10회")).toBeInTheDocument();
    expect(mockGetSuggestions).toHaveBeenCalledTimes(1);
    expect(mockGetQuota).toHaveBeenCalledTimes(1);
    expect(mockGetMessages).toHaveBeenCalledTimes(1);
  });

  test("추천 질문을 선택하면 입력창에 반영한다", async () => {
    const user = userEvent.setup();
    render(<SupportChatbot />);
    const suggestion = await screen.findByRole("button", {
      name: "프로젝트 등록 방법을 알려주세요.",
    });

    await user.click(suggestion);

    expect(screen.getByLabelText("챗봇 질문")).toHaveValue(
      "프로젝트 등록 방법을 알려주세요.",
    );
  });

  test("첫 질문을 sessionId 없이 전송하고 응답과 액션을 표시한다", async () => {
    const user = userEvent.setup();
    mockSendQuestion.mockResolvedValue(chatbotResponse());
    render(<SupportChatbot />);
    const input = await getReadyInput();

    await user.type(input, "  프로젝트는 어떻게 등록하나요?  ");
    await user.click(screen.getByRole("button", { name: "질문 보내기" }));

    expect(mockSendQuestion).toHaveBeenCalledWith({
      question: "프로젝트는 어떻게 등록하나요?",
      sessionId: null,
    });
    expect(await screen.findByText("프로젝트 등록 화면에서 정보를 입력해 주세요.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "프로젝트 등록하기" })).toHaveAttribute(
      "href",
      "/client/projects/new",
    );
    expect(input).toHaveValue("");
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  test("복원한 마지막 대화의 sessionId로 후속 질문을 전송한다", async () => {
    const user = userEvent.setup();
    mockGetMessages.mockResolvedValue(chatbotHistory);
    mockSendQuestion.mockResolvedValue(
      chatbotResponse({ question: "후속 질문", actions: [] }),
    );
    render(<SupportChatbot />);
    expect(await screen.findByText("내 계약 메뉴에서 확인할 수 있습니다.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "내 계약 보기" })).toHaveAttribute(
      "href",
      "/client/contracts",
    );

    await user.type(await getReadyInput(), "후속 질문");
    await user.click(screen.getByRole("button", { name: "질문 보내기" }));

    expect(mockSendQuestion).toHaveBeenCalledWith({
      question: "후속 질문",
      sessionId: 40,
    });
  });

  test("질문 전송 중 사용자 질문과 답변 준비 상태를 표시하고 중복 제출을 막는다", async () => {
    const user = userEvent.setup();
    mockSendQuestion.mockReturnValue(new Promise(() => undefined));
    render(<SupportChatbot />);
    const input = await getReadyInput();
    await user.type(input, "계약 질문");
    await user.click(screen.getByRole("button", { name: "질문 보내기" }));

    expect(screen.getByText("계약 질문")).toBeInTheDocument();
    expect(screen.getByText("답변을 준비하고 있습니다...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "질문 보내기" })).toBeDisabled();
    expect(mockSendQuestion).toHaveBeenCalledTimes(1);
  });

  test("세션 오류가 발생하면 sessionId를 초기화해 한 번 재시도한다", async () => {
    const user = userEvent.setup();
    mockGetMessages.mockResolvedValue(chatbotHistory);
    mockSendQuestion
      .mockRejectedValueOnce(new ApiException("CB_001", "session", 400))
      .mockResolvedValueOnce(chatbotResponse({ question: "재시도 질문" }));
    render(<SupportChatbot />);
    await screen.findByText("내 계약 메뉴에서 확인할 수 있습니다.");

    await user.type(await getReadyInput(), "재시도 질문");
    await user.click(screen.getByRole("button", { name: "질문 보내기" }));

    await waitFor(() => expect(mockSendQuestion).toHaveBeenCalledTimes(2));
    expect(mockSendQuestion).toHaveBeenNthCalledWith(1, {
      question: "재시도 질문",
      sessionId: 40,
    });
    expect(mockSendQuestion).toHaveBeenNthCalledWith(2, {
      question: "재시도 질문",
      sessionId: null,
    });
  });

  test("CB_003 오류 시 횟수를 소진 처리하고 질문 기능을 차단한다", async () => {
    const user = userEvent.setup();
    mockSendQuestion.mockRejectedValue(
      new ApiException("CB_003", "quota", 429),
    );
    render(<SupportChatbot />);
    const input = await getReadyInput();
    await user.type(input, "한도 질문");
    await user.click(screen.getByRole("button", { name: "질문 보내기" }));

    expect(
      await screen.findByText("오늘의 AI 상담 횟수를 모두 사용했습니다."),
    ).toBeInTheDocument();
    expect(input).toBeDisabled();
    expect(screen.getByRole("link", { name: "1:1 문의하기" })).toHaveAttribute(
      "href",
      "/support/inquiries",
    );
  });

  test("CB_004 오류 시 횟수를 유지하고 AI 장애 및 문의 링크를 표시한다", async () => {
    const user = userEvent.setup();
    mockSendQuestion.mockRejectedValue(
      new ApiException("CB_004", "ai", 502),
    );
    render(<SupportChatbot />);
    const input = await getReadyInput();
    await user.type(input, "AI 질문");
    await user.click(screen.getByRole("button", { name: "질문 보내기" }));

    expect(
      await screen.findByText(
        "AI 상담이 일시적으로 원활하지 않습니다. 사용 횟수는 차감되지 않았습니다.",
      ),
    ).toBeInTheDocument();
    expect(input).toHaveValue("AI 질문");
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "1:1 문의하기" })).toHaveAttribute(
      "href",
      "/support/inquiries",
    );
  });

  test("초기 조회 실패 시 오류와 재시도를 제공한다", async () => {
    const user = userEvent.setup();
    mockGetQuota.mockRejectedValueOnce(new Error("failure"));
    render(<SupportChatbot />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "챗봇 정보를 불러오지 못했습니다.",
    );
    expect(screen.getByLabelText("챗봇 질문")).toBeDisabled();

    setInitialSuccess();
    await user.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(
      await screen.findByRole("button", {
        name: "프로젝트 등록 방법을 알려주세요.",
      }),
    ).toBeInTheDocument();
    expect(mockGetQuota).toHaveBeenCalledTimes(2);
  });

  test("초기 잔여 횟수가 0이면 입력과 추천 질문을 비활성화한다", async () => {
    mockGetQuota.mockResolvedValue({
      ...chatbotQuota,
      usedCount: 10,
      remainingCount: 0,
    });
    render(<SupportChatbot />);

    const suggestion = await screen.findByRole("button", {
      name: "프로젝트 등록 방법을 알려주세요.",
    });
    expect(suggestion).toBeDisabled();
    expect(screen.getByLabelText("챗봇 질문")).toBeDisabled();
    expect(screen.getByText("FAQ 챗봇은 사용자별로 하루 최대 10회까지 이용할 수 있습니다.")).toBeInTheDocument();
  });
});
