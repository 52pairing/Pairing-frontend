import type { LoginRole } from "@/features/auth/types";

export type NotificationType =
  | "MATCHING"
  | "NEGOTIATION"
  | "CONTRACT"
  | "MESSAGE";

export interface NotificationItem {
  id: number;
  role: LoginRole;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string;
  isRead: boolean;
  href: string;
}
