"use client";

// Step 5 · 검수 (AI 사전 검수)
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";

import { LoadingState } from "@/features/common/components/Loading";
import { ChevronLeftIcon } from "@/features/common/components/SharedUI";
import { ProjectRegisterShell } from "@/features/client/projects/components/ProjectRegisterShell";
import {
  PROJECT_REGISTER_BASE,
  nextStep,
  prevStep,
} from "@/features/client/projects/constants/steps";
import { useProjectRegister } from "@/features/client/projects/context/ProjectRegisterContext";

const STEP = 5;

type Phase = "intro" | "loading" | "result";

/**
 * 사전 검수 결과 항목.
 * TODO: 추후 백엔드 사전 검수 API 연동 시 service(파일명.service.ts)로 분리 예정.
 * 지금은 백엔드 없이 프론트에서 하드코딩한 예상 결과입니다.
 */
interface PreCheckResultItem {
  recruitId: number;
  job: string;
  /** 모집 인원 */
  count: number;
  /** 예상 후보 수 */
  expectedCandidates: number;
  /** 모집 인원 이상 확보 가능한지 */
  matchable: boolean;
}

export function ProjectReview() {
  const router = useRouter();
  const { form, reset } = useProjectRegister();
  const prev = prevStep(STEP);
  const next = nextStep(STEP);

  const recruits = form.recruits ?? [];

  const [phase, setPhase] = useState<Phase>("intro");
  const [results, setResults] = useState<PreCheckResultItem[]>([]);

  const hasInsufficient = results.some((r) => !r.matchable);

  const startCheck = () => {
    if (recruits.length === 0) return;

    setPhase("loading");

    // 백엔드 없이 하드코딩한 예상 결과. (진행 중 상태를 보여주기 위한 지연 포함)
    setTimeout(() => {
      const data: PreCheckResultItem[] = recruits.map((recruit) => {
        // 직무 + 스킬 조합으로 예상 후보 수를 0~7 사이로 흉내냅니다. (하드코딩)
        const seed = `${recruit.job}|${recruit.skills.join(",")}`
          .split("")
          .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
        const expectedCandidates = seed % 8;

        return {
          recruitId: recruit.id,
          job: recruit.job,
          count: recruit.count,
          expectedCandidates,
          matchable: expectedCandidates >= recruit.count,
        };
      });

      setResults(data);
      setPhase("result");
    }, 1500);
  };

  const goPrev = () => {
    if (prev) router.push(prev.path);
  };

  // "등록 수정" → 직군·스킬을 조정하도록 직군 모집(Step3)으로 이동
  const goEdit = () => {
    router.push(`${PROJECT_REGISTER_BASE}/roles`);
  };

  // "등록 취소" → 입력값 초기화 후 클라이언트 홈으로
  const goCancel = () => {
    reset();
    router.push("/client");
  };

  // "입력한 내용으로 등록하기" → 최종 확인(Step6)
  const goRegister = () => {
    if (next) router.push(next.path);
  };

  return (
    <ProjectRegisterShell currentStep={STEP} backHref="/client" backLabel="홈으로">
      {phase === "intro" ? (
        <>
          <div className="mx-auto mt-12 max-w-[720px]">
            <header>
              <h1 className="text-[22px] font-extrabold tracking-[-0.04em] text-[#111827]">
                사전 검수
              </h1>

              <p className="mt-2 text-[12px] font-medium text-[#667085]">
                등록 전 현재 프리랜서 풀을 기준으로 직군별 예상 후보 수와 매칭
                가능성을 확인합니다.
              </p>
            </header>

            <div className="mt-6 rounded-[12px] border border-[#dce2e8] bg-[#fbfcfd] px-5 py-4">
              <p className="text-[11px] font-extrabold text-[#111827]">
                검수 항목
              </p>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <CheckItem>직군 · 직무</CheckItem>
                <CheckItem>요구 스킬</CheckItem>
              </div>
            </div>
          </div>

          <BottomBar>
            <BackButton onClick={goPrev} />

            <PrimaryButton onClick={startCheck} disabled={recruits.length === 0}>
              사전 검수 시작하기
            </PrimaryButton>
          </BottomBar>
        </>
      ) : null}

      {phase === "loading" ? (
        <LoadingState
          size="lg"
          className="mt-12 py-16"
          message={
            "사전 검수 진행 중\n현재 프리랜서 풀을 기준으로 직군별 예상 후보 수와 매칭 가능성을 분석하고 있습니다."
          }
        />
      ) : null}

      {phase === "result" ? (
        <>
          <div className="mx-auto mt-12 max-w-[720px]">
            <header>
              <h1 className="text-[22px] font-extrabold tracking-[-0.04em] text-[#111827]">
                사전 검수 결과
              </h1>

              <p className="mt-2 text-[12px] font-medium text-[#667085]">
                현재 프리랜서 풀 기준 예상 결과입니다. 실제 후보 수 및 매칭 성사
                여부는 달라질 수 있습니다.
              </p>
            </header>

            <div className="mt-6 space-y-3">
              {results.map((item) => (
                <ResultCard key={item.recruitId} item={item} />
              ))}
            </div>
          </div>

          <BottomBar align="end">
            <SecondaryButton onClick={goEdit}>등록 수정</SecondaryButton>

            {hasInsufficient ? (
              <DangerButton onClick={goCancel}>등록 취소</DangerButton>
            ) : null}

            <PrimaryButton onClick={goRegister}>
              입력한 내용으로 등록하기
            </PrimaryButton>
          </BottomBar>
        </>
      ) : null}
    </ProjectRegisterShell>
  );
}


function ResultCard({ item }: { item: PreCheckResultItem }) {
  const summary = (
    <p className="mt-1 text-[11px] text-[#667085]">
      모집 인원 {item.count}명 · 예상 후보 {item.expectedCandidates}명
      {item.matchable ? (
        <span className="ml-1 font-bold text-[#12b76a]">· 매칭 가능</span>
      ) : (
        <span className="ml-1 font-bold text-[#f04438]">· 후보 부족</span>
      )}
    </p>
  );

  if (item.matchable) {
    return (
      <div className="flex items-center justify-between rounded-[10px] border border-[#e1e6ec] bg-white px-5 py-4">
        <div>
          <p className="text-[13px] font-extrabold text-[#111827]">
            {item.job}
          </p>

          {summary}
        </div>

        <MatchableBadge />
      </div>
    );
  }

  return (
    <div className="rounded-[10px] border border-[#f04438] bg-[#fef4f4] px-5 py-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] font-extrabold text-[#111827]">
            {item.job}
          </p>

          {summary}
        </div>

        <InsufficientBadge />
      </div>

      <div className="mt-4 border-t border-[#f6cccc] pt-3">
        <p className="text-[11px] font-bold leading-5 text-[#e11d48]">
          현재 조건에 맞는 {item.job} 후보가 모집 인원보다 부족합니다.
        </p>

        <p className="mt-2 text-[11px] leading-5 text-[#8a4b4b]">
          조건을 조정하면 더 많은 후보를 확인할 수 있습니다:
        </p>

        <ul className="mt-1 space-y-1 text-[11px] leading-5 text-[#8a4b4b]">
          <li>· 요구 스킬 중 일부를 변경해보세요.</li>
          <li>· 직군 혹은 직무 범위를 변경해보세요.</li>
        </ul>
      </div>
    </div>
  );
}

function BottomBar({
  children,
  align = "between",
}: {
  children: ReactNode;
  align?: "between" | "end";
}) {
  return (
    <div className="mt-8 border-t border-[#e2e7ec] pt-6">
      <div
        className={`flex items-center gap-2 ${
          align === "end" ? "justify-end" : "justify-between"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[42px] cursor-pointer items-center gap-1 rounded-[8px] border border-[#dce2e8] bg-white px-5 text-[11px] font-semibold text-[#596579] transition hover:bg-[#f8fafc]"
    >
      <ChevronLeftIcon size={13} />
      이전
    </button>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-[42px] min-w-[99px] items-center justify-center rounded-[8px] px-5 text-[12px] font-bold text-white transition ${
        disabled
          ? "cursor-not-allowed bg-[#a7b0bf]"
          : "cursor-pointer bg-[#17365d] hover:bg-[#102a49]"
      }`}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[42px] cursor-pointer items-center justify-center rounded-[8px] border border-[#dce2e8] bg-white px-5 text-[11px] font-semibold text-[#596579] transition hover:bg-[#f8fafc]"
    >
      {children}
    </button>
  );
}

function DangerButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[42px] cursor-pointer items-center justify-center rounded-[8px] border border-[#f04438] bg-white px-5 text-[11px] font-semibold text-[#f04438] transition hover:bg-[#fef2f2]"
    >
      {children}
    </button>
  );
}

/* =========================================================
   아이콘 / 배지 (이 단계 전용)
========================================================= */

function CheckItem({ children }: { children: ReactNode }) {
  return (
    <span className="flex items-center gap-2 text-[11px] font-semibold text-[#344054]">
      <svg
        width="12"
        height="12"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
        className="shrink-0 text-[#98a2b3]"
      >
        <path
          d="M3.5 7L6 9.5L10.5 4.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </span>
  );
}

function MatchableBadge() {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e7f7ee]">
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3.5 7L6 9.5L10.5 4.5"
          stroke="#12b76a"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function InsufficientBadge() {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fdecec]">
      <svg
        width="15"
        height="15"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="6" stroke="#f04438" strokeWidth="1.3" />
        <path
          d="M8 5V8.5"
          stroke="#f04438"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <circle cx="8" cy="10.8" r="0.7" fill="#f04438" />
      </svg>
    </span>
  );
}
