"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  FileCheck2,
  FileText,
  HelpCircle,
  MessageCircle,
  UserCheck,
  Users,
  UserX,
  type LucideIcon,
} from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { ConfirmModal, WarningIcon } from "@/features/common/components/Modal";
import { ErrorState } from "@/features/common/components/ErrorState";
import { Header } from "@/features/common/components/header/Header";
import { LoadingState } from "@/features/common/components/Loading";
import { useToast } from "@/features/common/hooks/useToast";
import {
  deleteAllNotifications,
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/features/notification/services/notification";
import { useNotificationStream } from "@/features/notification/stomp/useNotificationStream";
import type { NotificationItem, NotificationType } from "@/features/notification/types/notification";
import type { CurrentUserResponse } from "@/features/auth/types";
import { ApiException } from "@/lib/api";

const NOTIFICATION_ICON: Record<NotificationType, { icon: LucideIcon; className: string }> = {
  MATCHING_RECOMMENDED: { icon: Users, className: "bg-surface-muted text-brand" },
  MATCHING_REQUESTED: { icon: Users, className: "bg-surface-muted text-brand" },
  MATCHING_ACCEPTED: { icon: UserCheck, className: "bg-success-surface text-theme-success" },
  MATCHING_REJECTED: { icon: UserX, className: "bg-danger-surface text-theme-danger" },
  NEGOTIATION_STARTED: { icon: MessageCircle, className: "bg-surface-muted text-brand" },
  NEGOTIATION_PROPOSED: { icon: MessageCircle, className: "bg-surface-muted text-brand" },
  NEGOTIATION_FAILED: { icon: UserX, className: "bg-danger-surface text-theme-danger" },
  CONTRACT_CREATED: { icon: FileText, className: "bg-surface-muted text-brand" },
  CONTRACT_SIGNED: { icon: FileCheck2, className: "bg-success-surface text-theme-success" },
  CONTRACT_REJECTED: { icon: FileText, className: "bg-danger-surface text-theme-danger" },
  SETTLEMENT_DUE: { icon: CreditCard, className: "bg-warning-surface text-theme-warning" },
  INQUIRY_ANSWERED: { icon: HelpCircle, className: "bg-surface-muted text-brand" },
};

const PAGE_SIZE = 20;

interface NotificationsProps {
  // 서버에서 미리 조회한 로그인 사용자 (헤더 깜빡임 방지용)
  initialUser?: CurrentUserResponse | null;
}

export function Notifications({ initialUser = null }: NotificationsProps) {
  const router = useRouter();
  const toast = useToast();
  const user = useCurrentUser(initialUser);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);

  const loadFirstPage = useCallback(async () => {
    setStatus("loading");
    setErrorMessage("");
    try {
      const result = await getNotifications({ page: 0, size: PAGE_SIZE });
      setNotifications(result.content);
      setPage(0);
      setHasMore(result.page + 1 < result.totalPages);
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof ApiException || error instanceof Error
          ? error.message
          : "알림을 불러오지 못했습니다.",
      );
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) void loadFirstPage();
    });
    return () => {
      cancelled = true;
    };
  }, [loadFirstPage]);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await getNotifications({ page: nextPage, size: PAGE_SIZE });
      setNotifications((current) => [...current, ...result.content]);
      setPage(result.page);
      setHasMore(result.page + 1 < result.totalPages);
    } catch {
      toast.error("알림을 더 불러오지 못했습니다.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleRealtimeNotification = useCallback(
    (notification: NotificationItem) => {
      setNotifications((current) => [notification, ...current]);
      toast.info(notification.title);
    },
    [toast],
  );
  const handleReconnect = useCallback(() => {
    void loadFirstPage();
  }, [loadFirstPage]);
  useNotificationStream(user?.accountId, handleRealtimeNotification, {
    onReconnect: handleReconnect,
  });

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.read) {
      setNotifications((current) =>
        current.map((item) =>
          item.notificationId === notification.notificationId
            ? { ...item, read: true }
            : item,
        ),
      );
      try {
        await markNotificationAsRead(notification.notificationId);
      } catch {
        // 읽음 처리 실패는 화면 이동을 막지 않는다.
      }
    }
    if (notification.linkUrl) router.push(notification.linkUrl);
  };

  const handleDelete = async (notificationId: number) => {
    const previous = notifications;
    setNotifications((current) => current.filter((item) => item.notificationId !== notificationId));
    try {
      await deleteNotification(notificationId);
      toast.success("알림을 삭제했습니다.");
    } catch {
      setNotifications(previous);
      toast.error("알림을 삭제하지 못했습니다.");
    }
  };

  const handleReadAll = async () => {
    if (unreadCount === 0) return;
    const previous = notifications;
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    try {
      await markAllNotificationsAsRead();
      toast.success("모든 알림을 읽음 처리했습니다.");
    } catch {
      setNotifications(previous);
      toast.error("모든 알림을 읽음 처리하지 못했습니다.");
    }
  };

  const handleDeleteAll = async () => {
    const previous = notifications;
    setNotifications([]);
    setIsDeleteAllModalOpen(false);
    try {
      await deleteAllNotifications();
      toast.success("모든 알림을 삭제했습니다.");
    } catch {
      setNotifications(previous);
      toast.error("모든 알림을 삭제하지 못했습니다.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        role={user?.role === "FREELANCER" ? "freelancer" : "client"}
        initialUser={initialUser}
      />
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
                onClick={() => void handleReadAll()}
                disabled={unreadCount === 0}
                className="rounded-md px-2 py-2 text-[#3478f6] transition hover:bg-[#eef5ff] disabled:cursor-not-allowed disabled:text-theme-muted disabled:hover:bg-transparent"
              >
                모두 읽음
              </button>
              <span className="text-theme" aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => setIsDeleteAllModalOpen(true)}
                disabled={notifications.length === 0}
                className="rounded-md px-2 py-2 text-theme-danger transition hover:bg-danger-surface disabled:cursor-not-allowed disabled:text-theme-muted disabled:hover:bg-transparent"
              >
                모두 삭제
              </button>
            </div>
          </div>

          {status === "loading" ? (
            <LoadingState className="mt-7" message="알림을 불러오는 중입니다." />
          ) : status === "error" ? (
            <ErrorState className="mt-7" description={errorMessage} onRetry={() => void loadFirstPage()} />
          ) : notifications.length > 0 ? (
            <>
              <ul className="mt-7 space-y-2" aria-label="알림 목록">
                {notifications.map((notification) => (
                  <NotificationCard
                    key={notification.notificationId}
                    notification={notification}
                    onOpen={(item) => void handleNotificationClick(item)}
                    onDelete={(id) => void handleDelete(id)}
                  />
                ))}
              </ul>
              {hasMore ? (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => void handleLoadMore()}
                    disabled={isLoadingMore}
                    className="rounded-lg border border-theme bg-surface px-4 py-2 text-sm font-semibold text-theme-secondary hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoadingMore ? "불러오는 중..." : "더 보기"}
                  </button>
                </div>
              ) : null}
            </>
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
        onConfirm={() => void handleDeleteAll()}
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
  const { icon: Icon, className: iconClassName } = NOTIFICATION_ICON[notification.type] ?? {
    icon: HelpCircle,
    className: "bg-surface-muted text-brand",
  };
  return (
    <li
      className={`group flex min-h-[86px] overflow-hidden rounded-[10px] border transition ${
        notification.read
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
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconClassName}`}
          aria-hidden="true"
        >
          <Icon size={17} strokeWidth={2} />
        </span>
        <span
          className={`mt-[7px] h-2 w-2 shrink-0 rounded-full ${notification.read ? "bg-transparent" : "bg-[#3478f6]"}`}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1">
          <span className={`block text-[13px] leading-5 text-theme-primary sm:text-[14px] ${notification.read ? "font-medium" : "font-bold"}`}>
            {notification.title}
          </span>
          <span className="mt-1 block text-[11px] leading-5 text-theme-secondary sm:text-[12px]">
            {notification.content}
          </span>
          <time className="mt-1 block text-[11px] text-theme-muted">{notification.createdAt}</time>
        </span>
      </button>
      <button
        type="button"
        onClick={() => onDelete(notification.notificationId)}
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
