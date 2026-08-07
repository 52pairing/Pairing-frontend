import type { ReactNode } from "react";

/** 프로젝트 등록 폼의 필수 입력 항목 라벨입니다. */
export function ProjectRequiredLabel({ children }: { children: ReactNode }) {
  return (
    <label className="text-[12px] font-extrabold text-[#111827]">
      {children}
      <span className="ml-1 text-[#f04438]">*</span>
    </label>
  );
}
