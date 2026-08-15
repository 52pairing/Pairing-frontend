export type NotificationType =
  | "MATCHING_RECOMMENDED"
  | "MATCHING_REQUESTED"
  | "MATCHING_ACCEPTED"
  | "MATCHING_REJECTED"
  | "NEGOTIATION_STARTED"
  | "NEGOTIATION_PROPOSED"
  | "NEGOTIATION_FAILED"
  | "CONTRACT_CREATED"
  | "CONTRACT_SIGNED"
  | "CONTRACT_REJECTED"
  | "SETTLEMENT_DUE"
  | "INQUIRY_ANSWERED";

export interface NotificationItem {
  notificationId: number;
  type: NotificationType;
  title: string;
  content: string;
  linkUrl: string | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationPage {
  content: NotificationItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface GetNotificationsParams {
  unreadOnly?: boolean;
  page?: number;
  size?: number;
}
