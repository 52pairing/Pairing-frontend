"use client";

import { useMemo } from "react";
import { useToastContext } from "@/features/common/components/Toast";
import type { ToastOptions } from "@/features/common/types/ui";

type MessageOptions = Omit<ToastOptions, "type">;

/**
 * 전역 토스트 호출 훅.
 *
 * @example
 * const toast = useToast();
 * toast.success("저장되었습니다.");
 * toast.error("요청에 실패했습니다.");
 */
export const useToast = () => {
  const { showToast } = useToastContext();

  return useMemo(
    () => ({
      show: showToast,
      success: (message: string, options?: MessageOptions) =>
        showToast(message, { ...options, type: "success" }),
      error: (message: string, options?: MessageOptions) =>
        showToast(message, { ...options, type: "error" }),
      info: (message: string, options?: MessageOptions) =>
        showToast(message, { ...options, type: "info" }),
    }),
    [showToast],
  );
};
