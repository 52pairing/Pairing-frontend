import { apiCall } from "@/lib/api";
import type { ProjectRegisterForm } from "@/features/client/projects/types/project";

interface ProjectRegistrationPosition {
  jobCategory: string;
  jobRole: string;
  minCareerYears: number;
  headcount: number;
  skills: string[];
}

export interface ProjectResponsePosition {
  jobRole: string | { code: string; label: string };
  jobRoleLabel?: string;
  jobRoleName?: string;
  code?: string;
  label?: string;
  headcount: number;
}

export interface ProjectResponse {
  projectId: number;
  title: string;
  periodValue: number;
  periodUnit: string;
  budgetAmount: number;
  startDesiredDate: string;
  status: string;
  positions: ProjectResponsePosition[];
  payableSettlementId: number | null;
}

export interface ProjectRegistrationRequest {
  noticeAgreed: boolean;
  title: string;
  startDesiredDate: string;
  startNegotiable: boolean;
  periodValue: number;
  periodUnit: string;
  budgetAmount: number;
  workStyle: string;
  workForm: string;
  positions: ProjectRegistrationPosition[];
  currentSituation: string;
  mainTask: string;
  detailScope: string | null;
  extraNote: string | null;
  fileIds: number[];
}

export const toProjectRegistrationRequest = (
  form: ProjectRegisterForm,
): ProjectRegistrationRequest => {
  if (
    !form.noticeAgreed ||
    !form.projectName ||
    !form.startDate ||
    form.periodValue == null ||
    !form.periodUnit ||
    form.budget == null ||
    !form.workMethod ||
    !form.workType ||
    !form.recruits?.length ||
    !form.currentSituation ||
    !form.mainTask
  ) {
    throw new Error("프로젝트 등록에 필요한 입력값을 다시 확인해주세요.");
  }

  return {
    noticeAgreed: form.noticeAgreed,
    title: form.projectName,
    startDesiredDate: form.startDate,
    startNegotiable: form.startNegotiable ?? false,
    periodValue: form.periodValue,
    periodUnit: form.periodUnit,
    budgetAmount: form.budget * 10_000,
    workStyle: form.workMethod,
    workForm: form.workType,
    positions: form.recruits.map((recruit) => {
      if (!recruit.category || !recruit.job) {
        throw new Error("직군과 직무 입력값을 다시 확인해주세요.");
      }

      return {
        jobCategory: recruit.category,
        jobRole: recruit.job,
        minCareerYears: recruit.experience,
        headcount: recruit.count,
        skills: recruit.skills,
      };
    }),
    currentSituation: form.currentSituation,
    mainTask: form.mainTask,
    detailScope: form.detailScope?.trim() || null,
    extraNote: form.extraNote?.trim() || null,
    fileIds: (form.files ?? []).map((file) => file.fileId),
  };
};

export const createProject = (request: ProjectRegistrationRequest) =>
  apiCall<ProjectResponse>("/api/v1/projects", {
    method: "POST",
    body: JSON.stringify(request),
  });

export const getProject = (projectId: number) =>
  apiCall<ProjectResponse>(`/api/v1/projects/${projectId}`);
