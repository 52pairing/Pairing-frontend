import type { ClientProjectStatus } from "@/features/client/myprojects/types/projectList";

/**
 * 프로젝트 상태 코드 → 한글 라벨 (목록/상세 공용).
 * 매칭 요청 상태(ProjectFreelancerStatus)·계약 상태(ProjectProgress)는
 * 의미가 다른 별도 맵이므로 여기에 합치지 않는다.
 */
export const PROJECT_STATUS_LABEL: Record<ClientProjectStatus, string> = {
  REGISTERED: "등록 완료",
  RECRUITING: "모집중",
  NEGOTIATING: "협상중",
  CONTRACT_PENDING: "계약 대기",
  IN_PROGRESS: "진행중",
  COMPLETION_PENDING: "완료 대기",
  CLOSED: "종료",
  CANCELED: "취소됨",
};

/** 알 수 없는 코드는 원문 그대로 노출한다. */
export const getProjectStatusLabel = (status: string): string =>
  PROJECT_STATUS_LABEL[status as ClientProjectStatus] ?? status;

/** 기간 단위 코드 → 한글 라벨 */
export const PERIOD_UNIT_LABEL: Record<string, string> = {
  DAY: "일",
  WEEK: "주",
  MONTH: "개월",
  YEAR: "년",
};

/** ISO 날짜 문자열 → YYYY.MM.DD (없으면 "-") */
export const formatProjectDate = (value: string | null | undefined): string =>
  value ? value.slice(0, 10).replaceAll("-", ".") : "-";
