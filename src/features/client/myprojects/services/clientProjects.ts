import { apiCall } from "@/lib/api";
import type {
  ClientProjectTab,
  ProjectPageResponse,
} from "@/features/client/myprojects/types/projectList";

interface GetMyProjectsParams {
  tab: ClientProjectTab;
  page?: number;
  size?: number;
}

export const getMyProjects = ({
  tab,
  page = 0,
  size = 10,
}: GetMyProjectsParams) => {
  const query = new URLSearchParams({
    tab,
    page: String(page),
    size: String(size),
  });

  return apiCall<ProjectPageResponse>(`/api/v1/projects/mine?${query}`);
};

export const completeProject = (projectId: number) =>
  apiCall<void>(`/api/v1/projects/${projectId}/completion`, {
    method: "POST",
  });
