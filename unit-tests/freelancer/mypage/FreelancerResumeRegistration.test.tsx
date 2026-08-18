import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FreelancerResumeRegistration } from "@/features/freelancer/mypage/components/FreelancerResumeRegistration";
import { getFreelancerProfile } from "@/features/freelancer/mypage/services/freelancerProfile";
import {
  getFreelancerJobCategories,
  getFreelancerJobRoles,
  getFreelancerResume,
  getFreelancerResumeDraft,
  getFreelancerSkills,
  getFreelancerWorkConditions,
  updateFreelancerResume,
  updateFreelancerResumeDraft,
} from "@/features/freelancer/mypage/services/freelancerResume";
import { ApiException } from "@/lib/api";
import type {
  FreelancerCondition,
  ResumeDetailBody,
  ResumeDetailResponse,
} from "@/features/freelancer/mypage/types/resume";

jest.mock("@/features/freelancer/mypage/components/FreelancerMyPageLayout", () => ({
  FreelancerMyPageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock("@/features/auth/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({
    accountId: 1,
    email: "freelancer@pairing.com",
    role: "FREELANCER",
    name: "김프리",
    companyName: null,
    tempPassword: false,
  }),
}));
jest.mock("@/features/freelancer/mypage/services/freelancerProfile", () => ({
  getFreelancerProfile: jest.fn(),
}));
jest.mock("@/features/freelancer/mypage/services/freelancerResume", () => ({
  getFreelancerJobCategories: jest.fn(),
  getFreelancerJobRoles: jest.fn(),
  getFreelancerSkills: jest.fn(),
  getFreelancerWorkConditions: jest.fn(),
  getFreelancerResume: jest.fn(),
  getFreelancerResumeDraft: jest.fn(),
  updateFreelancerResume: jest.fn(),
  updateFreelancerResumeDraft: jest.fn(),
}));

const mockedProfile = jest.mocked(getFreelancerProfile);
const mockedJobCategories = jest.mocked(getFreelancerJobCategories);
const mockedJobRoles = jest.mocked(getFreelancerJobRoles);
const mockedSkills = jest.mocked(getFreelancerSkills);
const mockedWorkConditions = jest.mocked(getFreelancerWorkConditions);
const mockedResume = jest.mocked(getFreelancerResume);
const mockedResumeDraft = jest.mocked(getFreelancerResumeDraft);
const mockedUpdateResume = jest.mocked(updateFreelancerResume);
const mockedUpdateDraft = jest.mocked(updateFreelancerResumeDraft);

const jobCategories = [{ code: "IT", label: "IT·개발" }];
const jobRoles = [{ code: "FE", label: "프론트엔드", parentCode: "IT" }];
const skills = [{ code: "REACT", label: "React" }];
const workConditionsMeta = {
  workStyles: [{ code: "REMOTE", label: "원격" }],
  workForms: [{ code: "FULL_TIME", label: "상주" }],
  payUnits: [{ code: "MONTHLY", label: "월" }],
  periodUnits: [{ code: "MONTH", label: "개월" }],
  skillLevels: [{ code: "ADVANCED", label: "상" }],
};

const condition: FreelancerCondition = {
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
  careerYears: 3,
  skills: [{ skillCode: "REACT", skillLevel: "ADVANCED" }],
};

const resumeBody: ResumeDetailBody = {
  profileImageUrl: "https://cdn.example.com/profile.jpg",
  contactPhone: "01098765432",
  contactEmail: "resume@pairing.com",
  zipCode: "12345",
  address: "서울시 강남구",
  addressDetail: "101동 202호",
  educations: [
    {
      startDate: "2010-03",
      endDate: "2014-02",
      schoolName: "파일대학교",
      major: "컴퓨터공학",
      graduationStatus: "GRADUATED",
      campusType: "MAIN",
    },
  ],
  careers: [
    {
      startDate: "2015-01",
      endDate: null,
      companyName: "페어링",
      department: "개발팀",
      position: "팀장",
      jobDescription: "프론트엔드 개발",
    },
  ],
  certificates: [],
  selfIntroduction: "안녕하세요, 3년차 프론트엔드 개발자입니다.",
  portfolioUrl: "https://cdn.example.com/portfolio.pdf",
  links: [{ url: "https://github.com/example" }],
  agreements: {
    profileCollectionAgreed: true,
    profileProvisionAgreed: true,
    aiAnalysisAgreed: true,
    careerPortfolioUsageAgreed: true,
  },
};

const savedResumeResponse: ResumeDetailResponse = {
  status: "COMPLETED",
  lastModifiedAt: "2026-08-01T00:00:00",
  condition,
  resume: resumeBody,
  notice: null,
};

const emptyResumeResponse: ResumeDetailResponse = {
  status: "INCOMPLETE",
  lastModifiedAt: null,
  condition: null,
  resume: null,
  notice: null,
};

beforeEach(() => {
  mockedProfile.mockResolvedValue({
    accountId: 1,
    name: "김프리",
    email: "freelancer@pairing.com",
    phone: "01012345678",
    birthDate: "1990-01-01",
    address: null,
    addressParts: null,
    profileImageUrl: null,
    aiMatchingAgreed: false,
    grade: "JUNIOR",
    ratingAverage: null,
    reviewCount: 0,
    resumeCompleted: false,
    withdrawable: true,
  });
  mockedJobCategories.mockResolvedValue(jobCategories);
  mockedJobRoles.mockResolvedValue(jobRoles);
  mockedSkills.mockResolvedValue(skills);
  mockedWorkConditions.mockResolvedValue(workConditionsMeta);
  mockedResumeDraft.mockResolvedValue({ payload: null });
});

afterEach(() => jest.clearAllMocks());

beforeAll(() => {
  // jsdom은 scrollIntoView/scrollTo를 구현하지 않아 저장 성공·실패 후 스크롤 로직에서 예외가 난다.
  Element.prototype.scrollIntoView = jest.fn();
  window.scrollTo = jest.fn();
});

it("이력서가 없으면 최초 작성 안내와 함께 등록 폼을 보여준다", async () => {
  mockedResume.mockResolvedValue(emptyResumeResponse);

  render(<FreelancerResumeRegistration />);

  expect(await screen.findByText("이력서 등록")).toBeInTheDocument();
  expect(
    screen.getByText(
      "아직 등록된 이력서가 없어 처음 작성하는 화면입니다. 아래 정보를 입력하고 저장하면 이력서가 등록됩니다.",
    ),
  ).toBeInTheDocument();
  expect(screen.getByText("희망 조건")).toBeInTheDocument();
});

it("저장된 이력서가 있으면 조회 화면을 먼저 보여준다", async () => {
  mockedResume.mockResolvedValue(savedResumeResponse);

  render(<FreelancerResumeRegistration />);

  expect(await screen.findByText("12345 서울시 강남구 101동 202호")).toBeInTheDocument();
  expect(screen.getByText("내 이력서")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "수정하기" })).toBeInTheDocument();
  expect(mockedResumeDraft).not.toHaveBeenCalled();
});

it("조회 화면에서 수정하기를 누르면 폼 화면으로 전환된다", async () => {
  mockedResume.mockResolvedValue(savedResumeResponse);
  const user = userEvent.setup();
  render(<FreelancerResumeRegistration />);

  await user.click(await screen.findByRole("button", { name: "수정하기" }));

  expect(await screen.findByText("내 이력서 수정")).toBeInTheDocument();
  expect(screen.getByText("이력서와 포트폴리오 정보를 수정합니다.")).toBeInTheDocument();
});

it("필수값을 입력하지 않고 제출하면 오류를 표시하고 저장 API를 호출하지 않는다", async () => {
  mockedResume.mockResolvedValue(emptyResumeResponse);
  const user = userEvent.setup();
  render(<FreelancerResumeRegistration />);

  await user.click(await screen.findByRole("button", { name: "변경사항 저장" }));

  expect(
    await screen.findByText("확인 페이지에 표시할 프로필 사진을 등록해 주세요."),
  ).toBeInTheDocument();
  expect(screen.getByText("직군과 직무를 선택해 주세요.")).toBeInTheDocument();
  expect(mockedUpdateResume).not.toHaveBeenCalled();
});

it("입력값이 유효하면 저장 후 조회 화면으로 전환된다", async () => {
  mockedResume.mockResolvedValue(savedResumeResponse);
  mockedUpdateResume.mockResolvedValue({} as never);
  const user = userEvent.setup();
  render(<FreelancerResumeRegistration />);

  await user.click(await screen.findByRole("button", { name: "수정하기" }));
  await user.click(screen.getByRole("button", { name: "변경사항 저장" }));

  await waitFor(() => expect(mockedUpdateResume).toHaveBeenCalledTimes(1));
  const payload = mockedUpdateResume.mock.calls[0][0];
  expect(payload.contactEmail).toBe("resume@pairing.com");
  expect(payload.condition?.jobCategory).toBe("IT");
  expect(await screen.findByText("내 이력서")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "수정하기" })).toBeInTheDocument();
});

it("저장에 실패하면 오류 메시지를 보여주고 폼 화면을 유지한다", async () => {
  mockedResume.mockResolvedValue(savedResumeResponse);
  mockedUpdateResume.mockRejectedValue(
    new ApiException("RS_001", "이력서 저장에 실패했습니다.", 400),
  );
  const user = userEvent.setup();
  render(<FreelancerResumeRegistration />);

  await user.click(await screen.findByRole("button", { name: "수정하기" }));
  await user.click(screen.getByRole("button", { name: "변경사항 저장" }));

  expect(await screen.findByText("이력서 저장에 실패했습니다.")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "변경사항 저장" })).toBeInTheDocument();
});

it("임시 저장 버튼을 누르면 draft API를 호출하고 완료 메시지를 보여준다", async () => {
  mockedResume.mockResolvedValue(emptyResumeResponse);
  mockedUpdateDraft.mockResolvedValue({ payload: null });
  const user = userEvent.setup();
  render(<FreelancerResumeRegistration />);

  await user.click(await screen.findByRole("button", { name: "임시 저장" }));

  await waitFor(() => expect(mockedUpdateDraft).toHaveBeenCalledTimes(1));
  expect(await screen.findByText("임시 저장되었습니다.")).toBeInTheDocument();
});

it("메타 정보 조회에 실패하면 오류 메시지와 다시 시도 버튼을 보여준다", async () => {
  mockedResume.mockResolvedValue(emptyResumeResponse);
  mockedJobCategories.mockRejectedValueOnce(new Error("네트워크 오류"));

  render(<FreelancerResumeRegistration />);

  expect(
    await screen.findByText("직군·직무·스킬 정보를 불러오지 못했습니다. 다시 시도해 주세요."),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "다시 시도" })).toBeInTheDocument();
});
