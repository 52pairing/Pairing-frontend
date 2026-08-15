import type { ReactNode } from "react";

import type { ClientContractListItem } from "@/features/contract/types/clientContract";
import type { ClientProjectDetailResponse } from "@/features/client/myprojects/types/projectDetail";
import type { ClientProjectTab } from "@/features/client/myprojects/types/projectList";

export interface ClientProjectCardProps {
  projectId: number;
  title: string;
  status: string;
  position: string;
  skills: string[];
  budget: string;
  duration: string;
  startDate: string;
  headcount: string;
  registeredAt: string;
  actionType?: "payment" | "detail" | "complete" | "successFee";
  detailHref?: string;
  onPayment?: () => void;
  onComplete?: () => void;
  isCompleting?: boolean;
}

export interface ProjectStatusTabsProps {
  activeTab: ClientProjectTab;
  onTabChange: (tab: ClientProjectTab) => void;
  counts?: Partial<Record<ClientProjectTab, number>>;
  labels?: Partial<Record<ClientProjectTab, string>>;
}

export type ProjectDetailTab = "프로젝트 정보" | "추천 후보" | "협상" | "계약" | "진행 현황";

export interface ProjectDetailTabsProps {
  activeTab: ProjectDetailTab;
  onTabChange: (tab: ProjectDetailTab) => void;
  rightContent?: ReactNode;
}

export type ProjectAction = "cancelRegistration" | "extendRecruitment" | "closeRecruitment" | "complete";

export interface ProjectInformationProps {
  project: ClientProjectDetailResponse;
  jobRoleLabels: Record<string, string>;
  skillLabels: Record<string, string>;
  workStyleLabel: string;
  workFormLabel: string;
}

export interface ProjectFreelancerStatusProps {
  projectId: number;
  jobRoleLabels: Record<string, string>;
}

export interface ProjectProgressProps {
  project: ClientProjectDetailResponse;
  jobRoleLabels: Record<string, string>;
  workStyleLabel: string;
}

export interface ProgressContract extends ClientContractListItem {
  negotiationId: number;
}

export interface RecommendedCandidateItem {
  id: number;
  name: string;
  role: string;
  career: string;
  level: string;
  rating: number;
  reviewCount: number;
  monthlyRate: number;
  skills: string[];
  reasons: string[];
  introduction: string;
  avatarClass: string;
}
