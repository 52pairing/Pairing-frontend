"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { LoginRole } from "@/features/auth/types";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { ConfirmModal, WarningIcon } from "@/features/common/components/Modal";
import { Header } from "@/features/common/components/header/Header";
import { useToast } from "@/features/common/hooks/useToast";
import { MOCK_NOTIFICATIONS } from "@/features/notification/constants/mockNotifications";
import type { NotificationItem } from "@/features/notification/types/notification";
import { useMatchingNotifications } from "@/features/matching/stomp/useMatchingNotifications";
import type { MatchingNotification } from "@/features/matching/types/matching";

export function Notifications() {
  const router = useRouter();
  const toast = useToast();
  const user = useCurrentUser();
  const role: LoginRole = user?.role ?? "CLIENT";
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);

  const handleMatchingNotification = useCallback((notification: MatchingNotification) => {
    const requestId = notification.linkUrl.match(/\/requests\/(\d+)/)?.[1];
    const positionId = notification.linkUrl.match(/\/positions\/(\d+)\//)?.[1];
    const href = requestId ? `/matchings/requests/${requestId}` : role === "CLIENT" && positionId ? `/matchings/positions/${positionId}/candidates` : "/notifications";
    const fallbackTitle = notification.type === "MATCHING_REQUESTED" ? "새로운 매칭 요청이 도착했습니다." : notification.type === "MATCHING_ACCEPTED" ? "매칭 요청이 수락되었습니다." : notification.type === "MATCHING_REJECTED" ? "매칭 요청 결과를 확인해 주세요." : "AI 재추천이 완료되었습니다.";
    setNotifications((current) => [{ id: Date.now(), role, type: "MATCHING", title: notification.title ?? fallbackTitle, description: notification.message ?? "자세한 내용을 확인해 주세요.", createdAt: "방금 전", isRead: false, href }, ...current]);
  }, [role]);
  useMatchingNotifications(user?.accountId, handleMatchingNotification);

  const visibleNotifications = useMemo(
    () => notifications.filter((notification) => notification.role === role),
    [notifications, role],
  );
  const unreadCount = visibleNotifications.filter((notification) => !notification.isRead).length;

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.isRead) {
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, isRead: true } : item,
        ),
      );
    }
    router.push(notification.href);
  };

  const handleDelete = (notificationId: number) => {
    setNotifications((current) => current.filter((item) => item.id !== notificationId));
    toast.success("알림을 삭제했습니다.");
  };

  const handleReadAll = () => {
    if (unreadCount === 0) return;

    setNotifications((current) =>
      current.map((item) => (item.role === role ? { ...item, isRead: true } : item)),
    );
    toast.success("모든 알림을 읽음 처리했습니다.");
  };

  const handleDeleteAll = () => {
    setNotifications((current) => current.filter((item) => item.role !== role));
    setIsDeleteAllModalOpen(false);
    toast.success("모든 알림을 삭제했습니다.");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header role={role === "FREELANCER" ? "freelancer" : "client"} />
      <main className="flex-1 px-5 pb-20 pt-10 sm:px-8 sm:pt-12">
        <section className="mx-auto w-full max-w-[700px]" aria-labelledby="notifications-title">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 id="notifications-title" className="text-[24px] font-extrabold tracking-[-0.04em] text-theme-primary">
                알림
              </h1>
              <p className="mt-2 text-[12px] text-theme-muted">
                새로운 프로젝트와 계약 소식을 확인하세요.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1 text-[12px] font-bold sm:gap-2 sm:text-[13px]">
              <button
                type="button"
                onClick={handleReadAll}
                disabled={unreadCount === 0}
                className="rounded-md px-2 py-2 text-[#3478f6] transition hover:bg-[#eef5ff] disabled:cursor-not-allowed disabled:text-theme-muted disabled:hover:bg-transparent"
              >
                모두 읽음
              </button>
              <span className="text-theme" aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => setIsDeleteAllModalOpen(true)}
                disabled={visibleNotifications.length === 0}
                className="rounded-md px-2 py-2 text-theme-danger transition hover:bg-danger-surface disabled:cursor-not-allowed disabled:text-theme-muted disabled:hover:bg-transparent"
              >
                모두 삭제
              </button>
            </div>
          </div>

          {visibleNotifications.length > 0 ? (
            <ul className="mt-7 space-y-2" aria-label="알림 목록">
              {visibleNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onOpen={handleNotificationClick}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          ) : (
            <EmptyNotifications />
          )}
        </section>
      </main>

      <ConfirmModal
        open={isDeleteAllModalOpen}
        title="모든 알림을 삭제할까요?"
        description="삭제한 알림은 다시 확인할 수 없습니다."
        confirmText="모두 삭제"
        cancelText="취소"
        variant="danger"
        icon={<WarningIcon />}
        onConfirm={handleDeleteAll}
        onClose={() => setIsDeleteAllModalOpen(false)}
      />
    </div>
  );
}

interface NotificationCardProps {
  notification: NotificationItem;
  onOpen: (notification: NotificationItem) => void;
  onDelete: (notificationId: number) => void;
}

function NotificationCard({ notification, onOpen, onDelete }: NotificationCardProps) {
  return (
    <li
      className={`group flex min-h-[86px] overflow-hidden rounded-[10px] border transition ${
        notification.isRead
          ? "border-theme bg-surface hover:bg-surface-subtle"
          : "border-[#c9dcfa] bg-[#eef5ff] hover:bg-[#e6f0ff] dark:border-[#315d91] dark:bg-[#172a44] dark:hover:bg-[#1b3150]"
      }`}
    >
      <button
        type="button"
        onClick={() => onOpen(notification)}
        className="flex min-w-0 flex-1 items-start gap-3 px-4 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3478f6] sm:px-5"
        aria-label={`${notification.title} 상세 페이지로 이동`}
      >
        <span
          className={`mt-[7px] h-2 w-2 shrink-0 rounded-full ${notification.isRead ? "bg-transparent" : "bg-[#3478f6]"}`}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1">
          <span className={`block text-[13px] leading-5 text-theme-primary sm:text-[14px] ${notification.isRead ? "font-medium" : "font-bold"}`}>
            {notification.title}
          </span>
          <span className="mt-1 block text-[11px] leading-5 text-theme-secondary sm:text-[12px]">
            {notification.description}
          </span>
          <time className="mt-1 block text-[11px] text-theme-muted">{notification.createdAt}</time>
        </span>
      </button>
      <button
        type="button"
        onClick={() => onDelete(notification.id)}
        aria-label={`${notification.title} 알림 삭제`}
        className="m-2 flex h-10 w-10 shrink-0 items-center justify-center self-start rounded-lg text-theme-muted transition hover:bg-danger-surface hover:text-theme-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-danger"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[18px] w-[18px]" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12m-10 0 .6 12h6.8L16 7m-6-3h4l1 3H9l1-3Z" />
        </svg>
      </button>
    </li>
  );
}

function EmptyNotifications() {
  return (
    <div className="mt-7 flex min-h-[300px] flex-col items-center justify-center rounded-[12px] border border-theme bg-surface px-5 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted text-theme-muted" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-7 w-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
        </svg>
      </span>
      <h2 className="mt-4 text-[15px] font-bold text-theme-primary">새로운 알림이 없습니다</h2>
      <p className="mt-2 text-[12px] leading-5 text-theme-muted">프로젝트와 계약 소식이 도착하면 알려드릴게요.</p>
    </div>
  );
}
