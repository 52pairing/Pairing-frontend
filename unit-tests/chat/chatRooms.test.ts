import {
  getChatMessages,
  getChatRoom,
  getChatRoomByNegotiation,
  getChatRooms,
  getChatUnreadCount,
  leaveChatRoom,
  markChatRoomRead,
  sendChatMessage,
} from "@/features/chat/services/chatRooms";
import { apiCall } from "@/lib/api";

jest.mock("@/lib/api", () => ({ apiCall: jest.fn() }));

const mockApiCall = jest.mocked(apiCall);

describe("chatRooms service", () => {
  test("채팅방 조회 API 경로를 구성한다", () => {
    getChatRooms();
    getChatRoom(11);
    getChatRoomByNegotiation(101);
    getChatMessages(11);
    getChatMessages(11, 2, 15);

    expect(mockApiCall).toHaveBeenNthCalledWith(1, "/api/v1/chat-rooms");
    expect(mockApiCall).toHaveBeenNthCalledWith(2, "/api/v1/chat-rooms/11");
    expect(mockApiCall).toHaveBeenNthCalledWith(3, "/api/v1/chat-rooms/by-negotiation/101");
    expect(mockApiCall).toHaveBeenNthCalledWith(4, "/api/v1/chat-rooms/11/messages?page=0&size=30");
    expect(mockApiCall).toHaveBeenNthCalledWith(5, "/api/v1/chat-rooms/11/messages?page=2&size=15");
  });

  test("메시지 전송 내용을 JSON body로 전달한다", () => {
    sendChatMessage(11, "안녕하세요.");

    expect(mockApiCall).toHaveBeenCalledWith("/api/v1/chat-rooms/11/messages", {
      method: "POST",
      body: JSON.stringify({ content: "안녕하세요." }),
    });
  });

  test("읽음·나가기·전체 미읽음 수 API를 호출한다", () => {
    markChatRoomRead(11);
    leaveChatRoom(11);
    getChatUnreadCount();

    expect(mockApiCall).toHaveBeenNthCalledWith(1, "/api/v1/chat-rooms/11/read", { method: "POST" });
    expect(mockApiCall).toHaveBeenNthCalledWith(2, "/api/v1/chat-rooms/11/leave", { method: "POST" });
    expect(mockApiCall).toHaveBeenNthCalledWith(3, "/api/v1/chat-rooms/unread-count");
  });
});
