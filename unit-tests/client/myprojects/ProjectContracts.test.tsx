import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ProjectContracts } from "@/features/contract/components/client/ProjectContracts";
import { getClientProjectContracts } from "@/features/contract/services/clientContracts";
import { getProjectJobRoles } from "@/features/client/projects/services/projectPreReview";
import { contractItem, contractPage } from "./fixtures";

jest.mock("@/features/contract/services/clientContracts", () => ({
  getClientProjectContracts: jest.fn(),
}));

jest.mock("@/features/client/projects/services/projectPreReview", () => ({
  getProjectJobRoles: jest.fn(),
}));

const mockGetContracts = jest.mocked(getClientProjectContracts);
const mockGetJobRoles = jest.mocked(getProjectJobRoles);

describe("ProjectContracts", () => {
  beforeEach(() => {
    mockGetContracts.mockResolvedValue(contractPage());
    mockGetJobRoles.mockResolvedValue([{ code: "FRONTEND", label: "프론트엔드 개발자", parentCode: "DEVELOPMENT" }]);
  });

  test("계약 목록과 직무 라벨, 서명 상태를 표시한다", async () => {
    render(<ProjectContracts projectId="7" />);

    expect(screen.getByText("계약 목록을 불러오고 있습니다.")).toBeInTheDocument();
    expect(await screen.findByText("쇼핑몰 리뉴얼")).toBeInTheDocument();
    expect(screen.getByText("김개발 · 프론트엔드 개발자")).toBeInTheDocument();
    expect(screen.getByText("월 5,000,000원")).toBeInTheDocument();
    expect(screen.getByText("내 서명 대기")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "계약 상세보기" })).toHaveAttribute("href", "/client/projects/7/contracts/31");
  });

  test("초안 계약은 상세 이동을 비활성화한다", async () => {
    mockGetContracts.mockResolvedValue(contractPage([{ ...contractItem, status: "DRAFT", signatureRequired: false }]));
    render(<ProjectContracts projectId="7" />);

    expect(await screen.findByText("계약서 준비 중")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "계약 상세보기" })).not.toBeInTheDocument();
    expect(screen.getByText("계약 상세보기")).toHaveAttribute("aria-disabled", "true");
  });

  test("계약이 없으면 빈 상태를 표시한다", async () => {
    mockGetContracts.mockResolvedValue(contractPage([]));
    render(<ProjectContracts projectId="7" />);

    expect(await screen.findByText("이 프로젝트에 등록된 계약이 없습니다.")).toBeInTheDocument();
  });

  test("조회 실패 후 다시 시도할 수 있다", async () => {
    const user = userEvent.setup();
    mockGetContracts.mockRejectedValueOnce(new Error("계약 목록 API 오류"));
    render(<ProjectContracts projectId="7" />);

    expect(await screen.findByRole("alert")).toHaveTextContent("계약 목록 API 오류");
    mockGetContracts.mockResolvedValue(contractPage());
    await user.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(await screen.findByText("쇼핑몰 리뉴얼")).toBeInTheDocument();
  });
});
