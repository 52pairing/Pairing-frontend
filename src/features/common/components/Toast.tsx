"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useHydrated } from "@/features/common/hooks/useHydrated";
import type {
  ToastItem,
  ToastOptions,
  ToastType,
} from "@/features/common/types/ui";

const DEFAULT_DURATION = 3000;

/* -------------------------------------------------------------------------- */
/* 단일 토스트 UI                                                              */
/* -------------------------------------------------------------------------- */

// 종류별 색상 스타일 (추후 디자인 토큰으로 교체 예정)
const TOAST_STYLE: Record<ToastType, string> = {
  success: "border-green-500 bg-green-50 text-green-800",
  error: "border-red-500 bg-red-50 text-red-800",
  info: "border-blue-500 bg-blue-50 text-blue-800",
};

interface ToastProps {
  toast: ToastItem;
  onClose: (id: string) => void;
}

const Toast = ({ toast, onClose }: ToastProps) => {
  return (
    <div
      role="alert"
      className={`pointer-events-auto flex min-w-64 max-w-sm items-start gap-3 rounded-lg border-l-4 px-4 py-3 shadow-md ${TOAST_STYLE[toast.type]}`}
    >
      <p className="flex-1 text-sm break-words">{toast.message}</p>
      <button
        type="button"
        onClick={() => onClose(toast.id)}
        aria-label="알림 닫기"
        className="shrink-0 text-lg leading-none opacity-60 hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 토스트 스택 컨테이너 (Portal)                                               */
/* -------------------------------------------------------------------------- */

interface ToastContainerProps {
  toasts: ToastItem[];
  onClose: (id: string) => void;
}

const ToastContainer = ({ toasts, onClose }: ToastContainerProps) => {
  const hydrated = useHydrated();

  // Portal은 하이드레이션 이후 클라이언트에서만 렌더링 (mismatch 방지)
  if (!hydrated) {
    return null;
  }

  return createPortal(
    <div
      className="pointer-events-none fixed top-4 right-4 z-50 flex flex-col gap-2"
      role="region"
      aria-label="알림 목록"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>,
    document.body,
  );
};

/* -------------------------------------------------------------------------- */
/* 전역 Provider + Context                                                     */
/* -------------------------------------------------------------------------- */

interface ToastContextValue {
  showToast: (message: string, options?: ToastOptions) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** 내부용 Context 접근. 앱 코드에서는 useToast 훅을 사용합니다. */
export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast는 ToastProvider 내부에서만 사용할 수 있습니다.");
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, options?: ToastOptions) => {
      idRef.current += 1;
      const id = `toast-${idRef.current}`;
      const toast: ToastItem = {
        id,
        message,
        type: options?.type ?? "info",
        duration: options?.duration ?? DEFAULT_DURATION,
      };

      setToasts((prev) => [...prev, toast]);

      if (toast.duration > 0) {
        window.setTimeout(() => removeToast(id), toast.duration);
      }
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};
