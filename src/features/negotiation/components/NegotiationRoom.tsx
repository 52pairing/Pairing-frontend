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
  giveUpNegotiation,
  markNegotiationRead,
  startNegotiation,
  submitAnswers,
} from "@/features/negotiation/services/negotiation";
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
        case "NEW_PROPOSAL":
        case "ANSWERED":
          void refreshMessages();
          void refreshDetail();
          break;
        case "CONDITION_LOCKED":
          void refreshDetail();
          break;
        case "AGREED":
        case "FAILED":
          void refreshDetail();
          void refreshMessages();
          break;
      }
    },
    [refreshDetail, refreshMessages],
  );

  useNegotiationEvents(negotiationId, handleEvent);

  // 협상 시작
  const handleStart = useCallback(
    async (conditions: Array<{ conditionType: ConditionType; value: string }>) => {
      if (!negotiationId || isSubmitting) return;
      setIsSubmitting(true);
      try {
        await startNegotiation(negotiationId, { conditions });
        await Promise.all([refreshDetail(), refreshMessages()]);
      } finally {
        setIsSubmitting(false);
      }
    },
    [negotiationId, isSubmitting, refreshDetail, refreshMessages],
  );

  // 조건 승인/재지시
  const handleSubmitAnswers = useCallback(
    async (answers: AnswerInput[]) => {
      if (!negotiationId || isSubmitting || !detail) return;
      setIsSubmitting(true);
      try {
        // roundNo 는 현재 라운드 기준(미검증 — 실제 응답 확인 후 확정)
        await submitAnswers(negotiationId, { roundNo: detail.totalRound, answers });
        await Promise.all([refreshDetail(), refreshMessages()]);
      } finally {
        setIsSubmitting(false);
      }
    },
    [negotiationId, isSubmitting, detail, refreshDetail, refreshMessages],
  );

  // 협상 포기
  const handleGiveUp = useCallback(async () => {
    if (!negotiationId || isSubmitting) return;
    setIsSubmitting(true);
    try {
      // reason 은 선택. 화면에 입력란이 없어 생략(서버가 "협상 포기"로 기록)
      await giveUpNegotiation(negotiationId, {});
      setIsCancelOpen(false);
      await refreshDetail();
    } finally {
      setIsSubmitting(false);
    }
  }, [negotiationId, isSubmitting, refreshDetail]);

  const goBackToProject = () => router.push(`${projectsBase}/${projectId}`);

  return (
    <div className="flex h-[calc(100dvh-60px)] min-h-0 flex-col overflow-hidden bg-[#f3f4f8] px-6 pb-4 pt-2 text-[#151b2b]">
      <header className="shrink-0">
        <button
          type="button"
          onClick={goBackToProject}
          className="mb-3 cursor-pointer text-[12px] text-[#98a1b2] hover:text-[#667085]"
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
              className="cursor-pointer rounded-[9px] border border-[#ff5757] bg-white px-5 py-2.5 text-[12px] font-semibold text-[#ff4d4f] hover:bg-[#fff5f5]"
            >
              협상 포기
            </button>
          ) : null}
        </div>
      </header>

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
                <p className="text-[12px] text-[#667085]">
                  계약 체결 후 대화를 시작할 수 있어요.
                </p>
              )
            ) : null
          }
        />
      )}

      {isCancelOpen ? (
        <NegotiationCancelModal
          onClose={() => setIsCancelOpen(false)}
          onConfirm={() => void handleGiveUp()}
        />
      ) : null}
    </div>
  );
}
