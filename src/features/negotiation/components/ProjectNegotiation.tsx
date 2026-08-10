"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ErrorState } from "@/features/common/components/ErrorState";
import { LoadingState } from "@/features/common/components/Loading";
import { CandidateCard } from "@/features/negotiation/components/CandidateCard";
import { getMyNegotiations } from "@/features/negotiation/services/negotiation";
import type { NegotiationListItem } from "@/features/negotiation/types/negotiation";
import { ApiException } from "@/lib/api";

/** 프로젝트 상세 - "협상" 탭 내용 (매칭 후보 협상 목록) */
export function ProjectNegotiation() {
  const params = useParams();
  const projectId = String(params.projectId ?? "");

  const [items, setItems] = useState<NegotiationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setErrorMessage(null);
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  }, []);

  // 목록 로드 — effect 본문 동기 setState 를 피하기 위해 상태 갱신은 await 이후에만 수행
  useEffect(() => {
    if (!projectId) return;
    let active = true;

    void (async () => {
      try {
        const loaded = await getMyNegotiations(projectId);
        if (!active) return;
        setItems(loaded);
        setErrorMessage(null);
      } catch (error) {
        if (!active) return;
        setErrorMessage(
          error instanceof ApiException
            ? error.message
            : "협상 목록을 불러오지 못했습니다.",
        );
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [projectId, reloadKey]);

  if (isLoading) {
    return <LoadingState className="mt-4" message="협상 목록을 불러오는 중입니다." />;
  }

  if (errorMessage) {
    return <ErrorState className="mt-4" description={errorMessage} onRetry={reload} />;
  }

  if (items.length === 0) {
    return (
      <div className="mt-4 flex h-[200px] items-center justify-center rounded-[14px] border border-[#dfe4ea] bg-white text-[12px] text-[#98a2b3]">
        진행 중인 협상이 없습니다.
      </div>
    );
  }

  return (
    <section className="mt-4">
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <CandidateCard key={item.negotiationId} item={item} projectId={projectId} />
        ))}
      </div>
    </section>
  );
}

export function NegotiationActions() {
  const [isRerollInfoOpen, setIsRerollInfoOpen] = useState(false);

  return (
      <div className="relative flex items-center justify-end">
        <div className="flex items-center gap-2">
          {/* 도움말 */}
          <button
            type="button"
            aria-label="무료 재추천 안내"
            aria-expanded={isRerollInfoOpen}
            onClick={() => setIsRerollInfoOpen((prev) => !prev)}
            className={`flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-full border text-[15px] font-bold transition ${
              isRerollInfoOpen
                ? "border-[#3478f6] bg-[#eff5ff] text-[#3478f6]"
                : "border-[#dfe3e8] bg-white text-[#98a2b3] hover:bg-[#f9fafb]"
            }`}
          >
            ?
          </button>

          {/* 무료 재추천 */}
          <button
            type="button"
            className="h-[36px] cursor-pointer rounded-[8px] border border-[#dfe3e8] bg-white px-4 text-[12px] font-semibold text-[#667085] transition hover:bg-[#f9fafb]"
          >
            무료 재추천
          </button>

          {/* 재추천 요청 */}
          <button
            type="button"
            className="h-[36px] cursor-pointer rounded-[8px] bg-[#142f50] px-4 text-[12px] font-bold text-white transition hover:bg-[#102641]"
          >
            재추천 요청
          </button>
        </div>

        {/* 안내 박스 (펼침/접힘) */}
        <div
          className={`absolute right-0 top-[44px] z-20 w-[520px] max-w-full transition duration-150 ease-out ${
            isRerollInfoOpen
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-1 opacity-0"
          }`}
        >
          <div className="rounded-[10px] border border-[#3478f6] bg-[#eff5ff] px-4 py-3 text-[12px] font-semibold leading-[1.6] text-[#3478f6] shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
            모든 추천 프리랜서가 요청을 거절한 경우 무료 재추천 버튼이 자동으로
            활성화됩니다.
            <br />
            추가 비용 없이 1회 다시 추천받을 수 있어요.
          </div>
        </div>
      </div>
  );
}
