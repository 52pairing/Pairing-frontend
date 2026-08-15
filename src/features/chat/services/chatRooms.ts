import { apiCall } from "@/lib/api";
import type { ChatMessage, ChatMessagePage, ChatRoom, ChatRoomDetail, ChatRoomListItem } from "@/features/chat/types/chat";

export const getChatRoomByNegotiation = (negotiationId: number) =>
  apiCall<ChatRoom>(
    `/api/v1/chat-rooms/by-negotiation/${negotiationId}`,
  );

const BASE = "/api/v1/chat-rooms";

export const getChatRooms = () => apiCall<ChatRoomListItem[]>(BASE);

export const getChatRoom = (chatRoomId: number) =>
  apiCall<ChatRoomDetail>(`${BASE}/${chatRoomId}`);

export const getChatMessages = (chatRoomId: number, page = 0, size = 30) =>
  apiCall<ChatMessagePage>(`${BASE}/${chatRoomId}/messages?page=${page}&size=${size}`);

export const sendChatMessage = (chatRoomId: number, content: string) =>
  apiCall<ChatMessage>(`${BASE}/${chatRoomId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });

export const markChatRoomRead = (chatRoomId: number) =>
  apiCall<void>(`${BASE}/${chatRoomId}/read`, { method: "POST" });

export const getChatUnreadCount = () =>
  apiCall<{ unreadCount: number }>(`${BASE}/unread-count`);
