"use client";

import type { ReactNode } from "react";

import { Modal } from "@/features/common/components/Modal";

type ActionWarningModalProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  warningItems: string[];
  confirmText: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function ActionWarningModal({ open, title, description, warningItems, confirmText, onClose, onConfirm }: ActionWarningModalProps) {
  return (
    <Modal open={open} onClose={onClose} size="md">
      <h2 className="text-[21px] font-bold text-theme-primary">{title}</h2>
      <div className="mt-4 text-[14px] leading-6 text-theme-secondary">{description}</div>

      <div className="mt-5 rounded-[10px] border border-warning-border bg-warning-surface px-4 py-4">
        <ul className="space-y-2 text-[13px] font-semibold leading-6 text-theme-warning">
          {warningItems.map((item) => <li key={item}>• {item}</li>)}
        </ul>
      </div>

      <div className="mt-6 flex gap-3">
        <button type="button" onClick={onClose} className="h-[52px] flex-1 cursor-pointer rounded-[10px] border border-theme bg-surface text-[15px] font-semibold text-theme-secondary transition hover:bg-surface-subtle">취소</button>
        <button type="button" onClick={onConfirm} className="h-[52px] flex-1 cursor-pointer rounded-[10px] bg-[#ef2024] text-[15px] font-bold text-white transition hover:bg-[#d91d20]">{confirmText}</button>
      </div>
    </Modal>
  );
}
