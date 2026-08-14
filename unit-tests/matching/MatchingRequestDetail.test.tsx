import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ClientMatchingRequestDetail } from "@/features/matching/components/ClientMatchingRequestDetail";
import { FreelancerProjectDetail } from "@/features/freelancer/myprojects/components/FreelancerProjectDetail";
import { acceptMatchingRequest, getMatchingRequestDetail, rejectMatchingRequest } from "@/features/matching/services/matching";
import type { MatchingRequestResponse } from "@/features/matching/types/matching";

let routeParams: Record<string, string> = {};
const push = jest.fn();
jest.mock("next/navigation", () => ({ useParams: () => routeParams, useRouter: () => ({ push, replace: jest.fn() }) }));
jest.mock("@/features/client/projects/services/projectPreReview", () => ({
  getProjectJobRoles: jest.fn().mockResolvedValue([{ code: "FRONTEND", label: "프론트엔드 개발자" }]),
  getProjectSkills: jest.fn().mockResolvedValue([{ code: "REACT", label: "React" }]),
}));
jest.mock("@/features/matching/services/matching", () => ({
  acceptMatchingRequest: jest.fn(),
  getMatchingRequestDetail: jest.fn(),
  rejectMatchingRequest: jest.fn(),
}));

const mockedDetail = jest.mocked(getMatchingRequestDetail);
const mockedAccept = jest.mocked(acceptMatchingRequest);
const mockedReject = jest.mocked(rejectMatchingRequest);

const detail: MatchingRequestResponse = {
  requestId: 31, projectId: 7, projectTitle: "쇼핑몰 개편", positionId: 11, jobRole: "FRONTEND",
  counterpartName: "상대방", companyName: "오이랩", companyProfile: "IT · 50명", skills: ["REACT"],
  minCareerYears: 3, workLabel: "재택 · 풀타임", periodLabel: "4개월", startDesiredDate: "2026-09-01",
  status: "REQUEST_PENDING", budgetAmount: 6000000, mainTask: "상품 화면과 주문 기능을 개발합니다.",
  requestedAt: "2026-08-10T10:00:00", expiresAt: "2026-08-13T10:00:00", respondedAt: null,
  rejectReason: null, currentRound: null, maxRound: null, newProposalCount: null, negotiationId: null,
};

describe("MatchingRequestDetail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedDetail.mockResolvedValue(detail);
    mockedAccept.mockResolvedValue({ ...detail, status: "NEGOTIATING", negotiationId: 88, mainTask: null });
    mockedReject.mockResolvedValue({ ...detail, status: "REJECTED", rejectReason: "DIRECT_REJECT", mainTask: null });
  });

  it("클라이언트 상세에서 requestId로 조회하고 상대 이름과 mainTask를 표시한다", async () => {
    routeParams = { projectId: "7", requestId: "31" };
    render(<ClientMatchingRequestDetail />);

    expect(await screen.findByText("상품 화면과 주문 기능을 개발합니다.")).toBeInTheDocument();
    expect(screen.getByText("상대방")).toBeInTheDocument();
    expect(mockedDetail).toHaveBeenCalledWith(31);
  });

  it("프리랜서가 수락하면 body 없이 requestId로 요청하고 협상방으로 이동한다", async () => {
    routeParams = { projectId: "31" };
    const user = userEvent.setup();
    render(<FreelancerProjectDetail />);
    await screen.findByText("상품 화면과 주문 기능을 개발합니다.");

    await user.click(screen.getByRole("button", { name: "수락 및 협상 시작" }));

    await waitFor(() => expect(mockedAccept).toHaveBeenCalledWith(31));
    expect(push).toHaveBeenCalledWith("/freelancer/projects/7/negotiation/88");
  });

  it("프리랜서가 선택 사유로 거절해도 상세 조회의 mainTask를 유지한다", async () => {
    routeParams = { projectId: "31" };
    const user = userEvent.setup();
    render(<FreelancerProjectDetail />);
    await screen.findByText("상품 화면과 주문 기능을 개발합니다.");

    await user.click(screen.getByRole("button", { name: "거절" }));
    const dialog = screen.getByRole("dialog");
    await user.type(within(dialog).getByLabelText("거절 사유 (선택)"), "일정이 맞지 않습니다.");
    await user.click(within(dialog).getByRole("button", { name: "거절" }));

    await waitFor(() => expect(mockedReject).toHaveBeenCalledWith(31, "일정이 맞지 않습니다."));
    expect(screen.getByText("상품 화면과 주문 기능을 개발합니다.")).toBeInTheDocument();
    expect(screen.getByText("거절됨")).toBeInTheDocument();
  });
});
