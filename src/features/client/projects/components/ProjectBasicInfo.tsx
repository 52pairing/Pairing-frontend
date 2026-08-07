"use client";

// Step 2 · 기본 정보
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ChangeEvent, ReactNode } from "react";

import { ProjectRegisterShell } from "@/features/client/projects/components/ProjectRegisterShell";
import { ProjectRequiredLabel } from "@/features/client/projects/components/ProjectRequiredLabel";
import { ProjectStepNavigation } from "@/features/client/projects/components/ProjectStepNavigation";
import { nextStep, prevStep } from "@/features/client/projects/constants/steps";
import { useProjectRegister } from "@/features/client/projects/context/ProjectRegisterContext";
import type { WorkMethod, WorkType } from "@/features/client/projects/types/project";

const STEP = 2;
const MIN_BUDGET_IN_TEN_THOUSAND_WON = 500;
const MAX_BUDGET_IN_TEN_THOUSAND_WON = 100_000;
const MAX_DURATION_MONTHS = 24;

export function ProjectBasicInfo() {
  const router = useRouter();
  const { form, patch } = useProjectRegister();
  const prev = prevStep(STEP);
  const next = nextStep(STEP);

  // 초기값은 공용 Context에서 읽어와, 뒤로 갔다 와도 입력값이 유지됩니다.
  const [projectName, setProjectName] = useState(form.projectName ?? "");
  const [startDate, setStartDate] = useState(form.startDate ?? "");
  const [startNegotiable, setStartNegotiable] = useState(
    form.startNegotiable ?? false,
  );

  const [duration, setDuration] = useState(
    form.durationMonths != null ? String(form.durationMonths) : "3",
  );
  const [budget, setBudget] = useState(
    form.budget != null ? form.budget.toLocaleString("ko-KR") : "",
  );

  const [workMethod, setWorkMethod] = useState<WorkMethod | null>(
    form.workMethod ?? null,
  );

  const [workType, setWorkType] = useState<WorkType | null>(
    form.workType ?? null,
  );

  const budgetNumber = Number(budget.replace(/,/g, "")) || 0;
  const budgetWithVat = budgetNumber ? Math.round(budgetNumber * 1.1) : 0;

  const handleBudgetChange = (event: ChangeEvent<HTMLInputElement>) => {
    const onlyNumber = event.target.value.replace(/[^\d]/g, "");

    if (!onlyNumber) {
      setBudget("");
      return;
    }

    const number = Number(onlyNumber);

    setBudget(number.toLocaleString("ko-KR"));
  };

  const durationNumber = Number(duration);
  const isValid =
    projectName.trim().length > 0 &&
    (startNegotiable || startDate.length > 0) &&
    durationNumber >= 1 &&
    durationNumber <= MAX_DURATION_MONTHS &&
    budgetNumber >= MIN_BUDGET_IN_TEN_THOUSAND_WON &&
    budgetNumber <= MAX_BUDGET_IN_TEN_THOUSAND_WON &&
    workMethod !== null &&
    workType !== null;

  const goPrev = () => {
    if (prev) router.push(prev.path);
  };

  const goNext = () => {
    if (!isValid || !next) return;

    // 입력값을 공용 Context에 저장 → 이후 스텝(검수·최종 확인)에서 사용
    patch({
      projectName: projectName.trim(),
      startDate,
      startNegotiable,
      durationMonths: durationNumber,
      budget: budgetNumber,
      workMethod: workMethod ?? undefined,
      workType: workType ?? undefined,
    });

    router.push(next.path);
  };

  return (
    <ProjectRegisterShell currentStep={STEP} backHref="/client" backLabel="홈으로">
      <div className="mx-auto mt-12 max-w-[700px]">
        <header>
          <h1 className="text-[22px] font-extrabold tracking-[-0.04em] text-[#111827]">
            프로젝트 기본 정보
          </h1>

          <p className="mt-2 text-[12px] font-medium text-[#667085]">
            프로젝트의 기본 조건을 입력해주세요.
          </p>
        </header>

        {/* 프로젝트 이름 */}
        <div className="mt-8">
          <ProjectRequiredLabel>프로젝트 이름</ProjectRequiredLabel>

          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="예) 쇼핑몰 관리자 페이지 프론트엔드 개발"
            className="mt-3 h-[43px] w-full rounded-[8px] border border-[#dce2e8] bg-white px-4 text-[12px] font-semibold text-[#111827] outline-none transition placeholder:font-medium placeholder:text-[#8e97a5] focus:border-[#17365d]"
          />

          <p className="mt-2 text-[10px] text-[#98a2b3]">
            프로젝트의 목적이나 작업 내용이 드러나도록 작성해주세요.
          </p>
        </div>

        {/* 시작 희망일 */}
        <div className="mt-7">
          <ProjectRequiredLabel>프로젝트 시작 희망일</ProjectRequiredLabel>

          <div className="mt-3">
            <div className="relative w-[142px]">
              <input
                type="date"
                value={startDate}
                disabled={startNegotiable}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-[43px] w-full rounded-[8px] border border-[#dce2e8] bg-white px-3 text-[11px] text-[#344054] outline-none disabled:bg-[#fafafa] disabled:text-[#98a2b3]"
              />
            </div>

            {/* 협의 가능 */}
            <label className="mt-3 flex w-fit cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={startNegotiable}
                onChange={(e) => {
                  const checked = e.target.checked;

                  setStartNegotiable(checked);

                  if (checked) {
                    setStartDate("");
                  }
                }}
                className="h-[15px] w-[15px] cursor-pointer accent-[#17365d]"
              />

              <span className="text-[11px] font-medium text-[#667085]">
                시작일 협의 가능
              </span>

              {startNegotiable && (
                <span className="rounded-[4px] border border-[#c9d5e3] bg-[#edf3f8] px-[6px] py-[2px] text-[9px] font-bold text-[#43566d]">
                  협의 가능
                </span>
              )}
            </label>
          </div>
        </div>

        {/* 프로젝트 예상 기간 */}
        <div className="mt-7">
          <ProjectRequiredLabel>프로젝트 예상 기간</ProjectRequiredLabel>

          <div className="mt-3 flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="24"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="h-[41px] w-[66px] rounded-[8px] border border-[#dce2e8] bg-white px-3 text-center text-[12px] font-semibold text-[#344054] outline-none focus:border-[#17365d]"
            />

            <div className="flex h-[41px] min-w-[61px] items-center justify-center rounded-[8px] border border-[#dce2e8] bg-white px-4 text-[11px] font-bold text-[#344054]">
              개월
            </div>
          </div>

          <p className="mt-2 text-[10px] text-[#98a2b3]">
            최대 24개월 또는 24주
          </p>
        </div>

        {/* 프로젝트 전체 예산 */}
        <div className="mt-7">
          <ProjectRequiredLabel>프로젝트 전체 예산</ProjectRequiredLabel>

          <div className="mt-3 flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={budget}
              onChange={handleBudgetChange}
              placeholder="3,000"
              className="h-[43px] w-[185px] rounded-[8px] border border-[#dce2e8] bg-white px-4 text-right text-[13px] font-bold text-[#111827] outline-none placeholder:text-[#8e97a5] focus:border-[#17365d]"
            />

            <span className="text-[11px] font-bold text-[#667085]">만원</span>
          </div>

          {/* 입력 후 표시 */}
          {budgetNumber > 0 && (
            <p className="mt-2 text-[10px] font-semibold text-[#246bfe]">
              부가세 포함 {budgetWithVat.toLocaleString("ko-KR")}만원
            </p>
          )}

          <p className="mt-2 text-[10px] text-[#98a2b3]">
            전체 프로젝트 기준 총예산 · 최소 500만원 · 최대 10억 · 부가세 별도 ·
            만 원 단위 입력
          </p>
        </div>

        {/* 근무 방식 */}
        <div className="mt-7">
          <ProjectRequiredLabel>근무 방식</ProjectRequiredLabel>

          <div className="mt-3 flex flex-wrap gap-[9px]">
            <SelectButton
              selected={workMethod === "REMOTE"}
              onClick={() => setWorkMethod("REMOTE")}
            >
              재택
            </SelectButton>

            <SelectButton
              selected={workMethod === "ONSITE"}
              onClick={() => setWorkMethod("ONSITE")}
            >
              상주
            </SelectButton>

            <SelectButton
              selected={workMethod === "ALL"}
              onClick={() => setWorkMethod("ALL")}
            >
              모두 가능
            </SelectButton>
          </div>
        </div>

        {/* 근무 형태 */}
        <div className="mt-7">
          <ProjectRequiredLabel>근무 형태</ProjectRequiredLabel>

          <div className="mt-3 flex flex-wrap gap-[9px]">
            <SelectButton
              selected={workType === "FULL_TIME"}
              onClick={() => setWorkType("FULL_TIME")}
            >
              풀타임
            </SelectButton>

            <SelectButton
              selected={workType === "PART_TIME"}
              onClick={() => setWorkType("PART_TIME")}
            >
              파트타임
            </SelectButton>

            <SelectButton
              selected={workType === "ALL"}
              onClick={() => setWorkType("ALL")}
            >
              모두 가능
            </SelectButton>
          </div>
        </div>
      </div>

      <ProjectStepNavigation
        onPrevious={goPrev}
        onNext={goNext}
        nextDisabled={!isValid}
      />
    </ProjectRegisterShell>
  );
}

function SelectButton({
  children,
  selected,
  onClick,
}: {
  children: ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[40px] min-w-[62px] items-center justify-center rounded-[8px] border px-5 text-[11px] font-semibold transition ${
        selected
          ? "border-[#17365d] bg-[#eef3f8] text-[#17365d]"
          : "border-[#dce2e8] bg-white text-[#667085] hover:bg-[#f8fafc]"
      }`}
    >
      {children}
    </button>
  );
}
