import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ProjectProgress } from "@/features/client/myprojects/progress/components/ProjectProgress";
import { getChatRoomByNegotiation } from "@/features/chat/services/chatRooms";
import { getClientProjectContracts } from "@/features/client/myprojects/contract/services/contracts";
import { getContractDetail } from "@/features/contract/services/contracts";
import { contractItem, contractPage, projectDetail } from "./fixtures";

const push = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));
jest.mock("@/features/client/myprojects/contract/services/contracts", () => ({
  getClientProjectContracts: jest.fn(),
}));
jest.mock("@/features/contract/services/contracts", () => ({
  getContractDetail: jest.fn(),
}));
jest.mock("@/features/chat/services/chatRooms", () => ({
  getChatRoomByNegotiation: jest.fn(),
}));

const mockGetContracts = jest.mocked(getClientProjectContracts);
const mockGetDetail = jest.mocked(getContractDetail);
const mockGetChatRoom = jest.mocked(getChatRoomByNegotiation);

const progressContract = { ...contractItem, status: "IN_PROGRESS" as const };

describe("ProjectProgress", () => {
  beforeEach(() => {
    mockGetContracts.mockResolvedValue(contractPage([
      progressContract,
      { ...contractItem, contractId: 32, status: "SIGN_PENDING" },
    ]));
    mockGetDetail.mockResolvedValue({ negotiationId: 77 } as Awaited<ReturnType<typeof getContractDetail>>);
  });

  test("진행 상태 계약만 표시하고 프로젝트 정보를 함께 보여준다", async () => {
    render(<ProjectProgress project={{ ...projectDetail, status: "IN_PROGRESS" }} jobRoleLabels={{ FRONTEND: "프론트엔드 개발자" }} workStyleLabel="재택" />);

    expect(screen.getByText("계약 진행 현황을 불러오고 있습니다.")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "김개발" })).toBeInTheDocument();
    expect(screen.getByText("프론트엔드 개발자 · 월 5,000,000원")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /계약서/ })).toHaveAttribute("href", "/client/projects/7/contracts/31");
    expect(mockGetDetail).toHaveBeenCalledTimes(1);
    expect(screen.getByText("50,000,000원")).toBeInTheDocument();
  });

  test("채팅 버튼을 누르면 협상 채팅방을 조회하고 이동한다", async () => {
    const user = userEvent.setup();
    mockGetChatRoom.mockResolvedValue({ chatRoomId: 88 } as Awaited<ReturnType<typeof getChatRoomByNegotiation>>);
    render(<ProjectProgress project={projectDetail} jobRoleLabels={{ FRONTEND: "프론트엔드 개발자" }} workStyleLabel="재택" />);
    await screen.findByRole("heading", { name: "김개발" });

    await user.click(screen.getByRole("button", { name: "채팅" }));

    expect(mockGetChatRoom).toHaveBeenCalledWith(77);
    expect(push).toHaveBeenCalledWith("/chat?chatRoomId=88");
  });

  test("진행 상태 계약이 없으면 빈 상태를 표시한다", async () => {
    mockGetContracts.mockResolvedValue(contractPage([{ ...contractItem, status: "SIGNED" }]));
    render(<ProjectProgress project={projectDetail} jobRoleLabels={{}} workStyleLabel="재택" />);

    expect(await screen.findByText("진행 중인 계약이 없습니다.")).toBeInTheDocument();
    expect(mockGetDetail).not.toHaveBeenCalled();
  });

  test("계약 조회 실패 시 오류와 재시도를 표시한다", async () => {
    mockGetContracts.mockRejectedValue(new Error("진행 계약 API 오류"));
    render(<ProjectProgress project={projectDetail} jobRoleLabels={{}} workStyleLabel="재택" />);

    expect(await screen.findByRole("alert")).toHaveTextContent("진행 계약 API 오류");
    expect(screen.getByRole("button", { name: "다시 시도" })).toBeInTheDocument();
  });
});
