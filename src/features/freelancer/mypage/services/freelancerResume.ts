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
      contactPhone: detail.resume.contactPhone ?? "",
      contactEmail: detail.resume.contactEmail ?? "",
      zipCode: detail.resume.zipCode ?? "",
      address: detail.resume.address ?? "",
      addressDetail: detail.resume.addressDetail ?? "",
      educations: detail.resume.educations ?? [],
      careers: detail.resume.careers ?? [],
      certificates: detail.resume.certificates ?? [],
      selfIntroduction: detail.resume.selfIntroduction ?? "",
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

export const getFreelancerJobCategories = () =>
  apiCall<MetaOption[] | null>("/api/v1/meta/job-categories").then((items) => items ?? []);

export const getFreelancerJobRoles = () =>
  apiCall<MetaOption[] | null>("/api/v1/meta/job-roles").then((items) => items ?? []);

export const getFreelancerSkills = () =>
  apiCall<MetaOption[] | null>("/api/v1/meta/skills").then((items) => items ?? []);

export const getFreelancerWorkConditions = () =>
  apiCall<WorkConditionsMeta>("/api/v1/meta/work-conditions").then((conditions) => ({
    workStyles: conditions.workStyles ?? [],
    workForms: conditions.workForms ?? [],
    payUnits: conditions.payUnits ?? [],
    periodUnits: conditions.periodUnits ?? [],
    skillLevels: conditions.skillLevels ?? [],
  }));
