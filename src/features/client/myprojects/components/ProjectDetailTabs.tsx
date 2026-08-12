import type { ProjectDetailTabsProps } from "@/features/client/myprojects/types/components";

export const PROJECT_DETAIL_TABS = ["프로젝트 정보", "추천 후보", "협상", "계약", "진행 현황"] as const;

export type { ProjectDetailTab } from "@/features/client/myprojects/types/components";

export function ProjectDetailTabs({ activeTab, onTabChange, rightContent }: ProjectDetailTabsProps) {
  return (
    <div className="mt-10 border-b border-theme">
      <div className="flex h-[48px] items-center justify-between">
        <div className="flex h-full items-end gap-3">
          {PROJECT_DETAIL_TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button key={tab} type="button" onClick={() => onTabChange(tab)} className={`relative flex h-full min-w-[90px] cursor-pointer items-center justify-center px-3 text-[13px] font-bold transition ${isActive ? "text-brand" : "text-[#7b8797] hover:text-theme-secondary"}`}>
                {tab}
                {isActive ? <span className="absolute bottom-[-1px] h-[2px] w-full bg-brand" /> : null}
              </button>
            );
          })}
        </div>
        {rightContent}
      </div>
    </div>
  );
}
