import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ProjectConfirm } from "@/features/client/projects/components/ProjectConfirm";
import { useProjectRegister } from "@/features/client/projects/context/ProjectRegisterContext";
import {
  createProject,
  toProjectRegistrationRequest,
} from "@/features/client/projects/services/projectRegistration";

const push = jest.fn();
const setRegisteredProject = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

jest.mock("@/features/client/projects/context/ProjectRegisterContext", () => ({
  useProjectRegister: jest.fn(),
}));

jest.mock("@/features/client/projects/services/projectRegistration", () => ({
  createProject: jest.fn(),
  toProjectRegistrationRequest: jest.fn(),
}));

jest.mock("@/features/client/projects/components/ProjectRegisterShell", () => ({
  ProjectRegisterShell: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockUseProjectRegister = jest.mocked(useProjectRegister);
const mockCreateProject = jest.mocked(createProject);
const mockToRequest = jest.mocked(toProjectRegistrationRequest);

const form = {
  noticeAgreed: true,
  projectName: "쇼핑몰 리뉴얼",
  startDate: "2026-09-01",
  periodValue: 6,
  periodUnit: "MONTH",
  periodUnitLabel: "개월",
  budget: 5000,
  workMethod: "REMOTE",
  workMethodLabel: "재택",
  workType: "FULL_TIME",
  workTypeLabel: "풀타임",
  recruits: [
    {
      id: 1,
      category: "DEVELOPMENT",
      job: "FRONTEND",
      jobLabel: "프론트엔드 개발자",
      experience: 3,
      count: 2,
      skills: ["REACT"],
      skillLabels: { REACT: "React" },
    },
  ],
  currentSituation: "기획 완료",
  mainTask: "프론트엔드 개발",
};

const request = { title: "쇼핑몰 리뉴얼" } as ReturnType<typeof toProjectRegistrationRequest>;
const response = {
  projectId: 7,
  title: "쇼핑몰 리뉴얼",
  periodValue: 6,
  periodUnit: "MONTH",
  budgetAmount: 50_000_000,
  startDesiredDate: "2026-09-01",
  status: "REGISTERED",
  positions: [],
  payableSettlementId: 99,
};

describe("ProjectConfirm", () => {
  beforeEach(() => {
    mockUseProjectRegister.mockReturnValue({
      form,
      patch: jest.fn(),
      registeredProject: null,
      setRegisteredProject,
      clearRegisteredProject: jest.fn(),
      clearDraft: jest.fn(),
      reset: jest.fn(),
    });
    mockToRequest.mockReturnValue(request);
  });

  test("입력한 프로젝트 정보를 요약하고 최종 동의 전에는 등록을 막는다", () => {
    render(<ProjectConfirm />);

    expect(screen.getByText("쇼핑몰 리뉴얼")).toBeInTheDocument();
    expect(screen.getByText("50,000,000원")).toBeInTheDocument();
    expect(screen.getByText(/프론트엔드 개발자 · 2명/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "프로젝트 등록하기" })).toBeDisabled();
  });

  test("최종 동의 후 등록에 성공하면 결과를 저장하고 완료 화면으로 이동한다", async () => {
    const user = userEvent.setup();
    mockCreateProject.mockResolvedValue(response);
    render(<ProjectConfirm />);

    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "프로젝트 등록하기" }));

    expect(mockToRequest).toHaveBeenCalledWith(form);
    expect(mockCreateProject).toHaveBeenCalledWith(request);
    await waitFor(() => expect(setRegisteredProject).toHaveBeenCalledWith(response));
    expect(push).toHaveBeenCalledWith("/client/projects/new/complete");
  });

  test("등록 요청 중에는 중복 제출을 막고 로딩 문구를 표시한다", async () => {
    const user = userEvent.setup();
    mockCreateProject.mockReturnValue(new Promise(() => undefined));
    render(<ProjectConfirm />);

    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "프로젝트 등록하기" }));

    expect(screen.getByRole("button", { name: "등록 중..." })).toBeDisabled();
    expect(mockCreateProject).toHaveBeenCalledTimes(1);
  });

  test("등록에 실패하면 오류 메시지를 표시하고 다시 제출할 수 있다", async () => {
    const user = userEvent.setup();
    mockCreateProject.mockRejectedValue(new Error("프로젝트 등록 API 오류"));
    render(<ProjectConfirm />);

    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "프로젝트 등록하기" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("프로젝트 등록 API 오류");
    expect(screen.getByRole("button", { name: "프로젝트 등록하기" })).toBeEnabled();
    expect(push).not.toHaveBeenCalledWith("/client/projects/new/complete");
  });
});
