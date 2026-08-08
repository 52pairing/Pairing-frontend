"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import {
  CandidateCard,
  type CandidateCardProps,
} from "@/features/client/myprojects/negotiation/components/CandidateCard";

type CandidateData = Omit<CandidateCardProps, "negotiationHref"> & {
  id: number;
};

const CANDIDATES: CandidateData[] = [
  {
    id: 1,
    initial: "김",
    name: "김개발",
    role: "프론트엔드",
    status: "수락",
    requestDate: "2026.07.20",
    responseDate: "2026.07.23",
    avatarClass: "bg-[#3777f6]",
  },
  {
    id: 2,
    initial: "이",
    name: "이서연",
    role: "프론트엔드",
    status: "요청 대기",
    requestDate: "2026.07.20",
    responseDate: "2026.07.23",
    remainingTime: "남은 시간 1일 12시간",
    avatarClass: "bg-[#7839ee]",
  },
  {
    id: 3,
    initial: "박",
    name: "박서버",
    role: "백엔드",
    status: "거절",
    requestDate: "2026.07.18",
    responseDate: "2026.07.21",
    avatarClass: "bg-[#16a34a]",
  },
];

/** 프로젝트 상세 - "협상" 탭 내용 (매칭 후보 협상 목록) */
export function ProjectNegotiation() {
  const params = useParams();
  const projectId = String(params.projectId ?? "");
  const negotiationHref = `/client/projects/${projectId}/negotiation`;

  const [isRerollInfoOpen, setIsRerollInfoOpen] = useState(false);

  return (
    <section className="mt-6">
      {/* 재추천 영역 */}
      <div className="flex flex-col items-end">
        <div className="flex items-center gap-2">
          {/* 도움말 */}
          <button
            type="button"
            aria-label="무료 재추천 안내"
            aria-expanded={isRerollInfoOpen}
            onClick={() => setIsRerollInfoOpen((prev) => !prev)}
            className={`flex h-[36px] w-[36px] items-center justify-center rounded-full border text-[15px] font-bold transition ${
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
            className="h-[36px] rounded-[8px] border border-[#dfe3e8] bg-white px-4 text-[12px] font-semibold text-[#667085] transition hover:bg-[#f9fafb]"
          >
            무료 재추천
          </button>

          {/* 재추천 요청 */}
          <button
            type="button"
            className="h-[36px] rounded-[8px] bg-[#142f50] px-4 text-[12px] font-bold text-white transition hover:bg-[#102641]"
          >
            재추천 요청
          </button>
        </div>

        {/* 안내 박스 (펼침/접힘) */}
        <div
          className={`w-full overflow-hidden transition-all duration-300 ease-in-out ${
            isRerollInfoOpen
              ? "mt-3 max-h-[240px] opacity-100"
              : "mt-0 max-h-0 opacity-0"
          }`}
        >
          <div className="ml-auto w-[620px] max-w-full rounded-[12px] border border-[#3478f6] bg-[#eff5ff] px-5 py-4 text-[13px] font-semibold leading-[1.6] text-[#3478f6]">
            모든 추천 프리랜서가 요청을 거절한 경우 무료 재추천 버튼이 자동으로
            활성화됩니다.
            <br />
            추가 비용 없이 1회 다시 추천받을 수 있어요.
          </div>
        </div>
      </div>

      {/* 협상 후보 목록 */}
      <div className="mt-4 flex flex-col gap-3">
        {CANDIDATES.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            {...candidate}
            negotiationHref={negotiationHref}
          />
        ))}
      </div>
    </section>
  );
}
