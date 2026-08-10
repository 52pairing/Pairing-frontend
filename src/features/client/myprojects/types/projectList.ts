export const CLIENT_PROJECT_TABS = [
  { tab: "REGISTERED", label: "등록 완료" },
  { tab: "MATCHING", label: "매칭 중" },
  { tab: "IN_PROGRESS", label: "진행 중" },
  { tab: "COMPLETION_PENDING", label: "완료 대기" },
  { tab: "CLOSED", label: "종료" },
  { tab: "CANCELED", label: "취소됨" },
] as const;

export type ClientProjectTab = (typeof CLIENT_PROJECT_TABS)[number]["tab"];

export type ClientProjectStatus =
  | "REGISTERED"
  | "RECRUITING"
  | "NEGOTIATING"
  | "CONTRACT_PENDING"
  | "IN_PROGRESS"
  | "COMPLETION_PENDING"
  | "CLOSED"
  | "CANCELED";

export interface ClientProjectListItem {
  projectId: number;
  title: string;
  status: ClientProjectStatus;
  jobRoleLabels: string[];
  skillLabels: string[];
  budgetAmount: number;
  periodLabel: string;
  startDesiredDate: string | null;
  totalHeadcount: number;
  createdAt: string | null;
  payableSettlementId: number | null;
}

export interface ProjectPageResponse {
  content: ClientProjectListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
