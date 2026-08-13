import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RecommendedCandidates } from "@/features/matching/components/RecommendedCandidates";
import {
  createMatchingRequests,
  getRecommendedCandidates,
  rejectRecommendedCandidate,
} from "@/features/matching/services/matching";
import type { CandidateListResponse } from "@/features/matching/types/matching";

jest.mock("@/features/matching/services/matching", () => ({
  createMatchingRequests: jest.fn(),
  getRecommendedCandidates: jest.fn(),
  rejectRecommendedCandidate: jest.fn(),
}));

const mockedGetCandidates = jest.mocked(getRecommendedCandidates);
const mockedCreateRequests = jest.mocked(createMatchingRequests);
const mockedRejectCandidate = jest.mocked(rejectRecommendedCandidate);

const candidateList: CandidateListResponse = {
  positionId: 11,
  roundId: 1,
  roundNo: 2,
  roundType: "INITIAL",
  headcount: 1,
  freeRerecommendAvailable: true,
  paidRerecommendRemaining: 5,
  lowScoreWarned: true,
  budgetWarned: true,
  candidates: [
    {
      candidateId: 101,
      freelancerId: 201,
      name: "김개발",
      profileImageUrl: null,
      jobRole: "FRONTEND",
      careerYears: 5,
      grade: "SENIOR",
      ratingAverage: 4.8,
      reviewCount: 12,
      skills: ["REACT", "TYPESCRIPT"],
      fitReasons: ["요구 스킬 2개 일치"],
      payUnit: "MONTHLY",
      payAmount: 6500000,
      rankNo: 1,
      requested: false,
      rejected: false,
    },
  ],
};

const defaultProps = {
  projectId: 7,
  positions: [
    {
      positionId: 11,
      positionNo: 1,
      jobCategory: "DEVELOPMENT",
      jobRole: "FRONTEND",
      minCareerYears: 3,
      headcount: 1,
      confirmedCount: 0,
      status: "OPEN",
      skills: ["REACT"],
    },
  ],
  jobRoleLabels: { FRONTEND: "프론트엔드 개발자" },
  skillLabels: { REACT: "React", TYPESCRIPT: "TypeScript" },
};

describe("RecommendedCandidates", () => {
  beforeEach(() => {
    mockedGetCandidates.mockResolvedValue(candidateList);
    mockedCreateRequests.mockResolvedValue([]);
    mockedRejectCandidate.mockResolvedValue({ ...candidateList, candidates: [] });
  });

  it("포지션 후보와 독립적인 두 경고를 표시한다", async () => {
    render(<RecommendedCandidates {...defaultProps} />);

    expect(await screen.findByText("김개발")).toBeInTheDocument();
    expect(mockedGetCandidates).toHaveBeenCalledWith(11);
    expect(screen.getByText(/다음 순번 후보 중 적합도가 낮은 후보/)).toBeInTheDocument();
    expect(screen.getByText(/희망 단가 합계가 남은 예산을 넘습니다/)).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("월 6,500,000원")).toBeInTheDocument();
  });

  it("선택한 candidateId로 매칭 요청을 보내고 목록을 다시 조회한다", async () => {
    const user = userEvent.setup();
    render(<RecommendedCandidates {...defaultProps} />);

    await user.click(await screen.findByRole("button", { name: "선택" }));
    await user.click(screen.getByRole("button", { name: "선택한 후보에게 요청 (1)" }));

    await waitFor(() => {
      expect(mockedCreateRequests).toHaveBeenCalledWith({
        positionId: 11,
        candidateIds: [101],
      });
      expect(mockedGetCandidates).toHaveBeenCalledTimes(2);
    });
    expect(await screen.findByText("선택한 프리랜서에게 매칭 요청을 보냈습니다.")).toBeInTheDocument();
  });

  it("후보 거절 응답의 최신 목록으로 화면을 갱신한다", async () => {
    const user = userEvent.setup();
    render(<RecommendedCandidates {...defaultProps} />);

    await user.click(await screen.findByRole("button", { name: "거절" }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "거절" }));

    await waitFor(() => expect(mockedRejectCandidate).toHaveBeenCalledWith(101));
    expect(await screen.findByText("후보를 관심 없음으로 처리했습니다.")).toBeInTheDocument();
    expect(screen.queryByText("김개발")).not.toBeInTheDocument();
  });

  it("최초 추천 결과가 비어 있어도 후보를 모두 추천했다고 단정하지 않는다", async () => {
    mockedGetCandidates.mockResolvedValue({
      ...candidateList,
      roundNo: 1,
      candidates: [],
    });

    render(<RecommendedCandidates {...defaultProps} />);

    expect(
      await screen.findByText(
        "현재 추천할 수 있는 프리랜서가 없습니다. 잠시 후 다시 확인하거나 프로젝트 조건을 조정해 주세요.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/프리랜서를 모두 추천해/)).not.toBeInTheDocument();
  });
});
