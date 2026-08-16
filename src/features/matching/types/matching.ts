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

export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface CandidateConditionSkill {
  skillCode: string;
  skillLevel: SkillLevel;
}

// GET /api/v1/matchings/candidates/{candidateId}/profile의 condition.
// 실제 로그인 세션 응답으로 필드명 확인 완료(2026-08-16).
export interface CandidateCondition {
  conditionId: number;
  jobCategory: string;
  jobRole: string;
  workStyle: string;
  workForm: string;
  payUnit: PayUnit;
  payAmount: number;
  minAcceptAmount: number;
  availableFrom: string | null;
  startNegotiable: boolean;
  periodValue: number;
  periodUnit: string;
  hasFreelanceExperience: boolean;
  careerYears: number;
  skills: CandidateConditionSkill[];
}

export type GraduationStatus = "GRADUATED" | "EXPECTED" | "ATTENDING" | "LEAVE" | "DROPPED";
export type CampusType = "MAIN" | "BRANCH";

export interface CandidateResumeEducation {
  startDate: string;
  endDate: string | null;
  schoolName: string;
  major: string | null;
  graduationStatus: GraduationStatus;
  campusType: CampusType;
}

export interface CandidateResumeCareer {
  startDate: string;
  endDate: string | null;
  companyName: string;
  department: string | null;
  position: string | null;
  jobDescription: string | null;
}

export interface CandidateResumeCertificate {
  acquiredDate: string;
  name: string;
  issuer: string | null;
  score: string | null;
  note: string | null;
}

export interface CandidateResumeAgreements {
  profileCollectionAgreed: boolean;
  profileProvisionAgreed: boolean;
  aiAnalysisAgreed: boolean;
  careerPortfolioUsageAgreed: boolean;
}

export interface CandidateResumeSnapshot {
  resumeId: number;
  status: string;
  name: string;
  birthDate: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  zipCode: string | null;
  address: string | null;
  addressDetail: string | null;
  profileImageUrl: string | null;
  selfIntroduction: string | null;
  portfolioUrl: string | null;
  educations: CandidateResumeEducation[];
  careers: CandidateResumeCareer[];
  certificates: CandidateResumeCertificate[];
  links: string[];
  agreements: CandidateResumeAgreements;
}

// GET /api/v1/matchings/candidates/{candidateId}/profile
// 매칭 당시(추천 시점)에 저장된 프리랜서 프로필 스냅샷(`capturedAt`). 실제 로그인 세션 응답으로 필드명 확인 완료(2026-08-16).
export interface CandidateProfileResponse {
  candidateId: number;
  projectId: number;
  positionId: number;
  freelancerId: number;
  name: string;
  profileImageUrl: string | null;
  grade: string;
  ratingAverage: number | null;
  reviewCount: number;
  fitScore: number | null;
  fitReasons: string[];
  rankNo: number | null;
  requested: boolean;
  rejected: boolean;
  capturedAt: string;
  condition: CandidateCondition;
  resume: CandidateResumeSnapshot;
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
  // 아래 7개는 상세 조회(GET /matchings/requests/{requestId})에서만 값이 오고,
  // 목록 조회(받은/보낸 요청 목록)에서는 mainTask와 같은 방식으로 null이 옵니다.
  currentSituation: string | null;
  startNegotiable: boolean | null;
  periodValue: number | null;
  periodUnit: string | null;
  totalHeadcount: number | null;
  // 아래 3개는 상세 조회에서도 프로젝트 등록 시 선택 입력이라 비어 있을 수 있습니다.
  // (근무 장소는 원격 프로젝트면 없는 것이 정상)
  detailScope: string | null;
  extraNote: string | null;
  workLocation: string | null;
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
