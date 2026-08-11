export interface ClientContractListItem {
  contractId: number;
  contractNo: string;
  projectId: number;
  projectTitle: string;
  jobRole: string;
  counterpartName: string;
  status: ContractStatus;
  totalAmount: number;
  payUnit: "MONTHLY";
  payAmount: number;
  startDate: string;
  endDate: string;
  signatureRequired: boolean;
  clientSigned: boolean;
  freelancerSigned: boolean;
  depositPaid: boolean;
}

export type ContractStatus =
  | "DRAFT"
  | "SIGN_PENDING"
  | "SIGNED"
  | "IN_PROGRESS"
  | "COMPLETION_PENDING"
  | "COMPLETED"
  | "TERMINATED"
  | "REJECTED";

export interface ClientContractPage {
  content: ClientContractListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
