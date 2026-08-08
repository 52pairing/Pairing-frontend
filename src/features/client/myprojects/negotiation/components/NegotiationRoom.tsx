"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { NegotiationCancelModal } from "@/features/client/myprojects/negotiation/components/NegotiationCancelModal";
import { NegotiationChatFlow } from "@/features/client/myprojects/negotiation/components/NegotiationChatFlow";
import { NegotiationFailedCard } from "@/features/client/myprojects/negotiation/components/NegotiationFailedCard";

export function NegotiationRoom() {
  const router = useRouter();
  const params = useParams();
  const projectId = String(params.projectId ?? "");
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  if (isFailed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f4f8] px-6">
        <NegotiationFailedCard onBack={() => router.push(`/client/projects/${projectId}`)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f8] px-6 pb-6 pt-3 text-[#151b2b]">
      <header>
        <button
          type="button"
          onClick={() => router.push(`/client/projects/${projectId}`)}
          className="mb-4 cursor-pointer text-[12px] text-[#98a1b2] hover:text-[#667085]"
        >
          ← 제안 목록
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[17px] font-bold">모바일 앱 백엔드 API 개발</h1>
            <p className="mt-3 text-[12px] text-[#7d8799]">
              백엔드 개발자 / 시작일: 2026.09.01
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCancelOpen(true)}
            className="cursor-pointer rounded-[9px] border border-[#ff5757] bg-white px-5 py-2.5 text-[12px] font-semibold text-[#ff4d4f] hover:bg-[#fff5f5]"
          >
            협상 포기
          </button>
        </div>
      </header>

      <NegotiationChatFlow onGiveUp={() => setIsCancelOpen(true)} />

      {isCancelOpen ? (
        <NegotiationCancelModal
          onClose={() => setIsCancelOpen(false)}
          onConfirm={() => {
            setIsCancelOpen(false);
            setIsFailed(true);
          }}
        />
      ) : null}
    </div>
  );
}
