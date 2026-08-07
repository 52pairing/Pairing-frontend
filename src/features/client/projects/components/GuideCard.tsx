import type { ReactNode } from "react";

/**
 * 프로젝트 등록 안내 등에서 쓰는 제목 + 불릿 목록 카드.
 * `GuideCard` 안에 `GuideLine`을 여러 개 넣어 사용합니다.
 */
export function GuideCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-4 overflow-hidden rounded-[11px] border border-[#dde2e8] bg-white">
      <div className="bg-[#f5f6f8] px-5 py-[13px]">
        <h2 className="text-[12px] font-extrabold text-[#111827]">{title}</h2>
      </div>

      <div className="space-y-[11px] px-5 py-4">{children}</div>
    </section>
  );
}

/** GuideCard 안의 불릿 한 줄 */
export function GuideLine({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-[11px] font-semibold leading-[1.65] text-[#667085]">
      <span className="mt-[7px] h-[3px] w-[3px] shrink-0 rounded-full bg-[#9aa4b2]" />

      <p>{children}</p>
    </div>
  );
}
