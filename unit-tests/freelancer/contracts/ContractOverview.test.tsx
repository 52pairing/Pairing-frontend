import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ContractOverview } from "@/features/contract/components/common/ContractOverview";
import { downloadContractPdf, getContractDetail } from "@/features/contract/services/contracts";
import { ApiException } from "@/lib/api";
import { contractDetail } from "./fixtures";

let contractId = "31";

jest.mock("next/navigation", () => ({
  useParams: () => ({ contractId }),
}));
jest.mock("@/features/contract/services/contracts", () => ({
  getContractDetail: jest.fn(),
  downloadContractPdf: jest.fn(),
}));

const mockGetDetail = jest.mocked(getContractDetail);
const mockDownloadPdf = jest.mocked(downloadContractPdf);

describe("ContractOverview - freelancer", () => {
  beforeEach(() => {
    contractId = "31";
    mockGetDetail.mockResolvedValue(contractDetail);
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: jest.fn(() => "blob:contract") });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: jest.fn() });
    jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
  });

  test("계약 상세와 양측 서명 상태, 계약 조항을 표시한다", async () => {
    render(<ContractOverview role="freelancer" />);
    expect(screen.getByText("계약 상세를 불러오고 있습니다.")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "쇼핑몰 리뉴얼" })).toBeInTheDocument();
    expect(screen.getByText("프론트엔드 개발자")).toBeInTheDocument();
    expect(screen.getByText("✓ 클라이언트 서명")).toBeInTheDocument();
    expect(screen.getByText("○ 프리랜서 서명")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "제1조 (목적)" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "계약서 서명하기" })).toHaveAttribute("href", "/freelancer/contracts/31/sign");
    expect(mockGetDetail).toHaveBeenCalledWith(31);
  });

  test("내 서명이 완료되면 상대방 서명 대기를 표시한다", async () => {
    mockGetDetail.mockResolvedValue({
      ...contractDetail,
      signatures: contractDetail.signatures.map((signature) =>
        signature.partyRole === "FREELANCER"
          ? { ...signature, status: "SIGNED", signedAt: "2026-08-13" }
          : { ...signature, status: "PENDING", signedAt: null },
      ),
    });
    render(<ContractOverview role="freelancer" />);
    expect(await screen.findByText("상대방 서명 대기")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "계약서 서명하기" })).not.toBeInTheDocument();
  });

  test("DRAFT 계약에서는 PDF와 서명 이동을 제한한다", async () => {
    mockGetDetail.mockResolvedValue({ ...contractDetail, status: "DRAFT" });
    render(<ContractOverview role="freelancer" />);
    expect(await screen.findByText("계약서를 작성하고 있습니다.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "PDF 다운로드" })).not.toBeInTheDocument();
    expect(screen.getByText("계약서 준비 중")).toHaveAttribute("aria-disabled", "true");
  });

  test("PDF Blob을 계약번호 파일명으로 다운로드한다", async () => {
    const user = userEvent.setup();
    mockDownloadPdf.mockResolvedValue(new Blob(["pdf"], { type: "application/pdf" }));
    render(<ContractOverview role="freelancer" />);
    await screen.findByRole("heading", { name: "쇼핑몰 리뉴얼" });
    await user.click(screen.getByRole("button", { name: "PDF 다운로드" }));
    expect(mockDownloadPdf).toHaveBeenCalledWith(31);
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:contract");
  });

  test.each([
    ["CONTRACT_NOT_FOUND", "계약을 찾을 수 없습니다."],
    ["NOT_CONTRACT_PARTY", "이 계약을 조회할 권한이 없습니다."],
  ])("%s 조회 오류를 안내한다", async (code, message) => {
    mockGetDetail.mockRejectedValue(new ApiException(code, "error", 404));
    render(<ContractOverview role="freelancer" />);
    expect(await screen.findByRole("alert")).toHaveTextContent(message);
    expect(screen.getByRole("button", { name: "다시 시도" })).toBeInTheDocument();
  });

  test("잘못된 계약 ID는 API를 호출하지 않는다", async () => {
    contractId = "invalid";
    render(<ContractOverview role="freelancer" />);
    expect(await screen.findByRole("alert")).toHaveTextContent("계약 정보를 확인할 수 없습니다.");
    expect(mockGetDetail).not.toHaveBeenCalled();
  });
});
