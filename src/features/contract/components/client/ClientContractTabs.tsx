import type { ClientContractTabsProps } from "@/features/contract/types/clientContract";
import { ContractTabBar } from "@/features/contract/components/common/ContractTabBar";

export const CLIENT_CONTRACT_TABS = [
  { tab: "ALL", label: "전체" },
  { tab: "AWAITING_ME", label: "서명 대기" },
  { tab: "AWAITING_COUNTERPART", label: "상대방 서명 대기" },
  { tab: "CONCLUDED", label: "체결 완료" },
] as const;

export function ClientContractTabs({ activeTab, onTabChange, rows }: ClientContractTabsProps) {
  const tabs = rows?.length ? rows : CLIENT_CONTRACT_TABS.map(({ tab, label }) => ({ tab, label }));
  return <ContractTabBar variant="client" tabs={tabs} activeTab={activeTab} onChange={onTabChange} />;
}
