export type RecommendationType = "INITIAL" | "FREE" | "PAID";

export type PayUnit = "HOURLY" | "DAILY" | "MONTHLY";

export interface CandidateResponse {
  candidateId: number;
  freelancerId: number;
  name: string;
  profileImageUrl: string | null;
  jobRole: string;
  careerYears: number;
  grade: string;
  ratingAverage: number | null;
  reviewCount: number;
  skills: string[];
  fitReasons: string[];
  payUnit: PayUnit;
  payAmount: number;
  rankNo: number;
  requested: boolean;
  rejected: boolean;
}

export interface CandidateListResponse {
  positionId: number;
  roundId: number;
  roundNo: number;
  roundType: RecommendationType;
  headcount: number;
  freeRerecommendAvailable: boolean;
  paidRerecommendRemaining: number;
  lowScoreWarned: boolean;
  budgetWarned: boolean;
  preparing: boolean;
  candidates: CandidateResponse[];
}

export interface MatchingRequestCreateRequest {
  positionId: number;
  candidateIds: number[];
}

export interface MatchingRequestResponse {
  requestId: number;
  projectId: number;
  projectTitle: string;
  positionId: number;
  jobRole: string;
  counterpartName: string;
  companyName: string | null;
  companyProfile: string | null;
  skills: string[];
  minCareerYears: number | null;
  workLabel: string | null;
  periodLabel: string | null;
  startDesiredDate: string | null;
  status: MatchingStatus;
  budgetAmount: number | null;
  mainTask: string | null;
  requestedAt: string;
  expiresAt: string;
  respondedAt: string | null;
  rejectReason: RejectReason | null;
  currentRound: number | null;
  maxRound: number | null;
  newProposalCount: number | null;
  negotiationId: number | null;
}

export type MatchingStatus = "REQUEST_PENDING" | "REJECTED" | "ACCEPTED" | "NEGOTIATING" | "NEGOTIATION_FAILED" | "CONTRACT_PENDING" | "CONTRACTED" | "IN_PROGRESS" | "COMPLETION_PENDING" | "CLOSED" | "TERMINATED";
export type RejectReason = "DIRECT_REJECT" | "EXPIRED" | "NEGOTIATION_FAILED";
export type MatchingRequestTab = "ALL" | "REVIEWING" | "NEGOTIATING" | "CLOSED";

export interface PageResponse<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number; first: boolean; last: boolean; }
export interface SentMatchingRequestParams { projectId?: number; positionId?: number; status?: MatchingStatus; page?: number; size?: number; }
export interface ReceivedMatchingRequestParams { tab?: MatchingRequestTab; page?: number; size?: number; }
export interface RerecommendRequest { type: "FREE" | "PAID"; quantity?: number; }
export interface MatchingSettingsRequest { aiMatchingAgreed: boolean; matchingPaused: boolean; }
export interface MatchingSettingsResponse extends MatchingSettingsRequest { matchable: boolean; unmatchableReason: string | null; }
export interface MatchingNotification { type: "MATCHING_REQUESTED" | "MATCHING_ACCEPTED" | "MATCHING_REJECTED" | "MATCHING_RECOMMENDED"; title?: string; message?: string; linkUrl: string; }
