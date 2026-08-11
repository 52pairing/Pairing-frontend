export interface ClientContractListItem {
  contractId: number;
  contractNo: string;
  projectTitle: string;
  counterpartName: string;
  status: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
  signatureRequired: boolean;
  payUnit: string;
  payAmount: number;
}

export interface ClientContractPage {
  content: ClientContractListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
