"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ErrorState } from "@/features/common/components/ErrorState";
import { LoadingState } from "@/features/common/components/Loading";
import { NegotiationCancelModal } from "@/features/negotiation/components/NegotiationCancelModal";
import {
  type AnswerInput,
  NegotiationChatFlow,
} from "@/features/negotiation/components/NegotiationChatFlow";
import {
  getNegotiation,
  getNegotiationMessages,
  getWorkConditionsMeta,
  acceptFinalOffer,
  giveUpNegotiation,
  markNegotiationRead,
  startNegotiation,
  submitAnswers,
  updateFloors,
} from "@/features/negotiation/services/negotiation";
import { onStompConnect } from "@/features/negotiation/stomp/client";
import { useNegotiationEvents } from "@/features/negotiation/stomp/useNegotiationEvents";
import type {
  ConditionType,
  NegotiationDetail,
  NegotiationEvent,
  NegotiationMessage,
} from "@/features/negotiation/types/negotiation";
import {
  EMPTY_WORK_CONDITION_LABELS,
  toLabelMap,
  type WorkConditionLabels,
} from "@/features/negotiation/utils/conditionFormat";
import { ApiException } from "@/lib/api";

/**
 * 협상방 컨테이너
 *
 * 진입: GET 상세 + 메시지 로드 → 진입 표시(read) → /topic 구독
 * 이후: 실시간 이벤트로 재조회하며 화면 갱신 (초기=GET, 이후=STOMP)
 *
 * negotiationId 는 동적 라우트 파라미터로 받는다.
 * (경로: /client/projects/{projectId}/negotiation/{negotiationId})
 */
export function NegotiationRoom() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const projectId = String(params.projectId ?? "");
  const negotiationId = params.negotiationId ? String(params.negotiationId) : null;
  // 협상방은 클라이언트·프리랜서 공용. 현재 경로로 뒤로가기 대상을 정한다.
  const projectsBase = pathname?.startsWith("/freelancer")
    ? "/freelancer/projects"
    : "/client/projects";

  const [detail, setDetail] = useState<NegotiationDetail | null>(null);
  const [messages, setMessages] = useState<NegotiationMessage[]>([]);
  // negotiationId 가 없으면 로딩 없이 바로 안내 화면을 보여준다(초기값으로 결정).
  const [isLoading, setIsLoading] = useState<boolean>(() => negotiationId != null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 액션(시작/승인·재지시/포기) 실패 메시지 — 전체 화면 대신 인라인 배너로 표시
  const [actionError, setActionError] = useState<string | null>(null);
  // 조건 값 라벨(근무방식/근무형태/기간 단위)은 meta API 로 해결
  const [labels, setLabels] = useState<WorkConditionLabels>(EMPTY_WORK_CONDITION_LABELS);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const meta = await getWorkConditionsMeta();
        if (!active) return;
        setLabels({
          workStyles: toLabelMap(meta.workStyles),
          workForms: toLabelMap(meta.workForms),
          periodUnits: toLabelMap(meta.periodUnits),
        });
      } catch {
        // 라벨을 못 받으면 코드 원문으로 표시(치명적 아님)
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // 상세/메시지 재조회 (실시간 이벤트·액션 후 재동기화)
  const refreshDetail = useCallback(async () => {
    if (!negotiationId) return;
    try {
      setDetail(await getNegotiation(negotiationId));
    } catch {
      // 재조회 실패는 화면 유지 (다음 이벤트/액션에서 재시도)
    }
  }, [negotiationId]);

  const refreshMessages = useCallback(async () => {
    if (!negotiationId) return;
    try {
      setMessages((await getNegotiationMessages(negotiationId)) ?? []);
    } catch {
      // 재조회 실패는 화면 유지
    }
  }, [negotiationId]);

  // 재시도(에러 화면 버튼): 로딩 표시 후 effect 재실행 트리거
  const reload = useCallback(() => {
    setErrorMessage(null);
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  }, []);

  // 초기 로드 — effect 본문에서 동기 setState 를 피하기 위해 모든 상태 갱신은 await 이후에만 수행
  useEffect(() => {
    if (!negotiationId) return;
    let active = true;

    void (async () => {
      try {
        const [loadedDetail, loadedMessages] = await Promise.all([
          getNegotiation(negotiationId),
          getNegotiationMessages(negotiationId),
        ]);
        if (!active) return;
        setDetail(loadedDetail);
        setMessages(loadedMessages ?? []);
        setErrorMessage(null);
        // 진입 시 안 읽은 새 제안 표시 해제 (실패해도 화면엔 영향 없음)
        markNegotiationRead(negotiationId).catch(() => {});
      } catch (error) {
        if (!active) return;
        setErrorMessage(
          error instanceof ApiException
            ? error.message
            : "협상 정보를 불러오지 못했습니다.",
        );
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [negotiationId, reloadKey]);

  // 실시간 이벤트 → 재조회
  const handleEvent = useCallback(
    (event: NegotiationEvent) => {
      switch (event.type) {
        // STARTED: 상대가 마지노선을 내 협상이 시작될 때 서버가 발행(초기 제안엔 NEW_PROPOSAL 없음).
        // 이벤트는 "재조회 신호"로만 쓰고, 화면 전환 판정은 totalRound/agentState 로 유지한다.
        case "STARTED":
        case "NEW_PROPOSAL":
        case "ANSWERED":
        case "AGENT_RUNNING": // 대리인 진행 시작 → agentState=RUNNING 반영
          void refreshMessages();
          void refreshDetail();
          break;
        case "CONDITION_LOCKED":
          void refreshDetail();
          break;
        case "AGREED":
        case "FAILED":
        case "AGENT_FAILED": // 실패 안내가 SYSTEM 메시지로 저장됨 → 메시지도 재조회
        case "FINAL_OFFER": // 최종 절충 진입/한쪽 수락 → 상세 재조회로 화면 전환
          void refreshDetail();
          void refreshMessages();
          break;
      }
    },
    [refreshDetail, refreshMessages],
  );

  useNegotiationEvents(negotiationId, handleEvent);

  // 재연결 시(최초 연결 제외) 놓친 상태를 재조회한다.
  // 인메모리 브로커는 끊긴 동안의 메시지를 재전송하지 않으므로 재연결 순간 다시 읽어야 한다.
  useEffect(() => {
    let connectedOnce = false;
    return onStompConnect(() => {
      if (connectedOnce) {
        void refreshDetail();
        void refreshMessages();
      }
      connectedOnce = true;
    });
  }, [refreshDetail, refreshMessages]);

  // 폴링 폴백(상시): 진행 중인 협상은 저빈도로 계속 재조회한다. 대리인 도는 중엔 빠르게(2.5초),
  // 그 외 전이(거절/수락/재지시)에도 안전망이 있게 느리게(10초). WS가 놓쳐도 화면이 영구히 멈추지 않는다.
  useEffect(() => {
    if (!negotiationId || detail?.status !== "IN_PROGRESS") return;
    const intervalMs = detail.agentState === "RUNNING" ? 2500 : 10000;
    const timer = setInterval(() => {
      void refreshDetail();
      void refreshMessages();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [negotiationId, detail?.status, detail?.agentState, refreshDetail, refreshMessages]);

  // 협상 시작
  const handleStart = useCallback(
    async (conditions: Array<{ conditionType: ConditionType; value: string }>) => {
      if (!negotiationId || isSubmitting) return;
      setIsSubmitting(true);
      setActionError(null);
      try {
        await startNegotiation(negotiationId, { conditions });
        await Promise.all([refreshDetail(), refreshMessages()]);
      } catch (error) {
        setActionError(
          error instanceof ApiException ? error.message : "협상 시작에 실패했습니다.",
        );
        // 실패 후에도 상태 재동기화(예: 이미 제출됨/형식 오류)
        await refreshDetail();
      } finally {
        setIsSubmitting(false);
      }
    },
    [negotiationId, isSubmitting, refreshDetail, refreshMessages],
  );

  // 조건 승인/재지시. 마지노선 밖 수락(NG_011)이면 floorViolation=true 로 알려 패널이 수정 영역을 편다.
  const handleSubmitAnswers = useCallback(
    async (answers: AnswerInput[]): Promise<{ floorViolation: boolean }> => {
      if (!negotiationId || isSubmitting || !detail) return { floorViolation: false };
      setIsSubmitting(true);
      setActionError(null);
      try {
        // roundNo 는 상세의 totalRound 를 그대로 전송(늦은 응답 필터용)
        await submitAnswers(negotiationId, { roundNo: detail.totalRound, answers });
        await Promise.all([refreshDetail(), refreshMessages()]);
        return { floorViolation: false };
      } catch (error) {
        const isFloorViolation =
          error instanceof ApiException && error.errorCode === "NG_011";
        setActionError(
          error instanceof ApiException ? error.message : "제출에 실패했습니다.",
        );
        // NG_011 은 화면 전환 없이 그대로 두고(상태 재동기화만), 패널이 수정 영역을 편다
        await refreshDetail();
        if (!isFloorViolation) await refreshMessages();
        return { floorViolation: isFloorViolation };
      } finally {
        setIsSubmitting(false);
      }
    },
    [negotiationId, isSubmitting, detail, refreshDetail, refreshMessages],
  );

  // 마지노선 수정 — 응답 data 로 상태 교체(재조회 X, 라운드 변화 없음).
  // 성공 여부와 실패 메시지를 패널에 돌려줘 인라인 오류/닫기 처리에 쓴다.
  const handleUpdateFloor = useCallback(
    async (
      conditionType: ConditionType,
      value: string,
    ): Promise<{ ok: boolean; message?: string }> => {
      if (!negotiationId) return { ok: false };
      setActionError(null);
      try {
        const updated = await updateFloors(negotiationId, {
          conditions: [{ conditionType, value }],
        });
        setDetail(updated);
        return { ok: true };
      } catch (error) {
        return {
          ok: false,
          message:
            error instanceof ApiException ? error.message : "마지노선 수정에 실패했습니다.",
        };
      }
    },
    [negotiationId],
  );

  // 협상 포기
  const handleGiveUp = useCallback(async () => {
    if (!negotiationId || isSubmitting) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      // reason 은 선택. 화면에 입력란이 없어 생략(서버가 "협상 포기"로 기록)
      await giveUpNegotiation(negotiationId, {});
      setIsCancelOpen(false);
      await refreshDetail();
    } catch (error) {
      setActionError(
        error instanceof ApiException ? error.message : "협상 포기에 실패했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [negotiationId, isSubmitting, refreshDetail]);

  // 최종 절충안 수락(바디 없음). 응답 data 로 상태 교체 → status 로 타결/상대대기 분기.
  const handleAcceptFinalOffer = useCallback(async () => {
    if (!negotiationId || isSubmitting) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      setDetail(await acceptFinalOffer(negotiationId));
    } catch (error) {
      setActionError(
        error instanceof ApiException ? error.message : "수락에 실패했습니다.",
      );
      await refreshDetail();
    } finally {
      setIsSubmitting(false);
    }
  }, [negotiationId, isSubmitting, refreshDetail]);

  // 대리인 실패(AGENT_FAILED) 재시도: 라운드가 안 올랐으므로 내 마지노선(myFloor)으로 start 재호출 = 재시도.
  const handleRetryAgent = useCallback(async () => {
    if (!negotiationId || !detail) return;
    if (detail.totalRound === 0) {
      const conditions = detail.conditions
        .filter((condition) => condition.myFloor != null)
        .map((condition) => ({
          conditionType: condition.type,
          value: condition.myFloor as string,
        }));
      if (conditions.length > 0) {
        await handleStart(conditions);
        return;
      }
    }
    await Promise.all([refreshDetail(), refreshMessages()]);
  }, [negotiationId, detail, handleStart, refreshDetail, refreshMessages]);

  const goBackToProject = () => router.push(`${projectsBase}/${projectId}`);

  return (
    <div className="flex h-[calc(100dvh-60px)] min-h-0 flex-col overflow-hidden bg-[#f3f4f8] px-6 pb-4 pt-2 text-theme-primary">
      <header className="shrink-0">
        <button
          type="button"
          onClick={goBackToProject}
          className="mb-3 cursor-pointer text-[12px] text-[#98a1b2] hover:text-theme-secondary"
        >
          ← 제안 목록
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[17px] font-bold">{detail?.projectTitle ?? "협상방"}</h1>
            {detail?.counterpartName ? (
              <p className="mt-2 text-[12px] text-[#7d8799]">{detail.counterpartName}</p>
            ) : null}
          </div>

          {/* 진행 중일 때만 협상 포기 버튼 노출 */}
          {detail && detail.status === "IN_PROGRESS" ? (
            <button
              type="button"
              onClick={() => setIsCancelOpen(true)}
              className="cursor-pointer rounded-[9px] border border-[#ff5757] bg-surface px-5 py-2.5 text-[12px] font-semibold text-[#ff4d4f] hover:bg-[#fff5f5]"
            >
              협상 포기
            </button>
          ) : null}
        </div>
      </header>

      {actionError ? (
        <div
          role="alert"
          className="mt-2 shrink-0 rounded-[8px] border border-[#fecdca] bg-danger-surface px-4 py-2 text-[12px] font-semibold text-theme-danger"
        >
          {actionError}
        </div>
      ) : null}

      {isLoading ? (
        <LoadingState className="flex-1" message="협상 정보를 불러오는 중입니다." />
      ) : errorMessage ? (
        <ErrorState className="flex-1" description={errorMessage} onRetry={reload} />
      ) : !negotiationId ? (
        <ErrorState
          className="flex-1"
          title="협상 정보를 찾을 수 없습니다"
          description="협상 목록에서 다시 진입해 주세요."
          onRetry={goBackToProject}
          retryText="목록으로"
        />
      ) : !detail ? (
        <ErrorState
          className="flex-1"
          title="협상 정보가 없습니다"
          description="협상 정보를 불러오지 못했습니다."
          onRetry={reload}
        />
      ) : (
        <NegotiationChatFlow
          detail={detail}
          messages={messages}
          labels={labels}
          onStart={handleStart}
          onSubmitAnswers={handleSubmitAnswers}
          onUpdateFloor={handleUpdateFloor}
          onRetryAgent={() => void handleRetryAgent()}
          onAcceptFinalOffer={() => void handleAcceptFinalOffer()}
          onGiveUp={() => setIsCancelOpen(true)}
          isSubmitting={isSubmitting}
          chatActionSlot={
            detail.status === "AGREED" ? (
              detail.chatRoomId != null ? (
                <button
                  type="button"
                  onClick={() => router.push("/chat")}
                  className="cursor-pointer rounded-[9px] bg-[#142f50] px-5 py-2.5 text-[12px] font-bold text-white transition hover:bg-[#102641]"
                >
                  채팅으로 이어가기
                </button>
              ) : (
                <p className="text-[12px] text-theme-secondary">
                  계약 체결 후 대화를 시작할 수 있어요.
                </p>
              )
            ) : null
          }
        />
      )}

      {isCancelOpen ? (
        <NegotiationCancelModal
          viewerRole={detail?.viewerRole ?? "CLIENT"}
          onClose={() => setIsCancelOpen(false)}
          onConfirm={() => void handleGiveUp()}
        />
      ) : null}
    </div>
  );
}
