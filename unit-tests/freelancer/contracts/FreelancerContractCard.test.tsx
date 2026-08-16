import { render, screen } from "@testing-library/react";

import {
  FreelancerContractCard,
  getContractAction,
} from "@/features/contract/components/freelancer/FreelancerContractCard";
import { freelancerContract } from "./fixtures";

describe("FreelancerContractCard", () => {
  test.each([
    ["SIGN_PENDING", true, false, null, "sign"],
    ["SIGN_PENDING", false, false, null, "none"],
    ["SIGNED", false, false, null, "upfrontFee"],
    ["SIGNED", false, true, null, "none"],
    ["COMPLETION_PENDING", false, true, 51, "successFee"],
    ["COMPLETION_PENDING", false, true, null, "none"],
    ["COMPLETED", false, true, null, "review"],
  ] as const)("%s 상태의 액션을 판정한다", (status, signatureRequired, depositPaid, payableSettlementId, expected) => {
    expect(
      getContractAction({ ...freelancerContract, status, signatureRequired, depositPaid, payableSettlementId }),
    ).toBe(expected);
  });

  test("서명 대기 계약 정보와 서명 링크를 표시한다", () => {
    render(<FreelancerContractCard contract={freelancerContract} />);

    expect(screen.getByRole("heading", { name: "쇼핑몰 리뉴얼" })).toBeInTheDocument();
    expect(screen.getByText("월 5,000,000원")).toBeInTheDocument();
    expect(screen.getByText("재택")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "계약 상세" })).toHaveAttribute("href", "/freelancer/contracts/31");
    expect(screen.getByRole("link", { name: "계약서 확인 및 서명" })).toHaveAttribute("href", "/freelancer/contracts/31/sign");
  });

  test("DRAFT 계약은 상세 이동과 액션을 제한한다", () => {
    render(
      <FreelancerContractCard
        contract={{ ...freelancerContract, status: "DRAFT", signatureRequired: false }}
      />,
    );

    expect(screen.getByText("작성 중")).toBeInTheDocument();
    expect(screen.getByText("계약 상세")).toHaveAttribute("aria-disabled", "true");
    expect(screen.queryByRole("link", { name: "계약서 확인 및 서명" })).not.toBeInTheDocument();
  });

  test("성공보수 결제 후에는 결제 버튼을 숨기고 클라이언트 결제 대기를 안내한다", () => {
    render(
      <FreelancerContractCard
        contract={{ ...freelancerContract, status: "COMPLETION_PENDING", payableSettlementId: null }}
      />,
    );

    expect(screen.queryByRole("button", { name: "성공보수 수수료 결제" })).not.toBeInTheDocument();
    expect(screen.getByText("성공보수 수수료 결제가 완료되었습니다. 클라이언트 결제가 끝나면 계약이 종료됩니다.")).toBeInTheDocument();
  });
});
