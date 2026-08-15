export type ContractListTab =
  | "ALL"
  | "AWAITING_ME"
  | "SIGNING"
  | "AWAITING_COUNTERPART"
  | "CONCLUDED"
  | "IN_PROGRESS"
  | "SETTLEMENT_PENDING"
  | "COMPLETED";

export type ContractStatus =
  | "DRAFT"
  | "SIGN_PENDING"
  | "SIGNED"
  | "IN_PROGRESS"
  | "COMPLETION_PENDING"
  | "COMPLETED"
  | "TERMINATED"
  | "REJECTED";

export interface ContractListItem {
  contractId: number;
  contractNo: string;
  projectId: number;
  projectTitle: string;
  jobRole: string;
  counterpartName: string;
  clientBusinessField: string;
  status: ContractStatus;
  totalAmount: number;
  payUnit: "MONTHLY";
  payAmount: number;
  startDate: string;
  endDate: string;
  createdAt?: string | null;
  workStyle: "REMOTE" | "ONSITE" | "ANY";
  signatureRequired: boolean;
  clientSigned: boolean;
  freelancerSigned: boolean;
  depositPaid: boolean;
  payableSettlementId: number | null;
}

export interface ContractListPage {
  content: ContractListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ContractTabCount {
  tab: ContractListTab;
  label: string;
  count: number;
}
