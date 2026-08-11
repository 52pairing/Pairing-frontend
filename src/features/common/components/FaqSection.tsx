"use client";

import { useState } from "react";
import Image from "next/image";

const FAQ_ITEMS = [
  {
    question: "페어링의 매칭 과정은 어떻게 진행되나요?",
    answer:
      "프로젝트 정보를 등록하면 AI가 기술 스택, 경력, 예산을 분석해 적합한 프리랜서 후보를 추천합니다. 후보 선택 후 AI Agent가 조건 협상을 진행하고, 합의된 조건으로 표준계약서가 생성됩니다.",
  },
  {
    question: "AI Agent는 어떤 역할을 하나요?",
    answer:
      "AI Agent는 클라이언트와 프리랜서의 희망 조건을 바탕으로 양측이 수용 가능한 조건을 협상합니다. 최종 승인과 계약 서명은 항상 사용자가 직접 진행합니다.",
  },
  {
    question: "프로젝트를 등록할 때 어떤 내용을 작성해야 하나요?",
    answer:
      "직군, 요구 기술, 프로젝트 기간, 예산, 근무 방식(원격/대면), 근무 형태(시급/일급/월급) 등을 입력합니다. 상세할수록 더 정확한 후보를 추천받을 수 있습니다.",
  },
  {
    question: "착수금 수수료와 성공보수 수수료는 무엇인가요?",
    answer:
      "착수금 수수료는 계약 체결 시 발생하며, 계약 금액이 1억 원 미만인 경우 클라이언트 3%, 프리랜서 4%가 적용됩니다. 1억 원 이상인 경우 클라이언트 수수료는 2%로 인하되며, 프리랜서 수수료는 4%로 동일합니다.\n성공보수 수수료는 프로젝트 완료 후 발생하며, 계약 금액이 1억 원 미만인 경우 클라이언트 7%, 프리랜서 6%가 적용됩니다. 1억 원 이상인 경우 클라이언트 수수료는 6%로 인하되며, 프리랜서 수수료는 6%로 동일합니다.",
  },
  {
    question: "실제 용역비는 어떻게 지급하나요?",
    answer:
      "실제 프로젝트 용역비는 클라이언트가 프리랜서에게 직접 지급합니다. 플랫폼에서는 플랫폼 이용 수수료만 결제합니다.",
  },
  {
    question: "새로운 프리랜서 후보를 다시 추천받을 수 있나요?",
    answer:
      "프로젝트당 무료 재추천 1회와 유료 재추천 최대 5회를 포함해 총 6회까지 이용할 수 있습니다.\n유료 재추천은 새로 추천받는 프리랜서 후보 1명당 10,000원이 부과됩니다.",
  },
  {
    question: "등급은 어떻게 결정되나요?",
    answer:
      "프리랜서 등급은 완료 프로젝트 건수와 평균 별점으로 결정됩니다. 시니어는 별점 3점 이상 5건 이상, 마스터는 별점 4점 이상 10건 이상이 기준입니다. 클라이언트 등급은 활동 내역을 기준으로 부여됩니다.",
  },
  {
    question: "계약서는 어떻게 작성되나요?",
    answer:
      "협상을 통해 합의된 계약 금액, 기간, 업무 범위 등의 조건은 표준계약서에 자동으로 반영됩니다. 클라이언트와 프리랜서가 플랫폼에서 전자 서명을 완료하면 계약이 최종 체결됩니다.",
  },
];

// 랜딩 페이지 "자주 묻는 질문" 아코디언 (한 번에 하나만 열림)
export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto w-full max-w-[800px] space-y-3">
      {FAQ_ITEMS.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div key={item.question} className="rounded-xl border border-theme bg-surface">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-sm font-bold text-theme-primary">{item.question}</span>
              <Image
                src="/icons/ChevronDownIcon.svg"
                alt=""
                width={12}
                height={12}
                aria-hidden="true"
                className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isOpen && (
              <p className="whitespace-pre-line border-t border-theme px-5 py-4 text-sm leading-relaxed text-theme-secondary">
                {item.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
