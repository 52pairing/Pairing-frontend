import type { ClientContractTabsProps } from "@/features/client/myprojects/contract/types/contract";

export const CLIENT_CONTRACT_TABS = [
  { tab: "ALL", label: "전체" },
  { tab: "CLIENT_PENDING", label: "서명 대기" },
  { tab: "CLIENT_SIGNED", label: "서명 완료" },
  { tab: "ALL_SIGNED", label: "모두 완료" },
] as const;

export function ClientContractTabs({ activeTab, onTabChange }: ClientContractTabsProps) {
  return (
    <div className="mt-7 border-b border-theme">
      <div className="flex h-12 items-end gap-2 overflow-x-auto overflow-y-hidden">
        {CLIENT_CONTRACT_TABS.map(({ tab, label }) => {
          const active = tab === activeTab;
          return (
            <button key={tab} type="button" onClick={() => onTabChange(tab)} className={`relative flex h-full min-w-[94px] shrink-0 items-center justify-center px-3 text-[13px] font-semibold ${active ? "text-brand" : "text-theme-muted hover:text-theme-secondary"}`}>
              {label}
              {active ? <span className="absolute bottom-0 left-0 h-0.5 w-full bg-brand" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
