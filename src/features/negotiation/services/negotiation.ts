/**
 * 협상 도메인 REST 서비스
 *
 * 초기 상태는 REST(GET)로 그리고, 이후 변화는 STOMP로 받는다.
 * (docs/api/negotiation-realtime-frontend.md §4: 초기=GET, 이후=STOMP)
 *
 * 요청 경로/바디는 screen-api-map 에 명시된 계약을 따른다.
 * 액션(start/answers/give-up/read)의 성공 응답 구조는 미검증이라
 * 호출부에서 GET 재조회로 상태를 재동기화한다.
 */

import { apiCall } from "@/lib/api";

import type {
  GiveUpRequest,
  NegotiationDetail,
  NegotiationListItem,
  NegotiationMessage,
  StartNegotiationRequest,
  SubmitAnswersRequest,
  WorkConditionsMeta,
} from "@/features/negotiation/types/negotiation";

const BASE = "/api/v1/negotiations";

type NegotiationId = number | string;

// 페이지 응답과 배열 응답 모두 방어적으로 처리하기 위한 최소 형태
interface PageLike<T> {
  content?: T[];
}

/** 협상 상세 조회 (초기 상태: 헤더 배지·라운드·조건) */
export const getNegotiation = (negotiationId: NegotiationId) =>
  apiCall<NegotiationDetail>(`${BASE}/${negotiationId}`);

/** 협상 메시지(로그) 조회 (초기 로드 / 재동기화) */
export const getNegotiationMessages = (negotiationId: NegotiationId) =>
  apiCall<NegotiationMessage[]>(`${BASE}/${negotiationId}/messages`);

/**
 * 협상 시작 — 내 마지노선 저장 + 두 대리인 A2A 왕복 실행.
 * 성공 응답 구조 미검증 → 호출부에서 상세·메시지 재조회로 갱신.
 */
export const startNegotiation = async (
  negotiationId: NegotiationId,
  body: StartNegotiationRequest,
): Promise<void> => {
  await apiCall<unknown>(`${BASE}/${negotiationId}/start`, {
    method: "POST",
    body: JSON.stringify(body),
  });
};

/**
 * 조건 승인/재지시 제출.
 * 성공 응답 구조 미검증 → 호출부에서 상세·메시지 재조회로 갱신.
 */
export const submitAnswers = async (
  negotiationId: NegotiationId,
  body: SubmitAnswersRequest,
): Promise<void> => {
  await apiCall<unknown>(`${BASE}/${negotiationId}/answers`, {
    method: "POST",
    body: JSON.stringify(body),
  });
};

/**
 * 협상 중 내 마지노선 수정.
 * 요청 형식은 start 와 동일. 성공 응답 data 는 상세(NegotiationDetail)와 동일 형태라
 * 그대로 상태에 반영하면 되고 재조회 불필요. 라운드 변화 없음.
 */
export const updateFloors = (
  negotiationId: NegotiationId,
  body: StartNegotiationRequest,
) =>
  apiCall<NegotiationDetail>(`${BASE}/${negotiationId}/floors`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

/** 협상 포기 → status=FAILED, 상대 알림 */
export const giveUpNegotiation = async (
  negotiationId: NegotiationId,
  body: GiveUpRequest,
): Promise<void> => {
  await apiCall<unknown>(`${BASE}/${negotiationId}/give-up`, {
    method: "POST",
    body: JSON.stringify(body),
  });
};

/** 안 읽은 새 제안 표시 해제 (협상방 진입 시 호출) */
export const markNegotiationRead = async (
  negotiationId: NegotiationId,
): Promise<void> => {
  await apiCall<unknown>(`${BASE}/${negotiationId}/read`, { method: "POST" });
};

/**
 * 내 협상 목록 (프로젝트별 후보 카드).
 * 페이징(§0) 응답이라 응답이 배열이면 그대로, 페이지 객체면 content 를 반환한다.
 */
export const getMyNegotiations = async (
  projectId: NegotiationId,
): Promise<NegotiationListItem[]> => {
  const data = await apiCall<NegotiationListItem[] | PageLike<NegotiationListItem>>(
    `${BASE}/mine?projectId=${encodeURIComponent(String(projectId))}`,
  );
  if (Array.isArray(data)) return data;
  return data?.content ?? [];
};

/**
 * 근무조건 메타 (조건 값 라벨용). 비로그인 호출 가능.
 * 라벨을 하드코딩하지 않고 이 응답으로 해결한다(백엔드 지침).
 */
export const getWorkConditionsMeta = () =>
  apiCall<WorkConditionsMeta>("/api/v1/meta/work-conditions");
