export type FreelancerGradeCode = "JUNIOR" | "SENIOR" | "MASTER";

export interface MyGradeResponse {
  grade: FreelancerGradeCode;
  label: string;
  completedProjectCount: number;
  ratingAverage: number | null;
  nextGrade: FreelancerGradeCode | null;
  nextGradeGuide: string | null;
  checkedGuide: string;
}

export interface GradeCriteriaResponse {
  role: "FREELANCER";
  grade: FreelancerGradeCode;
  label: string;
  level: number;
  promotionCondition: string;
  maintenanceCondition: string;
}
