import type { ClientProjectStatus } from "@/features/client/myprojects/types/projectList";

export interface ProjectDetailPosition {
  positionId: number;
  positionNo: number;
  jobCategory: string;
  jobRole: string;
  minCareerYears: number;
  headcount: number;
  confirmedCount: number;
  status: string;
  skills: string[];
}

export interface ProjectDetailFile {
  fileId: number;
  originalName: string;
  sizeBytes: number;
  fileUrl: string;
}

export interface ClientProjectDetailResponse {
  projectId: number;
  title: string;
  status: ClientProjectStatus;
  statusNote: string | null;
  paymentStatus: string | null;
  startDesiredDate: string | null;
  startNegotiable: boolean;
  periodValue: number;
  periodUnit: string;
  budgetAmount: number;
  workStyle: string;
  workForm: string;
  workLocation: string | null;
  currentSituation: string;
  mainTask: string;
  detailScope: string | null;
  extraNote: string | null;
  totalHeadcount: number;
  confirmedHeadcount: number;
  recruitDeadline: string | null;
  extensionCount: number;
  freeRerecommendUsed: number;
  paidRerecommendUsed: number;
  positions: ProjectDetailPosition[];
  files: ProjectDetailFile[];
  createdAt: string | null;
  payableSettlementId: number | null;
}

export interface ProjectUpdateRequest {
  title: string;
  startDesiredDate: string;
  startNegotiable: boolean;
  periodValue: number;
  periodUnit: string;
  budgetAmount: number;
  workStyle: string;
  workForm: string;
  positions: Array<{
    positionId: number | null;
    jobCategory: string;
    jobRole: string;
    minCareerYears: number;
    headcount: number;
    skills: string[];
  }>;
  currentSituation: string;
  mainTask: string;
  detailScope: string | null;
  extraNote: string | null;
  fileIds: number[];
}

export interface MatchingRequestItem {
  matchingRequestId?: number;
  counterpartName: string;
  jobRole: string;
  status: string;
  negotiationId: number | null;
  currentRound: number;
  maxRound: number;
  newProposalCount: number;
}

export interface MatchingRequestPage {
  content: MatchingRequestItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
