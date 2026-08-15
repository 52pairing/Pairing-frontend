import type { ClientContractTabsProps } from "@/features/contract/types/clientContract";

export const CLIENT_CONTRACT_TABS = [
  { tab: "ALL", label: "전체" },
  { tab: "AWAITING_ME", label: "서명 대기" },
  { tab: "AWAITING_COUNTERPART", label: "상대방 서명 대기" },
  { tab: "CONCLUDED", label: "체결 완료" },
] as const;

export function ClientContractTabs({ activeTab, onTabChange, rows }: ClientContractTabsProps) {
  const tabs = rows?.length ? rows : CLIENT_CONTRACT_TABS;
  return (
    <div className="mt-7 border-b border-theme">
      <div className="flex h-12 items-end gap-2 overflow-x-auto overflow-y-hidden">
        {tabs.map(({ tab, label, ...row }) => {
          const active = tab === activeTab;
          return (
            <button key={tab} type="button" onClick={() => onTabChange(tab)} className={`relative flex h-full min-w-[94px] shrink-0 items-center justify-center px-3 text-[13px] font-semibold ${active ? "text-brand" : "text-theme-muted hover:text-theme-secondary"}`}>
              {label}
              {"count" in row && row.count > 0 ? <span className="ml-1.5 rounded-full bg-brand px-1.5 py-0.5 text-[9px] font-bold text-white">{row.count}</span> : null}
              {active ? <span className="absolute bottom-0 left-0 h-0.5 w-full bg-brand" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
