export type ContractDetailStatus = "DRAFT" | "SIGN_PENDING" | "SIGNED";
export type ContractPartyRole = "CLIENT" | "FREELANCER";
export type ContractSignatureStatus = "PENDING" | "SIGNED" | "REJECTED";

export interface ContractPartyClient {
  companyName: string;
  businessNo: string;
  representative: string;
  address: string;
  phone: string;
}

export interface ContractPartyFreelancer {
  name: string;
  phone: string;
  jobRole: string;
  settlementAccount: string;
}

export interface ContractClause {
  no: number;
  title: string;
  content: string;
}

export interface ContractSignature {
  partyRole: ContractPartyRole;
  name: string;
  status: ContractSignatureStatus;
  signedAt: string | null;
  signatureImageUrl: string | null;
}

export interface ContractDetailResponse {
  contractId: number;
  contractNo: string;
  projectTitle: string;
  negotiationId: number;
  clientName: string;
  freelancerName: string;
  jobRole: string;
  status: ContractDetailStatus;
  client: ContractPartyClient;
  freelancer: ContractPartyFreelancer;
  totalAmount: number;
  payUnit: "MONTHLY";
  payAmount: number;
  startDate: string;
  endDate: string;
  workStyle: string;
  workForm: string;
  workLocation: string | null;
  inspectionDays: number;
  paymentDays: number;
  confidentialYears: number;
  penaltyRate: number;
  specialTerms: string | null;
  clauses: ContractClause[];
  signatures: ContractSignature[];
  signedAt: string | null;
  createdAt: string;
}
