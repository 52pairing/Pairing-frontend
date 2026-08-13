"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FormCard,
  ProfileRegistrationShell,
  fieldClassName,
  labelClassName,
} from "./ProfileRegistrationShell";

const STORAGE_KEY = "pairing.freelancer.profile.step1";
const JOB_CATEGORIES = ["개발", "디자인"] as const;
const JOB_ROLES = [
  "프론트엔드 개발자",
  "백엔드 개발자",
  "풀스택 개발자",
  "웹 퍼블리셔",
  "iOS 개발자",
  "Android 개발자",
  "크로스플랫폼 개발자 (Flutter · React Native)",
  "데이터 엔지니어",
  "데이터 분석가",
  "AI · ML 엔지니어",
  "DevOps 엔지니어",
  "클라우드 · 인프라 엔지니어",
  "DBA (DB 관리자)",
  "보안 엔지니어",
  "게임 개발자 (Unity · Unreal)",
  "블록체인 개발자",
  "임베디드 · 하드웨어 개발자",
  "QA 엔지니어",
  "UX · UI 디자이너",
  "제품 디자이너 (Product Designer)",
  "웹 디자이너",
  "그래픽 디자이너",
  "BX · 브랜드 디자이너",
  "일러스트레이터",
  "모션 · 영상 디자이너",
  "3D 디자이너",
] as const;
const SKILLS = [
  "React",
  "Next.js",
  "Vue",
  "TypeScript",
  "JavaScript",
  "Angular",
  "Svelte",
  "Redux",
  "Tailwind",
  "Java",
  "Spring Boot",
  "Node.js",
  "NestJS",
  "Python",
  "Django",
  "FastAPI",
  "Go",
  "PHP",
  "Laravel",
  "C#/.NET",
  "Kotlin",
  "Swift",
  "Flutter",
  "React Native",
  "SQL",
  "Pandas",
  "TensorFlow",
  "PyTorch",
  "scikit-learn",
  "Spark",
  "LangChain",
  "MySQL",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "Oracle",
  "Elasticsearch",
  "AWS",
  "GCP",
  "Docker",
  "Kubernetes",
  "Jenkins",
  "GitHub Actions",
  "Terraform",
  "Nginx",
  "Linux",
  "Unity",
  "Unreal",
  "C++",
  "Solidity",
  "Figma",
  "Sketch",
  "Adobe XD",
  "Photoshop",
  "Illustrator",
  "After Effects",
  "Zeplin",
  "Git",
  "Jira",
  "Notion",
  "REST API",
  "GraphQL",
  "Swagger",
] as const;
type SkillLevel = "초급" | "중급" | "고급";
type SelectedSkill = { name: string; level: SkillLevel };
type StepOneState = {
  category: string;
  role: string;
  affiliation: string;
  workStyle: string;
  payUnit: string;
  pay: string;
  workForm: string;
  startDate: string;
  startNegotiable: boolean;
  period: string;
  periodUnit: string;
  freelanceExperience: string;
  careerYears: string;
  skills: SelectedSkill[];
};

const initialState: StepOneState = {
  category: "",
  role: "",
  affiliation: "",
  workStyle: "",
  payUnit: "월급",
  pay: "",
  workForm: "",
  startDate: getTodayString(),
  startNegotiable: false,
  period: "",
  periodUnit: "개월",
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

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);
  const update = <K extends keyof StepOneState>(
    key: K,
    value: StepOneState[K],
  ) => setForm((current) => ({ ...current, [key]: value }));
  const filteredSkills = useMemo(
    () =>
      SKILLS.filter((skill) =>
        skill.toLowerCase().includes(search.toLowerCase()),
      ).slice(0, search ? SKILLS.length : 12),
    [search],
  );
  const isValid = Boolean(
    form.category &&
    form.role &&
    form.workStyle &&
    Number(form.pay.replaceAll(",", "")) >= 1 &&
    form.workForm &&
    (form.startNegotiable || form.startDate >= today) &&
    Number(form.period) >= 1 &&
    Number(form.period) <= 24 &&
    form.freelanceExperience &&
    Number(form.careerYears) >= 1 &&
    form.skills.length >= 1,
  );
  const toggleSkill = (name: string) =>
    update(
      "skills",
      form.skills.some((skill) => skill.name === name)
        ? form.skills.filter((skill) => skill.name !== name)
        : [...form.skills, { name, level: "초급" }],
    );

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
          setShowErrors(true);
          if (isValid) router.push("/freelancer/mypage/resume");
          else scrollToFirstError(formRef.current);
        }}
      >
        <BenefitBanner />
        <FormCard>
          <RequiredLabel>직군 및 직무</RequiredLabel>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <FieldGroup label="직군">
              <select
                value={form.category}
                onChange={(event) => update("category", event.target.value)}
                className={fieldClassName}
              >
                <option value="">직군 선택</option>
                {JOB_CATEGORIES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </FieldGroup>
            <FieldGroup label="직무">
              <select
                value={form.role}
                onChange={(event) => update("role", event.target.value)}
                className={fieldClassName}
              >
                <option value="">직무 선택</option>
                {JOB_ROLES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </FieldGroup>
          </div>
          {showErrors && !(form.category && form.role) ? (
            <ErrorText>직군과 직무를 선택해 주세요.</ErrorText>
          ) : null}
        </FormCard>
        <FormCard>
          <label className={labelClassName}>소속</label>
          <p className="mt-1 text-[10px] text-theme-muted">
            프리랜서는 개인만 등록할 수 있으며 팀 등록은 지원하지 않습니다.
          </p>
          <input
            value={form.affiliation}
            onChange={(event) => update("affiliation", event.target.value)}
            className={fieldClassName}
            placeholder="예: 개인 프리랜서, 현재 소속 없음"
          />
        </FormCard>
        <div className="grid gap-4 sm:grid-cols-2">
          <ChoiceCard
            title="근무 방식"
            value={form.workStyle}
            choices={["재택", "상주", "모두가능"]}
            onChange={(value) => update("workStyle", value)}
          />
          <ChoiceCard
            title="근무 형태"
            value={form.workForm}
            choices={["풀타임", "파트타임", "모두가능"]}
            onChange={(value) => update("workForm", value)}
          />
        </div>
        <FormCard>
          <RequiredLabel>희망 급여</RequiredLabel>
          <p className="mt-1 text-[10px] text-theme-muted">
            만원 단위로 입력해 주세요. 최소 1만원입니다.
          </p>
          <div className="mt-2 grid grid-cols-[1fr_4fr] gap-2">
            <select
              value={form.payUnit}
              onChange={(event) => update("payUnit", event.target.value)}
              className={fieldClassName}
            >
              {["시급", "일급", "월급"].map((item) => (
                <option key={item}>{item}</option>
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
                value={form.periodUnit}
                onChange={(event) => update("periodUnit", event.target.value)}
                className={`${fieldClassName} mt-0 px-2`}
              >
                <option>개월</option>
                <option>주</option>
              </select>
            </div>
            {showErrors &&
            !(Number(form.period) >= 1 && Number(form.period) <= 24) ? (
              <ErrorText>1~24 사이의 숫자를 입력해 주세요.</ErrorText>
            ) : null}
          </FormCard>
          <ChoiceCard
            title="프리랜서 경험"
            value={form.freelanceExperience}
            choices={["있음", "없음"]}
            onChange={(value) => update("freelanceExperience", value)}
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
              const selected = form.skills.some((item) => item.name === skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  aria-pressed={selected}
                  className={`rounded-full border px-3 py-1.5 text-[10px] font-bold ${selected ? "border-brand bg-brand text-brand-contrast" : "border-theme-strong"}`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
          <div className="mt-4 space-y-2">
            {form.skills.map((skill) => (
              <div
                key={skill.name}
                className="flex items-center gap-2 rounded-md border border-theme bg-surface-subtle p-2"
              >
                <span className="min-w-0 flex-1 text-[11px] font-bold">
                  {skill.name}
                </span>
                <select
                  value={skill.level}
                  onChange={(event) =>
                    update(
                      "skills",
                      form.skills.map((item) =>
                        item.name === skill.name
                          ? { ...item, level: event.target.value as SkillLevel }
                          : item,
                      ),
                    )
                  }
                  className="h-8 rounded-md border border-theme bg-surface px-2 text-[10px] outline-none hover:border-brand hover:outline-2 hover:outline-brand focus:border-brand focus:outline-2 focus:outline-brand"
                >
                  <option>초급</option>
                  <option>중급</option>
                  <option>고급</option>
                </select>
              </div>
            ))}
          </div>
          {showErrors && form.skills.length === 0 ? (
            <ErrorText>보유 스킬을 1개 이상 선택해 주세요.</ErrorText>
          ) : null}
        </FormCard>
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
              className="rounded-md bg-brand px-6 py-3 text-[12px] font-bold text-brand-contrast"
            >
              다음 →
            </button>
          </div>
        </div>
      </form>
    </ProfileRegistrationShell>
  );
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
  value,
  choices,
  onChange,
}: {
  title: string;
  value: string;
  choices: string[];
  onChange: (value: string) => void;
}) {
  return (
    <FormCard>
      <RequiredLabel>{title}</RequiredLabel>
      <div className="mt-3 flex gap-2">
        {choices.map((choice) => (
          <button
            key={choice}
            type="button"
            onClick={() => onChange(choice)}
            className={`flex-1 rounded-md border px-2 py-2 text-[10px] font-bold ${value === choice ? "border-brand bg-surface-muted text-brand" : "border-theme"}`}
          >
            {choice}
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
