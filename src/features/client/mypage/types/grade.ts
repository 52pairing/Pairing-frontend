export type ClientGradeCode = "SILVER" | "GOLD" | "DIAMOND";

export interface ClientMyGradeResponse {
  grade: ClientGradeCode;
  label: string;
  completedProjectCount: number;
  ratingAverage: number | null;
  nextGrade: ClientGradeCode | null;
  nextGradeGuide: string | null;
  checkedGuide: string;
}

export interface ClientGradeCriteriaResponse {
  role: "CLIENT";
  grade: ClientGradeCode;
  label: string;
  level: number;
  promotionCondition: string;
  maintenanceCondition: string;
}
