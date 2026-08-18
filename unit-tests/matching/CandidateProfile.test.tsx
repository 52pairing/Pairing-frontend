import { render, screen } from "@testing-library/react";

import { CandidateProfile } from "@/features/matching/components/CandidateProfile";
import {
  getProjectJobCategories,
  getProjectJobRoles,
  getProjectSkills,
  getProjectWorkConditions,
} from "@/features/client/projects/services/projectPreReview";
import { getCandidateProfile } from "@/features/matching/services/matching";
import { ApiException } from "@/lib/api";
import type { CandidateProfileResponse } from "@/features/matching/types/matching";

jest.mock("@/features/client/projects/services/projectPreReview", () => ({
  getProjectJobCategories: jest.fn(),
  getProjectJobRoles: jest.fn(),
  getProjectSkills: jest.fn(),
  getProjectWorkConditions: jest.fn(),
}));
jest.mock("@/features/matching/services/matching", () => ({
  getCandidateProfile: jest.fn(),
}));

const mockedGetCandidateProfile = jest.mocked(getCandidateProfile);
const mockedJobCategories = jest.mocked(getProjectJobCategories);
const mockedJobRoles = jest.mocked(getProjectJobRoles);
const mockedSkills = jest.mocked(getProjectSkills);
const mockedWorkConditions = jest.mocked(getProjectWorkConditions);

const candidate: CandidateProfileResponse = {
  candidateId: 3,
  projectId: 7,
  positionId: 1,
  freelancerId: 9,
  name: "김프리",
  profileImageUrl: null,
  grade: "SENIOR",
  ratingAverage: 4.8,
  reviewCount: 12,
  fitScore: 92,
  fitReasons: ["React 경험 3년 이상"],
  rankNo: 1,
  requested: false,
  rejected: false,
  capturedAt: "2026-08-10T00:00:00",
  condition: {
    conditionId: 1,
    jobCategory: "IT",
    jobRole: "FE",
    workStyle: "REMOTE",
    workForm: "FULL_TIME",
    payUnit: "MONTHLY",
    payAmount: 5_000_000,
    minAcceptAmount: 4_000_000,
    availableFrom: "2026-09-01",
    startNegotiable: false,
    periodValue: 6,
    periodUnit: "MONTH",
    hasFreelanceExperience: true,
    careerYears: 5,
    skills: [{ skillCode: "REACT", skillLevel: "ADVANCED" }],
  },
  resume: {
    resumeId: 1,
    status: "COMPLETED",
    name: "김프리",
    birthDate: null,
    contactPhone: null,
    contactEmail: null,
    zipCode: null,
    address: null,
    addressDetail: null,
    profileImageUrl: null,
    selfIntroduction: "안녕하세요.",
    portfolioUrl: null,
    educations: [],
    careers: [],
    certificates: [],
    links: [],
    agreements: {
      profileCollectionAgreed: true,
      profileProvisionAgreed: true,
      aiAnalysisAgreed: true,
      careerPortfolioUsageAgreed: true,
    },
  },
};

beforeEach(() => {
  mockedJobCategories.mockResolvedValue([{ code: "IT", label: "IT·개발" }]);
  mockedJobRoles.mockResolvedValue([{ code: "FE", label: "프론트엔드", parentCode: "IT" }]);
  mockedSkills.mockResolvedValue([{ code: "REACT", label: "React" }]);
  mockedWorkConditions.mockResolvedValue({
    workStyles: [{ code: "REMOTE", label: "원격" }],
    workForms: [{ code: "FULL_TIME", label: "상주" }],
    periodUnits: [{ code: "MONTH", label: "개월" }],
    skillLevels: [{ code: "ADVANCED", label: "상" }],
  });
});

afterEach(() => jest.clearAllMocks());

it("initialProfile이 있으면 재조회 없이 바로 표시한다", async () => {
  render(
    <CandidateProfile projectId={7} candidateId={3} initialProfile={candidate} />,
  );

  expect(await screen.findByText("김프리")).toBeInTheDocument();
  expect(screen.getByText("React 경험 3년 이상")).toBeInTheDocument();
  expect(mockedGetCandidateProfile).not.toHaveBeenCalled();
});

it("initialProfile이 없으면 조회해서 표시하고, 실패하면 오류 메시지를 보여준다", async () => {
  mockedGetCandidateProfile.mockRejectedValue(
    new ApiException("MT_020", "프로필을 찾을 수 없습니다.", 404),
  );

  render(<CandidateProfile projectId={7} candidateId={3} />);

  expect(await screen.findByText("프로필을 찾을 수 없습니다.")).toBeInTheDocument();
});
