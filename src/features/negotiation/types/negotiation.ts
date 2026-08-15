/**
 * 협상(negotiation) 도메인 타입
 *
 * 출처(백엔드 계약 문서 + 2026-08 백엔드 확정 답변):
 *  - docs/api/negotiation-realtime-frontend.md  (STOMP 실시간 계약)
 *  - docs/api/negotiation-screen-api-map.md      (화면 ↔ API/모달 매핑)
 *
 * 모든 REST 응답은 공통 래퍼 `{ timestamp, status, code, message, data }` 로 감싸지며,
 * apiCall 이 `data` 만 추출한다. 아래 타입은 그 `data` 기준이다.
 *
 * 필드 구조는 백엔드가 확정해 준 계약이나, 실제 네트워크 응답은 아직 미검증이다.
 */

// ── 공통 enum / union ────────────────────────────────────────────────

/** 협상 진행 상태 */
export type NegotiationStatus = "IN_PROGRESS" | "AGREED" | "FAILED";

/** 조건 상태 */
export type ConditionStatus = "PENDING" | "AGREED" | "REJECTED";

/** 메시지/제안 발신자 유형 (AI 대리인은 *_AGENT) */
export type SenderType =
  | "CLIENT_AGENT"
  | "FREELANCER_AGENT"
  | "CLIENT"
  | "FREELANCER"
  | "SYSTEM";

/** 메시지 종류 */
export type MessageType = "PROPOSAL" | "RESPONSE" | "SYSTEM";

/**
 * 조건 종류 코드 (백엔드 확정).
 * - AMOUNT: 월 단가(라벨은 "연봉"이지만 값은 월 용역대금, 원 단위)
 * - PERIOD: 계약 기간 ("4 MONTH" 형식)
 * - START_DATE: 시작일 ("2026-09-01")
 * - WORK_STYLE: 근무 방식 (REMOTE/ONSITE/ANY, ANY=혼합)
 * - WORK_FORM: 근무 형태 (풀타임/파트타임 — 코드값 미확인)
 * - SCOPE: 업무 범위 (자유 텍스트)
 * - OTHER: 기타
 */
export type ConditionType =
  | "AMOUNT"
  | "PERIOD"
  | "START_DATE"
  | "WORK_STYLE"
  | "WORK_FORM"
  | "SCOPE"
  | "OTHER";

// ── STOMP 실시간 이벤트 ──────────────────────────────────────────────

export type NegotiationEventType =
  | "STARTED"
  | "NEW_PROPOSAL"
  | "ANSWERED"
  | "CONDITION_LOCKED"
  | "AGREED"
  | "FAILED"
  // 비동기 A2A 전환으로 추가된 이벤트
  | "AGENT_RUNNING" // 대리인이 돌기 시작(제출 즉시)
  | "AGENT_FAILED" // 대리인 호출 실패, 라운드 안 오름
  | "FINAL_OFFER"; // 최종 절충 단계 진입 / 한쪽 수락으로 상태 변경

/**
 * `/topic/negotiations/{negotiationId}` 로 수신하는 실시간 이벤트 payload.
 * 실제 payload에는 conditionId·occurredAt 이 없어 optional (현재 type 만 사용).
 */
export interface NegotiationEvent {
  type: NegotiationEventType;
  negotiationId: number;
  status: NegotiationStatus;
  totalRound: number;
  conditionId?: number | null;
  occurredAt?: string;
}

// ── REST 응답 ────────────────────────────────────────────────────────

/**
 * 협상 조건 (GET /negotiations/{id} 의 conditions[]).
 * 값 필드(clientValue/freelancerValue/proposedValue/agreedValue/myFloor)는 전부 문자열.
 * 조건 종류 필드명은 `type` 이다(요청 바디의 conditionType 과 이름이 다름에 주의).
 */
export interface NegotiationCondition {
  conditionId: number;
  type: ConditionType;
  clientValue: string | null;
  freelancerValue: string | null;
  proposedValue: string | null;
  reason: string | null;
  agreedValue: string | null;
  status: ConditionStatus;
  roundCount: number;
  /** 내 마지노선 (내 것만, 상대 floor는 비공개) */
  myFloor: string | null;
  /**
   * 마지노선 비교 방식.
   * - RANGE: 크기 비교(이상/이하) — AMOUNT/PERIOD/START_DATE
   * - CHOICE: 허용값 집합(허용해야) — WORK_STYLE/WORK_FORM
   * - NONE: 비교 기준 없음(자유 텍스트) — SCOPE/OTHER → 안내 문구 미표시
   * 응답에 없을 수 있어(배포 시점차) optional. 없으면 type 으로 추정한다.
   */
  floorComparison?: "RANGE" | "CHOICE" | "NONE";
  /** 최종 절충값 (finalOffer=true 인 미합의 조건에만 채워짐). 그 외 null */
  compromiseValue?: string | null;
}

/**
 * 협상 메시지 (GET /negotiations/{id}/messages).
 * 서버가 roundNo ASC → id ASC 로 정렬해 내려주므로 프론트 재정렬 불필요.
 * 조건 무관 안내(SYSTEM)면 conditionType 은 null.
 */
export interface NegotiationMessage {
  messageId: number;
  roundNo: number;
  senderType: SenderType;
  messageType: MessageType;
  conditionType: ConditionType | null;
  content: string;
  reason: string | null;
  proposedValue: string | null;
  response: string | null;
  createdAt: string;
}

/**
 * 협상 상세 (GET /negotiations/{id}).
 * agreedAmount 는 원 단위 월 단가(Long), 그 외 값 필드는 conditions[] 안.
 */
export interface NegotiationDetail {
  negotiationId: number;
  projectId: number;
  projectTitle: string;
  positionId: number;
  counterpartName: string | null;
  /** 내 편 역할 (서버 제공, 역추정 불필요) */
  viewerRole: "CLIENT" | "FREELANCER";
  /** true 면 승인/재지시 패널 노출 (이번 라운드 AI 제안에 내 응답이 아직 없음) */
  waitingForMe: boolean;
  status: NegotiationStatus;
  totalRound: number;
  maxRound: number;
  /** 합의 월 단가(원). 미합의면 null */
  agreedAmount: number | null;
  /** 계약 "체결" 시 생성. 그 전에는 null */
  chatRoomId: number | null;
  aiOutAt: string | null;
  /** 미사용(항상 false). 15회 자동 결렬로 설계 변경되며 폐기 */
  finalApprovalRequired: boolean;
  /**
   * 대리인 A2A 상태 (백엔드 비동기 전환 시 도입 — 아직 배포 전이라 optional).
   * RUNNING=대리인 호출 중, FAILED=호출 실패, IDLE=대기.
   * 배포되면 RUNNING 동안 GET 폴링(2~3s) + 라벨 우선순위에 반영 필요.
   */
  agentState?: "RUNNING" | "FAILED" | "IDLE";
  /** 최종 절충(Final Compromise) 단계 여부. true 면 status 는 IN_PROGRESS 유지 */
  finalOffer?: boolean;
  /** 최종 절충안을 내가 수락했는가 (true 면 내 수락 버튼 비활성 + 상대 대기) */
  myFinalAccepted?: boolean;
  /** 최종 절충안을 상대가 수락했는가 */
  counterpartFinalAccepted?: boolean;
  conditions: NegotiationCondition[];
  /**
   * 결렬 사유 (가이드 3.12). status === "FAILED"일 때만 값이 있고, 타결(AGREED)은 null.
   * 사용자가 직접 입력한 문장이 그대로 온다 — 화면에 그대로 텍스트로만 렌더링하고
   * dangerouslySetInnerHTML 등으로 HTML 해석하지 말 것(XSS 경로).
   */
  endReason: string | null;
}

/**
 * 협상 목록 카드 (GET /negotiations/mine?projectId=) — 페이지 객체의 content[].
 * maxRound·newProposalCount·jobRole 은 이 응답에 없음(각각 상수 15 / 매칭 API / 매칭 API).
 */
export interface NegotiationListItem {
  negotiationId: number;
  /** 표시용 번호 문자열(예: "NEG-2026-005"). 서버 값 그대로 출력하고 파싱·식별자로 쓰지 말 것 */
  negotiationNo: string;
  projectId: number;
  projectTitle: string;
  counterpartName: string | null;
  clientName: string | null;
  freelancerName: string | null;
  status: NegotiationStatus;
  totalRound: number;
  waitingForMe: boolean;
  lastProposalBy: SenderType | null;
  lastProposalAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  /** 최종 절충 단계면 true — 카드에 라운드 배지 대신 "최종 절충" 표시 */
  finalOffer?: boolean;
}

// ── 요청 바디 ────────────────────────────────────────────────────────

/**
 * POST /negotiations/{id}/start.
 * 요청 필드명은 `conditionType`(응답 conditions[].type 과 이름 다름).
 * value 는 문자열: 금액은 원 단위(만원 ×10,000), 기간은 "4 MONTH", 날짜는 "2026-09-01".
 *
 * belowMinAccept(#... 2026-08-14): 프리랜서 AMOUNT 에만 의미. true 면 처음 마지노선 입력 시
 * 등록 최소가 하한 검증(NG_012)만 건너뛴다. 기본 false(하위호환). 재조정(/floors)에는 보내도 무시됨.
 */
export interface StartNegotiationRequest {
  conditions: Array<{
    conditionType: ConditionType;
    value: string;
    belowMinAccept?: boolean;
  }>;
}

/**
 * POST /negotiations/{id}/answers.
 * roundNo 는 상세의 totalRound 를 그대로 전송(늦은 응답 필터용).
 * proposedValue 는 재지시(거절) 시 새 마지노선 문자열.
 */
export interface SubmitAnswersRequest {
  roundNo: number;
  answers: Array<{
    conditionId: number;
    accepted: boolean;
    proposedValue?: string | null;
    /** accepted=true 일 때만 의미. true 면 내 마지노선을 넘겨서라도 이 제안을 직접 수락 */
    acceptBelowFloor?: boolean;
  }>;
}

/** POST /negotiations/{id}/give-up. reason 선택(생략/빈값 시 서버가 "협상 포기"로 기록) */
export interface GiveUpRequest {
  reason?: string | null;
}

/** 근무조건 메타 선택지 (GET /api/v1/meta/work-conditions) */
export interface MetaOption {
  code: string;
  label: string;
}

/**
 * 근무조건 메타 (비로그인 호출 가능).
 * 조건 값 라벨(WORK_STYLE/WORK_FORM/PERIOD 단위)은 이 응답으로 해결한다.
 * (payUnits/skillLevels 도 응답에 있으나 협상 화면에선 미사용)
 */
export interface WorkConditionsMeta {
  workStyles: MetaOption[];
  workForms: MetaOption[];
  periodUnits: MetaOption[];
}

/** 협상방 상수: 목록에는 maxRound 가 없어 상수 15 사용 */
export const DEFAULT_MAX_ROUND = 15;
