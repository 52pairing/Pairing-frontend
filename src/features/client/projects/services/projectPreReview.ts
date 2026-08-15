import { apiCall } from "@/lib/api";
import type {
  ProjectJobRoleOption,
  ProjectMetaOption,
  ProjectPreReviewRequest,
  ProjectPreReviewResponse,
  ProjectWorkConditionsResponse,
} from "@/features/client/projects/types/preReview";

/**
 * 정적 메타(/api/v1/meta/*)는 세션 동안 값이 바뀌지 않으므로 최초 조회 결과(프로미스)를
 * 캐시해, 여러 화면에서 마운트마다 반복 호출되는 것을 막는다.
 * 실패 시 캐시를 비워 다음 호출에서 재시도할 수 있게 한다.
 * (결과 배열을 호출처가 in-place로 변경하지 않는다는 전제 — 현재 모두 읽기 전용 사용)
 */
const cacheOnce = <T>(fetcher: () => Promise<T>): (() => Promise<T>) => {
  let cached: Promise<T> | null = null;
  return () => {
    if (!cached) {
      cached = fetcher().catch((error) => {
        cached = null;
        throw error;
      });
    }
    return cached;
  };
};

export const getProjectJobRoles = cacheOnce(() =>
  apiCall<ProjectJobRoleOption[]>("/api/v1/meta/job-roles"),
);

export const getProjectJobCategories = cacheOnce(() =>
  apiCall<ProjectMetaOption[]>("/api/v1/meta/job-categories"),
);

export const getProjectSkills = cacheOnce(() =>
  apiCall<ProjectMetaOption[]>("/api/v1/meta/skills"),
);

export const getProjectWorkConditions = cacheOnce(() =>
  apiCall<ProjectWorkConditionsResponse>("/api/v1/meta/work-conditions"),
);

export const createProjectPreReview = (request: ProjectPreReviewRequest) =>
  apiCall<ProjectPreReviewResponse>("/api/v1/projects/pre-review", {
    method: "POST",
    body: JSON.stringify(request),
  });
