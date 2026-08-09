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
      <h2 className="text-[21px] font-bold text-[#151b2b]">{title}</h2>
      <div className="mt-4 text-[14px] leading-6 text-[#657084]">{description}</div>

      <div className="mt-5 rounded-[10px] border border-[#ffd46a] bg-[#fff5d6] px-4 py-4">
        <ul className="space-y-2 text-[13px] font-semibold leading-6 text-[#a64b12]">
          {warningItems.map((item) => <li key={item}>• {item}</li>)}
        </ul>
      </div>

      <div className="mt-6 flex gap-3">
        <button type="button" onClick={onClose} className="h-[52px] flex-1 cursor-pointer rounded-[10px] border border-[#dde2e8] bg-white text-[15px] font-semibold text-[#737f91] transition hover:bg-[#f8f9fb]">취소</button>
        <button type="button" onClick={onConfirm} className="h-[52px] flex-1 cursor-pointer rounded-[10px] bg-[#ef2024] text-[15px] font-bold text-white transition hover:bg-[#d91d20]">{confirmText}</button>
      </div>
    </Modal>
  );
}
