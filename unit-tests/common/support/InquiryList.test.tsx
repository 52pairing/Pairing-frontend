import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { InquiryList } from "@/features/support/components/InquiryList";
import { getMyInquiries } from "@/features/support/services/support";
import { inquiryPage } from "./fixtures";

jest.mock("@/features/support/services/support", () => ({ getMyInquiries: jest.fn() }));
jest.mock("@/features/common/components/header/Header", () => ({ Header: () => null }));

const mockGetMyInquiries = jest.mocked(getMyInquiries);

describe("InquiryList", () => {
  beforeEach(() => mockGetMyInquiries.mockResolvedValue(inquiryPage()));

  test("전체 문의를 조회하고 상태별 목록 정보를 표시한다", async () => {
    render(<InquiryList />);

    expect(screen.getByRole("status")).toHaveTextContent("문의 목록을 불러오고 있습니다.");
    expect(await screen.findByText("계약 진행 문의")).toBeInTheDocument();
    expect(screen.getByText("수수료 문의")).toBeInTheDocument();
    expect(screen.getByText("답변 대기중")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "고객지원으로 돌아가기" })).toHaveAttribute("href", "/support");
    expect(screen.getByRole("link", { name: "새 문의 작성" })).toHaveAttribute("href", "/support/inquiries/new");
    expect(screen.getAllByRole("link", { name: "상세 보기" })[0]).toHaveAttribute("href", "/support/inquiries/1");
    expect(mockGetMyInquiries).toHaveBeenCalledWith({ status: undefined, page: 0 });
  });

  test("상태 탭을 선택하면 필터와 첫 페이지로 다시 조회한다", async () => {
    const user = userEvent.setup();
    render(<InquiryList />);
    await screen.findByText("계약 진행 문의");

    await user.click(screen.getByRole("tab", { name: "답변 완료" }));

    expect(screen.getByRole("tab", { name: "답변 완료" })).toHaveAttribute("aria-selected", "true");
    expect(mockGetMyInquiries).toHaveBeenLastCalledWith({ status: "ANSWERED", page: 0 });
  });

  test("다음 버튼을 누르면 다음 페이지를 조회한다", async () => {
    const user = userEvent.setup();
    mockGetMyInquiries.mockResolvedValue(inquiryPage(undefined, { totalPages: 2, last: false }));
    render(<InquiryList />);
    await screen.findByText("1 / 2");

    await user.click(screen.getByRole("button", { name: "다음" }));

    expect(mockGetMyInquiries).toHaveBeenLastCalledWith({ status: undefined, page: 1 });
  });

  test("조회 결과가 없으면 빈 상태를 표시한다", async () => {
    mockGetMyInquiries.mockResolvedValue(inquiryPage([]));
    render(<InquiryList />);
    expect(await screen.findByText("해당 상태의 문의가 없습니다.")).toBeInTheDocument();
  });

  test("조회 실패 후 다시 시도할 수 있다", async () => {
    const user = userEvent.setup();
    mockGetMyInquiries.mockRejectedValueOnce(new Error("failure"));
    render(<InquiryList />);
    expect(await screen.findByRole("alert")).toHaveTextContent("문의 목록을 불러오지 못했습니다.");

    mockGetMyInquiries.mockResolvedValue(inquiryPage());
    await user.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(await screen.findByText("계약 진행 문의")).toBeInTheDocument();
    expect(mockGetMyInquiries).toHaveBeenCalledTimes(2);
  });
});
