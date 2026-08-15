import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ClientPaymentHistory } from "@/features/client/mypage/components/ClientPaymentHistory";
import {
  getMySettlementSummary,
  getMySettlements,
} from "@/features/payment/services/settlementPayment";

const mockToastError = jest.fn();

jest.mock("@/features/client/mypage/components/ClientMyPageLayout", () => ({
  ClientMyPageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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
const page = {
  content: [{
    settlementId: 45,
    settlementNo: "ST-2026-000045",
    projectId: 7,
    projectTitle: "B2B 주문 관리 서비스 리뉴얼",
    phase: "SUCCESS_FEE" as const,
    baseAmount: 60_000_000,
    feeRate: 7,
    gradeDiscount: 0,
    feeAmount: 4_200_000,
    dueDate: null,
    payable: false,
    status: "PAID" as const,
    paidAt: "2026-06-18T10:00:00+09:00",
    paymentMethodLabel: "신한카드 1234",
  }],
  page: 0,
  size: 10,
  totalElements: 1,
  totalPages: 1,
  first: true,
  last: true,
};

beforeEach(() => {
  mockedSummary.mockResolvedValue({
    totalAmount: 7_000_000,
    depositAmount: 2_800_000,
    successFeeAmount: 4_200_000,
    depositProjectCount: 1,
    successFeeProjectCount: 1,
  });
  mockedSettlements.mockResolvedValue(page);
});

afterEach(() => jest.clearAllMocks());

it("요약과 결제 완료 목록을 API 응답으로 표시한다", async () => {
  render(<ClientPaymentHistory />);

  expect(await screen.findByText("ST-2026-000045")).toBeInTheDocument();
  expect(screen.getAllByText("7,000,000원")).toHaveLength(2);
  expect(screen.getByText("2026.06.18")).toBeInTheDocument();
  expect(screen.getByText("신한카드 1234")).toBeInTheDocument();
  expect(mockedSummary).toHaveBeenCalledTimes(1);
  expect(mockedSettlements).toHaveBeenCalledWith({
    phase: undefined,
    status: "PAID",
    page: 0,
    size: 10,
  });
});

it("탭 변경 시 phase만 바꾸고 summary는 다시 조회하지 않는다", async () => {
  const user = userEvent.setup();
  render(<ClientPaymentHistory />);
  await screen.findByText("ST-2026-000045");

  await user.click(screen.getByRole("button", { name: "착수금 수수료" }));

  await waitFor(() => expect(mockedSettlements).toHaveBeenLastCalledWith({
    phase: "DEPOSIT",
    status: "PAID",
    page: 0,
    size: 10,
  }));
  expect(mockedSummary).toHaveBeenCalledTimes(1);
  expect(screen.getAllByText("2,800,000원")).toHaveLength(2);
});
