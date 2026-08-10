import {
  CLIENT_PROJECT_TABS,
  type ClientProjectTab,
} from "@/features/client/myprojects/types/projectList";

export interface ProjectStatusTabsProps {
  activeTab: ClientProjectTab;
  onTabChange: (tab: ClientProjectTab) => void;
}

export function ProjectStatusTabs({
  activeTab,
  onTabChange,
}: ProjectStatusTabsProps) {
  return (
    <div className="mt-7 border-b border-[#e5e9ef]">
      <div className="flex h-[48px] items-end gap-2">
        {CLIENT_PROJECT_TABS.map(({ tab, label }) => {
          const isActive = tab === activeTab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={`relative flex h-full min-w-[82px] cursor-pointer items-center justify-center px-2 text-[13px] font-semibold transition ${
                isActive
                  ? "text-[#122d50]"
                  : "text-[#9aa4b2] hover:text-[#667085]"
              }`}
            >
              {label}

              {isActive ? (
                <span className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-[#15365d]" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
