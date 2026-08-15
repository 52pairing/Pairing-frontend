import { apiCall } from "@/lib/api";
import type { GradeCriteriaResponse, MyGradeResponse } from "@/features/freelancer/mypage/types/grade";

export const getMyGrade = () =>
  apiCall<MyGradeResponse>("/api/v1/grades/me").then((grade) => ({
    ...grade,
    completedProjectCount: grade.completedProjectCount ?? 0,
    ratingAverage: grade.ratingAverage ?? null,
    nextGrade: grade.nextGrade ?? null,
    nextGradeGuide: grade.nextGradeGuide ?? null,
  }));

export const getFreelancerGradeCriteria = () =>
  apiCall<GradeCriteriaResponse[]>("/api/v1/grades?role=FREELANCER").then((criteria) => criteria ?? []);
