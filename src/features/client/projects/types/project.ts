/**
* 프로젝트 등록 위저드(Step1~6)에서 누적되는 폼 데이터의 UI 상태 타입.

 */

/** 근무 방식 */
export type WorkMethod = "REMOTE" | "ONSITE" | "ALL";

/** 근무 형태 */
export type WorkType = "FULL_TIME" | "PART_TIME" | "ALL";

/** 직군 (Step3) */
export type JobCategory = "개발" | "디자인";

/** 직군별 모집 항목 (Step3) */
export interface ProjectRecruit {
  /** 목록 렌더링/수정용 클라이언트 식별자 */
  id: number;
  category: JobCategory | null;
  /** 직무 (예: 프론트엔드 개발자) */
  job: string;
  /** 희망 경력(년 이상) */
  experience: number;
  /** 모집 인원 */
  count: number;
  /** 요구 스킬 */
  skills: string[];
}

export interface ProjectRegisterForm {
  /** Step1 등록 전 안내 동의 여부 */
  agreedToTerms?: boolean;

  // ── Step2 기본 정보 ──
  /** 프로젝트 이름 */
  projectName?: string;
  /** 시작 희망일 "YYYY-MM-DD" (협의 가능 선택 시 빈 문자열) */
  startDate?: string;
  /** 시작일 협의 가능 여부 */
  startNegotiable?: boolean;
  /** 예상 기간(개월) */
  durationMonths?: number;
  /** 전체 예산(만원 단위, 부가세 별도) */
  budget?: number;
  /** 근무 방식 */
  workMethod?: WorkMethod;
  /** 근무 형태 */
  workType?: WorkType;

  // ── Step3 직군 모집 ──
  /** 직군별 모집 목록 */
  recruits?: ProjectRecruit[];

  // ── Step4 상세정보 ──
  /** 현재 프로젝트 진행 상황 */
  projectStatus?: string;
  /** 주요 담당 업무 */
  mainTasks?: string;
  /** 세부 업무 범위 */
  scope?: string;
  /** 기타 전달사항 및 우대사항 (선택) */
  additionalInfo?: string;

  // ── Step5 검수 / Step6 최종 확인 ... ──
  // TODO: 각 스텝 UI 확정 시 필드 추가
}

/**
 * (API 연동 시 사용) 서버로 보낼 요청 타입 자리.
 * UI 타입(ProjectRegisterForm)과 형태가 다를 수 있으므로 분리해 둡니다.
 */
// export interface ProjectRegisterRequest { ... }
// export function toProjectRegisterRequest(form: ProjectRegisterForm): ProjectRegisterRequest { ... }
