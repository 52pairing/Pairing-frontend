/**
* 프로젝트 등록 위저드(Step1~6)에서 누적되는 폼 데이터의 UI 상태 타입.

 */

/** 서버 근무 방식 코드 */
export type WorkMethod = string;

/** 서버 근무 형태 코드 */
export type WorkType = string;

/** 직군별 모집 항목 (Step3) */
export interface ProjectRecruit {
  /** 목록 렌더링/수정용 클라이언트 식별자 */
  id: number;
  /** 서버 직군 코드 */
  category: string | null;
  categoryLabel?: string;
  /** 서버 직무 코드 */
  job: string;
  jobLabel?: string;
  /** 희망 경력(년 이상) */
  experience: number;
  /** 모집 인원 */
  count: number;
  /** 요구 스킬 */
  skills: string[];
  /** 스킬 코드별 화면 표시 라벨 */
  skillLabels?: Record<string, string>;
}

export interface ProjectUploadedFile {
  fileId: number;
  originalName: string;
  sizeBytes: number;
}

export interface ProjectRegisterForm {
  /** Step1 등록 전 안내 동의 여부 */
  noticeAgreed?: boolean;

  // ── Step2 기본 정보 ──
  /** 프로젝트 이름 */
  projectName?: string;
  /** 시작 희망일 "YYYY-MM-DD", 협의 가능 여부와 관계없이 필수 */
  startDate?: string;
  /** 시작일 협의 가능 여부 */
  startNegotiable?: boolean;
  /** 예상 기간 값 */
  periodValue?: number;
  /** 서버 기간 단위 코드 */
  periodUnit?: string;
  /** 화면 표시용 기간 단위 라벨 */
  periodUnitLabel?: string;
  /** 전체 예산(만원 단위, 부가세 별도) */
  budget?: number;
  /** 근무 방식 */
  workMethod?: WorkMethod;
  /** 화면 표시용 근무 방식 라벨 */
  workMethodLabel?: string;
  /** 근무 형태 */
  workType?: WorkType;
  /** 화면 표시용 근무 형태 라벨 */
  workTypeLabel?: string;

  // ── Step3 직군 모집 ──
  /** 직군별 모집 목록 */
  recruits?: ProjectRecruit[];

  // ── Step4 상세정보 ──
  /** 현재 프로젝트 진행 상황 */
  currentSituation?: string;
  /** 주요 담당 업무 */
  mainTask?: string;
  /** 세부 업무 범위 */
  detailScope?: string;
  /** 기타 전달사항 및 우대사항 (선택) */
  extraNote?: string;
  /** Step4에서 서버에 업로드한 첨부 파일 */
  files?: ProjectUploadedFile[];
}
