import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FreelancerProjects } from "@/features/freelancer/myprojects/components/FreelancerProjects";
import { acceptMatchingRequest, getReceivedMatchingRequests, rejectMatchingRequest } from "@/features/matching/services/matching";
import type { MatchingRequestResponse, PageResponse } from "@/features/matching/types/matching";
import { ApiException } from "@/lib/api";

const replace = jest.fn();
const push = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push, replace }) }));
jest.mock("@/features/client/projects/services/projectPreReview", () => ({
  getProjectJobRoles: jest.fn().mockResolvedValue([{ code: "FRONTEND", label: "프론트엔드 개발자" }]),
  getProjectSkills: jest.fn().mockResolvedValue([{ code: "REACT", label: "React" }]),
}));
jest.mock("@/features/matching/services/matching", () => ({
  acceptMatchingRequest: jest.fn(),
  getReceivedMatchingRequests: jest.fn(),
  rejectMatchingRequest: jest.fn(),
}));
jest.mock("@/features/negotiation/services/negotiation", () => ({
  getNegotiation: jest.fn(),
  getWorkConditionsMeta: jest.fn().mockResolvedValue({ workStyles: [], workForms: [], periodUnits: [] }),
}));

const mockedGetReceived = jest.mocked(getReceivedMatchingRequests);
const mockedAccept = jest.mocked(acceptMatchingRequest);
const mockedReject = jest.mocked(rejectMatchingRequest);

const request: MatchingRequestResponse = {
  requestId: 31, projectId: 7, projectTitle: "쇼핑몰 개편", positionId: 11, jobRole: "FRONTEND",
  counterpartName: "오이랩", companyName: "오이랩", companyProfile: "IT · 50명", skills: ["REACT"],
  minCareerYears: 3, workLabel: "재택 · 풀타임", periodLabel: "4개월", startDesiredDate: "2026-09-01",
  status: "REQUEST_PENDING", budgetAmount: 6000000, mainTask: null, requestedAt: "2026-08-10T10:00:00",
  expiresAt: "2099-08-13T10:00:00", respondedAt: null, rejectReason: null, currentRound: null, maxRound: null,
  newProposalCount: null, negotiationId: null,
};

const pageResponse = (page: number): PageResponse<MatchingRequestResponse> => ({ content: [{ ...request, requestId: 31 + page, projectTitle: page ? "두 번째 프로젝트" : request.projectTitle }], page, size: 10, totalElements: 11, totalPages: 2, first: page === 0, last: page === 1 });

describe("FreelancerProjects", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetReceived.mockImplementation(async ({ page = 0 } = {}) => pageResponse(page));
    mockedAccept.mockResolvedValue({ ...request, status: "NEGOTIATING", negotiationId: 99 });
    mockedReject.mockResolvedValue({ ...request, status: "REJECTED", rejectReason: "DIRECT_REJECT" });
  });

  it("받은 요청을 10건 단위로 조회하고 다음 페이지를 불러온다", async () => {
    const user = userEvent.setup();
    render(<FreelancerProjects />);

    expect(await screen.findByText("쇼핑몰 개편")).toBeInTheDocument();
    expect(mockedGetReceived).toHaveBeenCalledWith({ tab: "ALL", page: 0, size: 10 });
    await user.click(screen.getByRole("button", { name: "다음" }));

    expect(await screen.findByText("두 번째 프로젝트")).toBeInTheDocument();
    expect(mockedGetReceived).toHaveBeenCalledWith({ tab: "ALL", page: 1, size: 10 });
  });

  it.each([
    ["전체", "ALL"],
    ["검토 중", "REVIEWING"],
    ["협상 중", "NEGOTIATING"],
    ["종료됨", "CLOSED"],
  ] as const)("%s 탭을 %s 값으로 조회한다", async (label, tab) => {
    const user = userEvent.setup();
    render(<FreelancerProjects />);
    await screen.findByText("쇼핑몰 개편");

    if (label !== "전체") await user.click(screen.getByRole("button", { name: label }));

    await waitFor(() => expect(mockedGetReceived).toHaveBeenCalledWith({ tab, page: 0, size: 10 }));
  });

  it("CONTRACTED 상태를 종료된 제안으로 표시한다", async () => {
    mockedGetReceived.mockResolvedValue({ ...pageResponse(0), content: [{ ...request, status: "CONTRACTED" }] });

    render(<FreelancerProjects />);

    expect(await screen.findByText("계약 완료")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "수락 및 협상 시작" })).not.toBeInTheDocument();
  });

  it("선택 입력한 거절 사유를 API로 전송한다", async () => {
    const user = userEvent.setup();
    render(<FreelancerProjects />);
    await screen.findByText("쇼핑몰 개편");

    await user.click(screen.getByRole("button", { name: "거절" }));
    const dialog = screen.getByRole("dialog");
    await user.type(within(dialog).getByLabelText("거절 사유 (선택)"), "일정이 맞지 않습니다.");
    await user.click(within(dialog).getByRole("button", { name: "거절" }));

    await waitFor(() => expect(mockedReject).toHaveBeenCalledWith(31, "일정이 맞지 않습니다."));
  });

  it("기한 만료 오류가 발생하면 목록을 다시 조회한다", async () => {
    mockedAccept.mockRejectedValue(new ApiException("MT_016", "이미 응답 기한이 지난 요청입니다.", 400));
    const user = userEvent.setup();
    render(<FreelancerProjects />);
    await screen.findByText("쇼핑몰 개편");

    await user.click(screen.getByRole("button", { name: "수락 및 협상 시작" }));

    await waitFor(() => expect(mockedGetReceived).toHaveBeenCalledTimes(2));
    expect(screen.getByRole("alert")).toHaveTextContent("이미 응답 기한이 지난 요청입니다.");
  });
});
