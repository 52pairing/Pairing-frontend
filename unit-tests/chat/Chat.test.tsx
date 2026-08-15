import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { getCurrentUser } from "@/features/auth/services/currentUser";
import { Chat } from "@/features/chat/components/Chat";
import {
  getChatMessages,
  getChatRoom,
  getChatRooms,
  markChatRoomRead,
  sendChatMessage,
} from "@/features/chat/services/chatRooms";
import type { ChatMessageBroadcast } from "@/features/chat/types/chat";
import { useChatMessages } from "@/features/chat/stomp/useChatMessages";
import { getProjectJobRoles } from "@/features/client/projects/services/projectPreReview";
import { getContractByNegotiation } from "@/features/contract/services/contracts";
import { getNegotiation } from "@/features/negotiation/services/negotiation";
import { ApiException } from "@/lib/api";
import {
  broadcastMessage,
  counterpartMessage,
  firstRoom,
  messagePage,
  myMessage,
  secondRoom,
  systemMessage,
} from "./fixtures";

let requestedRoomId: string | null = null;
let receiveBroadcast: ((message: ChatMessageBroadcast) => void) | undefined;

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(requestedRoomId ? { chatRoomId: requestedRoomId } : {}),
}));
jest.mock("@/features/chat/services/chatRooms", () => ({
  getChatRooms: jest.fn(),
  getChatRoom: jest.fn(),
  getChatMessages: jest.fn(),
  markChatRoomRead: jest.fn(),
  sendChatMessage: jest.fn(),
}));
jest.mock("@/features/chat/stomp/useChatMessages", () => ({
  useChatMessages: jest.fn((_roomId: number | null, handler: (message: ChatMessageBroadcast) => void) => {
    receiveBroadcast = handler;
  }),
}));
jest.mock("@/features/auth/services/currentUser", () => ({ getCurrentUser: jest.fn() }));
jest.mock("@/features/client/projects/services/projectPreReview", () => ({ getProjectJobRoles: jest.fn() }));
jest.mock("@/features/contract/services/contracts", () => ({ getContractByNegotiation: jest.fn() }));
jest.mock("@/features/negotiation/services/negotiation", () => ({ getNegotiation: jest.fn() }));

const mockGetRooms = jest.mocked(getChatRooms);
const mockGetRoom = jest.mocked(getChatRoom);
const mockGetMessages = jest.mocked(getChatMessages);
const mockMarkRead = jest.mocked(markChatRoomRead);
const mockSendMessage = jest.mocked(sendChatMessage);
const mockGetCurrentUser = jest.mocked(getCurrentUser);
const mockGetJobRoles = jest.mocked(getProjectJobRoles);
const mockGetContract = jest.mocked(getContractByNegotiation);
const mockGetNegotiation = jest.mocked(getNegotiation);
const mockUseChatMessages = jest.mocked(useChatMessages);

const setDefaultResponses = () => {
  mockGetRooms.mockResolvedValue([firstRoom, secondRoom]);
  mockGetRoom.mockImplementation(async (id) => id === secondRoom.chatRoomId ? secondRoom : firstRoom);
  mockGetMessages.mockResolvedValue(messagePage([counterpartMessage, myMessage]));
  mockMarkRead.mockResolvedValue(undefined);
  mockGetCurrentUser.mockResolvedValue({ accountId: 700 } as Awaited<ReturnType<typeof getCurrentUser>>);
  mockGetJobRoles.mockResolvedValue([]);
  mockGetContract.mockRejectedValue(new ApiException("CT_001", "계약 없음", 404));
  mockGetNegotiation.mockResolvedValue({} as Awaited<ReturnType<typeof getNegotiation>>);
};

describe("Chat", () => {
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: jest.fn(),
    });
  });

  beforeEach(() => {
    requestedRoomId = null;
    receiveBroadcast = undefined;
    setDefaultResponses();
  });

  test("채팅방을 최신순으로 표시하고 가장 최근 방을 기본 선택한다", async () => {
    render(<Chat />);

    expect(screen.getByText("불러오는 중...")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "이개발" })).toBeInTheDocument();
    const roomButtons = screen.getAllByRole("button").filter((button) =>
      button.textContent?.includes("개발"),
    );
    expect(roomButtons[0]).toHaveTextContent("이개발");
    expect(roomButtons[1]).toHaveTextContent("김프리");
    expect(mockGetRoom).toHaveBeenCalledWith(22);
    expect(mockGetMessages).toHaveBeenCalledWith(22);
    expect(mockMarkRead).toHaveBeenCalledWith(22);
    expect(screen.queryByText("2")).toBeInTheDocument();
  });

  test("URL의 chatRoomId에 해당하는 채팅방을 선택하고 메시지를 시간순으로 표시한다", async () => {
    requestedRoomId = "11";
    mockGetMessages.mockResolvedValue(messagePage([counterpartMessage, systemMessage]));
    render(<Chat />);

    expect(await screen.findByRole("heading", { name: "김프리" })).toBeInTheDocument();
    const system = screen.getByText("채팅방이 생성되었습니다.");
    const reply = screen.getByText("잘 부탁드립니다.");
    expect(system.compareDocumentPosition(reply) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getAllByText(/2026년 8월/)).toHaveLength(2);
    await waitFor(() => expect(screen.queryByText("2")).not.toBeInTheDocument());
  });

  test("채팅방 버튼을 선택하면 해당 방의 상세와 메시지를 조회한다", async () => {
    const user = userEvent.setup();
    render(<Chat />);
    await screen.findByRole("heading", { name: "이개발" });

    await user.click(screen.getByRole("button", { name: /김프리/ }));

    expect(await screen.findByRole("heading", { name: "김프리" })).toBeInTheDocument();
    expect(mockGetRoom).toHaveBeenLastCalledWith(11);
    expect(mockUseChatMessages).toHaveBeenLastCalledWith(11, expect.any(Function));
  });

  test("메시지를 공백 제거 후 전송하고 성공 시 입력값을 비운다", async () => {
    const user = userEvent.setup();
    const sent = { ...myMessage, messageId: 9, content: "전송할 메시지" };
    mockSendMessage.mockResolvedValue(sent);
    render(<Chat />);
    const input = await screen.findByLabelText("메시지");

    await user.type(input, "  전송할 메시지  ");
    await user.click(screen.getByRole("button", { name: "메시지 보내기" }));

    await waitFor(() => expect(mockSendMessage).toHaveBeenCalledWith(22, "전송할 메시지"));
    expect(input).toHaveValue("");
    expect(screen.getAllByText("전송할 메시지")).toHaveLength(2);
  });

  test("메시지 전송 실패 시 입력값을 유지하고 오류 코드 안내를 표시한다", async () => {
    const user = userEvent.setup();
    mockSendMessage.mockRejectedValue(new ApiException("CH_003", "disabled", 400));
    render(<Chat />);
    const input = await screen.findByLabelText("메시지");

    await user.type(input, "실패 메시지");
    await user.click(screen.getByRole("button", { name: "메시지 보내기" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("현재 메시지를 보낼 수 없습니다.");
    expect(input).toHaveValue("실패 메시지");
  });

  test("실시간 메시지를 추가하고 같은 messageId는 중복 표시하지 않는다", async () => {
    render(<Chat />);
    await screen.findByRole("heading", { name: "이개발" });
    expect(receiveBroadcast).toBeDefined();

    act(() => {
      receiveBroadcast?.(broadcastMessage);
      receiveBroadcast?.(broadcastMessage);
    });

    await waitFor(() => {
      expect(screen.getAllByText("실시간 메시지입니다.").filter((element) => element.tagName === "P")).toHaveLength(1);
    });
    expect(mockMarkRead).toHaveBeenCalledWith(22);
  });

  test("빈 목록과 목록 조회 오류에서 안내 및 재시도를 제공한다", async () => {
    const user = userEvent.setup();
    mockGetRooms.mockRejectedValueOnce(new Error("채팅 목록 오류"));
    render(<Chat />);

    expect(await screen.findByRole("alert")).toHaveTextContent("채팅 목록 오류");
    expect(screen.getByText("대화가 없습니다.")).toBeInTheDocument();

    mockGetRooms.mockResolvedValueOnce([]);
    await user.click(screen.getByRole("button", { name: "다시 시도" }));
    await waitFor(() => expect(mockGetRooms).toHaveBeenCalledTimes(2));
    expect(screen.getByText("대화를 선택해 주세요.")).toBeInTheDocument();
  });

  test("입력이 비활성화된 방에서는 메시지를 전송할 수 없다", async () => {
    mockGetRooms.mockResolvedValue([{ ...secondRoom, inputEnabled: false }]);
    mockGetRoom.mockResolvedValue({ ...secondRoom, inputEnabled: false });
    render(<Chat />);

    const input = await screen.findByLabelText("메시지");
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("placeholder", "현재 메시지를 보낼 수 없습니다.");
    expect(screen.getByRole("button", { name: "메시지 보내기" })).toBeDisabled();
    expect(mockSendMessage).not.toHaveBeenCalled();
  });
});
