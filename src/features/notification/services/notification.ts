import { apiCall } from "@/lib/api";
import type {
  GetNotificationsParams,
  NotificationPage,
  UnreadCountResponse,
} from "@/features/notification/types/notification";

export const getNotifications = ({
  unreadOnly = false,
  page = 0,
  size = 20,
}: GetNotificationsParams = {}) => {
  const query = new URLSearchParams({
    unreadOnly: String(unreadOnly),
    page: String(page),
    size: String(size),
  });

  return apiCall<NotificationPage>(`/api/v1/notifications?${query}`);
};

export const getUnreadNotificationCount = () =>
  apiCall<UnreadCountResponse>("/api/v1/notifications/unread-count");

export const markNotificationAsRead = (notificationId: number) =>
  apiCall<null>(`/api/v1/notifications/${notificationId}/read`, {
    method: "PUT",
  });

export const markAllNotificationsAsRead = () =>
  apiCall<null>("/api/v1/notifications/read-all", { method: "PUT" });

export const deleteNotification = (notificationId: number) =>
  apiCall<null>(`/api/v1/notifications/${notificationId}`, {
    method: "DELETE",
  });

export const deleteAllNotifications = () =>
  apiCall<null>("/api/v1/notifications", { method: "DELETE" });
