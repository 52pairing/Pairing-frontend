import { Fragment } from "react";

import { PROJECT_REGISTER_STEP_LABELS } from "@/features/client/projects/constants/steps";

/**
 * 클라이언트 프로젝트 등록 플로우의 상단 진행 스텝 표시.
 * 등록 안내 → 기본 정보 → 직군 모집 → 상세정보 → 검수 → 최종 확인 순서로,
 * 플로우의 여러 페이지에서 `currentStep`만 바꿔 공통으로 사용합니다.
 *
 * - 완료된 단계(currentStep 이전): 체크 표시 + 진한 원 + 진한 연결선
 * - 현재 단계: 진한 원 + 번호 강조
 * - 예정 단계: 옅은 테두리 원
 *
 * 스텝 라벨은 constants/steps.ts를 단일 소스로 사용합니다.
 */

type StepState = "completed" | "active" | "upcoming";

interface ProjectStepperProps {
  /** 현재 진행 중인 단계 (1부터 시작) */
  currentStep: number;
  /** 스텝 라벨 목록. 기본값은 프로젝트 등록 플로우 6단계 */
  steps?: readonly string[];
}

export function ProjectStepper({
  currentStep,
  steps = PROJECT_REGISTER_STEP_LABELS,
}: ProjectStepperProps) {
  return (
    <div className="flex items-start">
      {steps.map((label, index) => {
        const number = index + 1;
        const state: StepState =
          number < currentStep
            ? "completed"
            : number === currentStep
              ? "active"
              : "upcoming";

        return (
          <Fragment key={label}>
            {index > 0 ? <StepLine completed={number <= currentStep} /> : null}

            <StepNode number={number} label={label} state={state} />
          </Fragment>
        );
      })}
    </div>
  );
}

/** 스텝 하나 (번호/체크 원형 + 라벨) */
function StepNode({
  number,
  label,
  state,
}: {
  number: number;
  label: string;
  state: StepState;
}) {
  const circleClass =
    state === "upcoming"
      ? "border border-[#d9e0e7] bg-white font-semibold text-[#98a2b3]"
      : "bg-[#17365d] font-bold text-white";

  const labelClass =
    state === "active"
      ? "font-bold text-[#17365d]"
      : state === "completed"
        ? "font-medium text-[#8b95a5]"
        : "font-medium text-[#98a2b3]";

  return (
    <div className="flex w-[78px] shrink-0 flex-col items-center">
      <div
        className={`flex h-[34px] w-[34px] items-center justify-center rounded-full text-[12px] ${circleClass}`}
      >
        {state === "completed" ? <CheckMark /> : number}
      </div>

      <p className={`mt-2 text-[10px] ${labelClass}`}>{label}</p>
    </div>
  );
}

/** 스텝 사이를 잇는 연결선 (완료 구간은 진한색) */
function StepLine({ completed = false }: { completed?: boolean }) {
  return (
    <div
      className={`mt-[16px] h-[2px] flex-1 ${
        completed ? "bg-[#17365d]" : "bg-[#e6eaf0]"
      }`}
    />
  );
}

/** 완료 단계 원 안의 체크 표시 */
function CheckMark() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 7L6 9.5L10.5 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
