import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { getContracts } from "@/features/contract/services/contracts";
import { FreelancerContracts } from "@/features/freelancer/mycontracts/components/FreelancerContracts";
import { getMySettlements } from "@/features/payment/services/settlementPayment";
import { contractListPage, freelancerContract } from "./fixtures";

const push = jest.fn();

jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
jest.mock("@/features/contract/services/contracts", () => ({ getContracts: jest.fn() }));
jest.mock("@/features/payment/services/settlementPayment", () => ({ getMySettlements: jest.fn() }));
jest.mock("@/features/payment/components/PaymentMethodModal", () => ({
  PaymentMethodModal: ({ open, payment }: { open: boolean; payment: { settlementId?: number; type: string } }) =>
    open ? <div role="dialog">결제 모달 {payment.type} {payment.settlementId}</div> : null,
}));
jest.mock("@/features/payment/components/SettlementPaymentComplete", () => ({ SettlementPaymentComplete: () => <div>결제 완료</div> }));

const mockGetContracts = jest.mocked(getContracts);
const mockGetSettlements = jest.mocked(getMySettlements);

describe("FreelancerContracts", () => {
  beforeEach(() => mockGetContracts.mockResolvedValue(contractListPage()));

  test("전체 계약 목록을 조회하고 계약 카드를 표시한다", async () => {
    render(<FreelancerContracts />);
    expect(screen.getByText("계약 목록을 불러오고 있습니다.")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "쇼핑몰 리뉴얼" })).toBeInTheDocument();
    expect(mockGetContracts).toHaveBeenCalledWith({ tab: "ALL", page: 0, size: 10 });
  });

  test("상태 탭을 선택하면 서버 탭 코드로 다시 조회한다", async () => {
    const user = userEvent.setup();
    render(<FreelancerContracts />);
    await screen.findByRole("heading", { name: "쇼핑몰 리뉴얼" });
    await user.click(screen.getByRole("button", { name: "진행 중" }));
    expect(mockGetContracts).toHaveBeenLastCalledWith({ tab: "IN_PROGRESS", page: 0, size: 10 });
  });

  test("빈 목록과 조회 실패·재시도를 처리한다", async () => {
    const user = userEvent.setup();
    mockGetContracts.mockRejectedValueOnce(new Error("계약 목록 API 오류"));
    render(<FreelancerContracts />);
    expect(await screen.findByRole("alert")).toHaveTextContent("계약 목록 API 오류");
    mockGetContracts.mockResolvedValue(contractListPage([]));
    await user.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(await screen.findByText("해당 상태의 계약이 없습니다.")).toBeInTheDocument();
  });

  test("착수금 정산 ID가 없으면 결제 가능한 정산을 조회한다", async () => {
    const user = userEvent.setup();
    mockGetContracts.mockResolvedValue(
      contractListPage([{ ...freelancerContract, status: "SIGNED", signatureRequired: false }]),
    );
    mockGetSettlements.mockResolvedValue({
      content: [{ settlementId: 88, projectId: 7, projectTitle: "쇼핑몰 리뉴얼", phase: "DEPOSIT", baseAmount: 30_000_000, feeRate: 4, gradeDiscount: 0, feeAmount: 1_200_000, dueDate: null, payable: true, status: "PENDING" }],
      page: 0, size: 10, totalElements: 1, totalPages: 1, first: true, last: true,
    });
    render(<FreelancerContracts />);
    await user.click(await screen.findByRole("button", { name: "착수금 수수료 결제" }));
    expect(mockGetSettlements).toHaveBeenCalledWith(7, 0, 10);
    expect(screen.getByRole("dialog")).toHaveTextContent("UPFRONT_FEE 88");
  });
});
