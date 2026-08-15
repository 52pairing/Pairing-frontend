// 프리랜서 조건/이력서 API 타입. `.ai/API.md`의 마이페이지 2-4 섹션 기준.

export interface MetaOption {
  code: string;
  label: string;
  parentCode?: string | null;
}

export interface WorkConditionsMeta {
  workStyles: MetaOption[];
  workForms: MetaOption[];
  payUnits: MetaOption[];
  periodUnits: MetaOption[];
  skillLevels: MetaOption[];
}

export type WorkStyle = "REMOTE" | "ONSITE" | "ANY";
export type WorkForm = "FULL_TIME" | "PART_TIME" | "ANY";
export type PayUnit = "HOURLY" | "DAILY" | "MONTHLY";
export type PeriodUnit = "MONTH" | "WEEK";
export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface ConditionSkill {
  skillCode: string;
  skillLevel: SkillLevel;
}

// GET/PUT /api/v1/freelancers/me/condition
export interface FreelancerCondition {
  jobCategory: string;
  jobRole: string;
  workStyle: WorkStyle;
  workForm: WorkForm;
  payUnit: PayUnit;
  payAmount: number;
  minAcceptAmount: number;
  availableFrom: string | null;
  startNegotiable: boolean;
  periodValue: number;
  periodUnit: PeriodUnit;
  hasFreelanceExperience: boolean;
  careerYears: number;
  skills: ConditionSkill[];
}

export type GraduationStatus =
  | "GRADUATED"
  | "EXPECTED"
  | "ATTENDING"
  | "LEAVE"
  | "DROPPED";
export type CampusType = "MAIN" | "BRANCH";

export interface ResumeEducation {
  startDate: string;
  endDate?: string | null;
  schoolName: string;
  major?: string;
  graduationStatus: GraduationStatus;
  campusType: CampusType;
}

export interface ResumeCareer {
  startDate: string;
  endDate?: string | null;
  companyName: string;
  department?: string;
  position?: string;
  jobDescription?: string;
}

export interface ResumeCertificate {
  acquiredDate: string;
  name: string;
  issuer?: string;
  score?: string | null;
  note?: string | null;
}

export interface ResumeLink {
  url: string;
}

export interface ResumeAgreements {
  profileCollectionAgreed: boolean;
  profileProvisionAgreed: boolean;
  aiAnalysisAgreed: boolean;
  careerPortfolioUsageAgreed: boolean;
}

// PUT /api/v1/freelancers/me/resume
export interface ResumeBody {
  profileFileId?: number;
  contactPhone: string;
  contactEmail: string;
  zipCode: string;
  address: string;
  addressDetail: string;
  educations: ResumeEducation[];
  careers: ResumeCareer[];
  certificates: ResumeCertificate[];
  selfIntroduction: string;
  portfolioFileId?: number;
  links: ResumeLink[];
  agreements: ResumeAgreements;
}

export interface ResumeUpdateRequest extends ResumeBody {
  condition?: FreelancerCondition;
}

// GET /api/v1/freelancers/me/resume의 resume 필드. 저장(PUT)은 profileFileId/portfolioFileId(숫자)를
// 받지만, 조회(GET)는 같은 사진·포트폴리오를 profileImageUrl/portfolioUrl(CDN 절대 URL)로 내려준다.
export interface ResumeDetailBody {
  profileImageUrl: string | null;
  contactPhone: string;
  contactEmail: string;
  zipCode: string;
  address: string;
  addressDetail: string;
  educations: ResumeEducation[];
  careers: ResumeCareer[];
  certificates: ResumeCertificate[];
  selfIntroduction: string;
  portfolioUrl: string | null;
  links: ResumeLink[];
  agreements: ResumeAgreements;
}

export type ResumeStatus = "COMPLETED" | "INCOMPLETE";

// GET /api/v1/freelancers/me/resume
export interface ResumeDetailResponse {
  status: ResumeStatus;
  lastModifiedAt: string | null;
  condition: FreelancerCondition | null;
  resume: ResumeDetailBody | null;
  notice: string | null;
}

// PUT /api/v1/freelancers/me/resume/draft
export interface ResumeDraftRequest {
  payload: unknown;
}
