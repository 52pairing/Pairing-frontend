"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { ProjectRegisterShell } from "@/features/client/projects/components/ProjectRegisterShell";
import { ProjectRequiredLabel } from "@/features/client/projects/components/ProjectRequiredLabel";
import { ProjectStepNavigation } from "@/features/client/projects/components/ProjectStepNavigation";
import { nextStep, prevStep } from "@/features/client/projects/constants/steps";
import { useProjectRegister } from "@/features/client/projects/context/ProjectRegisterContext";
import {
  getProjectJobCategories,
  getProjectJobRoles,
  getProjectSkills,
} from "@/features/client/projects/services/projectPreReview";
import type {
  ProjectJobRoleOption,
  ProjectMetaOption,
} from "@/features/client/projects/types/preReview";
import type { ProjectRecruit } from "@/features/client/projects/types/project";

const STEP = 3;
const MAX_RECRUITS = 100;
const MAX_EXPERIENCE = 50;
const MAX_HEADCOUNT = 50;
const MAX_SKILLS = 63;

const createRecruit = (id: number): ProjectRecruit => ({
  id,
  category: null,
  job: "",
  experience: 3,
  count: 1,
  skills: [],
  skillLabels: {},
});

interface ProjectRecruitMeta {
  categories: ProjectMetaOption[];
  jobRoles: ProjectJobRoleOption[];
  skills: ProjectMetaOption[];
}

/** 모집 조건 메타(직군·직무·스킬) 3종을 한 번에 조회 */
const fetchRecruitMeta = () =>
  Promise.all([
    getProjectJobCategories(),
    getProjectJobRoles(),
    getProjectSkills(),
  ]);

export function ProjectRoles() {
  const router = useRouter();
  const { form, patch } = useProjectRegister();
  const prev = prevStep(STEP);
  const next = nextStep(STEP);
  const [recruits, setRecruits] = useState<ProjectRecruit[]>(
    form.recruits?.length ? form.recruits : [createRecruit(1)],
  );
  const [meta, setMeta] = useState<ProjectRecruitMeta | null>(null);
  const [metaError, setMetaError] = useState("");

  const applyMeta = (
    categories: ProjectMetaOption[],
    jobRoles: ProjectJobRoleOption[],
    skills: ProjectMetaOption[],
  ) => {
    setMeta({ categories, jobRoles, skills });
    setRecruits((current) =>
      current.map((recruit) => ({
        ...recruit,
        categoryLabel:
          categories.find((item) => item.code === recruit.category)?.label ??
          recruit.categoryLabel,
        jobLabel:
          jobRoles.find((item) => item.code === recruit.job)?.label ??
          recruit.jobLabel,
        skillLabels: Object.fromEntries(
          recruit.skills.map((code) => [
            code,
            skills.find((item) => item.code === code)?.label ??
              recruit.skillLabels?.[code] ??
              code,
          ]),
        ),
      })),
    );
  };

  const loadMeta = async () => {
    setMetaError("");
    try {
      const [categories, jobRoles, skills] = await fetchRecruitMeta();
      applyMeta(categories, jobRoles, skills);
    } catch (error) {
      setMetaError(error instanceof Error ? error.message : "모집 조건 선택지를 불러오지 못했습니다.");
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetchRecruitMeta()
      .then(([categories, jobRoles, skills]) => {
        if (!cancelled) applyMeta(categories, jobRoles, skills);
      })
      .catch((error) => {
        if (!cancelled) setMetaError(error instanceof Error ? error.message : "모집 조건 선택지를 불러오지 못했습니다.");
      });
    return () => { cancelled = true; };
  }, []);

  const isValid =
    meta !== null &&
    recruits.length >= 1 &&
    recruits.length <= MAX_RECRUITS &&
    recruits.every(
      (item) =>
        item.category &&
        item.job &&
        item.experience >= 1 &&
        item.experience <= MAX_EXPERIENCE &&
        item.count >= 1 &&
        item.count <= MAX_HEADCOUNT &&
        item.skills.length >= 1 &&
        item.skills.length <= MAX_SKILLS,
    );

  const updateRecruit = (id: number, changes: Partial<ProjectRecruit>) => {
    setRecruits((current) =>
      current.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );
  };

  const goNext = () => {
    if (!isValid || !next) return;
    patch({ recruits });
    router.push(next.path);
  };

  return (
    <ProjectRegisterShell currentStep={STEP} backHref="/client" backLabel="홈으로">
      <div className="mx-auto mt-12 max-w-[720px]">
        <header>
          <h1 className="text-[22px] font-extrabold tracking-[-0.04em] text-[#111827]">직군별 모집 인원 설정</h1>
          <p className="mt-2 text-[12px] font-medium text-[#667085]">모집이 필요한 직군과 조건을 직군별로 설정해주세요.</p>
        </header>

        <div className="mt-4 flex min-h-[40px] items-center rounded-[8px] border border-[#e1e6ec] bg-[#f7f8fa] px-4">
          <p className="text-[11px] font-bold text-[#344054]">총 모집 인원 {recruits.reduce((sum, item) => sum + item.count, 0)}명</p>
        </div>

        {metaError ? (
          <div className="mt-4 flex items-center justify-between rounded-[8px] border border-[#fda29b] bg-[#fff5f4] px-4 py-3">
            <p className="text-[11px] font-semibold text-[#b42318]">{metaError}</p>
            <button type="button" onClick={() => void loadMeta()} className="text-[11px] font-bold text-[#b42318] underline">다시 시도</button>
          </div>
        ) : null}

        <div className="mt-4 space-y-4">
          {recruits.map((recruit, index) => (
            <RecruitCard
              key={recruit.id}
              index={index}
              recruit={recruit}
              meta={meta}
              canDelete={recruits.length > 1}
              onChange={(changes) => updateRecruit(recruit.id, changes)}
              onDelete={() => setRecruits((current) => current.filter((item) => item.id !== recruit.id))}
            />
          ))}
        </div>

        <button
          type="button"
          disabled={!meta || recruits.length >= MAX_RECRUITS}
          onClick={() => setRecruits((current) => [...current, createRecruit(Date.now())])}
          className="flex h-[43px] w-full items-center justify-center gap-2 rounded-b-[10px] border border-t-0 border-[#e1e6ec] bg-white text-[11px] font-semibold text-[#667085] transition hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:bg-[#f8fafc] disabled:text-[#b8c0cc]"
        >
          <span className="text-[18px] font-light">+</span> 모집 직군 추가
        </button>
      </div>

      <ProjectStepNavigation
        onPrevious={() => prev && router.push(prev.path)}
        onNext={goNext}
        nextDisabled={!isValid}
      />
    </ProjectRegisterShell>
  );
}

function RecruitCard({ index, recruit, meta, canDelete, onChange, onDelete }: {
  index: number;
  recruit: ProjectRecruit;
  meta: ProjectRecruitMeta | null;
  canDelete: boolean;
  onChange: (changes: Partial<ProjectRecruit>) => void;
  onDelete: () => void;
}) {
  const [skillInput, setSkillInput] = useState("");
  const [isSkillListOpen, setIsSkillListOpen] = useState(false);
  const jobs = meta?.jobRoles.filter((job) => job.parentCode === recruit.category) ?? [];
  const normalizedQuery = skillInput.trim().toLocaleLowerCase("ko-KR");
  const filteredSkills = (meta?.skills ?? []).filter(
    (skill) =>
      !recruit.skills.includes(skill.code) &&
      (!normalizedQuery ||
        skill.label.toLocaleLowerCase("ko-KR").includes(normalizedQuery) ||
        skill.code.toLocaleLowerCase("ko-KR").includes(normalizedQuery)),
  );

  const selectSkill = (skill: ProjectMetaOption) => {
    if (recruit.skills.length >= MAX_SKILLS) return;
    onChange({
      skills: [...recruit.skills, skill.code],
      skillLabels: { ...recruit.skillLabels, [skill.code]: skill.label },
    });
    setSkillInput("");
    setIsSkillListOpen(true);
  };

  return (
    <section className="overflow-visible rounded-[11px] border border-[#e1e6ec] bg-white">
      <div className="flex h-[46px] items-center justify-between rounded-t-[11px] bg-[#f5f6f8] px-5">
        <h2 className="text-[12px] font-extrabold text-[#111827]">모집 직군 {index + 1}</h2>
        {canDelete ? <button type="button" onClick={onDelete} className="text-[10px] font-medium text-[#667085]">삭제</button> : null}
      </div>
      <div className="grid gap-x-8 gap-y-6 px-5 py-6 md:grid-cols-2">
        <Field label="직군">
          <div className="flex flex-wrap gap-2">
            {meta?.categories.map((category) => (
              <OptionButton
                key={category.code}
                selected={recruit.category === category.code}
                onClick={() => onChange({ category: category.code, categoryLabel: category.label, job: "", jobLabel: undefined })}
              >{category.label}</OptionButton>
            ))}
          </div>
        </Field>

        <Field label="직무">
          <select
            value={recruit.job}
            disabled={!recruit.category || !meta}
            onChange={(event) => {
              const option = jobs.find((item) => item.code === event.target.value);
              onChange({ job: option?.code ?? "", jobLabel: option?.label });
            }}
            className="h-[43px] w-full rounded-[8px] border border-[#dce2e8] bg-white px-4 text-[11px] font-semibold outline-none"
          >
            <option value="">{recruit.category ? "직무를 선택해주세요" : "직군을 먼저 선택"}</option>
            {jobs.map((job) => <option key={job.code} value={job.code}>{job.label}</option>)}
          </select>
        </Field>

        <Field label="희망 경력">
          <div className="flex items-center gap-2">
            <input type="number" min={1} max={MAX_EXPERIENCE} value={recruit.experience} onChange={(e) => onChange({ experience: Math.min(MAX_EXPERIENCE, Math.max(1, Number(e.target.value))) })} className="h-[40px] w-[66px] rounded-[8px] border border-[#dce2e8] text-center text-[12px] font-bold outline-none" />
            <span className="text-[11px] font-semibold text-[#667085]">년 이상</span>
          </div>
        </Field>

        <Field label="모집 인원">
          <div className="flex items-center gap-3">
            <CountButton onClick={() => onChange({ count: Math.max(1, recruit.count - 1) })}>−</CountButton>
            <span className="min-w-[18px] text-center text-[13px] font-bold">{recruit.count}</span>
            <CountButton onClick={() => onChange({ count: Math.min(MAX_HEADCOUNT, recruit.count + 1) })}>+</CountButton>
            <span className="text-[11px] font-semibold text-[#667085]">명</span>
          </div>
        </Field>

        <div className="md:col-span-2">
          <ProjectRequiredLabel>요구 스킬</ProjectRequiredLabel>
          {recruit.skills.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {recruit.skills.map((code) => (
                <button key={code} type="button" onClick={() => onChange({ skills: recruit.skills.filter((item) => item !== code) })} className="flex h-[29px] items-center gap-2 rounded-[6px] border border-[#bfcfe1] bg-[#edf4fb] px-3 text-[10px] font-bold text-[#17365d]">
                  {recruit.skillLabels?.[code] ?? code}<span className="text-[#8898aa]">×</span>
                </button>
              ))}
            </div>
          ) : null}
          <div className="relative mt-3">
            <input
              type="text"
              value={skillInput}
              disabled={!meta || recruit.skills.length >= MAX_SKILLS}
              onFocus={() => setIsSkillListOpen(true)}
              onBlur={() => setIsSkillListOpen(false)}
              onChange={(e) => { setSkillInput(e.target.value); setIsSkillListOpen(true); }}
              placeholder="스킬 검색 (예: React, Python...)"
              className="h-[41px] w-full rounded-[8px] border border-[#dce2e8] px-4 text-[11px] font-semibold outline-none disabled:bg-[#f8fafc]"
            />
            {isSkillListOpen && filteredSkills.length ? (
              <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-[8px] border border-[#dce2e8] bg-white py-1 shadow-lg">
                {filteredSkills.map((skill) => (
                  <button key={skill.code} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => selectSkill(skill)} className="block w-full px-4 py-2 text-left text-[11px] font-semibold hover:bg-[#f4f7fa]">{skill.label}</button>
                ))}
              </div>
            ) : null}
          </div>
          <p className="mt-2 text-[10px] text-[#98a2b3]">필수 1개 · 최대 {MAX_SKILLS}개</p>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div><ProjectRequiredLabel>{label}</ProjectRequiredLabel><div className="mt-3">{children}</div></div>;
}
function OptionButton({ children, selected, onClick }: { children: ReactNode; selected: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`flex h-[38px] min-w-[59px] items-center justify-center rounded-[8px] border px-4 text-[11px] font-semibold ${selected ? "border-[#17365d] bg-[#eef3f8] text-[#17365d]" : "border-[#dce2e8] bg-white text-[#667085]"}`}>{children}</button>;
}
function CountButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex h-[33px] w-[33px] items-center justify-center rounded-[8px] border border-[#dce2e8] bg-white text-[16px] font-bold">{children}</button>;
}
