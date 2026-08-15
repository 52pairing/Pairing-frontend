import type { ProjectJobRoleOption, ProjectMetaOption } from "@/features/client/projects/types/preReview";

export type ProjectReviewPhase = "intro" | "loading" | "result" | "error";

export interface ProjectRecruitMeta {
  categories: ProjectMetaOption[];
  jobRoles: ProjectJobRoleOption[];
  skills: ProjectMetaOption[];
}

export interface ProjectStepNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  previousLabel?: string;
  nextLabel?: string;
}

export type ProjectStepState = "completed" | "active" | "upcoming";

export interface ProjectStepperProps {
  currentStep: number;
  steps?: readonly string[];
}
