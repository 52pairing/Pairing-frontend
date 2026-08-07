"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useHydrated } from "@/features/common/hooks/useHydrated";

// 모달 내부에서 포커스 이동 대상이 되는 요소 셀렉터
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

// 모든 모달이 공유하는 카드 크기 (여기 한 곳에서만 관리)
// - 너비: 384px 고정 / - 최소 높이: 230px (경고 모달은 내용이 더 커서 자연히 넘음)
const MODAL_SIZE = "w-full max-w-sm min-h-[230px]";

/* -------------------------------------------------------------------------- */
/* Modal — 공통 껍데기 (Portal / 오버레이 / ESC / 포커스 트랩 / 스크롤 잠금)   */
/* -------------------------------------------------------------------------- */

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** 오버레이 클릭으로 닫기 (기본 true) */
  closeOnOverlayClick?: boolean;
  /** 제목 요소 id (aria-labelledby) */
  labelledBy?: string;
  /** 설명 요소 id (aria-describedby) */
  describedBy?: string;
}

/**
 * 모든 모달의 토대가 되는 껍데기 컴포넌트.
 * 내용은 children으로 채우고, 자주 쓰는 형태는 ConfirmModal을 사용합니다.
 */
export const Modal = ({
  open,
  onClose,
  children,
  closeOnOverlayClick = true,
  labelledBy,
  describedBy,
}: ModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  // 최신 onClose를 참조해 effect가 매 렌더마다 재실행되지 않도록 함 (포커스 가로채기 방지)
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // 열릴 때 첫 포커스 가능한 요소로 이동 (없으면 다이얼로그 자체)
    const initialFocusables = dialog?.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (initialFocusables && initialFocusables.length > 0) {
      initialFocusables[0].focus();
    } else {
      dialog?.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }

      // 포커스 트랩: Tab이 모달 밖으로 나가지 않도록 순환
      if (event.key !== "Tab" || !dialog) {
        return;
      }
      const items = dialog.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (items.length === 0) {
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // 배경 스크롤 잠금 (스크롤바가 사라지며 생기는 배경 흔들림 방지를 위해 그만큼 padding 보정)
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      // 닫힐 때 이전 포커스 위치로 복귀
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open || !hydrated) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        aria-hidden="true"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        className={`relative z-10 flex flex-col ${MODAL_SIZE} rounded-2xl bg-white p-6 shadow-xl outline-none`}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};

/* -------------------------------------------------------------------------- */
/* WarningIcon — 경고 모달용 기본 아이콘                                       */
/* -------------------------------------------------------------------------- */

/** 빨간 삼각형 경고 아이콘 (경고 모달의 icon prop에 사용) */
export const WarningIcon = () => (
  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-7 w-7 text-red-500"
      aria-hidden="true"
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  </span>
);

/* -------------------------------------------------------------------------- */
/* ConfirmModal — 확인/취소 프리셋 (CheckModal · Confirm · 경고 모두 커버)      */
/* -------------------------------------------------------------------------- */

type ConfirmVariant = "primary" | "danger";

// 확인 버튼 색상 (시안 기준값 — 추후 디자인 토큰으로 교체 예정)
const CONFIRM_STYLE: Record<ConfirmVariant, string> = {
  primary: "bg-[#2c3e5d] text-white hover:bg-[#24334d]",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  /** 확인 버튼 문구 (기본 "확인") */
  confirmText?: string;
  /** 취소 버튼 문구. 생략하면 확인 버튼만 있는 알림형(CheckModal)이 됩니다. */
  cancelText?: string;
  /** 확인 버튼 색상. "danger"면 빨간 버튼 (기본 "primary") */
  variant?: ConfirmVariant;
  /** 상단 아이콘 (경고 모달은 <WarningIcon />) */
  icon?: ReactNode;
  onConfirm: () => void;
  /** 취소 버튼 · 오버레이 · ESC로 닫힐 때 호출 */
  onClose: () => void;
  closeOnOverlayClick?: boolean;
}

/**
 * 확인/취소 프리셋 모달.
 *
 * - 알림형(CheckModal): cancelText 없이 사용
 * - 확인/취소형(Confirm): cancelText 지정
 * - 경고형: variant="danger" + icon={<WarningIcon />}
 */
export const ConfirmModal = ({
  open,
  title,
  description,
  confirmText = "확인",
  cancelText,
  variant = "primary",
  icon,
  onConfirm,
  onClose,
  closeOnOverlayClick = true,
}: ConfirmModalProps) => {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeOnOverlayClick={closeOnOverlayClick}
      labelledBy={titleId}
      describedBy={description ? descriptionId : undefined}
    >
      <div className="flex flex-1 flex-col">
        {/* 텍스트 블록: 카드 안에서 위아래 가운데 정렬 */}
        <div className="flex flex-1 flex-col justify-center">
          {icon ? (
            <div className="mb-4 flex justify-center">{icon}</div>
          ) : null}

          {/* 제목·설명 모두 가운데 정렬 */}
          <h2
            id={titleId}
            className="w-full text-center text-lg font-bold text-gray-900"
          >
            {title}
          </h2>

          {description ? (
            <p
              id={descriptionId}
              className="mt-3 w-full text-center text-sm leading-relaxed text-gray-500"
            >
              {description}
            </p>
          ) : null}
        </div>

        <div className="flex w-full gap-3 pt-6">
          {cancelText ? (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              {cancelText}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-semibold ${CONFIRM_STYLE[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
