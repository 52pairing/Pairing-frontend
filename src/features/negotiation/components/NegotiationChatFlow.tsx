"use client";

import { useState } from "react";

import { Spinner } from "@/features/common/components/Loading";
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
  manwonToWonString,
  senderLabel,
  type WorkConditionLabels,
} from "@/features/negotiation/utils/conditionFormat";

/**
 * 협상방 대화 플로우 (실데이터 구동)
 *
 * 로그·조건 배지·라운드·상태 화면은 서버 응답(detail/messages)으로 렌더링한다.
 * 인라인 패널 노출 판정:
 *  - totalRound === 0 && myFloor 없음  → 마지노선 입력 폼 + [협상 시작]
 *  - totalRound === 0 && myFloor 있음  → "상대 입력 대기" 안내 (폼 다시 안 띄움)
 *  - totalRound >= 1 && waitingForMe   → 승인/재지시 패널 (조건별 status 분기)
 *  - 그 외                              → 대리인 진행 중 대기
 *
 * 마지노선(start)과 재지시(answers.proposedValue) 값은 조건 종류별 전용 입력 위젯이
 * 서버 형식(금액=원, 기간="N MONTH", 근무방식/형태=enum 코드, 날짜="yyyy-MM-dd")으로 만든다.
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
  // 내 마지노선을 이미 냈는지 (내 것만 conditions[].myFloor 로 내려옴)
  const hasSubmittedFloor = conditions.some((condition) => condition.myFloor != null);
  const isSetup =
    detail.status === "IN_PROGRESS" && detail.totalRound === 0 && !hasSubmittedFloor;
  const isWaitingOpponentFloor =
    detail.status === "IN_PROGRESS" && detail.totalRound === 0 && hasSubmittedFloor;
  const showActionPanel =
    detail.status === "IN_PROGRESS" && detail.totalRound >= 1 && detail.waitingForMe;

  return (
    <main className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[14px] bg-surface">
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
          {messages.length === 0 && !isFailed && !isComplete && !isSubmitting ? (
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
          {/* AI 대리인 협상(Gemini 왕복, 10~20초) 대기 표시 — 누른 사람 화면에만 */}
          {isSubmitting ? <AgentTypingBubble /> : null}
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
            viewerRole={detail.viewerRole}
            isSubmitting={isSubmitting}
            onStart={onStart}
          />
        ) : isWaitingOpponentFloor ? (
          <WaitingNotice label="상대방이 조건을 입력하면 협상이 시작됩니다." />
        ) : showActionPanel ? (
          <ConditionActionPanel
            conditions={conditions}
            labels={labels}
            viewerRole={detail.viewerRole}
            isSubmitting={isSubmitting}
            onSubmit={onSubmitAnswers}
            onGiveUp={onGiveUp}
          />
        ) : (
          <WaitingNotice label="대리인이 협상을 진행하고 있습니다…" />
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

// 내 관점에서 "상대 희망값". 프리랜서면 클라 값, 클라면 프리랜서 값.
const opponentValue = (
  condition: NegotiationCondition,
  viewerRole: "CLIENT" | "FREELANCER",
): string | null =>
  viewerRole === "CLIENT" ? condition.freelancerValue : condition.clientValue;

// 마지노선 입력 라벨. 단가·기간은 역할에 따라 최소/최대 의미가 반대다.
const floorFieldLabel = (
  type: ConditionType,
  viewerRole: "CLIENT" | "FREELANCER",
): string => {
  const isFreelancer = viewerRole === "FREELANCER";
  switch (type) {
    case "AMOUNT":
      return isFreelancer
        ? "최소 단가 (이 금액 미만은 거절)"
        : "최대 단가 (이 금액 초과는 거절)";
    case "PERIOD":
      return isFreelancer ? "최소 기간" : "최대 기간";
    case "WORK_STYLE":
      return "허용 가능한 근무 방식";
    case "WORK_FORM":
      return "허용 가능한 근무 형태";
    case "START_DATE":
      return "희망 시작일";
    default:
      return conditionLabel(type);
  }
};

// Record<code,label> → 정렬 유지된 옵션 배열
const toOptions = (map: Record<string, string>): Array<{ code: string; label: string }> =>
  Object.entries(map).map(([code, label]) => ({ code, label }));

// ── 프레젠테이션 컴포넌트 ────────────────────────────────────────────────

function WaitingNotice({ label }: { label: string }) {
  return (
    <div className="mt-8 flex justify-center">
      <p className="rounded-full bg-[#f2f4f8] px-4 py-2 text-[11px] text-[#7d8799]">{label}</p>
    </div>
  );
}

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
      <div className="flex items-center gap-3 text-[11px] font-semibold text-theme-secondary">
        <span>라운드 {round} / {maxRound}</span>
        <span className={`rounded-full border px-3 py-1.5 ${isFailed ? "border-[#fecdca] bg-danger-surface text-theme-danger" : isComplete ? "border-[#abefc6] bg-success-surface text-theme-success" : "border-[#b9d4ff] bg-[#edf5ff] text-[#4b89f7]"}`}>
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
            className={`rounded-full border px-3 py-1.5 text-[11px] font-bold ${isAgreed ? "border-[#abefc6] bg-success-surface text-theme-success" : isRejected ? "border-[#fecdca] bg-danger-surface text-theme-danger" : "border-[#b9d4ff] bg-[#edf5ff] text-[#4b89f7]"}`}
          >
            {conditionLabel(condition.type)}{" "}
            {isAgreed ? "합의🔒" : isRejected ? "재협상 필요" : "진행중"}
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
          <div className={`rounded-[12px] px-4 py-2.5 text-[12px] leading-5 ${isMine ? "bg-[#8878e8] text-white" : "border border-theme bg-surface text-[#283142]"}`}>
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

// AI 대리인 협상 대기 말풍선 (요청 처리 중 로그 하단에 표시)
function AgentTypingBubble() {
  return (
    <div className="mt-5 flex justify-start">
      <div className="flex max-w-[420px] items-start gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#8878e8] text-[10px] font-bold text-white">
          AI
        </span>
        <div className="rounded-[12px] border border-theme bg-surface px-4 py-2.5 text-[12px] leading-5 text-[#283142]">
          <span className="flex items-center gap-2">
            <span className="flex items-center gap-1" aria-hidden="true">
              {[0, 1, 2].map((index) => (
                <span
                  key={index}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8878e8]"
                  style={{ animationDelay: `${index * 0.15}s` }}
                />
              ))}
            </span>
            AI 대리인이 협상 중입니다
          </span>
          <small className="mt-1 block text-theme-muted">10~20초 정도 걸립니다</small>
        </div>
      </div>
    </div>
  );
}

// ── 조건 종류별 입력 위젯 ─────────────────────────────────────────────────
// 각 위젯은 사용자 입력을 서버 전송 형식 문자열로 변환해 onChange 로 올린다("" = 미입력).

const INPUT_CLASS =
  "h-[38px] w-full rounded-[8px] border border-[#e2e5ea] px-3 text-[12px] outline-none focus:border-[#8878e8]";

function ConditionFloorField({
  condition,
  labels,
  onChange,
}: {
  condition: NegotiationCondition;
  labels: WorkConditionLabels;
  onChange: (serverValue: string) => void;
}) {
  switch (condition.type) {
    case "AMOUNT":
      return <AmountField onChange={onChange} />;
    case "PERIOD":
      return <PeriodField options={toOptions(labels.periodUnits)} onChange={onChange} />;
    case "WORK_STYLE":
      return <CodeSelectField options={toOptions(labels.workStyles)} onChange={onChange} />;
    case "WORK_FORM":
      return <CodeSelectField options={toOptions(labels.workForms)} onChange={onChange} />;
    case "START_DATE":
      return <DateField onChange={onChange} />;
    default:
      return <PlainTextField onChange={onChange} />;
  }
}

// 금액: 만원 입력 → 원 단위 문자열
function AmountField({ onChange }: { onChange: (value: string) => void }) {
  const [manwon, setManwon] = useState("");
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="0"
        value={manwon}
        onChange={(event) => {
          const next = event.target.value;
          setManwon(next);
          onChange(next.trim() === "" ? "" : manwonToWonString(next));
        }}
        placeholder="예: 480"
        className={INPUT_CLASS}
      />
      <span className="whitespace-nowrap text-[10px] text-theme-muted">만 원</span>
    </div>
  );
}

// 기간: 숫자 + 단위(meta periodUnits) → "N MONTH"
function PeriodField({
  options,
  onChange,
}: {
  options: Array<{ code: string; label: string }>;
  onChange: (value: string) => void;
}) {
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState(options[0]?.code ?? "MONTH");
  const emit = (nextAmount: string, nextUnit: string) =>
    onChange(nextAmount.trim() === "" ? "" : `${nextAmount} ${nextUnit}`);
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="1"
        value={amount}
        onChange={(event) => {
          setAmount(event.target.value);
          emit(event.target.value, unit);
        }}
        placeholder="예: 4"
        className={INPUT_CLASS}
      />
      <select
        value={unit}
        onChange={(event) => {
          setUnit(event.target.value);
          emit(amount, event.target.value);
        }}
        className="h-[38px] rounded-[8px] border border-[#e2e5ea] px-2 text-[12px] outline-none focus:border-[#8878e8]"
      >
        {options.length === 0 ? <option value="MONTH">개월</option> : null}
        {options.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// 근무 방식/형태: meta 코드 드롭다운 → 코드 전송
function CodeSelectField({
  options,
  onChange,
}: {
  options: Array<{ code: string; label: string }>;
  onChange: (value: string) => void;
}) {
  const [code, setCode] = useState("");
  return (
    <select
      value={code}
      onChange={(event) => {
        setCode(event.target.value);
        onChange(event.target.value);
      }}
      className={INPUT_CLASS}
    >
      <option value="" disabled>
        선택
      </option>
      {options.map((option) => (
        <option key={option.code} value={option.code}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

// 시작일: 날짜 입력 (yyyy-MM-dd 그대로 전송)
function DateField({ onChange }: { onChange: (value: string) => void }) {
  const [date, setDate] = useState("");
  return (
    <input
      type="date"
      value={date}
      onChange={(event) => {
        setDate(event.target.value);
        onChange(event.target.value);
      }}
      className={INPUT_CLASS}
    />
  );
}

// 자유 텍스트 (SCOPE/OTHER)
function PlainTextField({ onChange }: { onChange: (value: string) => void }) {
  const [text, setText] = useState("");
  return (
    <input
      value={text}
      onChange={(event) => {
        setText(event.target.value);
        onChange(event.target.value.trim());
      }}
      placeholder="입력"
      className={INPUT_CLASS}
    />
  );
}

// ── 인라인 액션 패널 ─────────────────────────────────────────────────────

function SetupPanel({
  conditions,
  labels,
  viewerRole,
  isSubmitting,
  onStart,
}: {
  conditions: NegotiationCondition[];
  labels: WorkConditionLabels;
  viewerRole: "CLIENT" | "FREELANCER";
  isSubmitting: boolean;
  onStart: (values: Array<{ conditionType: ConditionType; value: string }>) => void;
}) {
  // 조건별 "서버 전송 형식" 값 저장 (위젯이 변환해서 올려줌)
  const [values, setValues] = useState<Record<number, string>>({});

  const canStart = conditions.every(
    (condition) => (values[condition.conditionId] ?? "").trim() !== "",
  );

  const handleStart = () => {
    onStart(
      conditions.map((condition) => ({
        conditionType: condition.type,
        value: values[condition.conditionId] ?? "",
      })),
    );
  };

  return (
    <div className="mt-6 flex justify-end">
      <section className="w-[360px] rounded-[14px] border border-theme bg-surface p-4 shadow-sm">
        <p className="text-[12px] leading-5 text-[#283142]">
          협상 전 마지노선을 입력해 주세요. 이 선을 넘는 조건은 대리인이 자동 거절합니다.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {conditions.map((condition) => {
            const hint = formatConditionValue(
              condition.type,
              opponentValue(condition, viewerRole),
              labels,
            );
            return (
              <div key={condition.conditionId}>
                <label className="text-[10px] font-bold text-theme-secondary">
                  {floorFieldLabel(condition.type, viewerRole)}
                </label>
                <div className="mt-2">
                  <ConditionFloorField
                    condition={condition}
                    labels={labels}
                    onChange={(value) =>
                      setValues((prev) => ({ ...prev, [condition.conditionId]: value }))
                    }
                  />
                </div>
                {hint ? (
                  <p className="mt-1 text-[10px] text-theme-muted">상대 희망: {hint}</p>
                ) : null}
              </div>
            );
          })}
        </div>
        <button
          type="button"
          disabled={!canStart || isSubmitting}
          onClick={handleStart}
          className="mt-5 flex h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-[9px] bg-[#8878e8] text-[12px] font-bold text-white hover:bg-[#7969dc] disabled:cursor-not-allowed disabled:bg-[#c7c2f4]"
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" label="협상 중" />
              AI 대리인이 협상 중…
            </>
          ) : (
            "협상 시작"
          )}
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
  viewerRole,
  isSubmitting,
  onSubmit,
  onGiveUp,
}: {
  conditions: NegotiationCondition[];
  labels: WorkConditionLabels;
  viewerRole: "CLIENT" | "FREELANCER";
  isSubmitting: boolean;
  onSubmit: (answers: AnswerInput[]) => void;
  onGiveUp: () => void;
}) {
  const [decisions, setDecisions] = useState<Record<number, Decision>>({});
  // 재지시 새 마지노선 (서버 전송 형식)
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
        proposedValue: floors[condition.conditionId] ?? "",
      })),
    ];
    onSubmit(answers);
  };

  const hasRejected = rejected.length > 0;

  return (
    <div className="mt-6 flex justify-end">
      <section className="w-[340px] rounded-[14px] border border-theme bg-surface p-4 shadow-sm">
        <p className="text-[12px] font-semibold leading-5">
          각 조건에 대한 의견을 선택해 주세요.
        </p>

        {/* 승인 대기 조건 — 상대방이 제안한 값을 수락/거절 */}
        {pending.map((condition) => (
          <div key={condition.conditionId} className="mt-4">
            <p className="text-[10px] font-semibold text-theme-muted">상대방 제안</p>
            <p className="mt-0.5 text-[13px] font-bold text-theme-primary">
              {conditionLabel(condition.type)}{" "}
              {formatConditionValue(condition.type, condition.proposedValue ?? opponentValue(condition, viewerRole), labels)}
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
              <span>{floorFieldLabel(condition.type, viewerRole)}</span>
              <span className="rounded bg-[#fff0b8] px-2 py-1">재협상 필요</span>
            </div>
            {condition.myFloor != null ? (
              <p className="mt-1 text-[10px] text-[#92400e]">
                직전 마지노선: {formatConditionValue(condition.type, condition.myFloor, labels)}
              </p>
            ) : null}
            <div className="mt-3">
              <ConditionFloorField
                condition={condition}
                labels={labels}
                onChange={(value) =>
                  setFloors((prev) => ({ ...prev, [condition.conditionId]: value }))
                }
              />
            </div>
          </div>
        ))}

        {/* 이미 합의된 조건 */}
        {agreed.map((condition) => (
          <div key={condition.conditionId} className="mt-4">
            <p className="text-[11px] text-theme-muted">{conditionLabel(condition.type)}</p>
            <div className="mt-2 rounded-[8px] border border-[#86efac] bg-success-surface py-2 text-center text-[11px] font-bold text-[#16a34a]">
              ♙ 이미 합의
            </div>
          </div>
        ))}

        <div className={`mt-4 ${hasRejected ? "grid grid-cols-[1fr_auto] gap-2" : ""}`}>
          <button
            type="button"
            disabled={!canSubmit || isSubmitting}
            onClick={handleSubmit}
            className="flex h-[40px] w-full cursor-pointer items-center justify-center gap-2 rounded-[8px] bg-[#8878e8] text-[12px] font-bold text-white hover:bg-[#7969dc] disabled:cursor-not-allowed disabled:bg-[#c7c2f4]"
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" label="협상 중" />
                AI 대리인이 협상 중…
              </>
            ) : hasRejected ? (
              "다시 협상"
            ) : (
              "확인"
            )}
          </button>
          {hasRejected ? (
            <button
              type="button"
              onClick={onGiveUp}
              className="h-[40px] cursor-pointer rounded-[8px] border border-[#f04438] bg-surface px-4 text-[12px] font-bold text-theme-danger hover:bg-danger-surface"
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
      className={`h-[36px] cursor-pointer rounded-[7px] border text-[11px] font-bold ${selected ? "border-[#8b7cf6] bg-[#f2f0ff] text-[#7969dc]" : "border-theme bg-surface text-theme-secondary"}`}
    >
      {label}
    </button>
  );
}
