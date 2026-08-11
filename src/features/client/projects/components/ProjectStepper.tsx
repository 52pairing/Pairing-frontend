import { Fragment } from "react";

import { PROJECT_REGISTER_STEP_LABELS } from "@/features/client/projects/constants/steps";

/**
 * 클라이언트 프로젝트 등록 플로우의 상단 진행 스텝 표시.
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
    <div className="flex items-start px-1">
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
      ? "border border-[#d9e0e7] bg-surface font-semibold text-theme-muted"
      : "bg-brand font-bold text-white";

  const labelClass =
    state === "active"
      ? "font-bold text-brand"
      : state === "completed"
        ? "font-medium text-theme-muted"
        : "font-medium text-theme-muted";

  return (
    <div className="flex w-[68px] shrink-0 flex-col items-center">
      <div
        className={`flex h-[30px] w-[30px] items-center justify-center rounded-full text-[11px] ${circleClass}`}
      >
        {state === "completed" ? <CheckMark /> : number}
      </div>

      <p className={`mt-1.5 text-[9px] ${labelClass}`}>{label}</p>
    </div>
  );
}

/** 스텝 사이를 잇는 연결선 (완료 구간은 진한색) */
function StepLine({ completed = false }: { completed?: boolean }) {
  return (
    <div
      className={`mt-[14px] h-[2px] flex-1 ${
        completed ? "bg-brand" : "bg-[#e6eaf0]"
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
