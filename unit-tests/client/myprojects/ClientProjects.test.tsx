import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ClientProjects } from "@/features/client/myprojects/components/ClientProjects";
import { getMyProjects } from "@/features/client/myprojects/services/clientProjects";
import { projectPage, projectListItem } from "./fixtures";

const push = jest.fn();
const replace = jest.fn();
let tab: string | null = null;
let pageParam: string | null = null;

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
  useSearchParams: () => ({
    get: (key: string) => (key === "page" ? pageParam : tab),
  }),
}));

// totalPages > 1 인 다중 페이지 응답 (페이지네이션 nav 렌더 조건)
const multiPage = (page: number): ReturnType<typeof projectPage> => ({
  content: [projectListItem],
  page,
  size: 10,
  totalElements: 15,
  totalPages: 2,
  first: page === 0,
  last: page === 1,
});

jest.mock("@/features/client/myprojects/services/clientProjects", () => ({
  getMyProjects: jest.fn(),
  completeProject: jest.fn(),
}));

jest.mock("@/features/payment/components/PaymentMethodModal", () => ({
  PaymentMethodModal: () => null,
}));

const mockGetMyProjects = jest.mocked(getMyProjects);

describe("ClientProjects", () => {
  beforeEach(() => {
    tab = null;
    pageParam = null;
    push.mockClear();
    replace.mockClear();
    mockGetMyProjects.mockResolvedValue(projectPage());
  });

  test("기본 등록 완료 탭의 프로젝트 목록을 조회하고 카드 정보를 표시한다", async () => {
    render(<ClientProjects />);

    expect(screen.getByText("프로젝트를 불러오고 있습니다.")).toBeInTheDocument();
    expect(await screen.findByText("쇼핑몰 리뉴얼")).toBeInTheDocument();
    expect(screen.getByText("50,000,000원")).toBeInTheDocument();
    expect(mockGetMyProjects).toHaveBeenCalledWith({ tab: "REGISTERED", page: 0, size: 10 });
  });

  test("탭을 선택하면 URL과 조회 조건을 변경한다", async () => {
    const user = userEvent.setup();
    render(<ClientProjects />);
    await screen.findByText("쇼핑몰 리뉴얼");

    await user.click(screen.getByRole("button", { name: "진행 중" }));

    expect(replace).toHaveBeenCalledWith("/client/projects?tab=IN_PROGRESS", { scroll: false });
    expect(mockGetMyProjects).toHaveBeenLastCalledWith({ tab: "IN_PROGRESS", page: 0, size: 10 });
  });

  test("조회 결과가 없으면 빈 상태를 표시한다", async () => {
    mockGetMyProjects.mockResolvedValue(projectPage([]));
    render(<ClientProjects />);

    expect(await screen.findByText("해당 상태의 프로젝트가 없습니다.")).toBeInTheDocument();
  });

  test("다음 페이지로 이동하면 page 쿼리를 URL에 반영하고 해당 페이지를 조회한다", async () => {
    const user = userEvent.setup();
    mockGetMyProjects.mockResolvedValueOnce(multiPage(0));
    mockGetMyProjects.mockResolvedValueOnce(multiPage(1));
    render(<ClientProjects />);
    await screen.findByText("쇼핑몰 리뉴얼");

    await user.click(screen.getByRole("button", { name: "다음" }));

    expect(replace).toHaveBeenCalledWith(
      "/client/projects?tab=REGISTERED&page=2",
      { scroll: false },
    );
    expect(mockGetMyProjects).toHaveBeenLastCalledWith({
      tab: "REGISTERED",
      page: 1,
      size: 10,
    });
  });

  test("URL에 page 쿼리가 있으면 새로고침 시 해당 페이지를 조회한다", async () => {
    pageParam = "2"; // 1-based → 내부 page 1
    mockGetMyProjects.mockResolvedValue(multiPage(1));
    render(<ClientProjects />);
    await screen.findByText("쇼핑몰 리뉴얼");

    expect(mockGetMyProjects).toHaveBeenCalledWith({
      tab: "REGISTERED",
      page: 1,
      size: 10,
    });
  });

  test("조회 실패 시 오류와 재시도를 제공한다", async () => {
    const user = userEvent.setup();
    mockGetMyProjects.mockRejectedValueOnce(new Error("프로젝트 목록 API 오류"));
    render(<ClientProjects />);

    expect(await screen.findByRole("alert")).toHaveTextContent("프로젝트 목록 API 오류");
    mockGetMyProjects.mockResolvedValue(projectPage());
    await user.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(await screen.findByText("쇼핑몰 리뉴얼")).toBeInTheDocument();
    expect(mockGetMyProjects).toHaveBeenCalledTimes(2);
  });
});
