"use client";

import { useState } from "react";

import { NegotiationResultCard } from "@/features/negotiation/components/NegotiationResultCard";
import type {
  ConditionType,
  NegotiationCondition,
  NegotiationDetail,
  NegotiationMessage,
} from "@/features/negotiation/types/negotiation";
import {
  conditionLabel,
  formatConditionValue,
  senderLabel,
  toServerValue,
  type WorkConditionLabels,
} from "@/features/negotiation/utils/conditionFormat";

/**
 * 협상방 대화 플로우 (실데이터 구동)
 *
 * 로그·조건 배지·라운드·상태 화면은 서버 응답(detail/messages)으로 렌더링한다.
 * 인라인 패널 노출은 백엔드가 내려주는 `waitingForMe`로 판정한다.
 *  - totalRound === 0        → 시작(마지노선 입력) 패널
 *  - waitingForMe === true   → 승인/재지시 패널 (조건별 status 로 분기)
 *  - 그 외                    → 대리인 진행 중 대기
 */

export interface AnswerInput {
  conditionId: number;
  accepted: boolean;
  proposedValue?: string | null;
}

interface NegotiationChatFlowProps {
  detail: NegotiationDetail;
  messages: NegotiationMessage[];
  /** 조건 값 라벨(근무방식/근무형태/기간 단위) — meta API 기반 */
  labels: WorkConditionLabels;
  /** 협상 시작(마지노선 저장) — value 는 서버 전송용 문자열 */
  onStart: (conditions: Array<{ conditionType: ConditionType; value: string }>) => void;
  /** 조건 승인/재지시 제출 */
  onSubmitAnswers: (answers: AnswerInput[]) => void;
  onGiveUp: () => void;
  /** 요청 진행 중(버튼 잠금) */
  isSubmitting: boolean;
  /** 타결 시 채팅 이어가기 슬롯 (버튼/안내) */
  chatActionSlot?: React.ReactNode;
}

export function NegotiationChatFlow({
  detail,
  messages,
  labels,
  onStart,
  onSubmitAnswers,
  onGiveUp,
  isSubmitting,
  chatActionSlot,
}: NegotiationChatFlowProps) {
  const conditions = detail.conditions ?? [];
  const isFailed = detail.status === "FAILED";
  const isComplete = detail.status === "AGREED";
  const isSetup = detail.status === "IN_PROGRESS" && detail.totalRound === 0;
  const showActionPanel = detail.status === "IN_PROGRESS" && detail.waitingForMe;

  return (
    <main className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[14px] bg-white">
      <div className="shrink-0">
        <NegotiationHeader
          status={detail.status}
          round={detail.totalRound}
          maxRound={detail.maxRound}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-7 pt-4">
        <ConditionBadges conditions={conditions} />

        {/* 실시간 로그 */}
        <div className="mt-2">
          {messages.length === 0 && !isFailed && !isComplete ? (
            <TimelineDivider label="아직 협상 로그가 없습니다" />
          ) : null}
          {messages.map((message) => (
            <MessageItem
              key={message.messageId}
              message={message}
              viewerRole={detail.viewerRole}
              labels={labels}
            />
          ))}
        </div>

        {/* 상태별 화면 */}
        {isFailed ? (
          <div className="mt-8">
            <NegotiationResultCard result="failed" />
          </div>
        ) : isComplete ? (
          <div className="mt-8">
            <NegotiationResultCard
              result="complete"
              summary={buildAgreedSummary(conditions, labels)}
              actionSlot={chatActionSlot}
            />
          </div>
        ) : isSetup ? (
          <SetupPanel
            conditions={conditions}
            labels={labels}
            isSubmitting={isSubmitting}
            onStart={onStart}
          />
        ) : showActionPanel ? (
          <ConditionActionPanel
            conditions={conditions}
            labels={labels}
            isSubmitting={isSubmitting}
            onSubmit={onSubmitAnswers}
            onGiveUp={onGiveUp}
          />
        ) : (
          <div className="mt-8 flex justify-center">
            <p className="rounded-full bg-[#f2f4f8] px-4 py-2 text-[11px] text-[#7d8799]">
              대리인이 협상을 진행하고 있습니다…
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

// ── 표시 헬퍼 ──────────────────────────────────────────────────────────

const buildAgreedSummary = (
  conditions: NegotiationCondition[],
  labels: WorkConditionLabels,
): string => {
  const parts = conditions
    .filter((condition) => condition.status === "AGREED")
    .map((condition) => {
      const value = formatConditionValue(condition.type, condition.agreedValue, labels);
      const label = conditionLabel(condition.type);
      return value ? `${label} ${value}` : label;
    });
  return parts.length > 0 ? parts.join(" · ") : "모든 조건에 합의했습니다.";
};

// ── 프레젠테이션 컴포넌트 ────────────────────────────────────────────────

function NegotiationHeader({
  status,
  round,
  maxRound,
}: {
  status: NegotiationDetail["status"];
  round: number;
  maxRound: number;
}) {
  const isFailed = status === "FAILED";
  const isComplete = status === "AGREED";
  return (
    <div className="flex items-center justify-between border-b border-[#e8ebf0] px-5 py-4">
      <div>
        <h2 className="text-[16px] font-bold">AI 협상 로그</h2>
        <p className="mt-1 text-[11px] text-[#9ba3b2]">AI 에이전트 간 협상 과정</p>
      </div>
      <div className="flex items-center gap-3 text-[11px] font-semibold text-[#667085]">
        <span>라운드 {round} / {maxRound}</span>
        <span className={`rounded-full border px-3 py-1.5 ${isFailed ? "border-[#fecdca] bg-[#fef3f2] text-[#d92d20]" : isComplete ? "border-[#abefc6] bg-[#ecfdf3] text-[#039855]" : "border-[#b9d4ff] bg-[#edf5ff] text-[#4b89f7]"}`}>
          {isFailed ? "× 협상 결렬" : isComplete ? "✓ 협상 완료" : "♙ 협상 중"}
        </span>
      </div>
    </div>
  );
}

function ConditionBadges({ conditions }: { conditions: NegotiationCondition[] }) {
  if (conditions.length === 0) return null;
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {conditions.map((condition) => {
        const isAgreed = condition.status === "AGREED";
        const isRejected = condition.status === "REJECTED";
        return (
          <span
            key={condition.conditionId}
            className={`rounded-full border px-3 py-1.5 text-[11px] font-bold ${isAgreed ? "border-[#abefc6] bg-[#ecfdf3] text-[#039855]" : isRejected ? "border-[#fecdca] bg-[#fef3f2] text-[#d92d20]" : "border-[#b9d4ff] bg-[#edf5ff] text-[#4b89f7]"}`}
          >
            {conditionLabel(condition.type)}{" "}
            {isAgreed ? "합의🔒" : isRejected ? "재협상" : "진행중"}
          </span>
        );
      })}
    </div>
  );
}

function MessageItem({
  message,
  viewerRole,
  labels,
}: {
  message: NegotiationMessage;
  viewerRole: "CLIENT" | "FREELANCER";
  labels: WorkConditionLabels;
}) {
  // SYSTEM 안내는 가운데 구분선으로 표시
  if (message.messageType === "SYSTEM" || message.senderType === "SYSTEM") {
    return <TimelineDivider label={message.content} />;
  }

  // 내 편(대리인/사람)이면 우측, 상대면 좌측
  const isMine =
    message.senderType === `${viewerRole}_AGENT` || message.senderType === viewerRole;
  const proposed = formatConditionValue(
    message.conditionType ?? "",
    message.proposedValue,
    labels,
  );

  return (
    <div className={`mt-5 flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[420px] items-start gap-2 ${isMine ? "flex-row-reverse" : ""}`}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#8878e8] text-[11px] font-bold text-white">
          {senderLabel(message.senderType).charAt(0)}
        </span>
        <div>
          <p className={`mb-1 text-[10px] text-[#a5adbb] ${isMine ? "text-right" : ""}`}>
            {senderLabel(message.senderType)}
          </p>
          <div className={`rounded-[12px] px-4 py-2.5 text-[12px] leading-5 ${isMine ? "bg-[#8878e8] text-white" : "border border-[#e1e5eb] bg-white text-[#283142]"}`}>
            {message.content}
            {message.reason ? (
              <small className="mt-1 block opacity-80">근거: {message.reason}</small>
            ) : null}
            {proposed ? (
              <small className="mt-1 block opacity-80">제시값: {proposed}</small>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineDivider({ label }: { label: string }) {
  return (
    <div className="mt-4 flex items-center gap-3">
      <div className="h-px flex-1 bg-[#e7eaf0]" />
      <span className="whitespace-nowrap text-[10px] text-[#a5adbb]">{label}</span>
      <div className="h-px flex-1 bg-[#e7eaf0]" />
    </div>
  );
}

// ── 인라인 액션 패널 ─────────────────────────────────────────────────────

// 금액 조건은 만원 단위 입력을 안내한다.
const inputSuffix = (type: NegotiationCondition["type"]): string =>
  type === "AMOUNT" ? "만 원" : "";

function SetupPanel({
  conditions,
  labels,
  isSubmitting,
  onStart,
}: {
  conditions: NegotiationCondition[];
  labels: WorkConditionLabels;
  isSubmitting: boolean;
  onStart: (values: Array<{ conditionType: ConditionType; value: string }>) => void;
}) {
  const [values, setValues] = useState<Record<number, string>>({});

  const canStart = conditions.every(
    (condition) => (values[condition.conditionId] ?? "").trim() !== "",
  );

  const handleStart = () => {
    const payload = conditions.map((condition) => ({
      conditionType: condition.type,
      value: toServerValue(condition.type, values[condition.conditionId] ?? ""),
    }));
    onStart(payload);
  };

  return (
    <div className="mt-6 flex justify-end">
      <section className="w-[360px] rounded-[14px] border border-[#e1e5eb] bg-white p-4 shadow-sm">
        <p className="text-[12px] leading-5 text-[#283142]">
          협상 전 조건별 최소(마지노선)를 입력해 주세요.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {conditions.map((condition) => (
            <div key={condition.conditionId}>
              <label className="text-[10px] font-bold text-[#667085]">
                {conditionLabel(condition.type)}
              </label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  value={values[condition.conditionId] ?? ""}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      [condition.conditionId]: event.target.value,
                    }))
                  }
                  placeholder={
                    formatConditionValue(condition.type, condition.clientValue, labels) ||
                    "최소값 입력"
                  }
                  className="h-[38px] w-full rounded-[8px] border border-[#e2e5ea] px-3 text-[12px] outline-none focus:border-[#8878e8]"
                />
                {inputSuffix(condition.type) ? (
                  <span className="whitespace-nowrap text-[10px] text-[#98a2b3]">
                    {inputSuffix(condition.type)}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          disabled={!canStart || isSubmitting}
          onClick={handleStart}
          className="mt-5 h-[42px] w-full cursor-pointer rounded-[9px] bg-[#8878e8] text-[12px] font-bold text-white hover:bg-[#7969dc] disabled:cursor-not-allowed disabled:bg-[#c7c2f4]"
        >
          협상 시작
        </button>
      </section>
    </div>
  );
}

type Decision = "accept" | "reject";

/** 승인/재지시 통합 패널 — 조건별 status 로 분기 (PENDING·AGREED·REJECTED) */
function ConditionActionPanel({
  conditions,
  labels,
  isSubmitting,
  onSubmit,
  onGiveUp,
}: {
  conditions: NegotiationCondition[];
  labels: WorkConditionLabels;
  isSubmitting: boolean;
  onSubmit: (answers: AnswerInput[]) => void;
  onGiveUp: () => void;
}) {
  const [decisions, setDecisions] = useState<Record<number, Decision>>({});
  const [floors, setFloors] = useState<Record<number, string>>({});

  const pending = conditions.filter((condition) => condition.status === "PENDING");
  const rejected = conditions.filter((condition) => condition.status === "REJECTED");
  const agreed = conditions.filter((condition) => condition.status === "AGREED");

  const canSubmit =
    pending.every((condition) => decisions[condition.conditionId] != null) &&
    rejected.every((condition) => (floors[condition.conditionId] ?? "").trim() !== "") &&
    pending.length + rejected.length > 0;

  const handleSubmit = () => {
    const answers: AnswerInput[] = [
      ...pending.map((condition) => ({
        conditionId: condition.conditionId,
        accepted: decisions[condition.conditionId] === "accept",
      })),
      ...rejected.map((condition) => ({
        conditionId: condition.conditionId,
        accepted: false,
        proposedValue: toServerValue(condition.type, floors[condition.conditionId] ?? ""),
      })),
    ];
    onSubmit(answers);
  };

  const hasRejected = rejected.length > 0;

  return (
    <div className="mt-6 flex justify-end">
      <section className="w-[340px] rounded-[14px] border border-[#e1e5eb] bg-white p-4 shadow-sm">
        <p className="text-[12px] font-semibold leading-5">
          각 조건에 대한 의견을 선택해 주세요.
        </p>

        {/* 승인 대기 조건 (수락/거절) */}
        {pending.map((condition) => (
          <div key={condition.conditionId} className="mt-4">
            <p className="text-[11px] text-[#98a2b3]">
              {conditionLabel(condition.type)}{" "}
              {formatConditionValue(condition.type, condition.proposedValue ?? condition.freelancerValue, labels)}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <DecisionButton
                label="수락"
                selected={decisions[condition.conditionId] === "accept"}
                onClick={() =>
                  setDecisions((prev) => ({ ...prev, [condition.conditionId]: "accept" }))
                }
              />
              <DecisionButton
                label="거절"
                selected={decisions[condition.conditionId] === "reject"}
                onClick={() =>
                  setDecisions((prev) => ({ ...prev, [condition.conditionId]: "reject" }))
                }
              />
            </div>
          </div>
        ))}

        {/* 재지시 조건 (새 마지노선 입력) */}
        {rejected.map((condition) => (
          <div
            key={condition.conditionId}
            className="mt-4 rounded-[10px] border border-[#f7c65f] bg-[#fff9e8] p-3"
          >
            <div className="flex justify-between text-[11px] font-bold text-[#d97706]">
              <span>{conditionLabel(condition.type)}</span>
              <span className="rounded bg-[#fff0b8] px-2 py-1">재입력 필요</span>
            </div>
            {condition.myFloor != null ? (
              <p className="mt-1 text-[10px] text-[#92400e]">
                직전 마지노선: {formatConditionValue(condition.type, condition.myFloor, labels)}
              </p>
            ) : null}
            <div className="mt-3 flex items-center gap-2">
              <input
                value={floors[condition.conditionId] ?? ""}
                onChange={(event) =>
                  setFloors((prev) => ({ ...prev, [condition.conditionId]: event.target.value }))
                }
                className="h-[36px] w-full rounded-[7px] border border-[#f5b942] bg-white px-3 text-[11px] outline-none"
                placeholder="새 마지노선 입력"
              />
              {inputSuffix(condition.type) ? (
                <span className="whitespace-nowrap text-[10px] text-[#667085]">
                  {inputSuffix(condition.type)}
                </span>
              ) : null}
            </div>
          </div>
        ))}

        {/* 이미 합의된 조건 */}
        {agreed.map((condition) => (
          <div key={condition.conditionId} className="mt-4">
            <p className="text-[11px] text-[#98a2b3]">{conditionLabel(condition.type)}</p>
            <div className="mt-2 rounded-[8px] border border-[#86efac] bg-[#ecfdf3] py-2 text-center text-[11px] font-bold text-[#16a34a]">
              ♙ 이미 합의
            </div>
          </div>
        ))}

        <div className={`mt-4 ${hasRejected ? "grid grid-cols-[1fr_auto] gap-2" : ""}`}>
          <button
            type="button"
            disabled={!canSubmit || isSubmitting}
            onClick={handleSubmit}
            className="h-[40px] w-full cursor-pointer rounded-[8px] bg-[#8878e8] text-[12px] font-bold text-white hover:bg-[#7969dc] disabled:cursor-not-allowed disabled:bg-[#c7c2f4]"
          >
            {hasRejected ? "다시 협상" : "확인"}
          </button>
          {hasRejected ? (
            <button
              type="button"
              onClick={onGiveUp}
              className="h-[40px] cursor-pointer rounded-[8px] border border-[#f04438] bg-white px-4 text-[12px] font-bold text-[#f04438] hover:bg-[#fff5f4]"
            >
              협상 포기
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function DecisionButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-[36px] cursor-pointer rounded-[7px] border text-[11px] font-bold ${selected ? "border-[#8b7cf6] bg-[#f2f0ff] text-[#7969dc]" : "border-[#dfe3e8] bg-white text-[#667085]"}`}
    >
      {label}
    </button>
  );
}
