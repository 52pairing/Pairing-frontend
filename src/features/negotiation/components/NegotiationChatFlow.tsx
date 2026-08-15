"use client";

import { useEffect, useRef, useState } from "react";

import { Spinner } from "@/features/common/components/Loading";
import { ConfirmModal } from "@/features/common/components/Modal";
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
  wonToManwon,
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
  /** accepted=true 일 때만. 내 마지노선을 넘겨서라도 직접 수락 */
  acceptBelowFloor?: boolean;
}

interface NegotiationChatFlowProps {
  detail: NegotiationDetail;
  messages: NegotiationMessage[];
  /** 조건 값 라벨(근무방식/근무형태/기간 단위) — meta API 기반 */
  labels: WorkConditionLabels;
  /** 협상 시작(마지노선 저장) — value 는 서버 전송용 문자열 */
  onStart: (conditions: Array<{ conditionType: ConditionType; value: string }>) => void;
  /** 조건 승인/재지시 제출 — 마지노선 밖 수락(NG_011)이면 floorViolation=true */
  onSubmitAnswers: (answers: AnswerInput[]) => Promise<{ floorViolation: boolean }>;
  /** 내 마지노선 수정(PATCH) — ok=false 면 message 를 인라인 표시 */
  onUpdateFloor: (
    conditionType: ConditionType,
    value: string,
  ) => Promise<{ ok: boolean; message?: string }>;
  /** 대리인 호출 실패(AGENT_FAILED) 재시도 */
  onRetryAgent: () => void;
  /** 최종 절충안 수락 */
  onAcceptFinalOffer: () => void;
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
  onUpdateFloor,
  onRetryAgent,
  onAcceptFinalOffer,
  onGiveUp,
  isSubmitting,
  chatActionSlot,
}: NegotiationChatFlowProps) {
  const conditions = detail.conditions ?? [];
  const isFailed = detail.status === "FAILED";
  const isComplete = detail.status === "AGREED";
  // 대리인 A2A 상태 (비동기 전환)
  const agentRunning = detail.agentState === "RUNNING";
  const agentFailed = detail.agentState === "FAILED";
  // 내 마지노선을 다 냈는지. 아직 안 낸 조건이 하나라도 있으면 입력 화면을 띄워야 한다.
  // (서버가 AMOUNT 는 프리랜서 minAcceptAmount 로 프리필해 내려주므로 some() 은 항상 true → every() 로 판정)
  const hasSubmittedFloor = conditions.every((condition) => condition.myFloor != null);
  const isSetup =
    detail.status === "IN_PROGRESS" && detail.totalRound === 0 && !hasSubmittedFloor;
  const isWaitingOpponentFloor =
    detail.status === "IN_PROGRESS" && detail.totalRound === 0 && hasSubmittedFloor;
  const showActionPanel =
    detail.status === "IN_PROGRESS" && detail.totalRound >= 1 && detail.waitingForMe;
  // AI 진행 중은 요청이 떠 있는 동안(isSubmitting)만 참. 그 외 대기는 상대 입력 대기다.
  const hasRejected = conditions.some((condition) => condition.status === "REJECTED");

  // 새 메시지·상태 변화 시 로그를 맨 아래로 (채팅 관례, 타결 카드가 화면 밖으로 밀리지 않게)
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = logRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages.length, detail.status]);

  return (
    <main className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[14px] bg-surface">
      <div className="shrink-0">
        <NegotiationHeader
          status={detail.status}
          round={detail.totalRound}
          maxRound={detail.maxRound}
          finalOffer={detail.finalOffer}
        />
      </div>

      <div ref={logRef} className="min-h-0 flex-1 overflow-y-auto px-6 pb-7 pt-4">
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
          {/* AI 대리인 협상(Gemini 왕복, 10~20초) 대기 표시.
              내 요청 중(isSubmitting)이거나 서버가 대리인 진행 중(agentState=RUNNING)일 때 */}
          {isSubmitting || agentRunning ? <AgentTypingBubble /> : null}
        </div>

        {/* 상태별 화면 */}
        {isFailed ? (
          <div className="mt-8">
            <NegotiationResultCard result="failed" summary={detail.endReason ?? undefined} />
          </div>
        ) : isComplete ? (
          <div className="mt-8">
            <NegotiationResultCard
              result="complete"
              summary={buildAgreedSummary(conditions, labels)}
              actionSlot={chatActionSlot}
            />
          </div>
        ) : detail.finalOffer ? (
          <FinalOfferPanel
            detail={detail}
            labels={labels}
            isSubmitting={isSubmitting}
            onAccept={onAcceptFinalOffer}
            onGiveUp={onGiveUp}
          />
        ) : agentFailed ? (
          <AgentFailedNotice onRetry={onRetryAgent} isSubmitting={isSubmitting} />
        ) : agentRunning ? (
          // 진행 표시는 위 로그의 타이핑 말풍선이 담당
          null
        ) : isSetup ? (
          <SetupPanel
            conditions={conditions}
            labels={labels}
            viewerRole={detail.viewerRole}
            isSubmitting={isSubmitting}
            onStart={onStart}
          />
        ) : isWaitingOpponentFloor ? (
          <WaitingNotice label="상대방이 조건을 입력하고 있습니다" />
        ) : showActionPanel ? (
          <ConditionActionPanel
            conditions={conditions}
            labels={labels}
            viewerRole={detail.viewerRole}
            isSubmitting={isSubmitting}
            onSubmit={onSubmitAnswers}
            onUpdateFloor={onUpdateFloor}
            onGiveUp={onGiveUp}
          />
        ) : (
          // 이 분기는 항상 totalRound >= 1(진행 중, 내 차례 아님).
          // AI 진행 중은 isSubmitting(요청 떠 있을 때)로 이미 표시되므로, 여기선 상대 대기다.
          <WaitingNotice
            label={
              hasRejected
                ? "상대방이 조건을 다시 입력하고 있습니다"
                : "상대방 응답을 기다리는 중입니다"
            }
          />
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

// 대리인 호출 실패(AGENT_FAILED): 안내 + 다시 시도(같은 마지노선으로 재제출 = 재시도)
function AgentFailedNotice({
  onRetry,
  isSubmitting,
}: {
  onRetry: () => void;
  isSubmitting: boolean;
}) {
  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      <div className="w-full max-w-[420px] rounded-[12px] border border-[#fecdca] bg-danger-surface px-4 py-3 text-center text-[12px] font-semibold leading-5 text-theme-danger">
        AI 대리인 호출에 실패해 이번 라운드가 진행되지 못했습니다.
        <br />
        다시 시도해 주세요.
      </div>
      <button
        type="button"
        disabled={isSubmitting}
        onClick={onRetry}
        className="flex h-[40px] cursor-pointer items-center justify-center gap-2 rounded-[8px] bg-[#8878e8] px-6 text-[12px] font-bold text-white hover:bg-[#7969dc] disabled:cursor-not-allowed disabled:bg-[#c7c2f4]"
      >
        {isSubmitting ? (
          <>
            <Spinner size="sm" label="재시도" />
            재시도 중…
          </>
        ) : (
          "다시 시도"
        )}
      </button>
    </div>
  );
}

function NegotiationHeader({
  status,
  round,
  maxRound,
  finalOffer,
}: {
  status: NegotiationDetail["status"];
  round: number;
  maxRound: number;
  finalOffer?: boolean;
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
        {/* 최종 절충 단계면 라운드 대신 "최종 절충" 표시 */}
        <span>{finalOffer ? "최종 절충" : `라운드 ${round} / ${maxRound}`}</span>
        <span className={`rounded-full border px-3 py-1.5 ${isFailed ? "border-[#fecdca] bg-danger-surface text-theme-danger" : isComplete ? "border-[#abefc6] bg-success-surface text-theme-success" : finalOffer ? "border-[#fdb022] bg-[#fffaeb] text-[#b54708]" : "border-[#b9d4ff] bg-[#edf5ff] text-[#4b89f7]"}`}>
          {isFailed ? "× 협상 결렬" : isComplete ? "✓ 협상 완료" : finalOffer ? "⚑ 최종 절충안" : "♙ 협상 중"}
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
        <div className="min-w-0">
          <p className={`mb-1 text-[10px] text-[#a5adbb] ${isMine ? "text-right" : ""}`}>
            {senderLabel(message.senderType)}
          </p>
          <div className={`whitespace-pre-wrap break-words [overflow-wrap:anywhere] rounded-[12px] px-4 py-2.5 text-[12px] leading-5 ${isMine ? "bg-[#8878e8] text-white" : "border border-theme bg-surface text-[#283142]"}`}>
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
      <div className="h-px flex-1 shrink-0 bg-[#e7eaf0]" />
      <span className="min-w-0 break-words [overflow-wrap:anywhere] text-center text-[10px] text-[#a5adbb]">
        {label}
      </span>
      <div className="h-px flex-1 shrink-0 bg-[#e7eaf0]" />
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
  defaultServerValue,
  onChange,
}: {
  condition: NegotiationCondition;
  labels: WorkConditionLabels;
  /** 수정 시 현재 마지노선(서버 형식) 프리필 */
  defaultServerValue?: string | null;
  onChange: (serverValue: string) => void;
}) {
  const initial = defaultServerValue ?? "";
  switch (condition.type) {
    case "AMOUNT":
      return <AmountField defaultServerValue={initial} onChange={onChange} />;
    case "PERIOD":
      return (
        <PeriodField
          options={toOptions(labels.periodUnits)}
          defaultServerValue={initial}
          onChange={onChange}
        />
      );
    case "WORK_STYLE":
      return (
        <CodeSelectField
          options={toOptions(labels.workStyles)}
          defaultServerValue={initial}
          onChange={onChange}
        />
      );
    case "WORK_FORM":
      return (
        <CodeSelectField
          options={toOptions(labels.workForms)}
          defaultServerValue={initial}
          onChange={onChange}
        />
      );
    case "START_DATE":
      return <DateField defaultServerValue={initial} onChange={onChange} />;
    default:
      return <PlainTextField defaultServerValue={initial} onChange={onChange} />;
  }
}

// 금액: 만원 입력 → 원 단위 문자열
function AmountField({
  defaultServerValue,
  onChange,
}: {
  defaultServerValue?: string;
  onChange: (value: string) => void;
}) {
  const [manwon, setManwon] = useState(() => {
    const won = Number(defaultServerValue);
    return defaultServerValue && !Number.isNaN(won) ? String(wonToManwon(won)) : "";
  });
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
  defaultServerValue,
  onChange,
}: {
  options: Array<{ code: string; label: string }>;
  defaultServerValue?: string;
  onChange: (value: string) => void;
}) {
  const [defaultAmount, defaultUnit] = (defaultServerValue ?? "").split(" ");
  const [amount, setAmount] = useState(defaultAmount ?? "");
  const [unit, setUnit] = useState(defaultUnit || options[0]?.code || "MONTH");
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
  defaultServerValue,
  onChange,
}: {
  options: Array<{ code: string; label: string }>;
  defaultServerValue?: string;
  onChange: (value: string) => void;
}) {
  const [code, setCode] = useState(defaultServerValue ?? "");
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
function DateField({
  defaultServerValue,
  onChange,
}: {
  defaultServerValue?: string;
  onChange: (value: string) => void;
}) {
  const [date, setDate] = useState(defaultServerValue ?? "");
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
function PlainTextField({
  defaultServerValue,
  onChange,
}: {
  defaultServerValue?: string;
  onChange: (value: string) => void;
}) {
  const [text, setText] = useState(defaultServerValue ?? "");
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
  // 아직 안 낸 조건만 입력·전송한다. 서버가 이미 채워 준 조건(myFloor != null,
  // 예: 프리랜서 AMOUNT=최소 수용가)을 다시 보내면 NG_006(이미 제출)이 난다.
  const pending = conditions.filter((condition) => condition.myFloor == null);
  const prefilled = conditions.filter((condition) => condition.myFloor != null);

  // 조건별 "서버 전송 형식" 값 저장 (위젯이 변환해서 올려줌)
  const [values, setValues] = useState<Record<number, string>>({});

  const canStart = pending.every(
    (condition) => (values[condition.conditionId] ?? "").trim() !== "",
  );

  const handleStart = () => {
    onStart(
      pending.map((condition) => ({
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
          {/* 서버가 미리 채워 준 조건(예: 최소 수용가) — 안내만, 재전송하지 않음 */}
          {prefilled.map((condition) => (
            <div
              key={condition.conditionId}
              className="rounded-[8px] border border-[#e2e5ea] bg-[#fafafe] px-3 py-2"
            >
              <p className="text-[10px] font-bold text-theme-secondary">
                {floorFieldLabel(condition.type, viewerRole)}
              </p>
              <p className="mt-1 text-[13px] font-bold text-theme-primary">
                {formatConditionValue(condition.type, condition.myFloor, labels)}
              </p>
              <p className="mt-1 text-[10px] text-theme-muted">
                등록해두신 값이 자동 반영됐습니다. 협상 시작 후 수정할 수 있어요.
              </p>
            </div>
          ))}

          {/* 아직 안 낸 조건 입력 */}
          {pending.map((condition) => {
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
  onUpdateFloor,
  onGiveUp,
}: {
  conditions: NegotiationCondition[];
  labels: WorkConditionLabels;
  viewerRole: "CLIENT" | "FREELANCER";
  isSubmitting: boolean;
  onSubmit: (answers: AnswerInput[]) => Promise<{ floorViolation: boolean }>;
  onUpdateFloor: (
    conditionType: ConditionType,
    value: string,
  ) => Promise<{ ok: boolean; message?: string }>;
  onGiveUp: () => void;
}) {
  const [decisions, setDecisions] = useState<Record<number, Decision>>({});
  // 재지시 새 마지노선 (서버 전송 형식)
  const [floors, setFloors] = useState<Record<number, string>>({});
  // 마지노선 수정 인라인 상태
  const [editOpen, setEditOpen] = useState<Record<number, boolean>>({});
  const [editValues, setEditValues] = useState<Record<number, string>>({});
  const [editErrors, setEditErrors] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  // 마지노선 밖 수락(NG_011) 확인 모달: 재제출할 답변과 안내 문구 보관
  const [belowFloorConfirm, setBelowFloorConfirm] = useState<{
    answers: AnswerInput[];
    message: string;
  } | null>(null);

  const pending = conditions.filter((condition) => condition.status === "PENDING");
  const rejected = conditions.filter((condition) => condition.status === "REJECTED");
  const agreed = conditions.filter((condition) => condition.status === "AGREED");

  const canSubmit =
    pending.every((condition) => decisions[condition.conditionId] != null) &&
    rejected.every((condition) => (floors[condition.conditionId] ?? "").trim() !== "") &&
    pending.length + rejected.length > 0;

  const openEdit = (condition: NegotiationCondition) => {
    setEditOpen((prev) => ({ ...prev, [condition.conditionId]: true }));
    // 현재 마지노선(서버 형식)으로 초기화 — 수정 없이 저장해도 현재 값이 전송됨
    setEditValues((prev) => ({ ...prev, [condition.conditionId]: condition.myFloor ?? "" }));
  };
  const closeEdit = (conditionId: number) => {
    setEditOpen((prev) => ({ ...prev, [conditionId]: false }));
    setEditErrors((prev) => ({ ...prev, [conditionId]: "" }));
  };
  const saveEdit = async (condition: NegotiationCondition) => {
    const value = (editValues[condition.conditionId] ?? "").trim();
    if (value === "") return;
    setSavingId(condition.conditionId);
    const result = await onUpdateFloor(condition.type, value);
    setSavingId(null);
    if (result.ok) {
      closeEdit(condition.conditionId);
    } else {
      setEditErrors((prev) => ({
        ...prev,
        [condition.conditionId]: result.message ?? "마지노선 수정에 실패했습니다.",
      }));
    }
  };

  const buildAnswers = (): AnswerInput[] => [
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

  const handleSubmit = async () => {
    const answers = buildAnswers();
    const result = await onSubmit(answers);
    // 마지노선 밖 수락(NG_011) → 편집칸 대신 확인 모달을 띄운다.
    // (사람이 눈으로 보고 내리는 명시적 수락은 존중 — 확인 후 그대로 수락)
    if (result.floorViolation) {
      const violation = findFloorViolation(pending, decisions, viewerRole);
      setBelowFloorConfirm({
        answers,
        message: buildBelowFloorMessage(violation, viewerRole, labels),
      });
    }
  };

  // [그래도 수락] — 수락 답변에 acceptBelowFloor=true 를 붙여 그대로 재제출
  const confirmAcceptBelowFloor = async () => {
    if (!belowFloorConfirm) return;
    const answers = belowFloorConfirm.answers.map((answer) =>
      answer.accepted ? { ...answer, acceptBelowFloor: true } : answer,
    );
    setBelowFloorConfirm(null);
    await onSubmit(answers);
  };

  const hasRejected = rejected.length > 0;

  // 단가·기간은 역할에 따라 상한/하한. 근무 방식/형태는 접두 없음.
  const floorPrefix = (type: ConditionType): string =>
    type === "AMOUNT" || type === "PERIOD"
      ? viewerRole === "CLIENT"
        ? "최대 "
        : "최소 "
      : "";

  return (
    <div className="mt-6 flex justify-end">
      <section className="w-[340px] rounded-[14px] border border-theme bg-surface p-4 shadow-sm">
        <p className="text-[12px] font-semibold leading-5">
          각 조건에 대한 의견을 선택해 주세요.
        </p>

        {/* 승인 대기 조건 — 상대방이 제안한 값을 수락/거절 */}
        {pending.map((condition) => {
          const proposedText = formatConditionValue(
            condition.type,
            condition.proposedValue ?? opponentValue(condition, viewerRole),
            labels,
          );
          const myFloorText = formatConditionValue(condition.type, condition.myFloor, labels);
          const isEditing = editOpen[condition.conditionId] === true;
          return (
            <div key={condition.conditionId} className="mt-4">
              <p className="text-[10px] font-semibold text-theme-muted">상대방 제안</p>
              <p className="mt-0.5 text-[13px] font-bold text-theme-primary">
                {conditionLabel(condition.type)} {proposedText}
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

              {/* 내 마지노선 + 수정 */}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-theme-muted">
                  내 선택: {floorPrefix(condition.type)}
                  {myFloorText || "미설정"}
                </span>
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => openEdit(condition)}
                    className="text-[10px] font-bold text-[#7969dc] hover:underline"
                  >
                    수정
                  </button>
                ) : null}
              </div>

              {/* 마지노선 수정 인라인 영역 */}
              {isEditing ? (
                <div className="mt-2 rounded-[8px] border border-[#e2e5ea] bg-[#fafafe] p-3">
                  <ConditionFloorField
                    condition={condition}
                    labels={labels}
                    defaultServerValue={condition.myFloor}
                    onChange={(value) =>
                      setEditValues((prev) => ({ ...prev, [condition.conditionId]: value }))
                    }
                  />
                  <p className="mt-1 text-[10px] text-theme-muted">라운드는 진행되지 않습니다.</p>
                  {editErrors[condition.conditionId] ? (
                    <p className="mt-1 text-[10px] font-semibold text-theme-danger">
                      {editErrors[condition.conditionId]}
                    </p>
                  ) : null}
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      disabled={savingId === condition.conditionId}
                      onClick={() => void saveEdit(condition)}
                      className="h-[32px] flex-1 cursor-pointer rounded-[7px] bg-[#8878e8] text-[11px] font-bold text-white hover:bg-[#7969dc] disabled:cursor-not-allowed disabled:bg-[#c7c2f4]"
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      onClick={() => closeEdit(condition.conditionId)}
                      className="h-[32px] flex-1 cursor-pointer rounded-[7px] border border-theme bg-surface text-[11px] font-bold text-theme-secondary"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}

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
            <p className="mt-1 text-[10px] text-[#92400e]">
              새로 입력한 값으로 대체됩니다. 저장하면 대리인이 다시 협상합니다.
            </p>
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
            onClick={() => void handleSubmit()}
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

      {belowFloorConfirm ? (
        <ConfirmModal
          open
          title="그래도 수락하시겠어요?"
          description={belowFloorConfirm.message}
          confirmText="그래도 수락"
          cancelText="취소"
          confirmDisabled={isSubmitting}
          onConfirm={() => void confirmAcceptBelowFloor()}
          onClose={() => setBelowFloorConfirm(null)}
        />
      ) : null}
    </div>
  );
}

// ── 마지노선 밖 수락 판정·문구 ────────────────────────────────────────────

// 숫자로 비교 가능한 조건 값만 뽑는다(AMOUNT=원, PERIOD="N …"의 앞 숫자).
const numericValue = (
  type: NegotiationCondition["type"],
  value: string | null,
): number | null => {
  if (value == null || value === "") return null;
  if (type === "AMOUNT") {
    const won = Number(value);
    return Number.isFinite(won) ? won : null;
  }
  if (type === "PERIOD") {
    const amount = Number.parseInt(value, 10);
    return Number.isFinite(amount) ? amount : null;
  }
  return null;
};

// 수락한 조건 중 "내 마지노선을 넘는" 첫 조건을 찾는다(표시용).
// 프리랜서 하한: 제안 < 내 마지노선 / 클라 상한: 제안 > 내 마지노선.
const findFloorViolation = (
  pending: NegotiationCondition[],
  decisions: Record<number, Decision>,
  viewerRole: "CLIENT" | "FREELANCER",
): NegotiationCondition | null => {
  for (const condition of pending) {
    if (decisions[condition.conditionId] !== "accept") continue;
    const proposed = numericValue(condition.type, condition.proposedValue);
    const floor = numericValue(condition.type, condition.myFloor);
    if (proposed == null || floor == null) continue;
    const breaks = viewerRole === "FREELANCER" ? proposed < floor : proposed > floor;
    if (breaks) return condition;
  }
  return null;
};

const buildBelowFloorMessage = (
  violation: NegotiationCondition | null,
  viewerRole: "CLIENT" | "FREELANCER",
  labels: WorkConditionLabels,
): string => {
  if (!violation) {
    return "이 제안은 회원님의 마지노선을 넘습니다. 그래도 수락하시겠어요?";
  }
  const proposed = formatConditionValue(violation.type, violation.proposedValue, labels);
  const floor = formatConditionValue(violation.type, violation.myFloor, labels);
  const isFreelancer = viewerRole === "FREELANCER";
  const floorLabel = isFreelancer ? `최소 ${floor}` : `최대 ${floor}`;
  const direction = isFreelancer ? "낮습니다" : "높습니다";
  return `이 제안(${proposed})은 회원님의 마지노선(${floorLabel})보다 ${direction}. 그래도 수락하시겠어요?`;
};

// 최종 절충안 패널 — 조건별 절충값을 보여주고 [이 절충안으로 합의]/[협상 포기]만 받는다.
function FinalOfferPanel({
  detail,
  labels,
  isSubmitting,
  onAccept,
  onGiveUp,
}: {
  detail: NegotiationDetail;
  labels: WorkConditionLabels;
  isSubmitting: boolean;
  onAccept: () => void;
  onGiveUp: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const conditions = detail.conditions ?? [];
  const compromiseConds = conditions.filter((c) => c.compromiseValue != null);
  const agreed = conditions.filter((c) => c.status === "AGREED");
  const waitingOpponent = detail.myFinalAccepted === true;
  const opponentAccepted =
    detail.counterpartFinalAccepted === true && detail.myFinalAccepted !== true;

  // 확인 모달 문구 (첫 절충 조건 기준)
  const first = compromiseConds.find((c) => c.myFloor != null) ?? compromiseConds[0];
  let confirmMessage = "양측이 함께 양보하는 최종 제안입니다. 수락하시겠어요?";
  if (first) {
    const value = formatConditionValue(first.type, first.compromiseValue, labels);
    if (first.myFloor != null && value) {
      const floor = formatConditionValue(first.type, first.myFloor, labels);
      const floorLabel =
        detail.viewerRole === "FREELANCER" ? `최소 ${floor}` : `최대 ${floor}`;
      confirmMessage = `이 절충안(${value})은 회원님의 마지노선(${floorLabel})을 넘습니다. 양측이 함께 양보하는 최종 제안입니다. 수락하시겠어요?`;
    }
  }

  return (
    <div className="mt-6 flex justify-end">
      <section className="w-[340px] rounded-[14px] border border-[#fdb022] bg-[#fffaeb] p-4 shadow-sm">
        <p className="text-[12px] font-bold leading-5 text-[#b54708]">최종 절충안</p>
        <p className="mt-1 text-[11px] leading-5 text-[#92400e]">
          이 제안으로 합의하지 않으면 협상이 결렬됩니다.
        </p>

        <div className="mt-3 flex flex-col gap-2">
          {compromiseConds.map((c) => (
            <div
              key={c.conditionId}
              className="rounded-[8px] border border-[#f5d9a6] bg-surface px-3 py-2"
            >
              <p className="text-[10px] font-semibold text-theme-muted">
                {conditionLabel(c.type)} · 양측 절충값
              </p>
              <p className="mt-0.5 text-[13px] font-bold text-theme-primary">
                {formatConditionValue(c.type, c.compromiseValue, labels)}
              </p>
            </div>
          ))}
          {agreed.map((c) => (
            <div key={c.conditionId} className="flex items-center justify-between px-1">
              <span className="text-[11px] text-theme-muted">{conditionLabel(c.type)}</span>
              <span className="text-[11px] font-bold text-theme-success">
                🔒 {formatConditionValue(c.type, c.agreedValue, labels)}
              </span>
            </div>
          ))}
        </div>

        {opponentAccepted ? (
          <p className="mt-3 rounded-[8px] bg-[#ecfdf3] px-3 py-2 text-[11px] font-semibold text-theme-success">
            상대는 이미 수락했습니다. 수락하면 바로 타결됩니다.
          </p>
        ) : null}

        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
          <button
            type="button"
            disabled={waitingOpponent || isSubmitting}
            onClick={() => setConfirmOpen(true)}
            className="flex h-[40px] cursor-pointer items-center justify-center gap-2 rounded-[8px] bg-[#8878e8] text-[12px] font-bold text-white hover:bg-[#7969dc] disabled:cursor-not-allowed disabled:bg-[#c7c2f4]"
          >
            {waitingOpponent ? "상대 수락 대기 중…" : "이 절충안으로 합의"}
          </button>
          <button
            type="button"
            onClick={onGiveUp}
            className="h-[40px] cursor-pointer rounded-[8px] border border-[#f04438] bg-surface px-4 text-[12px] font-bold text-theme-danger hover:bg-danger-surface"
          >
            협상 포기
          </button>
        </div>
      </section>

      {confirmOpen ? (
        <ConfirmModal
          open
          title="이 절충안으로 합의하시겠어요?"
          description={confirmMessage}
          confirmText="그래도 수락"
          cancelText="취소"
          confirmDisabled={isSubmitting}
          onConfirm={() => {
            setConfirmOpen(false);
            onAccept();
          }}
          onClose={() => setConfirmOpen(false)}
        />
      ) : null}
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
