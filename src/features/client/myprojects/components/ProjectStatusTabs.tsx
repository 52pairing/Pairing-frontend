import {
  CLIENT_PROJECT_TABS,
} from "@/features/client/myprojects/types/projectList";
import type { ProjectStatusTabsProps } from "@/features/client/myprojects/types/components";

export type { ProjectStatusTabsProps } from "@/features/client/myprojects/types/components";

export function ProjectStatusTabs({
  activeTab,
  onTabChange,
}: ProjectStatusTabsProps) {
  return (
    <div className="mt-7 border-b border-theme">
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
                  : "text-theme-muted hover:text-theme-secondary"
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
