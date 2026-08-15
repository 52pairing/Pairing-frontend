import type { ProjectDetailFile } from "@/features/client/myprojects/types/projectDetail";
import type { ProjectJobRoleOption, ProjectMetaOption, ProjectWorkConditionsResponse } from "@/features/client/projects/types/preReview";

export interface EditablePosition {
  key: string;
  positionId: number | null;
  jobCategory: string;
  jobRole: string;
  minCareerYears: number;
  headcount: number;
  skills: string[];
}

export interface ProjectEditMeta {
  categories: ProjectMetaOption[];
  jobRoles: ProjectJobRoleOption[];
  skills: ProjectMetaOption[];
  workConditions: ProjectWorkConditionsResponse;
}

export type EditableFile = Pick<ProjectDetailFile, "fileId" | "originalName" | "sizeBytes">;
