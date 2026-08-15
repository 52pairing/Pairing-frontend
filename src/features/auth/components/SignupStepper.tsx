import Image from "next/image";
import { Fragment } from "react";

// 회원가입 위저드의 타이틀 + 상단 진행 스텝 표시.
// client/projects의 ProjectStepper와 동일한 구조, 색상 토큰만 auth 팔레트로 교체.

type StepState = "completed" | "active" | "upcoming";

interface SignupStepperProps {
  /** 역할별 타이틀 (예: "클라이언트 회원가입") — 스텝 위에 함께 표시 */
  title: string;
  /** 현재 진행 중인 단계 (1부터 시작) */
  currentStep: number;
  /** 스텝 라벨 목록 */
  labels: readonly string[];
}

export function SignupStepper({ title, currentStep, labels }: SignupStepperProps) {
  return (
    <div>
      <h1 className="mb-6 text-center text-lg font-bold text-theme-primary">
        {title}
      </h1>

      <div className="flex items-start justify-center">
        {labels.map((label, index) => {
          const number = index + 1;
          const state: StepState =
            number < currentStep
              ? "completed"
              : number === currentStep
                ? "active"
                : "upcoming";

          return (
            <Fragment key={label}>
              {index > 0 ? (
                <StepLine completed={number <= currentStep} />
              ) : null}

              <StepNode number={number} label={label} state={state} />
            </Fragment>
          );
        })}
      </div>
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
      ? "border border-[#E4E7EC] bg-surface font-semibold text-[#9CA3AF]"
      : state === "active"
        ? "bg-[#356DF3] font-bold text-white"
        : "bg-brand font-bold text-white";

  const labelClass =
    state === "active"
      ? "font-bold text-[#356DF3]"
      : state === "completed"
        ? "font-medium text-theme-secondary"
        : "font-medium text-[#9CA3AF]";

  return (
    <div className="flex w-[84px] shrink-0 flex-col items-center">
      <div
        className={`flex h-[34px] w-[34px] items-center justify-center rounded-full text-[12px] ${circleClass}`}
      >
        {state === "completed" ? (
          <Image
            src="/icons/CheckIcon-white.svg"
            alt=""
            width={13}
            height={13}
            aria-hidden="true"
          />
        ) : (
          number
        )}
      </div>

      <p className={`mt-2 text-[11px] ${labelClass}`}>{label}</p>
    </div>
  );
}

/** 스텝 사이를 잇는 연결선 (완료 구간은 네이비) */
function StepLine({ completed = false }: { completed?: boolean }) {
  return (
    <div
      className={`mt-[16px] h-[2px] flex-1 ${
        completed ? "bg-brand" : "bg-[#E4E7EC]"
      }`}
    />
  );
}
