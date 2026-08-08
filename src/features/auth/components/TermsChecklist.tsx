// 전체동의 + 개별 약관 체크리스트
"use client";

import { useId, useState } from "react";

import { Modal } from "@/features/common/components/Modal";
import type { TermsItem } from "@/features/auth/types";

interface TermsChecklistProps {
  items: TermsItem[];
  agreed: Record<number, boolean>;
  onChange: (agreed: Record<number, boolean>) => void;
  /** 전체 동의 항목을 강조 카드로 보여줄지 */
  emphasizeAll?: boolean;
}

export const TermsChecklist = ({
  items,
  agreed,
  onChange,
  emphasizeAll = false,
}: TermsChecklistProps) => {
  const [viewingTermsId, setViewingTermsId] = useState<number | null>(null);
  const titleId = useId();

  const allChecked = items.every((item) => agreed[item.termsId]);
  const requiredChecked = areRequiredTermsAgreed(items, agreed);
  const viewingItem = items.find((item) => item.termsId === viewingTermsId);

  const toggleAll = () => {
    const next = !allChecked;
    const nextAgreed: Record<number, boolean> = {};

    items.forEach((item) => {
      nextAgreed[item.termsId] = next;
    });

    onChange(nextAgreed);
  };

  const toggleItem = (termsId: number) => {
    onChange({ ...agreed, [termsId]: !agreed[termsId] });
  };

  return (
    <div className="space-y-3">
      <label
        className={`flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 ${
          emphasizeAll ? "border-[#142B4A] bg-[#F7F8FA]" : "border-gray-200"
        }`}
      >
        <input
          type="checkbox"
          checked={allChecked}
          onChange={toggleAll}
          className="h-4 w-4 accent-[#142B4A]"
        />
        <span className="text-sm font-bold text-[#111827]">전체 동의</span>
      </label>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.termsId}
            className="flex items-center justify-between px-1"
          >
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={agreed[item.termsId] ?? false}
                onChange={() => toggleItem(item.termsId)}
                className="h-4 w-4 accent-[#142B4A]"
              />
              <span className="text-sm text-[#374151]">
                {item.title}{" "}
                <span
                  className={item.required ? "text-[#356DF3]" : "text-gray-400"}
                >
                  {item.required ? "(필수)" : "(선택)"}
                </span>
              </span>
            </label>

            <button
              type="button"
              onClick={() => setViewingTermsId(item.termsId)}
              className="text-xs text-gray-400 underline hover:text-gray-600"
            >
              보기
            </button>
          </div>
        ))}
      </div>

      {!requiredChecked ? (
        <p className="text-xs text-red-500">필수 약관에 모두 동의해 주세요.</p>
      ) : null}

      <Modal
        open={viewingItem != null}
        onClose={() => setViewingTermsId(null)}
        labelledBy={titleId}
        size="lg"
      >
        {viewingItem ? (
          <div className="flex max-h-[70vh] flex-col">
            <h2 id={titleId} className="text-base font-bold text-[#111827]">
              {viewingItem.title}{" "}
              <span className="text-xs font-normal text-gray-400">
                {viewingItem.version}
              </span>
            </h2>
            <div className="mt-4 flex-1 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
              {viewingItem.content}
            </div>
            <button
              type="button"
              onClick={() => setViewingTermsId(null)}
              className="mt-6 h-11 w-full rounded-md bg-[#142B4A] text-sm font-bold text-white hover:bg-[#0f2138]"
            >
              닫기
            </button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export const areRequiredTermsAgreed = (
  items: TermsItem[],
  agreed: Record<number, boolean>,
) => items.filter((item) => item.required).every((item) => agreed[item.termsId]);
