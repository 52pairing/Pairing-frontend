import { apiCall } from "@/lib/api";

interface ChatRoomByNegotiationResponse {
  chatRoomId: number;
}

export const getChatRoomByNegotiation = (negotiationId: number) =>
  apiCall<ChatRoomByNegotiationResponse>(
    `/api/v1/chat-rooms/by-negotiation/${negotiationId}`,
  );
