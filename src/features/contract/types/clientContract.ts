import type { ContractListItem, ContractListPage } from "@/features/contract/types/contractList";

export type ClientContractListItem = ContractListItem;
export type ClientContractPage = ContractListPage;

export type ClientContractTab = "ALL" | "AWAITING_ME" | "AWAITING_COUNTERPART" | "CONCLUDED";

export interface ClientContractCardProps {
  contract: ClientContractListItem;
  jobRoleLabel: string;
  detailHref: string;
}

export interface ClientContractTabsProps {
  activeTab: ClientContractTab;
  onTabChange: (tab: ClientContractTab) => void;
  rows?: Array<{ tab: ClientContractTab; label: string; count: number }>;
}
