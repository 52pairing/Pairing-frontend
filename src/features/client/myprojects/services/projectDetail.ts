import { apiBlob, apiCall } from "@/lib/api";
import type {
  ClientProjectDetailResponse,
  MatchingRequestPage,
  ProjectUpdateRequest,
} from "@/features/client/myprojects/types/projectDetail";

export const getClientProjectDetail = (projectId: number) =>
  apiCall<ClientProjectDetailResponse>(`/api/v1/projects/${projectId}`);

export const downloadProjectFile = (projectId: number, fileId: number) =>
  apiBlob(`/api/v1/projects/${projectId}/files/${fileId}/download`);

export const updateClientProject = (
  projectId: number,
  request: ProjectUpdateRequest,
) =>
  apiCall<ClientProjectDetailResponse>(`/api/v1/projects/${projectId}`, {
    method: "PUT",
    body: JSON.stringify(request),
  });

export const getProjectMatchingRequests = (projectId: number) => {
  const query = new URLSearchParams({
    projectId: String(projectId),
    size: "100",
  });

  return apiCall<MatchingRequestPage>(`/api/v1/matchings/requests?${query}`);
};

export const cancelProjectRegistration = (projectId: number) =>
  apiCall<ClientProjectDetailResponse>(
    `/api/v1/projects/${projectId}/registration-cancellation`,
    { method: "POST" },
  );

export const extendProjectRecruitment = (projectId: number) =>
  apiCall<ClientProjectDetailResponse>(
    `/api/v1/projects/${projectId}/recruit-extensions`,
    { method: "POST" },
  );

export const closeProjectRecruitment = (projectId: number) =>
  apiCall<ClientProjectDetailResponse>(
    `/api/v1/projects/${projectId}/recruit-close`,
    { method: "POST" },
  );

export const completeClientProject = (projectId: number) =>
  apiCall<ClientProjectDetailResponse>(
    `/api/v1/projects/${projectId}/completion`,
    { method: "POST" },
  );
