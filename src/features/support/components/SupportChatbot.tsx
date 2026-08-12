"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { Header } from "@/features/common/components/header/Header";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import type { LoginRole } from "@/features/auth/types";
import { ApiException } from "@/lib/api";

import {
  getChatbotMessages,
  getChatbotQuota,
  getSuggestedQuestions,
  sendChatbotQuestion,
} from "../services/support";
import type { ChatbotAction, ChatbotMessage } from "../types/support";
import { BotIcon } from "./SupportIcons";

const MAX_QUESTION_LENGTH = 500;
const LOW_QUOTA_THRESHOLD = 3;
const initialMessages = [
  "안녕하세요. 페어링 고객지원 챗봇입니다.",
  "서비스 이용 방법이나 정책에 대해 궁금한 내용을 질문해 주세요.",
] as const;

function getQuotaStyles(isQuotaExhausted: boolean, isLowQuota: boolean) {
  if (isQuotaExhausted) {
    return {
      card: "border-theme-danger bg-danger-surface text-theme-danger",
      track: "bg-red-200",
      bar: "bg-red-500",
    };
  }

  if (isLowQuota) {
    return {
      card: "border-warning-border bg-warning-surface text-theme-warning",
      track: "bg-warning-border/40",
      bar: "bg-orange-500",
    };
  }

  return {
    card: "border-transparent text-brand",
    track: "bg-surface-muted",
    bar: "bg-blue-600",
  };
}

function getActionUrl(code: string, role: LoginRole | undefined, serverUrl: string) {
  let rolePrefix: "/client" | "/freelancer" | null = null;
  if (role === "CLIENT") rolePrefix = "/client";
  if (role === "FREELANCER") rolePrefix = "/freelancer";

  switch (code) {
    case "RESUME_EDIT":
      return "/freelancer/mypage/resume";
    case "PROJECT_CREATE":
      return "/client/projects/new";
    case "PAYMENT_METHOD":
      return rolePrefix ? `${rolePrefix}/mypage/payment-methods` : serverUrl;
    case "SETTLEMENTS":
      return rolePrefix ? `${rolePrefix}/mypage/payments` : serverUrl;
    case "MY_PROJECTS":
    case "NEGOTIATION_LIST":
      return rolePrefix ? `${rolePrefix}/projects` : serverUrl;
    case "CONTRACTS":
      return rolePrefix ? `${rolePrefix}/contracts` : serverUrl;
    case "INQUIRY_NEW":
      return "/support/inquiries/new";
    default:
      return serverUrl;
  }
}

export function SupportChatbot() {
  const currentUser = useCurrentUser();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [dailyLimit, setDailyLimit] = useState(0);
  const [remainingCount, setRemainingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [loadError, setLoadError] = useState("");
  const [sendError, setSendError] = useState("");
  const [isAiUnavailable, setIsAiUnavailable] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getSuggestedQuestions(),
      getChatbotQuota(),
      getChatbotMessages(),
    ])
      .then(([suggestions, quota, history]) => {
        if (cancelled) return;
        setSuggestedQuestions(suggestions);
        setDailyLimit(quota.dailyLimit);
        setRemainingCount(quota.remainingCount);
        setMessages(history);
      })
      .catch(() => {
        if (!cancelled) setLoadError("챗봇 정보를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingQuestion, isSending, sendError]);

  const handleRetry = () => {
    setIsLoading(true);
    setLoadError("");
    setRetryCount((count) => count + 1);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isSending || remainingCount === 0) return;

    const lastMessage = messages.at(-1);
    const request = {
      question: trimmedQuestion,
      sessionId: lastMessage?.sessionId ?? null,
    };

    setIsSending(true);
    setPendingQuestion(trimmedQuestion);
    setQuestion("");
    setSendError("");
    setIsAiUnavailable(false);

    try {
      let response;

      try {
        response = await sendChatbotQuestion(request);
      } catch (error) {
        const shouldResetSession =
          error instanceof ApiException &&
          (error.errorCode === "CB_001" || error.errorCode === "CB_002");

        if (!shouldResetSession) throw error;

        response = await sendChatbotQuestion({
          question: trimmedQuestion,
          sessionId: null,
        });
      }

      setMessages((current) => [...current, response]);
      setRemainingCount(response.remainingQuota);
      setPendingQuestion("");
    } catch (error) {
      setPendingQuestion("");
      setQuestion(trimmedQuestion);

      if (error instanceof ApiException && error.errorCode === "CB_003") {
        setRemainingCount(0);
        setSendError("오늘의 AI 상담 횟수를 모두 사용했습니다.");
      } else if (error instanceof ApiException && error.errorCode === "CB_004") {
        setIsAiUnavailable(true);
        setSendError("AI 상담이 일시적으로 원활하지 않습니다. 사용 횟수는 차감되지 않았습니다.");
      } else {
        setSendError("질문을 전송하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setIsSending(false);
    }
  };

  const remainingRatio = dailyLimit > 0 ? (remainingCount / dailyLimit) * 100 : 0;
  const isQuotaExhausted = !isLoading && dailyLimit > 0 && remainingCount === 0;
  const isLowQuota = remainingCount > 0 && remainingCount <= LOW_QUOTA_THRESHOLD;
  const quotaStyles = getQuotaStyles(isQuotaExhausted, isLowQuota);

  return (
    <>
      <Header role="guest" />
      <main className="flex h-[calc(100dvh-60px)] flex-none overflow-hidden bg-background px-5 py-7 text-theme-primary sm:px-8 sm:py-9">
        <div className="mx-auto flex min-h-0 w-full max-w-[900px] flex-1 flex-col">
          <div className="flex items-start justify-between gap-5">
            <div className="flex min-w-0 items-center gap-4">
              <Link href="/support" className="flex h-10 shrink-0 items-center gap-1 rounded-[9px] border border-theme bg-surface px-3 text-[13px] font-semibold text-theme-secondary hover:bg-surface-subtle">
                <span aria-hidden="true">←</span> 뒤로
              </Link>
              <h1 className="truncate text-xl font-extrabold tracking-[-0.03em] sm:text-2xl">페어링 FAQ 챗봇</h1>
            </div>

            <div className={`w-[128px] shrink-0 rounded-[12px] border px-4 py-3 text-right ${quotaStyles.card}`}>
              <p className={`text-[11px] font-semibold ${isLowQuota || isQuotaExhausted ? "text-current" : "text-theme-muted"}`}>오늘 남은 AI 상담</p>
              <p className="mt-2 text-xl font-extrabold">
                {isLoading ? "-" : remainingCount}
                <span className={`ml-1 text-xs font-semibold ${isLowQuota || isQuotaExhausted ? "text-current" : "text-theme-muted"}`}>/ {isLoading ? "-" : dailyLimit}회</span>
              </p>
              <div className={`mt-2 h-1 overflow-hidden rounded-full ${quotaStyles.track}`}>
                <div className={`h-full rounded-full transition-[width] ${quotaStyles.bar}`} style={{ width: `${remainingRatio}%` }} />
              </div>
            </div>
          </div>

          <section aria-label="챗봇 대화" className="mt-12 flex min-h-0 flex-1 flex-col sm:mt-16">
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
              {initialMessages.map((message) => <BotBubble key={message}>{message}</BotBubble>)}

              {isLoading ? <p role="status" className="py-8 text-center text-sm text-theme-secondary">오늘의 대화를 불러오고 있습니다.</p> : null}
              {!isLoading && loadError ? (
                <div role="alert" className="flex flex-col items-center gap-3 py-8 text-center">
                  <p className="text-sm text-theme-danger">{loadError}</p>
                  <button type="button" onClick={handleRetry} className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-brand-contrast">다시 시도</button>
                </div>
              ) : null}

              {!loadError
                ? messages.map((message) => (
                    <div
                      key={`${message.sessionId}-${message.createdAt}`}
                      className="space-y-3"
                    >
                      <div className="flex justify-end">
                        <p className="max-w-[75%] whitespace-pre-wrap break-keep rounded-[16px] bg-brand px-5 py-4 text-[13px] font-semibold leading-5 text-brand-contrast">
                          {message.question}
                        </p>
                      </div>
                      <BotBubble
                        actions={message.actions}
                        role={currentUser?.role}
                      >
                        {message.answer}
                      </BotBubble>
                    </div>
                  ))
                : null}

              {pendingQuestion ? (
                <div className="flex justify-end">
                  <p className="max-w-[75%] whitespace-pre-wrap break-keep rounded-[16px] bg-brand px-5 py-4 text-[13px] font-semibold leading-5 text-brand-contrast">
                    {pendingQuestion}
                  </p>
                </div>
              ) : null}
              {isSending ? <BotBubble>답변을 준비하고 있습니다...</BotBubble> : null}
              {sendError && !isQuotaExhausted ? (
                <div role="alert">
                  <BotBubble>{sendError}</BotBubble>
                  {isAiUnavailable ? (
                    <div className="mt-2 ml-12">
                      <Link
                        href="/support/inquiries"
                        className="inline-flex rounded-lg border border-theme-danger bg-surface px-4 py-2 text-xs font-bold text-theme-danger hover:bg-danger-surface"
                      >
                        1:1 문의하기
                      </Link>
                    </div>
                  ) : null}
                </div>
              ) : null}
              {isQuotaExhausted ? <QuotaExhaustedNotice dailyLimit={dailyLimit} /> : null}
              <div ref={messageEndRef} />
            </div>

            <div className="mt-4 border-t border-theme-strong pt-5">
              {suggestedQuestions.length > 0 ? (
                <>
                  <p className="mb-3 text-xs font-semibold text-theme-muted">추천 질문</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((suggestion) => (
                      <button key={suggestion} type="button" disabled={isQuotaExhausted || isSending} onClick={() => setQuestion(suggestion)} className="rounded-full border border-theme bg-surface px-4 py-2.5 text-xs font-bold text-theme-secondary hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-50">{suggestion}</button>
                    ))}
                  </div>
                </>
              ) : null}

              <form onSubmit={handleSubmit} className="mt-4 flex min-h-[74px] items-center gap-3 rounded-[14px] border border-theme bg-surface px-4 py-3 shadow-[0_3px_12px_rgb(15_23_42/0.08)] focus-within:border-brand">
                <label htmlFor="chatbot-question" className="sr-only">챗봇 질문</label>
                <input id="chatbot-question" type="text" value={question} maxLength={MAX_QUESTION_LENGTH} disabled={isLoading || !!loadError || isSending || isQuotaExhausted} onChange={(event) => setQuestion(event.target.value)} placeholder={isQuotaExhausted ? "오늘의 상담 횟수를 모두 사용했습니다." : "페어링 이용 방법이나 정책을 질문해 주세요."} className="min-w-0 flex-1 bg-transparent px-1 text-sm text-theme-primary outline-none placeholder:text-theme-muted disabled:cursor-not-allowed" />
                <button type="submit" disabled={!question.trim() || isLoading || !!loadError || isSending || isQuotaExhausted} aria-label="질문 보내기" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px] bg-brand text-brand-contrast hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-theme-muted"><SendIcon /></button>
              </form>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function QuotaExhaustedNotice({ dailyLimit }: { dailyLimit: number }) {
  return (
    <aside className="mt-5 rounded-[14px] border border-theme-danger bg-danger-surface px-6 py-5 text-theme-danger" role="alert">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
          <WarningIcon />
        </span>
        <div>
          <p className="text-sm font-extrabold">오늘의 AI 상담 횟수를 모두 사용했습니다.</p>
        </div>
      </div>
      <p className="mt-4 text-xs font-semibold text-theme-secondary">
        FAQ 챗봇은 사용자별로 하루 최대 {dailyLimit}회까지 이용할 수 있습니다.
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-medium text-theme-muted">상담 가능 횟수는 매일 다시 제공됩니다.</p>
        <Link href="/support/inquiries" className="text-xs font-bold text-theme-danger underline underline-offset-2">
          1:1 문의하기
        </Link>
      </div>
    </aside>
  );
}

function WarningIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 7.5V13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="1" fill="currentColor" />
    </svg>
  );
}

function BotBubble({
  children,
  actions = [],
  role,
}: {
  children: string;
  actions?: ChatbotAction[];
  role?: LoginRole;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-brand-contrast"><BotIcon className="h-5 w-5" /></span>
      <div className="w-fit max-w-[75%] rounded-[16px] border border-theme bg-surface px-5 py-4 shadow-[0_1px_3px_rgb(15_23_42/0.04)]">
        <p className="whitespace-pre-wrap break-keep text-[13px] font-semibold leading-5 text-theme-primary">
          {children}
        </p>
        {actions.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-theme pt-3">
            {actions.map((action) => (
              <Link
                key={action.code}
                href={getActionUrl(action.code, role, action.url)}
                className="rounded-lg bg-brand px-4 py-2 text-xs font-bold text-brand-contrast hover:bg-brand-hover"
              >
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SendIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 21 21" fill="none" aria-hidden="true">
      <path d="m18 3-7.1 15-2.1-6.7L2 9.1 18 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m8.8 11.3 4-3.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
