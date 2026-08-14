import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FreelancerPaymentHistory } from "@/features/freelancer/mypage/components/FreelancerPaymentHistory";
import {
  getMySettlementSummary,
  getMySettlements,
} from "@/features/payment/services/settlementPayment";

const mockToastError = jest.fn();

jest.mock("@/features/freelancer/mypage/components/FreelancerMyPageLayout", () => ({
  FreelancerMyPageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock("@/features/payment/services/settlementPayment", () => ({
  getMySettlementSummary: jest.fn(),
  getMySettlements: jest.fn(),
}));
jest.mock("@/features/common/hooks/useToast", () => ({
  useToast: () => ({ error: mockToastError }),
}));

const mockedSummary = jest.mocked(getMySettlementSummary);
const mockedSettlements = jest.mocked(getMySettlements);

beforeEach(() => {
  mockedSummary.mockResolvedValue({
    totalAmount: 1_000_000,
    depositAmount: 256_000,
    successFeeAmount: 744_000,
    depositProjectCount: 1,
    successFeeProjectCount: 1,
  });
  mockedSettlements.mockResolvedValue({
    content: [{
      settlementId: 13,
      settlementNo: "ST-2027-000013",
      projectId: 2,
      projectTitle: "B2B 주문 관리 서비스 리뉴얼",
      clientName: "주식회사 오이랩",
      phase: "SUCCESS_FEE",
      baseAmount: 12_400_000,
      feeRate: 6,
      gradeDiscount: 0,
      feeAmount: 744_000,
      dueDate: null,
      payable: false,
      status: "PAID",
      paymentMethodLabel: "신한카드 1234",
      paidAt: "2027-01-02T14:45:11.31534",
    }],
    page: 0,
    size: 10,
    totalElements: 1,
    totalPages: 1,
    first: true,
    last: true,
  });
});

afterEach(() => jest.clearAllMocks());

it("summary와 결제 완료 목록을 API 응답으로 표시한다", async () => {
  render(<FreelancerPaymentHistory />);

  expect(await screen.findByText("B2B 주문 관리 서비스 리뉴얼")).toBeInTheDocument();
  expect(screen.getAllByText("744,000원")).toHaveLength(2);
  expect(screen.getByText("1건")).toBeInTheDocument();
  expect(screen.getByText("주식회사 오이랩 · 신한카드 1234 · 2027.01.02")).toBeInTheDocument();
  expect(screen.getByText("결제 완료")).toBeInTheDocument();
  expect(mockedSummary).toHaveBeenCalledTimes(1);
  expect(mockedSettlements).toHaveBeenCalledWith({ phase: undefined, status: "PAID", page: 0, size: 10 });
});

it("탭 변경 시 phase만 바꾸고 summary는 재조회하지 않는다", async () => {
  const user = userEvent.setup();
  render(<FreelancerPaymentHistory />);
  await screen.findByText("B2B 주문 관리 서비스 리뉴얼");

  await user.click(screen.getByRole("button", { name: "착수금 수수료" }));

  await waitFor(() => expect(mockedSettlements).toHaveBeenLastCalledWith({ phase: "DEPOSIT", status: "PAID", page: 0, size: 10 }));
  expect(mockedSummary).toHaveBeenCalledTimes(1);
  expect(screen.getByText("총 성공보수 납부")).toBeInTheDocument();
});
