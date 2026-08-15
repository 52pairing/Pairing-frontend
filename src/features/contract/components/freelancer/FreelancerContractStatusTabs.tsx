import { ContractTabBar } from "@/features/contract/components/common/ContractTabBar";

export const FREELANCER_CONTRACT_STATUS_TABS = [
  "전체",
  "서명 대기",
  "진행 중",
  "정산 대기",
  "완료",
] as const;

export type FreelancerContractStatus =
  (typeof FREELANCER_CONTRACT_STATUS_TABS)[number];

interface FreelancerContractStatusTabsProps {
  activeStatus: FreelancerContractStatus;
  onStatusChange: (status: FreelancerContractStatus) => void;
  rows?: Partial<Record<FreelancerContractStatus, { label: string; count: number }>>;
}

export function FreelancerContractStatusTabs({
  activeStatus,
  onStatusChange,
  rows = {},
}: FreelancerContractStatusTabsProps) {
  const tabs = FREELANCER_CONTRACT_STATUS_TABS.map((status) => ({
    tab: status,
    label: rows[status]?.label ?? status,
    count: rows[status]?.count,
  }));
  return <ContractTabBar variant="freelancer" tabs={tabs} activeTab={activeStatus} onChange={onStatusChange} />;
}
