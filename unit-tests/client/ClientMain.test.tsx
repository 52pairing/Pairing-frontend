import { render, screen, waitFor } from "@testing-library/react";

import { ClientMain } from "@/features/client/components/ClientMain";
import { getClientMyGrade } from "@/features/client/mypage/services/grade";

jest.mock("@/features/auth/hooks/useCurrentUser", () => ({
  useCurrentUserState: () => ({
    user: { accountId: 1, companyName: "페어링심사7", role: "CLIENT" },
    isLoading: false,
  }),
}));

jest.mock("@/features/client/mypage/services/grade", () => ({
  getClientMyGrade: jest.fn(),
}));

const mockedGetClientMyGrade = jest.mocked(getClientMyGrade);

beforeEach(() => {
  jest.clearAllMocks();
});

it("서버 사용자명과 등급을 첫 렌더부터 함께 표시한다", () => {
  render(
    <ClientMain
      initialGrade={{
        grade: "GOLD",
        label: "골드",
        completedProjectCount: 5,
        ratingAverage: 4.5,
        nextGrade: "DIAMOND",
        nextGradeGuide: null,
        checkedGuide: "",
      }}
    />,
  );

  expect(screen.getByText("골드 등급")).toBeInTheDocument();
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    "페어링심사7 님,",
  );
  expect(mockedGetClientMyGrade).not.toHaveBeenCalled();
});

it("서버 등급이 없으면 배지 자리를 유지하며 클라이언트 조회로 폴백한다", async () => {
  mockedGetClientMyGrade.mockResolvedValue({ label: "실버" } as never);

  render(<ClientMain />);

  expect(screen.getByText("등급 확인 중")).toHaveClass("invisible");
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    "페어링심사7 님,",
  );

  await waitFor(() => expect(screen.getByText("실버 등급")).toBeInTheDocument());
});
