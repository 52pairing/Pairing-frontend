"use client";

// Step 3 · 직군 모집
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";

import { ProjectRegisterShell } from "@/features/client/projects/components/ProjectRegisterShell";
import { ProjectRequiredLabel } from "@/features/client/projects/components/ProjectRequiredLabel";
import { ProjectStepNavigation } from "@/features/client/projects/components/ProjectStepNavigation";
import { nextStep, prevStep } from "@/features/client/projects/constants/steps";
import { useProjectRegister } from "@/features/client/projects/context/ProjectRegisterContext";
import type {
  JobCategory,
  ProjectRecruit,
} from "@/features/client/projects/types/project";

const STEP = 3;

const createRecruit = (id: number): ProjectRecruit => ({
  id,
  category: null,
  job: "",
  experience: 3,
  count: 1,
  skills: [],
});

export function ProjectRoles() {
  const router = useRouter();
  const { form, patch } = useProjectRegister();
  const prev = prevStep(STEP);
  const next = nextStep(STEP);

  const [recruits, setRecruits] = useState<ProjectRecruit[]>(
    form.recruits && form.recruits.length > 0
      ? form.recruits
      : [createRecruit(1)],
  );

  const totalCount = recruits.reduce((sum, item) => sum + item.count, 0);

  const isValid = recruits.every(
    (item) =>
      item.category &&
      item.job &&
      item.experience >= 1 &&
      item.count >= 1 &&
      item.skills.length > 0,
  );

  const updateRecruit = (id: number, changes: Partial<ProjectRecruit>) => {
    setRecruits((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );
  };

  const addRecruit = () => {
    setRecruits((prev) => [...prev, createRecruit(Date.now())]);
  };

  const removeRecruit = (id: number) => {
    if (recruits.length === 1) return;

    setRecruits((prev) => prev.filter((item) => item.id !== id));
  };

  const goPrev = () => {
    if (prev) router.push(prev.path);
  };

  const goNext = () => {
    if (!isValid || !next) return;

    // 입력값을 공용 Context에 저장 → 이후 스텝(검수·최종 확인)에서 사용
    patch({ recruits });

    router.push(next.path);
  };

  return (
    <ProjectRegisterShell currentStep={STEP} backHref="/client" backLabel="홈으로">
      <div className="mx-auto mt-12 max-w-[720px]">
        <header>
          <h1 className="text-[22px] font-extrabold tracking-[-0.04em] text-[#111827]">
            직군별 모집 인원 설정
          </h1>

          <p className="mt-2 text-[12px] font-medium text-[#667085]">
            모집이 필요한 직군과 조건을 직군별로 설정해주세요.
          </p>
        </header>

        {/* 총 모집 인원 */}
        <div className="mt-4 flex min-h-[40px] items-center rounded-[8px] border border-[#e1e6ec] bg-[#f7f8fa] px-4">
          <p className="text-[11px] font-bold text-[#344054]">
            총 모집 인원 {totalCount}명
          </p>

          {recruits.length > 1 && (
            <p className="ml-1 text-[11px] font-medium text-[#667085]">
              ·{" "}
              {recruits.map((item, index) => (
                <span key={item.id}>
                  {item.job || `모집 직군 ${index + 1}`} {item.count}명
                  {index !== recruits.length - 1 ? " · " : ""}
                </span>
              ))}
            </p>
          )}
        </div>

        {/* 모집 카드 */}
        <div className="mt-4 space-y-4">
          {recruits.map((recruit, index) => (
            <RecruitCard
              key={recruit.id}
              index={index}
              recruit={recruit}
              canDelete={recruits.length > 1}
              onChange={(changes) => updateRecruit(recruit.id, changes)}
              onDelete={() => removeRecruit(recruit.id)}
            />
          ))}
        </div>

        {/* 모집 직군 추가 */}
        <button
          type="button"
          onClick={addRecruit}
          className="flex h-[43px] w-full items-center justify-center gap-2 rounded-b-[10px] border border-t-0 border-[#e1e6ec] bg-white text-[11px] font-semibold text-[#667085] transition hover:bg-[#f8fafc]"
        >
          <span className="text-[18px] font-light">+</span>
          모집 직군 추가
        </button>
      </div>

      <ProjectStepNavigation
        onPrevious={goPrev}
        onNext={goNext}
        nextDisabled={!isValid}
      />
    </ProjectRegisterShell>
  );
}

function RecruitCard({
  index,
  recruit,
  canDelete,
  onChange,
  onDelete,
}: {
  index: number;
  recruit: ProjectRecruit;
  canDelete: boolean;
  onChange: (changes: Partial<ProjectRecruit>) => void;
  onDelete: () => void;
}) {
  const [skillInput, setSkillInput] = useState("");

  const jobs: string[] =
    recruit.category === "개발"
      ? [
          "프론트엔드 개발자",
          "백엔드 개발자",
          "풀스택 개발자",
          "모바일 개발자",
          "DevOps 엔지니어",
        ]
      : recruit.category === "디자인"
        ? [
            "UI/UX 디자이너",
            "웹 디자이너",
            "프로덕트 디자이너",
            "그래픽 디자이너",
          ]
        : [];

  const addSkill = () => {
    const value = skillInput.trim();

    if (!value) return;
    if (recruit.skills.includes(value)) return;

    onChange({ skills: [...recruit.skills, value] });

    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    onChange({ skills: recruit.skills.filter((item) => item !== skill) });
  };

  const selectCategory = (category: JobCategory) => {
    onChange({ category, job: "", skills: [] });
  };

  return (
    <section className="overflow-hidden rounded-[11px] border border-[#e1e6ec] bg-white">
      {/* 헤더 */}
      <div className="flex h-[46px] items-center justify-between bg-[#f5f6f8] px-5">
        <h2 className="text-[12px] font-extrabold text-[#111827]">
          모집 직군 {index + 1}
        </h2>

        {canDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="text-[10px] font-medium text-[#667085] hover:text-[#111827]"
          >
            삭제
          </button>
        )}
      </div>

      {/* 내용 */}
      <div className="grid gap-x-8 gap-y-6 px-5 py-6 md:grid-cols-2">
        {/* 직군 */}
        <div>
          <ProjectRequiredLabel>직군</ProjectRequiredLabel>

          <div className="mt-3 flex gap-2">
            <OptionButton
              selected={recruit.category === "개발"}
              onClick={() => selectCategory("개발")}
            >
              개발
            </OptionButton>

            <OptionButton
              selected={recruit.category === "디자인"}
              onClick={() => selectCategory("디자인")}
            >
              디자인
            </OptionButton>
          </div>
        </div>

        {/* 직무 */}
        <div>
          <ProjectRequiredLabel>직무</ProjectRequiredLabel>

          <div className="relative mt-3">
            <select
              value={recruit.job}
              disabled={!recruit.category}
              onChange={(e) => onChange({ job: e.target.value })}
              className={`h-[43px] w-full appearance-none rounded-[8px] border border-[#dce2e8] bg-white px-4 pr-10 text-[11px] font-semibold outline-none transition focus:border-[#17365d] ${
                recruit.job ? "text-[#111827]" : "text-[#98a2b3]"
              }`}
            >
              <option value="">
                {recruit.category ? "직무를 선택해주세요" : "직군을 먼저 선택"}
              </option>

              {jobs.map((job) => (
                <option key={job} value={job}>
                  {job}
                </option>
              ))}
            </select>

            <ChevronDownIcon />
          </div>
        </div>

        {/* 희망 경력 */}
        <div>
          <ProjectRequiredLabel>희망 경력</ProjectRequiredLabel>

          <div className="mt-3 flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={recruit.experience}
              onChange={(e) =>
                onChange({ experience: Math.max(1, Number(e.target.value)) })
              }
              className="h-[40px] w-[66px] rounded-[8px] border border-[#dce2e8] text-center text-[12px] font-bold text-[#344054] outline-none focus:border-[#17365d]"
            />

            <span className="text-[11px] font-semibold text-[#667085]">
              년 이상
            </span>
          </div>
        </div>

        {/* 모집 인원 */}
        <div>
          <ProjectRequiredLabel>모집 인원</ProjectRequiredLabel>

          <div className="mt-3 flex items-center gap-3">
            <CountButton
              onClick={() => onChange({ count: Math.max(1, recruit.count - 1) })}
            >
              −
            </CountButton>

            <span className="min-w-[18px] text-center text-[13px] font-bold text-[#111827]">
              {recruit.count}
            </span>

            <CountButton onClick={() => onChange({ count: recruit.count + 1 })}>
              +
            </CountButton>

            <span className="text-[11px] font-semibold text-[#667085]">명</span>
          </div>
        </div>

        {/* 요구 스킬 */}
        <div className="md:col-span-2">
          <ProjectRequiredLabel>요구 스킬</ProjectRequiredLabel>

          {recruit.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {recruit.skills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="flex h-[29px] items-center gap-2 rounded-[6px] border border-[#bfcfe1] bg-[#edf4fb] px-3 text-[10px] font-bold text-[#17365d]"
                >
                  {skill}

                  <span className="text-[#8898aa]">×</span>
                </button>
              ))}
            </div>
          )}

          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
            onBlur={addSkill}
            placeholder="스킬 검색 (예: React, Python...)"
            className="mt-3 h-[41px] w-full rounded-[8px] border border-[#dce2e8] px-4 text-[11px] font-semibold text-[#111827] outline-none placeholder:font-medium placeholder:text-[#98a2b3] focus:border-[#17365d]"
          />
        </div>
      </div>
    </section>
  );
}

function OptionButton({
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
      className={`flex h-[38px] min-w-[59px] items-center justify-center rounded-[8px] border px-4 text-[11px] font-semibold transition ${
        selected
          ? "border-[#17365d] bg-[#eef3f8] text-[#17365d]"
          : "border-[#dce2e8] bg-white text-[#667085] hover:bg-[#f8fafc]"
      }`}
    >
      {children}
    </button>
  );
}

function CountButton({
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
      className="flex h-[33px] w-[33px] items-center justify-center rounded-[8px] border border-[#dce2e8] bg-white text-[16px] font-bold text-[#111827] transition hover:bg-[#f8fafc]"
    >
      {children}
    </button>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#98a2b3]"
    >
      <path
        d="M3.5 5.5L7 9L10.5 5.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
