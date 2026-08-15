import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ClientProjectDetail } from "@/features/client/myprojects/components/ClientProjectDetail";
import {
  cancelProjectRegistration,
  getClientProjectDetail,
} from "@/features/client/myprojects/services/projectDetail";
import {
  getProjectJobRoles,
  getProjectSkills,
  getProjectWorkConditions,
} from "@/features/client/projects/services/projectPreReview";
import { projectDetail } from "./fixtures";

let queryTab: string | null = null;
const push = jest.fn();

jest.mock("next/navigation", () => ({
  useParams: () => ({ projectId: "7" }),
  useRouter: () => ({ push }),
  useSearchParams: () => ({
    get: (key: string) => key === "tab" ? queryTab : null,
  }),
}));

jest.mock("@/features/client/myprojects/services/projectDetail", () => ({
  getClientProjectDetail: jest.fn(),
  cancelProjectRegistration: jest.fn(),
  extendProjectRecruitment: jest.fn(),
  closeProjectRecruitment: jest.fn(),
  completeClientProject: jest.fn(),
}));

jest.mock("@/features/client/projects/services/projectPreReview", () => ({
  getProjectJobRoles: jest.fn(),
  getProjectSkills: jest.fn(),
  getProjectWorkConditions: jest.fn(),
}));

jest.mock("@/features/client/myprojects/information/components/ProjectInformation", () => ({
  ProjectInformation: ({ workStyleLabel }: { workStyleLabel: string }) => <div>프로젝트 정보 화면 · {workStyleLabel}</div>,
}));
jest.mock("@/features/contract/components/client/ProjectContracts", () => ({
  ProjectContracts: ({ projectId }: { projectId: string }) => <div>계약 화면 {projectId}</div>,
}));
jest.mock("@/features/client/myprojects/progress/components/ProjectProgress", () => ({
  ProjectProgress: () => <div>진행 현황 화면</div>,
}));
jest.mock("@/features/negotiation/components/ProjectNegotiation", () => ({
  ProjectNegotiation: () => <div>협상 화면</div>,
  NegotiationActions: () => null,
}));
jest.mock("@/features/matching/components/RecommendedCandidates", () => ({
  RecommendedCandidates: () => <div>추천 후보 화면</div>,
}));
jest.mock("@/features/matching/components/CandidateRerollActions", () => ({
  CandidateRerollActions: () => null,
}));
jest.mock("@/features/payment/components/PaymentMethodModal", () => ({
  PaymentMethodModal: () => null,
}));
jest.mock("@/features/common/components/Modal", () => ({
  ConfirmModal: ({ open, title, confirmText, onConfirm }: { open: boolean; title: string; confirmText: string; onConfirm: () => void }) =>
    open ? <div><p>{title}</p><button type="button" onClick={onConfirm}>{confirmText}</button></div> : null,
}));

const mockGetDetail = jest.mocked(getClientProjectDetail);
const mockCancel = jest.mocked(cancelProjectRegistration);
const mockGetJobRoles = jest.mocked(getProjectJobRoles);
const mockGetSkills = jest.mocked(getProjectSkills);
const mockGetWorkConditions = jest.mocked(getProjectWorkConditions);

describe("ClientProjectDetail", () => {
  beforeEach(() => {
    queryTab = null;
    mockGetDetail.mockResolvedValue(projectDetail);
    mockGetJobRoles.mockResolvedValue([{ code: "FRONTEND", label: "프론트엔드 개발자", parentCode: "DEVELOPMENT" }]);
    mockGetSkills.mockResolvedValue([{ code: "REACT", label: "React" }]);
    mockGetWorkConditions.mockResolvedValue({
      workStyles: [{ code: "REMOTE", label: "재택" }],
      workForms: [{ code: "FULL_TIME", label: "풀타임" }],
      periodUnits: [{ code: "MONTH", label: "개월" }],
    });
  });

  test("상세 정보와 메타데이터 라벨을 조회해 표시한다", async () => {
    render(<ClientProjectDetail />);

    expect(screen.getByText("프로젝트 상세를 불러오고 있습니다.")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "쇼핑몰 리뉴얼" })).toBeInTheDocument();
    expect(screen.getByText("등록 완료")).toBeInTheDocument();
    expect(screen.getByText("프로젝트 정보 화면 · 재택")).toBeInTheDocument();
    expect(mockGetDetail).toHaveBeenCalledWith(7);
  });

  test("계약 탭을 선택하면 해당 프로젝트의 계약 화면을 표시한다", async () => {
    const user = userEvent.setup();
    render(<ClientProjectDetail />);
    await screen.findByRole("heading", { name: "쇼핑몰 리뉴얼" });

    await user.click(screen.getByRole("button", { name: "계약" }));

    expect(screen.getByText("계약 화면 7")).toBeInTheDocument();
  });

  test("등록 완료 프로젝트는 등록 취소 확인 후 API를 호출하고 상세를 다시 조회한다", async () => {
    const user = userEvent.setup();
    mockCancel.mockResolvedValue(projectDetail);
    render(<ClientProjectDetail />);
    await screen.findByRole("heading", { name: "쇼핑몰 리뉴얼" });

    await user.click(screen.getByRole("button", { name: "프로젝트 관리 메뉴" }));
    await user.click(screen.getByRole("menuitem", { name: "등록 취소" }));
    expect(screen.getByText("프로젝트 등록을 취소하시겠습니까?")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "등록 취소" }));

    expect(mockCancel).toHaveBeenCalledWith(7);
    expect(mockGetDetail).toHaveBeenCalledTimes(2);
  });

  test("상세 조회 실패 시 오류와 다시 시도 버튼을 표시한다", async () => {
    mockGetDetail.mockRejectedValue(new Error("프로젝트 상세 API 오류"));
    render(<ClientProjectDetail />);

    expect(await screen.findByText("프로젝트 상세 API 오류")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다시 시도" })).toBeInTheDocument();
  });
});
