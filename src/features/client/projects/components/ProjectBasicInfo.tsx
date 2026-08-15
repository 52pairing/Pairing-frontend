"use client";

// Step 2 · 기본 정보
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";

import { ProjectRegisterShell } from "@/features/client/projects/components/ProjectRegisterShell";
import { ProjectRequiredLabel } from "@/features/client/projects/components/ProjectRequiredLabel";
import { ProjectStepNavigation } from "@/features/client/projects/components/ProjectStepNavigation";
import { nextStep, prevStep } from "@/features/client/projects/constants/steps";
import { useProjectRegister } from "@/features/client/projects/context/ProjectRegisterContext";
import { getProjectWorkConditions } from "@/features/client/projects/services/projectPreReview";
import type { ProjectWorkConditionsResponse } from "@/features/client/projects/types/preReview";
import type {
  WorkMethod,
  WorkType,
} from "@/features/client/projects/types/project";

const STEP = 2;
const MIN_BUDGET_IN_TEN_THOUSAND_WON = 500;
const MAX_BUDGET_IN_TEN_THOUSAND_WON = 100_000;
const MAX_DURATION_MONTHS = 24;

const getLocalDateString = () => {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

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
    form.periodValue != null ? String(form.periodValue) : "3",
  );
  const [periodUnit, setPeriodUnit] = useState(form.periodUnit ?? "");
  const [budget, setBudget] = useState(
    form.budget != null ? form.budget.toLocaleString("ko-KR") : "",
  );
  const [budgetValidationRequested, setBudgetValidationRequested] =
    useState(false);

  const [workMethod, setWorkMethod] = useState<WorkMethod | null>(
    form.workMethod ?? null,
  );

  const [workType, setWorkType] = useState<WorkType | null>(
    form.workType ?? null,
  );
  const [workConditions, setWorkConditions] =
    useState<ProjectWorkConditionsResponse | null>(null);
  const [metaError, setMetaError] = useState("");

  // 조회 결과를 상태에 반영하는 공통 처리 (최초 로드·재시도 버튼이 공유)
  const applyWorkConditions = (response: ProjectWorkConditionsResponse) => {
    setWorkConditions(response);
    setPeriodUnit((current) => current || response.periodUnits[0]?.code || "");
  };

  const loadWorkConditions = async () => {
    setMetaError("");

    try {
      applyWorkConditions(await getProjectWorkConditions());
    } catch (error) {
      setMetaError(
        error instanceof Error
          ? error.message
          : "근무 조건 선택지를 불러오지 못했습니다.",
      );
    }
  };

  useEffect(() => {
    let cancelled = false;

    getProjectWorkConditions()
      .then((response) => {
        if (!cancelled) applyWorkConditions(response);
      })
      .catch((error) => {
        if (cancelled) return;

        setMetaError(
          error instanceof Error
            ? error.message
            : "근무 조건 선택지를 불러오지 못했습니다.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const budgetNumber = Number(budget.replace(/,/g, "")) || 0;
  const budgetWithVat = budgetNumber ? Math.round(budgetNumber * 1.1) : 0;
  const today = getLocalDateString();
  const isStartDateValid = startDate.length > 0 && startDate >= today;

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
  const isBudgetValid =
    budgetNumber >= MIN_BUDGET_IN_TEN_THOUSAND_WON &&
    budgetNumber <= MAX_BUDGET_IN_TEN_THOUSAND_WON;
  const areOtherFieldsValid =
    projectName.trim().length > 0 &&
    isStartDateValid &&
    durationNumber >= 1 &&
    durationNumber <= MAX_DURATION_MONTHS &&
    periodUnit.length > 0 &&
    workMethod !== null &&
    workType !== null;
  const goPrev = () => {
    if (prev) router.push(prev.path);
  };

  const goNext = () => {
    if (!isBudgetValid) {
      setBudgetValidationRequested(true);
      return;
    }

    if (!areOtherFieldsValid || !next) return;

    // 입력값을 공용 Context에 저장 → 이후 스텝(검수·최종 확인)에서 사용
    patch({
      projectName: projectName.trim(),
      startDate,
      startNegotiable,
      periodValue: durationNumber,
      periodUnit,
      periodUnitLabel: workConditions?.periodUnits.find(
        (option) => option.code === periodUnit,
      )?.label,
      budget: budgetNumber,
      workMethod: workMethod ?? undefined,
      workMethodLabel: workConditions?.workStyles.find(
        (option) => option.code === workMethod,
      )?.label,
      workType: workType ?? undefined,
      workTypeLabel: workConditions?.workForms.find(
        (option) => option.code === workType,
      )?.label,
    });

    router.push(next.path);
  };

  return (
    <ProjectRegisterShell
      currentStep={STEP}
      backHref="/client"
      backLabel="홈으로"
    >
      <div className="mx-auto mt-8 max-w-[660px]">
        <header>
          <h1 className="text-[20px] font-extrabold tracking-[-0.04em] text-theme-primary">
            프로젝트 기본 정보
          </h1>

          <p className="mt-2 text-[12px] font-medium text-theme-secondary">
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
            className="mt-3 h-[43px] w-full rounded-[8px] border border-theme bg-surface px-4 text-[12px] font-semibold text-theme-primary outline-none transition placeholder:font-medium placeholder:text-[#8e97a5] focus:border-brand"
          />

          <p className="mt-2 text-[10px] text-theme-muted">
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
                min={today}
                aria-invalid={startDate.length > 0 && !isStartDateValid}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-[43px] w-full rounded-[8px] border border-theme bg-surface px-3 text-[11px] text-theme-secondary outline-none"
              />
            </div>

            {/* 협의 가능 */}
            <label className="mt-3 flex w-fit cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={startNegotiable}
                onChange={(e) => setStartNegotiable(e.target.checked)}
                className="h-[15px] w-[15px] cursor-pointer accent-[#17365d]"
              />

              <span className="text-[11px] font-medium text-theme-secondary">
                시작일 협의 가능
              </span>

              {startNegotiable && (
                <span className="rounded-[4px] border border-[#c9d5e3] bg-[#edf3f8] px-[6px] py-[2px] text-[9px] font-bold text-[#43566d]">
                  협의 가능
                </span>
              )}
            </label>

            {startDate.length > 0 && !isStartDateValid && (
              <p
                role="alert"
                className="mt-2 text-[10px] font-semibold text-theme-danger"
              >
                프로젝트 시작 희망일은 오늘 이후 날짜로 선택해주세요.
              </p>
            )}
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
              className="h-[41px] w-[66px] rounded-[8px] border border-theme bg-surface px-3 text-center text-[12px] font-semibold text-theme-secondary outline-none focus:border-brand"
            />

            <select
              value={periodUnit}
              onChange={(e) => setPeriodUnit(e.target.value)}
              disabled={!workConditions}
              className="h-[41px] min-w-[88px] rounded-[8px] border border-theme bg-surface px-3 text-[11px] font-bold text-theme-secondary outline-none disabled:bg-surface-subtle"
            >
              <option value="">단위 선택</option>
              {workConditions?.periodUnits.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <p className="mt-2 text-[10px] text-theme-muted">
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
              className="h-[43px] w-[185px] rounded-[8px] border border-theme bg-surface px-4 text-right text-[13px] font-bold text-theme-primary outline-none placeholder:text-[#8e97a5] focus:border-brand"
            />

            <span className="text-[11px] font-bold text-theme-secondary">
              만원
            </span>
          </div>

          {/* 입력 후 표시 */}
          {budgetNumber > 0 && (
            <p className="mt-2 text-[10px] font-semibold text-[#246bfe]">
              부가세 포함 {budgetWithVat.toLocaleString("ko-KR")}만원
            </p>
          )}

          <p className="mt-2 text-[10px] text-theme-muted">
            전체 프로젝트 기준 총예산 · 최소 500만원 · 최대 10억원(100,000만원)
            · 부가세 별도 · 만 원 단위 입력
          </p>

          {!isBudgetValid &&
          (budget.length > 0 || budgetValidationRequested) ? (
            <p
              role="alert"
              className="mt-2 text-[10px] font-semibold text-theme-danger"
            >
              프로젝트 전체 예산은 500만원 이상 100,000만원 이하로 입력해주세요.
            </p>
          ) : null}
        </div>

        {/* 근무 방식 */}
        <div className="mt-7">
          <ProjectRequiredLabel>근무 방식</ProjectRequiredLabel>

          <div className="mt-3 flex flex-wrap gap-[9px]">
            {workConditions?.workStyles.map((option) => (
              <SelectButton
                key={option.code}
                selected={workMethod === option.code}
                onClick={() => setWorkMethod(option.code)}
              >
                {option.label}
              </SelectButton>
            ))}
          </div>
        </div>

        {/* 근무 형태 */}
        <div className="mt-7">
          <ProjectRequiredLabel>근무 형태</ProjectRequiredLabel>

          <div className="mt-3 flex flex-wrap gap-[9px]">
            {workConditions?.workForms.map((option) => (
              <SelectButton
                key={option.code}
                selected={workType === option.code}
                onClick={() => setWorkType(option.code)}
              >
                {option.label}
              </SelectButton>
            ))}
          </div>
        </div>

        {metaError ? (
          <div className="mt-6 flex items-center justify-between rounded-[8px] border border-[#fda29b] bg-danger-surface px-4 py-3">
            <p className="text-[11px] font-semibold text-theme-danger">
              {metaError}
            </p>
            <button
              type="button"
              onClick={() => void loadWorkConditions()}
              className="text-[11px] font-bold text-theme-danger underline"
            >
              다시 시도
            </button>
          </div>
        ) : null}
      </div>

      <ProjectStepNavigation
        onPrevious={goPrev}
        onNext={goNext}
        nextDisabled={!areOtherFieldsValid}
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
          ? "border-brand bg-[#eef3f8] text-brand"
          : "border-theme bg-surface text-theme-secondary hover:bg-surface-subtle"
      }`}
    >
      {children}
    </button>
  );
}
