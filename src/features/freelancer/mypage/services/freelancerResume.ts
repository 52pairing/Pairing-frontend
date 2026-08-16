import { apiCall } from "@/lib/api";
import type {
  FreelancerCondition,
  MetaOption,
  ResumeDetailResponse,
  ResumeBody,
  ResumeDraftRequest,
  ResumeUpdateRequest,
  WorkConditionsMeta,
} from "@/features/freelancer/mypage/types/resume";

const FREELANCER_BASE = "/api/v1/freelancers/me";

/**
 * 정적 메타(/api/v1/meta/*)는 세션 동안 값이 바뀌지 않으므로 최초 조회 결과(프로미스)를
 * 캐시해, 이력서 화면 재진입마다 반복 호출되는 것을 막는다. 실패 시 캐시를 비워 재시도 가능.
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

export const getFreelancerCondition = () =>
  apiCall<FreelancerCondition>(`${FREELANCER_BASE}/condition`).then((condition) => ({
    ...condition,
    payAmount: condition.payAmount ?? 0,
    minAcceptAmount: condition.minAcceptAmount ?? 0,
    periodValue: condition.periodValue ?? 0,
    careerYears: condition.careerYears ?? 0,
    skills: condition.skills ?? [],
  }));

export const updateFreelancerCondition = (condition: FreelancerCondition) =>
  apiCall<FreelancerCondition>(`${FREELANCER_BASE}/condition`, {
    method: "PUT",
    body: JSON.stringify(condition),
  });

export const getFreelancerResume = () =>
  apiCall<ResumeDetailResponse>(`${FREELANCER_BASE}/resume`).then((detail) => ({
    ...detail,
    resume: detail.resume ? {
      ...detail.resume,
      profileImageUrl: detail.resume.profileImageUrl ?? null,
      contactPhone: detail.resume.contactPhone ?? "",
      contactEmail: detail.resume.contactEmail ?? "",
      zipCode: detail.resume.zipCode ?? "",
      address: detail.resume.address ?? "",
      addressDetail: detail.resume.addressDetail ?? "",
      educations: detail.resume.educations ?? [],
      careers: detail.resume.careers ?? [],
      certificates: detail.resume.certificates ?? [],
      selfIntroduction: detail.resume.selfIntroduction ?? "",
      portfolioUrl: detail.resume.portfolioUrl ?? null,
      links: detail.resume.links ?? [],
    } : null,
  }));

export const updateFreelancerResume = (resume: ResumeUpdateRequest) =>
  apiCall<ResumeBody>(`${FREELANCER_BASE}/resume`, {
    method: "PUT",
    body: JSON.stringify(resume),
  });

export const getFreelancerResumeDraft = () =>
  apiCall<ResumeDraftRequest>(`${FREELANCER_BASE}/resume/draft`);

export const updateFreelancerResumeDraft = (payload: unknown) =>
  apiCall<ResumeDraftRequest>(`${FREELANCER_BASE}/resume/draft`, {
    method: "PUT",
    body: JSON.stringify({ payload }),
  });

export const getFreelancerJobCategories = cacheOnce(() =>
  apiCall<MetaOption[] | null>("/api/v1/meta/job-categories").then((items) => items ?? []),
);

export const getFreelancerJobRoles = cacheOnce(() =>
  apiCall<MetaOption[] | null>("/api/v1/meta/job-roles").then((items) => items ?? []),
);

export const getFreelancerSkills = cacheOnce(() =>
  apiCall<MetaOption[] | null>("/api/v1/meta/skills").then((items) => items ?? []),
);

export const getFreelancerWorkConditions = cacheOnce(() =>
  apiCall<WorkConditionsMeta>("/api/v1/meta/work-conditions").then((conditions) => ({
    workStyles: conditions.workStyles ?? [],
    workForms: conditions.workForms ?? [],
    payUnits: conditions.payUnits ?? [],
    periodUnits: conditions.periodUnits ?? [],
    skillLevels: conditions.skillLevels ?? [],
  })),
);
