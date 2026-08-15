import { apiCall } from "@/lib/api";
import type {
  ProjectJobRoleOption,
  ProjectMetaOption,
  ProjectPreReviewRequest,
  ProjectPreReviewResponse,
  ProjectWorkConditionsResponse,
} from "@/features/client/projects/types/preReview";

export const getProjectJobRoles = () =>
  apiCall<ProjectJobRoleOption[]>("/api/v1/meta/job-roles");

export const getProjectJobCategories = () =>
  apiCall<ProjectMetaOption[]>("/api/v1/meta/job-categories");

export const getProjectSkills = () =>
  apiCall<ProjectMetaOption[]>("/api/v1/meta/skills");

export const getProjectWorkConditions = () =>
  apiCall<ProjectWorkConditionsResponse>("/api/v1/meta/work-conditions");

export const createProjectPreReview = (request: ProjectPreReviewRequest) =>
  apiCall<ProjectPreReviewResponse>("/api/v1/projects/pre-review", {
    method: "POST",
    body: JSON.stringify(request),
  });
