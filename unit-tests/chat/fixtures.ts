import type {
  ChatMessage,
  ChatMessageBroadcast,
  ChatMessagePage,
  ChatRoom,
} from "@/features/chat/types/chat";

export const firstRoom: ChatRoom = {
  chatRoomId: 11,
  negotiationId: 101,
  counterpartName: "김프리",
  counterpartImageUrl: null,
  projectTitle: "쇼핑몰 프론트엔드 개발",
  status: "ACTIVE",
  lastMessage: "확인했습니다.",
  lastMessageAt: "2026-08-13T09:30:00",
  unreadCount: 2,
  inputEnabled: true,
};

export const secondRoom: ChatRoom = {
  ...firstRoom,
  chatRoomId: 22,
  negotiationId: 202,
  counterpartName: "이개발",
  projectTitle: "관리자 페이지 개발",
  lastMessage: "안녕하세요.",
  lastMessageAt: "2026-08-13T10:30:00",
  unreadCount: 0,
};

export const myMessage: ChatMessage = {
  messageId: 1,
  senderId: 700,
  senderName: "클라이언트",
  senderImageUrl: null,
  messageType: "TEXT",
  content: "반갑습니다.",
  mine: true,
  createdAt: "2026-08-13T09:00:00",
};

export const counterpartMessage: ChatMessage = {
  messageId: 2,
  senderId: 800,
  senderName: "김프리",
  senderImageUrl: null,
  messageType: "TEXT",
  content: "잘 부탁드립니다.",
  mine: false,
  createdAt: "2026-08-13T09:05:00",
};

export const systemMessage: ChatMessage = {
  messageId: 3,
  senderId: null,
  senderName: null,
  senderImageUrl: null,
  messageType: "SYSTEM",
  content: "채팅방이 생성되었습니다.",
  mine: false,
  createdAt: "2026-08-12T18:00:00",
};

export const messagePage = (content: ChatMessage[] = []): ChatMessagePage => ({
  content,
  page: 0,
  size: 30,
  totalElements: content.length,
  totalPages: content.length ? 1 : 0,
  first: true,
  last: true,
});

export const broadcastMessage: ChatMessageBroadcast = {
  chatRoomId: 11,
  messageId: 4,
  senderId: 800,
  senderName: "김프리",
  senderImageUrl: null,
  messageType: "TEXT",
  content: "실시간 메시지입니다.",
  createdAt: "2026-08-13T11:00:00",
};
