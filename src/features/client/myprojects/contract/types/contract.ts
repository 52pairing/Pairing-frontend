import type { ContractListItem, ContractListPage } from "@/features/contract/types/contractList";

export type ClientContractListItem = ContractListItem;
export type ClientContractPage = ContractListPage;

export type ClientContractTab = "ALL" | "CLIENT_PENDING" | "CLIENT_SIGNED" | "ALL_SIGNED";

export interface ClientContractCardProps {
  contract: ClientContractListItem;
  jobRoleLabel: string;
  detailHref: string;
}

export interface ClientContractTabsProps {
  activeTab: ClientContractTab;
  onTabChange: (tab: ClientContractTab) => void;
}
