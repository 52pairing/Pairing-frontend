"use client";

import { useEffect, useState } from "react";

import { Header } from "@/features/common/components/header/Header";

import { getChatbotQuota } from "../services/support";
import { SupportCard } from "./SupportCard";
import { BotIcon, ChatIcon, InfoIcon } from "./SupportIcons";

function getQuotaLabel(dailyLimit: number | null, loadFailed: boolean) {
  if (loadFailed) return "무료 이용 한도 확인 필요";
  if (dailyLimit === null) return "무료 이용 한도 확인 중";
  return `하루 최대 ${dailyLimit}회 무료 이용`;
}

export function Support() {
  const [dailyLimit, setDailyLimit] = useState<number | null>(null);
  const [quotaLoadFailed, setQuotaLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getChatbotQuota()
      .then((quota) => {
        if (!cancelled) setDailyLimit(quota.dailyLimit);
      })
      .catch(() => {
        if (!cancelled) setQuotaLoadFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const quotaLabel = getQuotaLabel(dailyLimit, quotaLoadFailed);

  const supportOptions = [
    {
      title: "FAQ 챗봇",
      caption: "AI 자동 응답 · 즉시 이용 가능",
      description:
        "페어링 이용 방법과 정책에 대해 AI 챗봇에게 질문할 수 있습니다.",
      items: ["이용 방법 및 절차 안내", "수수료·정책 관련 문의", quotaLabel],
      actionLabel: "챗봇 시작하기",
      emphasis: true,
    },
    {
      title: "1:1 문의",
      caption: "관리자 직접 응답 · 영업일 기준 1~2일",
      description:
        "서비스 이용 중 도움이 필요한 내용을 관리자에게 직접 문의할 수 있습니다.",
      items: [
        "복잡하거나 개인화된 문의",
        "챗봇으로 해결되지 않은 이슈",
        "영업일 기준 1~2일 이내 답변",
      ],
      actionLabel: "1:1 문의하기",
      actionHref: "/support/inquiries",
      emphasis: false,
    },
  ] as const;

  return (
    <>
      <Header role="guest" />
      <main className="flex-1 bg-background px-5 pb-24 pt-12 text-theme-primary sm:px-8 sm:pt-16">
        <div className="mx-auto w-full max-w-[750px]">
          <h1 className="text-[28px] font-extrabold tracking-[-0.04em]">
            고객지원
          </h1>
          <p className="mt-2 break-keep text-sm font-semibold text-theme-secondary">
            페어링 이용 중 도움이 필요하신가요?
          </p>

          <div className="mt-8 flex min-h-12 items-center gap-3 rounded-[12px] border border-theme bg-surface-muted px-4 py-3 text-[13px] font-semibold text-theme-primary">
            <InfoIcon className="h-4 w-4 shrink-0 text-brand" />
            <p className="break-keep">
              챗봇 이용 여부와 관계없이 언제든 1:1 문의를 접수할 수 있습니다.
            </p>
          </div>

          <section
            aria-label="고객지원 방법"
            className="mt-7 grid gap-5 md:grid-cols-2"
          >
            {supportOptions.map((option) => (
              <SupportCard
                key={option.title}
                {...option}
                icon={
                  option.emphasis ? (
                    <BotIcon className="h-6 w-6" />
                  ) : (
                    <ChatIcon className="h-6 w-6" />
                  )
                }
                actionIcon={
                  option.emphasis ? (
                    <ChatIcon className="h-[18px] w-[18px]" />
                  ) : undefined
                }
              />
            ))}
          </section>
        </div>
      </main>
    </>
  );
}
