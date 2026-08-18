"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { ApiException } from "@/lib/api";
import {
  getFreelancerJobCategories,
  getFreelancerJobRoles,
  getFreelancerResume,
  getFreelancerResumeDraft,
  getFreelancerSkills,
  getFreelancerWorkConditions,
  updateFreelancerResume,
  updateFreelancerResumeDraft,
} from "@/features/freelancer/mypage/services/freelancerResume";
import { getFreelancerProfile } from "@/features/freelancer/mypage/services/freelancerProfile";
import type {
  MetaOption,
  WorkConditionsMeta,
} from "@/features/freelancer/mypage/types/resume";
import {
  blankConditionForm,
  buildConditionPayload,
  buildResumePayload,
  emptyDraft,
  isResumeDraft,
  mapApiToDraft,
  mapConditionToForm,
  type ConditionForm,
  type ResumeDraft,
} from "@/features/freelancer/mypage/utils/resumeFormData";
import {
  ErrorText,
  ResumeSaveStatus,
  scrollToFirstError,
} from "./ResumeFormControls";
import { CompleteScreen, ReviewScreen } from "./ResumeReviewScreen";
import { ProfileRegistrationShell } from "./ProfileRegistrationShell";
import {
  ResumeAgreementsSection,
  ResumeBasicInfoSection,
  ResumeCareerSection,
  ResumeCertificateSection,
  ResumeConditionSection,
  ResumeEducationSection,
  ResumeLinksSection,
  ResumePortfolioSection,
  ResumeSelfIntroSection,
} from "./ResumeFormSections";

type Screen = "form" | "review" | "complete";

export function FreelancerResumeRegistration() {
  const currentUser = useCurrentUser();
  const formRef = useRef<HTMLFormElement>(null);
  const [screen, setScreen] = useState<Screen>("form");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [draft, setDraft] = useState<ResumeDraft>(emptyDraft);
  const [conditionForm, setConditionForm] =
    useState<ConditionForm>(blankConditionForm);
  const [notice, setNotice] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [draftSaving, setDraftSaving] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");
  const [hasSavedResume, setHasSavedResume] = useState(false);
  const [accountBirthDate, setAccountBirthDate] = useState<string | null>(null);

  const [jobCategories, setJobCategories] = useState<MetaOption[]>([]);
  const [jobRoles, setJobRoles] = useState<MetaOption[]>([]);
  const [skillOptions, setSkillOptions] = useState<MetaOption[]>([]);
  const [workConditionsMeta, setWorkConditionsMeta] =
    useState<WorkConditionsMeta | null>(null);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState("");
  const name = currentUser?.name ?? "회원정보 확인 중";
  const effectiveEmail = draft.email || currentUser?.email || "";
  const photoUrl = draft.profileImagePreview || draft.profileImageUrl || "";
  const hasProfileImage = Boolean(
    draft.profileImageFileId || draft.profileImageUrl,
  );
  const hasPortfolio = Boolean(draft.portfolioFileId || draft.portfolioUrl);

  const fetchConditionMeta = useCallback(
    () =>
      Promise.all([
        getFreelancerJobCategories(),
        getFreelancerJobRoles(),
        getFreelancerSkills(),
        getFreelancerWorkConditions(),
      ])
        .then(([categories, roles, skills, meta]) => {
          setJobCategories(categories);
          setJobRoles(roles);
          setSkillOptions(skills);
          setWorkConditionsMeta(meta);
        })
        .catch(() =>
          setMetaError(
            "직군·직무·스킬 정보를 불러오지 못했습니다. 다시 시도해 주세요.",
          ),
        )
        .finally(() => setMetaLoading(false)),
    [],
  );

  useEffect(() => {
    void fetchConditionMeta();
  }, [fetchConditionMeta]);

  useEffect(() => {
    getFreelancerProfile()
      .then((profile) => setAccountBirthDate(profile.birthDate))
      .catch(() => null);
  }, []);

  useEffect(() => {
    let active = true;
    getFreelancerResume()
      .then(async (detail) => {
        if (!active) return;
        if (detail.condition)
          setConditionForm(mapConditionToForm(detail.condition));
        setNotice(detail.notice ?? "");
        if (detail.resume) {
          setDraft(mapApiToDraft(detail.resume));
          setHasSavedResume(true);
          setScreen("review");
          return;
        }
        const draftResponse = await getFreelancerResumeDraft().catch(
          () => null,
        );
        if (active && draftResponse && isResumeDraft(draftResponse.payload)) {
          setDraft(draftResponse.payload);
        }
      })
      .catch(() => {
        if (active)
          setLoadError(
            "이력서 정보를 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const update = useCallback(
    <K extends keyof ResumeDraft,>(key: K, value: ResumeDraft[K]) =>
      setDraft((current) => ({ ...current, [key]: value })),
    [],
  );

  const filteredJobRoles = useMemo(
    () =>
      jobRoles.filter((role) => role.parentCode === conditionForm.categoryCode),
    [conditionForm.categoryCode, jobRoles],
  );
  const filteredSkills = useMemo(
    () => {
      const selectedCodes = new Set(
        conditionForm.skills.map((skill) => skill.code),
      );
      return skillOptions.filter((skill) => !selectedCodes.has(skill.code));
    },
    [conditionForm.skills, skillOptions],
  );
  const toggleSkill = useCallback(
    (option: MetaOption) =>
      setConditionForm((current) => ({
        ...current,
        skills: current.skills.some((skill) => skill.code === option.code)
          ? current.skills.filter((skill) => skill.code !== option.code)
          : [
              ...current.skills,
              {
                code: option.code,
                levelCode: workConditionsMeta?.skillLevels[0]?.code ?? "",
              },
            ],
      })),
    [workConditionsMeta?.skillLevels],
  );

  const educationsValid = draft.educations.every(
    (item) => item.schoolName.trim() && item.startYear && item.startMonth,
  );
  const careersValid = draft.careers.every(
    (item) => item.companyName.trim() && item.startYear && item.startMonth,
  );
  const certificatesValid = draft.certificates.every(
    (item) => item.acquiredDate.trim() && item.name.trim(),
  );
  const conditionValid = Boolean(
    conditionForm.categoryCode &&
    conditionForm.roleCode &&
    conditionForm.workStyleCode &&
    conditionForm.workFormCode &&
    conditionForm.payUnitCode &&
    Number(conditionForm.pay.replaceAll(",", "")) >= 1 &&
    conditionForm.periodUnitCode &&
    conditionForm.freelanceExperience &&
    conditionForm.skills.length >= 1 &&
    conditionForm.skills.every((skill) => skill.levelCode),
  );
  const agreementsValid = Object.values(draft.agreements).every(Boolean);
  const agreementsGate = hasSavedResume || agreementsValid;
  const isValid = Boolean(
    name.trim() &&
    hasProfileImage &&
    draft.phone.trim() &&
    effectiveEmail.trim() &&
    draft.address.trim() &&
    educationsValid &&
    careersValid &&
    certificatesValid &&
    draft.summary.trim() &&
    hasPortfolio &&
    agreementsGate &&
    conditionValid,
  );

  const review = async () => {
    if (!isValid) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setSubmitError("");
    setSubmitting(true);
    try {
      await updateFreelancerResume(
        buildResumePayload(draft, conditionForm, effectiveEmail),
      );
      setHasSavedResume(true);
      setScreen("review");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitError(
        error instanceof ApiException
          ? error.message
          : "이력서 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const saveDraft = async () => {
    setDraftSaving(true);
    setDraftMessage("");
    try {
      await updateFreelancerResumeDraft(draft);
      setDraftMessage("임시 저장되었습니다.");
    } catch {
      setDraftMessage("임시 저장에 실패했습니다.");
    } finally {
      setDraftSaving(false);
    }
  };

  if (loading) {
    return (
      <ProfileRegistrationShell
        step={2}
        title="내 이력서"
        description="이력서 정보를 불러오는 중입니다."
      >
        <p className="rounded-lg border border-theme bg-surface p-8 text-center text-[12px] text-theme-secondary">
          불러오는 중...
        </p>
      </ProfileRegistrationShell>
    );
  }

  if (screen === "complete")
    return <CompleteScreen name={name} onView={() => setScreen("review")} />;
  if (screen === "review")
    return (
      <ReviewScreen
        name={name}
        birthDate={accountBirthDate}
        phone={draft.phone}
        email={effectiveEmail}
        draft={draft}
        photoUrl={photoUrl}
        condition={conditionValid ? buildConditionPayload(conditionForm) : null}
        jobCategories={jobCategories}
        jobRoles={jobRoles}
        skillOptions={skillOptions}
        workConditionsMeta={workConditionsMeta}
        notice={notice}
        onEdit={() => {
          setScreen("form");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    );

  return (
    <ProfileRegistrationShell
      step={2}
      title={hasSavedResume ? "내 이력서 수정" : "이력서 등록"}
      description={
        hasSavedResume
          ? "이력서와 포트폴리오 정보를 수정합니다."
          : "희망 조건과 이력서, 포트폴리오를 등록해 주세요."
      }
    >
      <form
        ref={formRef}
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void review();
          if (!isValid) scrollToFirstError(formRef.current);
        }}
      >
        {hasSavedResume ? (
          <ResumeSaveStatus notice={notice} />
        ) : (
          <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-[11px] font-semibold leading-5 text-blue-700">
            아직 등록된 이력서가 없어 처음 작성하는 화면입니다. 아래 정보를
            입력하고 저장하면 이력서가 등록됩니다.
          </p>
        )}
        {loadError ? <ErrorText>{loadError}</ErrorText> : null}

        <ResumeBasicInfoSection
          draft={draft}
          update={update}
          name={name}
          accountBirthDate={accountBirthDate}
          effectiveEmail={effectiveEmail}
          showErrors={showErrors}
          hasProfileImage={hasProfileImage}
        />

        <ResumeConditionSection
          conditionForm={conditionForm}
          setConditionForm={setConditionForm}
          metaLoading={metaLoading}
          setMetaLoading={setMetaLoading}
          metaError={metaError}
          setMetaError={setMetaError}
          fetchConditionMeta={fetchConditionMeta}
          jobCategories={jobCategories}
          filteredJobRoles={filteredJobRoles}
          workConditionsMeta={workConditionsMeta}
          filteredSkills={filteredSkills}
          skillOptions={skillOptions}
          toggleSkill={toggleSkill}
          showErrors={showErrors}
        />

        <ResumeEducationSection
          educations={draft.educations}
          update={update}
          showErrors={showErrors}
          valid={educationsValid}
        />

        <ResumeCareerSection
          careers={draft.careers}
          update={update}
          showErrors={showErrors}
          valid={careersValid}
        />

        <ResumeCertificateSection
          certificates={draft.certificates}
          update={update}
          showErrors={showErrors}
          valid={certificatesValid}
        />

        <ResumeSelfIntroSection
          summary={draft.summary}
          update={update}
          showErrors={showErrors}
        />

        <ResumePortfolioSection
          draft={draft}
          update={update}
          showErrors={showErrors}
          hasPortfolio={hasPortfolio}
        />

        <ResumeLinksSection links={draft.links} update={update} />

        <ResumeAgreementsSection
          draft={draft}
          update={update}
          showErrors={showErrors}
          agreementsGate={agreementsGate}
          hasSavedResume={hasSavedResume}
        />

        {submitError ? <ErrorText>{submitError}</ErrorText> : null}
        {draftMessage ? (
          <p className="text-[10px] font-semibold text-theme-secondary">
            {draftMessage}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setScreen("review")}
            className="rounded-md border border-theme bg-surface px-5 py-3 text-[12px] font-bold"
          >
            수정 취소
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void saveDraft()}
              disabled={draftSaving}
              className="rounded-md border border-theme bg-surface px-5 py-3 text-[12px] font-bold disabled:opacity-60"
            >
              {draftSaving ? "저장 중..." : "임시 저장"}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-brand px-6 py-3 text-[12px] font-bold text-brand-contrast hover:bg-brand-hover disabled:opacity-60"
            >
              {submitting ? "저장 중..." : "변경사항 저장"}
            </button>
          </div>
        </div>
      </form>
    </ProfileRegistrationShell>
  );
}
