"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ApiException } from "@/lib/api";
import {
  getFreelancerCondition,
  getFreelancerJobCategories,
  getFreelancerJobRoles,
  getFreelancerSkills,
  getFreelancerWorkConditions,
} from "@/features/freelancer/mypage/services/freelancerResume";
import type {
  MetaOption,
  WorkConditionsMeta,
} from "@/features/freelancer/mypage/types/resume";
import {
  FormCard,
  ProfileRegistrationShell,
  fieldClassName,
  labelClassName,
} from "./ProfileRegistrationShell";

const STORAGE_KEY = "pairing.freelancer.profile.step1";

type SelectedSkill = { code: string; levelCode: string };
type StepOneState = {
  categoryCode: string;
  roleCode: string;
  workStyleCode: string;
  payUnitCode: string;
  pay: string;
  minPay: string;
  workFormCode: string;
  startDate: string;
  startNegotiable: boolean;
  period: string;
  periodUnitCode: string;
  freelanceExperience: string;
  careerYears: string;
  skills: SelectedSkill[];
};

const initialState: StepOneState = {
  categoryCode: "",
  roleCode: "",
  workStyleCode: "",
  payUnitCode: "",
  pay: "",
  minPay: "",
  workFormCode: "",
  startDate: getTodayString(),
  startNegotiable: false,
  period: "",
  periodUnitCode: "",
  freelanceExperience: "",
  careerYears: "",
  skills: [],
};

export function FreelancerProfileRegistration() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState<StepOneState>(loadStepOneDraft);
  const [search, setSearch] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const today = getTodayString();

  const [jobCategories, setJobCategories] = useState<MetaOption[]>([]);
  const [jobRoles, setJobRoles] = useState<MetaOption[]>([]);
  const [skillOptions, setSkillOptions] = useState<MetaOption[]>([]);
  const [workConditions, setWorkConditions] = useState<WorkConditionsMeta | null>(null);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 실제 fetch는 여기서만 수행하고, effect 안에서는 setState를 동기적으로 호출하지 않습니다.
  const fetchMeta = () =>
    Promise.all([
      getFreelancerJobCategories(),
      getFreelancerJobRoles(),
      getFreelancerSkills(),
      getFreelancerWorkConditions(),
    ])
      .then(([categories, roles, skills, conditions]) => {
        setJobCategories(categories);
        setJobRoles(roles);
        setSkillOptions(skills);
        setWorkConditions(conditions);
      })
      .catch(() => {
        setMetaError("직군·직무·스킬 정보를 불러오지 못했습니다. 다시 시도해 주세요.");
      })
      .finally(() => setMetaLoading(false));

  const retryMeta = () => {
    setMetaLoading(true);
    setMetaError("");
    void fetchMeta();
  };

  useEffect(() => {
    void fetchMeta();
  }, []);

  // 이미 저장된 조건이 있으면 불러와 채워줍니다. 아직 없으면(FR_001) 임시저장 내용을 그대로 둡니다.
  useEffect(() => {
    getFreelancerCondition()
      .then((condition) => {
        setForm((current) => ({
          ...current,
          categoryCode: condition.jobCategory,
          roleCode: condition.jobRole,
          workStyleCode: condition.workStyle,
          workFormCode: condition.workForm,
          payUnitCode: condition.payUnit,
          pay: String(Math.round(condition.payAmount / 10_000)),
          minPay: String(Math.round(condition.minAcceptAmount / 10_000)),
          startNegotiable: condition.startNegotiable,
          startDate: condition.availableFrom ?? current.startDate,
          period: String(condition.periodValue),
          periodUnitCode: condition.periodUnit,
          freelanceExperience: condition.hasFreelanceExperience ? "있음" : "없음",
          careerYears: String(condition.careerYears),
          skills: condition.skills.map((skill) => ({
            code: skill.skillCode,
            levelCode: skill.skillLevel,
          })),
        }));
      })
      .catch((error) => {
        if (error instanceof ApiException && error.errorCode === "FR_001") return;
      });
  }, []);

  // meta 라벨은 저장 시점에만 계산해서 sessionStorage에 함께 기록합니다(별도 setState 없음).
  useEffect(() => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...form,
        category: labelOf(jobCategories, form.categoryCode),
        role: labelOf(jobRoles, form.roleCode),
        workStyle: labelOf(workConditions?.workStyles ?? [], form.workStyleCode),
        workForm: labelOf(workConditions?.workForms ?? [], form.workFormCode),
        payUnit: labelOf(workConditions?.payUnits ?? [], form.payUnitCode),
        periodUnit: labelOf(workConditions?.periodUnits ?? [], form.periodUnitCode),
        skills: form.skills.map((skill) => ({
          name: labelOf(skillOptions, skill.code),
          level: labelOf(workConditions?.skillLevels ?? [], skill.levelCode),
        })),
      }),
    );
  }, [form, jobCategories, jobRoles, skillOptions, workConditions]);

  const update = <K extends keyof StepOneState>(
    key: K,
    value: StepOneState[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const filteredSkills = useMemo(
    () =>
      skillOptions
        .filter((skill) => !form.skills.some((selected) => selected.code === skill.code))
        .filter((skill) => skill.label.toLowerCase().includes(search.toLowerCase()))
        .slice(0, search ? skillOptions.length : 12),
    [form.skills, search, skillOptions],
  );

  const filteredJobRoles = useMemo(
    () => jobRoles.filter((role) => role.parentCode === form.categoryCode),
    [form.categoryCode, jobRoles],
  );

  const isValid = Boolean(
    form.categoryCode &&
    form.roleCode &&
    form.workStyleCode &&
    Number(form.pay.replaceAll(",", "")) >= 1 &&
    form.workFormCode &&
    Number(form.minPay.replaceAll(",", "")) >= 1 &&
    Number(form.minPay.replaceAll(",", "")) <= Number(form.pay.replaceAll(",", "")) &&
    (form.startNegotiable || form.startDate >= today) &&
    Number(form.period) >= 1 &&
    Number(form.period) <= 24 &&
    form.freelanceExperience &&
    Number(form.careerYears) >= 1 &&
    form.skills.length >= 1 && form.skills.every((skill) => skill.levelCode),
  );

  const toggleSkill = (option: MetaOption) =>
    update(
      "skills",
      form.skills.some((skill) => skill.code === option.code)
        ? form.skills.filter((skill) => skill.code !== option.code)
        : [
          ...form.skills,
          { code: option.code, levelCode: workConditions?.skillLevels[0]?.code ?? "" },
        ],
    );

  const submit = async () => {
    setShowErrors(true);
    if (!isValid) {
      scrollToFirstError(formRef.current);
      return;
    }
    setSubmitError("");
    setSubmitting(true);
    const payAmount = Number(form.pay.replaceAll(",", "")) * 10_000;
    const minAcceptAmount = Number(form.minPay.replaceAll(",", "")) * 10_000;
    try {
      sessionStorage.setItem("pairing.freelancer.resume.condition", JSON.stringify({
        jobCategory: form.categoryCode,
        jobRole: form.roleCode,
        workStyle: form.workStyleCode as never,
        workForm: form.workFormCode as never,
        payUnit: form.payUnitCode as never,
        payAmount,
        minAcceptAmount,
        availableFrom: form.startNegotiable ? null : form.startDate,
        startNegotiable: form.startNegotiable,
        periodValue: Number(form.period),
        periodUnit: form.periodUnitCode as never,
        hasFreelanceExperience: form.freelanceExperience === "있음",
        careerYears: Number(form.careerYears),
        skills: form.skills.map((skill) => ({
          skillCode: skill.code,
          skillLevel: skill.levelCode as never,
        })),
      }));
      router.push("/freelancer/mypage/resume");
    } catch (error) {
      setSubmitError(
        error instanceof ApiException
          ? error.message
          : "조건 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProfileRegistrationShell
      step={1}
      title="희망 조건과 전문 정보를 입력해 주세요."
      description="입력한 정보는 프로젝트 추천과 AI 매칭에 활용됩니다."
    >
      <form
        ref={formRef}
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <BenefitBanner />
        {metaError ? (
          <p className="rounded-md bg-danger-surface p-3 text-[11px] font-bold text-theme-danger">
            {metaError}{" "}
            <button type="button" onClick={retryMeta} className="underline">
              다시 시도
            </button>
          </p>
        ) : null}
        <FormCard>
          <RequiredLabel>직군 및 직무</RequiredLabel>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <FieldGroup label="직군">
              <select
                value={form.categoryCode}
                onChange={(event) => {
                  const categoryCode = event.target.value;
                  setForm((current) => ({ ...current, categoryCode, roleCode: "" }));
                }}
                disabled={metaLoading || !form.categoryCode}
                className={fieldClassName}
              >
                <option value="">직군 선택</option>
                {jobCategories.map((item) => (
                  <option key={item.code} value={item.code}>{item.label}</option>
                ))}
              </select>
            </FieldGroup>
            <FieldGroup label="직무">
              <select
                value={form.roleCode}
                onChange={(event) => update("roleCode", event.target.value)}
                disabled={metaLoading}
                className={fieldClassName}
              >
                <option value="">직무 선택</option>
                {filteredJobRoles.map((item) => (
                  <option key={item.code} value={item.code}>{item.label}</option>
                ))}
              </select>
            </FieldGroup>
          </div>
          {showErrors && !(form.categoryCode && form.roleCode) ? (
            <ErrorText>직군과 직무를 선택해 주세요.</ErrorText>
          ) : null}
        </FormCard>
        <div className="grid gap-4 sm:grid-cols-2">
          <ChoiceCard
            title="근무 방식"
            valueCode={form.workStyleCode}
            options={workConditions?.workStyles ?? []}
            onChange={(option) => update("workStyleCode", option.code)}
          />
          <ChoiceCard
            title="근무 형태"
            valueCode={form.workFormCode}
            options={workConditions?.workForms ?? []}
            onChange={(option) => update("workFormCode", option.code)}
          />
        </div>
        <FormCard>
          <RequiredLabel>희망 급여</RequiredLabel>
          <p className="mt-1 text-[10px] text-theme-muted">
            만원 단위로 입력해 주세요. 최소 1만원입니다.
          </p>
          <div className="mt-2 grid grid-cols-[1fr_4fr] gap-2">
            <select
              value={form.payUnitCode}
              onChange={(event) => update("payUnitCode", event.target.value)}
              disabled={metaLoading}
              className={fieldClassName}
            >
              <option value="">단위 선택</option>
              {(workConditions?.payUnits ?? []).map((item) => (
                <option key={item.code} value={item.code}>{item.label}</option>
              ))}
            </select>
            <div className="grid grid-cols-[minmax(0,1fr)_72px] gap-2">
              <input
                value={form.pay}
                onChange={(event) =>
                  update("pay", formatNumber(event.target.value))
                }
                inputMode="numeric"
                className={`${fieldClassName} pr-12`}
                placeholder="1만원 이상 입력"
              />
              <span className="absolute right-3 top-[22px] text-[10px] text-theme-muted">
                만원
              </span>
            </div>
          </div>
          {Number(form.pay.replaceAll(",", "")) >= 1 ? (
            <p className="mt-2 text-[10px] font-semibold text-brand">
              입력 금액: {formatKoreanWon(Number(form.pay.replaceAll(",", "")) * 10_000)}
            </p>
          ) : null}
          {showErrors && Number(form.pay.replaceAll(",", "")) < 1 ? (
            <ErrorText>희망 급여를 1만원 이상 입력해 주세요.</ErrorText>
          ) : null}

          <div className="mt-4 border-t border-theme pt-4">
            <RequiredLabel>최저 수용 금액</RequiredLabel>
            <p className="mt-1 text-[10px] text-theme-muted">
              협상 시 수용 가능한 최소 금액입니다. 희망 급여 이하로, 만원 단위로 입력해 주세요.
            </p>
            <div className="mt-2 grid grid-cols-[minmax(0,1fr)_72px] gap-2">
              <input
                value={form.minPay}
                onChange={(event) =>
                  update("minPay", formatNumber(event.target.value))
                }
                inputMode="numeric"
                className={`${fieldClassName} pr-12`}
                placeholder="1만원 이상 입력"
              />
              <span className="absolute right-3 mt-2 text-[10px] text-theme-muted">
                만원
              </span>
            </div>
            {Number(form.minPay.replaceAll(",", "")) >= 1 ? (
              <p className="mt-2 text-[10px] font-semibold text-brand">
                입력 금액: {formatKoreanWon(Number(form.minPay.replaceAll(",", "")) * 10_000)}
              </p>
            ) : null}
            {showErrors && Number(form.minPay.replaceAll(",", "")) < 1 ? (
              <ErrorText>최저 수용 금액을 1만원 이상 입력해 주세요.</ErrorText>
            ) : showErrors &&
              Number(form.minPay.replaceAll(",", "")) > Number(form.pay.replaceAll(",", "")) ? (
              <ErrorText>최저 수용 금액은 희망 급여보다 클 수 없습니다.</ErrorText>
            ) : null}
          </div>
        </FormCard>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormCard>
            <RequiredLabel>프로젝트 시작 가능일</RequiredLabel>
            <input
              value={form.startDate}
              onChange={(event) => update("startDate", event.target.value)}
              disabled={form.startNegotiable}
              type="date"
              min={today}
              className={fieldClassName}
            />
            <label className="mt-3 flex cursor-pointer items-center gap-2 text-[10px]">
              <input
                checked={form.startNegotiable}
                onChange={(event) =>
                  update("startNegotiable", event.target.checked)
                }
                type="checkbox"
              />{" "}
              협의 가능
            </label>
          </FormCard>
          <FormCard>
            <RequiredLabel>프로젝트 예상 기간</RequiredLabel>
            <p className="mt-1 text-[10px] text-theme-muted">
              개월·주 모두 최대 24까지 입력할 수 있습니다.
            </p>
            <div className="grid grid-cols-[7fr_3fr] gap-2">
              <input
                value={form.period}
                onChange={(event) =>
                  update("period", digitsOnly(event.target.value).slice(0, 2))
                }
                inputMode="numeric"
                className={`${fieldClassName} mt-0`}
              />
              <select
                value={form.periodUnitCode}
                onChange={(event) => update("periodUnitCode", event.target.value)}
                disabled={metaLoading}
                className={`${fieldClassName} mt-0 px-2`}
              >
                {(workConditions?.periodUnits ?? []).map((item) => (
                  <option key={item.code} value={item.code}>{item.label}</option>
                ))}
              </select>
            </div>
            {showErrors &&
            !(Number(form.period) >= 1 && Number(form.period) <= 24) ? (
              <ErrorText>1~24 사이의 숫자를 입력해 주세요.</ErrorText>
            ) : null}
          </FormCard>
          <ChoiceCard
            title="프리랜서 경험"
            valueCode={form.freelanceExperience}
            options={[{ code: "있음", label: "있음" }, { code: "없음", label: "없음" }]}
            onChange={(option) => update("freelanceExperience", option.code)}
          />
          <FormCard>
            <RequiredLabel>전체 경력 연수</RequiredLabel>
            <p className="mt-1 text-[10px] text-theme-muted">
              최소 1년부터 입력할 수 있습니다.
            </p>
            <div className="relative">
              <input
                value={form.careerYears}
                onChange={(event) =>
                  update("careerYears", digitsOnly(event.target.value))
                }
                inputMode="numeric"
                className={`${fieldClassName} pr-10`}
                min="1"
              />
              <span className="pointer-events-none absolute right-3 top-[22px] text-[11px] font-semibold text-theme-secondary">년</span>
            </div>
            {showErrors && Number(form.careerYears) < 1 ? (
              <ErrorText>경력 연수는 1년 이상이어야 합니다.</ErrorText>
            ) : null}
          </FormCard>
        </div>
        <FormCard>
          <RequiredLabel>보유 스킬 및 숙련도</RequiredLabel>
          <p className="mt-1 text-[10px] text-theme-muted">
            스킬을 1개 이상 선택하고 각각 숙련도를 지정해 주세요.
          </p>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className={fieldClassName}
            placeholder="스킬 검색"
          />
          <div className="mt-3 flex max-h-40 flex-wrap gap-2 overflow-y-auto">
            {filteredSkills.map((skill) => {
              const selected = form.skills.some((item) => item.code === skill.code);
              return (
                <button
                  key={skill.code}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  aria-pressed={selected}
                  className={`rounded-full border px-3 py-1.5 text-[10px] font-bold ${selected ? "border-brand bg-brand text-brand-contrast" : "border-theme-strong"}`}
                >
                  {skill.label}
                </button>
              );
            })}
          </div>
          <div className="mt-4 space-y-2">
            {form.skills.map((skill) => (
              <div
                key={skill.code}
                className="flex items-center gap-2 rounded-md border border-theme bg-surface-subtle p-2"
              >
                <span className="min-w-0 flex-1 text-[11px] font-bold">
                  {labelOf(skillOptions, skill.code)}
                </span>
                <select
                  value={skill.levelCode}
                  onChange={(event) => {
                    const levelCode = event.target.value;
                    update(
                      "skills",
                      form.skills.map((item) =>
                        item.code === skill.code ? { ...item, levelCode } : item,
                      ),
                    );
                  }}
                  className="h-8 rounded-md border border-theme bg-surface px-2 text-[10px] outline-none hover:border-brand hover:outline-2 hover:outline-brand focus:border-brand focus:outline-2 focus:outline-brand"
                >
                  {(workConditions?.skillLevels ?? []).map((level) => (
                    <option key={level.code} value={level.code}>{level.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          {showErrors && form.skills.length === 0 ? (
            <ErrorText>보유 스킬을 1개 이상 선택해 주세요.</ErrorText>
          ) : null}
        </FormCard>
        {submitError ? (
          <p className="rounded-md bg-danger-surface p-3 text-[11px] font-bold text-theme-danger">
            {submitError}
          </p>
        ) : null}
        {showErrors && !isValid ? (
          <p className="rounded-md bg-danger-surface p-3 text-[11px] font-bold text-theme-danger">
            필수 항목을 확인해 주세요.
          </p>
        ) : null}
        <div className="flex justify-between pt-3">
          <Link
            href="/freelancer"
            className="rounded-md border border-theme bg-surface px-5 py-3 text-[12px] font-bold"
          >
            나가기
          </Link>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                sessionStorage.setItem(STORAGE_KEY, JSON.stringify(form))
              }
              className="rounded-md border border-theme bg-surface px-5 py-3 text-[12px] font-bold"
            >
              임시 저장
            </button>
            <button
              type="submit"
              disabled={submitting || metaLoading}
              className="rounded-md bg-brand px-6 py-3 text-[12px] font-bold text-brand-contrast disabled:opacity-60"
            >
              {submitting ? "저장 중..." : "다음 →"}
            </button>
          </div>
        </div>
      </form>
    </ProfileRegistrationShell>
  );
}

function labelOf(options: MetaOption[], code: string) {
  return options.find((option) => option.code === code)?.label ?? "";
}

function BenefitBanner() {
  return (
    <section className="rounded-[10px] border border-theme bg-surface p-5">
      <p className="text-[11px] font-extrabold text-brand">프로필 등록 혜택</p>
      <div className="mt-3 grid gap-2 text-[10px] font-semibold text-theme-secondary sm:grid-cols-3">
        <span>✓ 검증된 프로젝트 매칭</span>
        <span>✓ 표준 계약서 작성</span>
        <span>✓ AI 1:1 맞춤 매칭</span>
      </div>
      <p className="mt-3 text-[9px] text-theme-muted">
        완료 프로젝트와 평점에 따라 등급별 추가 혜택을 받을 수 있습니다.
      </p>
    </section>
  );
}
function ChoiceCard({
  title,
  valueCode,
  options,
  onChange,
}: {
  title: string;
  valueCode: string;
  options: MetaOption[];
  onChange: (option: MetaOption) => void;
}) {
  return (
    <FormCard>
      <RequiredLabel>{title}</RequiredLabel>
      <div className="mt-3 flex gap-2">
        {options.map((option) => (
          <button
            key={option.code}
            type="button"
            onClick={() => onChange(option)}
            className={`flex-1 rounded-md border px-2 py-2 text-[10px] font-bold ${valueCode === option.code ? "border-brand bg-surface-muted text-brand" : "border-theme"}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </FormCard>
  );
}
function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className={labelClassName}>
      {children}
      <span className="ml-1 text-theme-danger">*</span>
    </p>
  );
}
function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="text-[10px] font-semibold text-theme-muted">
      {label}
      {children}
    </label>
  );
}
function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <p data-form-error="true" className="mt-2 text-[10px] font-bold text-theme-danger">{children}</p>
  );
}
function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}
function formatNumber(value: string) {
  const digits = digitsOnly(value);
  return digits ? Number(digits).toLocaleString("ko-KR") : "";
}
function getTodayString() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
}
function loadStepOneDraft(): StepOneState {
  if (typeof window === "undefined") return initialState;
  const saved = sessionStorage.getItem(STORAGE_KEY);
  if (!saved) return initialState;
  try {
    return { ...initialState, ...JSON.parse(saved) };
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return initialState;
  }
}
function scrollToFirstError(form: HTMLFormElement | null) {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const error = form?.querySelector<HTMLElement>('[data-form-error="true"]');
    const section = error?.closest("section");
    if (!error || !section) return;
    section.scrollIntoView({ behavior: "smooth", block: "center" });
    section.querySelector<HTMLElement>("input:not(:disabled), select:not(:disabled), textarea:not(:disabled), button")?.focus({ preventScroll: true });
  }));
}
function formatKoreanWon(value: number) {
  const units = [[100_000_000, "억"], [10_000_000, "천만"], [1_000_000, "백만"], [100_000, "십만"], [10_000, "만"]] as const;
  let remaining = value;
  let result = "";
  for (const [unit, label] of units) {
    const count = Math.floor(remaining / unit);
    if (count > 0) { result += `${count === 1 ? "" : count.toLocaleString("ko-KR")}${label}`; remaining %= unit; }
  }
  return `${result || value.toLocaleString("ko-KR")}원`;
}
