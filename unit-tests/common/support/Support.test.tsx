import { render, screen } from "@testing-library/react";

import { Support } from "@/features/support/components/Support";

jest.mock("@/features/common/components/header/Header", () => ({ Header: () => null }));

describe("Support", () => {
  test("첫 렌더부터 챗봇 이용 한도와 고객지원 이동 링크를 표시한다", () => {
    render(<Support />);

    expect(screen.getByText("하루 최대 10회 무료 이용")).toBeInTheDocument();
    expect(screen.queryByText("무료 이용 한도 확인 중")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /챗봇 시작하기/ })).toHaveAttribute("href", "/support/chatbot");
    expect(screen.getByRole("link", { name: "1:1 문의하기" })).toHaveAttribute("href", "/support/inquiries");
  });
});
