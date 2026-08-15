export interface ChatRoom {
  chatRoomId: number;
  negotiationId: number;
  counterpartName: string | null;
  counterpartImageUrl: string | null;
  projectTitle: string | null;
  status: "ACTIVE" | "CLOSED";
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  inputEnabled: boolean;
  leaveEnabled: boolean;
}

export type ChatRoomListItem = ChatRoom;
export type ChatRoomDetail = ChatRoom;

export type ChatMessageType = "TEXT" | "SYSTEM";

export interface ChatMessage {
  messageId: number;
  senderId: number | null;
  senderName: string | null;
  senderImageUrl: string | null;
  messageType: ChatMessageType;
  content: string;
  mine: boolean;
  createdAt: string;
}

export interface ChatMessageBroadcast extends Omit<ChatMessage, "mine"> {
  chatRoomId: number;
}

export interface ChatMessagePage {
  content: ChatMessage[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
