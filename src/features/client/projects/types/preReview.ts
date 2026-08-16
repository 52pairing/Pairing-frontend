export interface ProjectPreReviewPosition {
  jobRole: string;
  headcount: number;
  skills: string[];
}

export interface ProjectPreReviewRequest {
  positions: ProjectPreReviewPosition[];
}

export interface ProjectPreReviewItem {
  positionIndex: number;
  jobRole: string;
  headcount: number;
  expectedCandidateCount: number;
  matchable: boolean;
}

export interface ProjectPreReviewResponse {
  notice: string;
  allMatchable: boolean;
  items: ProjectPreReviewItem[];
}

export interface ProjectJobRoleOption {
  code: string;
  label: string;
  parentCode: string;
}

export interface ProjectMetaOption {
  code: string;
  label: string;
  parentCode?: string | null;
}

export interface ProjectWorkConditionsResponse {
  workStyles: ProjectMetaOption[];
  workForms: ProjectMetaOption[];
  periodUnits: ProjectMetaOption[];
  // 같은 /api/v1/meta/work-conditions 응답에 포함되지만 이 화면들에서는 그동안 쓰이지 않던 필드
  // (프리랜서 이력서 쪽 WorkConditionsMeta에서는 이미 사용 중 — src/features/freelancer/mypage/types/resume.ts)
  payUnits?: ProjectMetaOption[];
  skillLevels?: ProjectMetaOption[];
}
