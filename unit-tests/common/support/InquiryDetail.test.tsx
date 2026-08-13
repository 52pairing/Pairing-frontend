import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { InquiryDetail } from "@/features/support/components/InquiryDetail";
import { getInquiry } from "@/features/support/services/support";
import { ApiException } from "@/lib/api";
import { answeredInquiry, pendingInquiry } from "./fixtures";

let inquiryId = "1";

jest.mock("next/navigation", () => ({ useParams: () => ({ inquiryId }) }));
jest.mock("@/features/common/components/header/Header", () => ({ Header: () => null }));
jest.mock("@/features/support/services/support", () => ({ getInquiry: jest.fn() }));

const mockGetInquiry = jest.mocked(getInquiry);

describe("InquiryDetail", () => {
  beforeEach(() => {
    inquiryId = "1";
    mockGetInquiry.mockResolvedValue(pendingInquiry);
  });

  test("대기 중 문의 내용과 첨부파일을 표시한다", async () => {
    render(<InquiryDetail />);
    expect(screen.getByRole("status")).toHaveTextContent("문의 내용을 불러오고 있습니다.");
    expect(await screen.findByRole("heading", { name: "계약 진행 문의" })).toBeInTheDocument();
    expect(screen.getByText("대기 중")).toBeInTheDocument();
    expect(screen.getByText("관리자가 문의 내용을 확인하고 있습니다.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /화면.png/ })).toHaveAttribute("href", "https://example.com/screen.png");
    expect(mockGetInquiry).toHaveBeenCalledWith(1);
  });

  test("답변 완료 문의의 답변자와 답변 내용을 표시한다", async () => {
    mockGetInquiry.mockResolvedValue(answeredInquiry);
    render(<InquiryDetail />);
    expect(await screen.findByText("고객지원 담당자")).toBeInTheDocument();
    expect(screen.getByText("계약 금액에 따라 수수료가 적용됩니다.")).toBeInTheDocument();
    expect(screen.getByText("답변 완료")).toBeInTheDocument();
  });

  test.each([
    ["IQ_001", "존재하지 않는 문의입니다."],
    ["IQ_002", "본인이 작성한 문의만 확인할 수 있습니다."],
  ])("%s 오류를 사용자 안내로 변환한다", async (code, message) => {
    mockGetInquiry.mockRejectedValue(new ApiException(code, "error", 404));
    render(<InquiryDetail />);
    expect(await screen.findByRole("alert")).toHaveTextContent(message);
  });

  test("조회 실패 후 다시 시도할 수 있다", async () => {
    const user = userEvent.setup();
    mockGetInquiry.mockRejectedValueOnce(new Error("failure"));
    render(<InquiryDetail />);
    expect(await screen.findByRole("alert")).toHaveTextContent("문의 내용을 불러오지 못했습니다.");

    mockGetInquiry.mockResolvedValue(pendingInquiry);
    await user.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(await screen.findByRole("heading", { name: "계약 진행 문의" })).toBeInTheDocument();
  });

  test("잘못된 문의 번호는 API를 호출하지 않고 안내한다", () => {
    inquiryId = "invalid";
    render(<InquiryDetail />);
    expect(screen.getByRole("alert")).toHaveTextContent("올바르지 않은 문의 번호입니다.");
    expect(screen.queryByRole("button", { name: "다시 시도" })).not.toBeInTheDocument();
    expect(mockGetInquiry).not.toHaveBeenCalled();
  });
});
