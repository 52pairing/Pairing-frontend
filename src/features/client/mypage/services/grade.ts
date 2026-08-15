import { apiCall } from "@/lib/api";
import type { ClientGradeCriteriaResponse, ClientMyGradeResponse } from "@/features/client/mypage/types/grade";

export const getClientMyGrade = () =>
  apiCall<ClientMyGradeResponse>("/api/v1/grades/me").then((grade) => ({
    ...grade,
    completedProjectCount: grade.completedProjectCount ?? 0,
    ratingAverage: grade.ratingAverage ?? null,
    nextGrade: grade.nextGrade ?? null,
    nextGradeGuide: grade.nextGradeGuide ?? null,
  }));

export const getClientGradeCriteria = () =>
  apiCall<ClientGradeCriteriaResponse[]>("/api/v1/grades?role=CLIENT").then((criteria) => criteria ?? []);
