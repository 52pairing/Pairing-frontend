import { render, screen } from "@testing-library/react";

import { InquiryComplete } from "@/features/support/components/InquiryComplete";

jest.mock("@/features/common/components/header/Header", () => ({ Header: () => null }));

describe("InquiryComplete", () => {
  test("접수 완료 안내와 문의 목록 이동 링크를 표시한다", () => {
    render(<InquiryComplete />);

    expect(screen.getByRole("heading", { name: "문의가 접수되었습니다." })).toBeInTheDocument();
    expect(screen.getByText("관리자가 문의 내용을 확인한 후 답변을 등록합니다.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "문의 내역 확인" })).toHaveAttribute("href", "/support/inquiries");
    expect(screen.getByRole("link", { name: "목록으로 이동" })).toHaveAttribute("href", "/support/inquiries");
  });
});
