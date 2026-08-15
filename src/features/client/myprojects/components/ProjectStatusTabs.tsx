import {
  CLIENT_PROJECT_TABS,
} from "@/features/client/myprojects/types/projectList";
import type { ProjectStatusTabsProps } from "@/features/client/myprojects/types/components";

export function ProjectStatusTabs({
  activeTab,
  onTabChange,
  counts = {},
  labels = {},
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
              <span>{labels[tab] ?? label}</span>
              {(counts[tab] ?? 0) > 0 ? <span className="ml-1.5 rounded-full bg-brand px-1.5 py-0.5 text-[9px] font-bold text-white">{counts[tab]}</span> : null}

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
