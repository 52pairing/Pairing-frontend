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
}
