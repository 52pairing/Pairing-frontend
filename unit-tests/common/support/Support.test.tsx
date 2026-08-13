import { render, screen } from "@testing-library/react";

import { Support } from "@/features/support/components/Support";
import { getChatbotQuota } from "@/features/support/services/support";
import { chatbotQuota } from "./chatbotFixtures";

jest.mock("@/features/common/components/header/Header", () => ({ Header: () => null }));
jest.mock("@/features/support/services/support", () => ({ getChatbotQuota: jest.fn() }));

const mockGetQuota = jest.mocked(getChatbotQuota);

describe("Support", () => {
  test("챗봇 이용 한도와 고객지원 이동 링크를 표시한다", async () => {
    mockGetQuota.mockResolvedValue(chatbotQuota);
    render(<Support />);

    expect(screen.getByText("무료 이용 한도 확인 중")).toBeInTheDocument();
    expect(await screen.findByText("하루 최대 10회 무료 이용")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /챗봇 시작하기/ })).toHaveAttribute("href", "/support/chatbot");
    expect(screen.getByRole("link", { name: "1:1 문의하기" })).toHaveAttribute("href", "/support/inquiries");
  });

  test("이용 한도 조회 실패 시 대체 안내를 표시한다", async () => {
    mockGetQuota.mockRejectedValue(new Error("failure"));
    render(<Support />);
    expect(await screen.findByText("무료 이용 한도 확인 필요")).toBeInTheDocument();
  });
});
