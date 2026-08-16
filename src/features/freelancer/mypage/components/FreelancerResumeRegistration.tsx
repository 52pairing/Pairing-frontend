"use client";

import { FileText, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatPhoneNumber } from "@/features/auth/utils/formatPhoneNumber";
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
import { uploadFreelancerFile } from "@/features/freelancer/mypage/services/freelancerFiles";
import type {
  CampusType,
  GraduationStatus,
  MetaOption,
  WorkConditionsMeta,
} from "@/features/freelancer/mypage/types/resume";
import {
  CAMPUS_TYPE_OPTIONS,
  GRADUATION_STATUS_OPTIONS,
  MAX_PORTFOLIO_SIZE,
  MAX_PROFILE_IMAGE_SIZE,
  blankCareer,
  blankCertificate,
  blankConditionForm,
  blankEducation,
  buildConditionPayload,
  buildResumePayload,
  createProfileImagePreview,
  digitsOnly,
  emptyDraft,
  formatNumber,
  isResumeDraft,
  labelOf,
  mapApiToDraft,
  mapConditionToForm,
  type CareerForm,
  type CertificateForm,
  type ConditionForm,
  type EducationForm,
  type ResumeDraft,
} from "@/features/freelancer/mypage/utils/resumeFormData";
import {
  AddButton,
  AgreementCheckbox,
  CardTitle,
  CompactField,
  ConditionChoice,
  EntryBox,
  ErrorText,
  Field,
  ResumeSaveStatus,
  YearMonthSelect,
  compactInputClassName,
  scrollToFirstError,
} from "./ResumeFormControls";
import { CompleteScreen, ReviewScreen } from "./ResumeReviewScreen";
import {
  FormCard,
  ProfileRegistrationShell,
  fieldClassName,
} from "./ProfileRegistrationShell";

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
  const [profileImageError, setProfileImageError] = useState("");
  const [portfolioError, setPortfolioError] = useState("");
  const [profileImageUploading, setProfileImageUploading] = useState(false);
  const [portfolioUploading, setPortfolioUploading] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [linkInput, setLinkInput] = useState("");
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
  const [skillSearch, setSkillSearch] = useState("");

  const name = currentUser?.name ?? "회원정보 확인 중";
  const effectiveEmail = draft.email || currentUser?.email || "";
  const photoUrl = draft.profileImagePreview || draft.profileImageUrl || "";
  const hasProfileImage = Boolean(
    draft.profileImageFileId || draft.profileImageUrl,
  );
  const hasPortfolio = Boolean(draft.portfolioFileId || draft.portfolioUrl);

  const fetchConditionMeta = () =>
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
      .finally(() => setMetaLoading(false));

  useEffect(() => {
    void fetchConditionMeta();
  }, []);

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

  const update = <K extends keyof ResumeDraft>(key: K, value: ResumeDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const updateEducation = (id: string, patch: Partial<EducationForm>) =>
    setDraft((current) => ({
      ...current,
      educations: current.educations.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    }));
  const updateCareer = (id: string, patch: Partial<CareerForm>) =>
    setDraft((current) => ({
      ...current,
      careers: current.careers.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    }));
  const updateCertificate = (id: string, patch: Partial<CertificateForm>) =>
    setDraft((current) => ({
      ...current,
      certificates: current.certificates.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    }));

  const addLink = (url: string, clear: () => void) => {
    const normalized = url.trim();
    if (!/^https?:\/\//i.test(normalized)) {
      setLinkError("http:// 또는 https://로 시작하는 링크를 입력해 주세요.");
      return;
    }
    if (draft.links.some((link) => link.url === normalized)) {
      setLinkError("이미 추가된 링크입니다.");
      return;
    }
    update("links", [...draft.links, { url: normalized }]);
    setLinkError("");
    clear();
  };

  const filteredJobRoles = useMemo(
    () =>
      jobRoles.filter((role) => role.parentCode === conditionForm.categoryCode),
    [conditionForm.categoryCode, jobRoles],
  );
  const filteredSkills = useMemo(
    () =>
      skillOptions
        .filter(
          (skill) =>
            !conditionForm.skills.some(
              (selected) => selected.code === skill.code,
            ),
        )
        .filter((skill) =>
          skill.label.toLowerCase().includes(skillSearch.toLowerCase()),
        ),
    [conditionForm.skills, skillSearch, skillOptions],
  );
  const toggleSkill = (option: MetaOption) =>
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
    }));

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
        <FormCard>
          <CardTitle>기본 정보</CardTitle>
          <p className="mt-1 text-[11px] text-theme-muted">
            연락처와 이메일을 비우면 회원정보의 값을 사용합니다. 로그인 정보를
            바꾸려면 기본 정보 탭에서 수정하세요.
          </p>
          <div className="mt-5 grid items-start gap-6 sm:grid-cols-[132px_1fr]">
            <label className="group flex w-[126px] flex-col items-start text-left text-[10px] font-semibold text-theme-muted">
              <span className="w-full text-left">프로필 사진</span>
              <span
                className="relative mt-2 flex h-[162px] w-[126px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-md border border-theme bg-surface-subtle bg-cover bg-center text-theme-secondary group-hover:border-brand group-hover:outline-2 group-hover:outline-brand"
                style={
                  photoUrl ? { backgroundImage: `url(${photoUrl})` } : undefined
                }
              >
                {!photoUrl ? (
                  <>
                    <Upload size={24} strokeWidth={1.7} aria-hidden="true" />
                    <span className="mt-2 text-[9px]">3.5 × 4.5 비율</span>
                  </>
                ) : null}
                {photoUrl ? (
                  <span className="absolute inset-x-0 bottom-0 bg-slate-950/70 py-2 text-center text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                    사진 변경
                  </span>
                ) : null}
              </span>
              <span className="mt-2 w-full text-left">JPG, PNG · 최대 5MB</span>
              <input
                type="file"
                accept="image/jpeg,image/png"
                className="sr-only"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  event.currentTarget.value = "";
                  setProfileImageError("");
                  if (!file) return;
                  if (!["image/jpeg", "image/png"].includes(file.type)) {
                    setProfileImageError(
                      "JPG 또는 PNG 파일만 등록할 수 있습니다.",
                    );
                    return;
                  }
                  if (file.size > MAX_PROFILE_IMAGE_SIZE) {
                    setProfileImageError(
                      "프로필 사진은 5MB 이하만 등록할 수 있습니다.",
                    );
                    return;
                  }
                  try {
                    const preview = await createProfileImagePreview(file);
                    update("profileImagePreview", preview);
                    setProfileImageUploading(true);
                    const uploaded = await uploadFreelancerFile(
                      file,
                      "PROFILE_IMAGE",
                    );
                    update("profileImageName", uploaded.originalName);
                    update("profileImageFileId", uploaded.fileId);
                  } catch {
                    update("profileImagePreview", "");
                    setProfileImageError(
                      "사진을 업로드하지 못했습니다. 다시 시도해 주세요.",
                    );
                  } finally {
                    setProfileImageUploading(false);
                  }
                }}
              />
              {profileImageUploading ? (
                <span className="mt-2 text-[9px] text-brand">업로드 중...</span>
              ) : draft.profileImageName ? (
                <span className="mt-2 flex w-[126px] items-center justify-between gap-2">
                  <span className="min-w-0 flex-1 truncate text-left text-[9px] text-theme-success">
                    {draft.profileImageName}
                  </span>
                  <span className="shrink-0 text-[9px] font-bold text-brand">
                    사진 변경
                  </span>
                </span>
              ) : null}
            </label>
            <div className="grid gap-x-3 gap-y-2 sm:grid-cols-2">
              <Field label="성명" value={name} readOnly />
              <Field
                label="생년월일"
                value={accountBirthDate ?? "회원정보 확인 중"}
                readOnly
              />
              <Field
                label="연락처"
                value={draft.phone}
                onChange={(value) => update("phone", formatPhoneNumber(value))}
                error={showErrors && !draft.phone.trim()}
                inputMode="numeric"
                maxLength={20}
                placeholder="'-' 제외하고 입력해주세요"
              />
              <Field
                label="이메일"
                type="email"
                value={effectiveEmail}
                onChange={(value) => update("email", value)}
                error={showErrors && !draft.email.trim()}
                maxLength={255}
                placeholder="ex) hongildon@pairing.com"
              />
              <Field
                label="우편번호"
                value={draft.zipCode}
                onChange={(value) => update("zipCode", value)}
                maxLength={10}
                placeholder="우편번호"
              />
              <Field
                label="기본 주소"
                value={draft.address}
                onChange={(value) => update("address", value)}
                error={showErrors && !draft.address.trim()}
                maxLength={255}
                placeholder="도로명/지번 주소"
              />
              <label className="block text-[11px] font-semibold text-theme-secondary sm:col-span-2">
                상세주소
                <input
                  className={`${fieldClassName} mt-2`}
                  value={draft.addressDetail}
                  maxLength={255}
                  onChange={(event) =>
                    update("addressDetail", event.target.value)
                  }
                  placeholder="상세주소를 입력해주세요"
                />
              </label>
            </div>
          </div>
          {profileImageError ? (
            <ErrorText>{profileImageError}</ErrorText>
          ) : null}
          {showErrors && !hasProfileImage ? (
            <ErrorText>
              확인 페이지에 표시할 프로필 사진을 등록해 주세요.
            </ErrorText>
          ) : null}
        </FormCard>

        <FormCard>
          <CardTitle>희망 조건</CardTitle>
          <p className="mt-1 text-[11px] text-theme-muted">
            이력서와 같은 화면에서 함께 저장됩니다.
          </p>
          {metaError ? (
            <p className="mt-3 rounded-md bg-danger-surface p-3 text-[11px] font-bold text-theme-danger">
              {metaError}{" "}
              <button
                type="button"
                onClick={() => {
                  setMetaLoading(true);
                  setMetaError("");
                  void fetchConditionMeta();
                }}
                className="underline"
              >
                다시 시도
              </button>
            </p>
          ) : null}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <CompactField label="직군 *">
              <select
                value={conditionForm.categoryCode}
                onChange={(event) => {
                  const categoryCode = event.target.value;
                  setConditionForm((current) => ({
                    ...current,
                    categoryCode,
                    roleCode: "",
                  }));
                }}
                disabled={metaLoading}
                className={fieldClassName}
              >
                <option value="">직군 선택</option>
                {jobCategories.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.label}
                  </option>
                ))}
              </select>
            </CompactField>
            <CompactField label="직무 *">
              <select
                value={conditionForm.roleCode}
                onChange={(event) =>
                  setConditionForm((current) => ({
                    ...current,
                    roleCode: event.target.value,
                  }))
                }
                disabled={metaLoading || !conditionForm.categoryCode}
                className={fieldClassName}
              >
                <option value="">직무 선택</option>
                {filteredJobRoles.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.label}
                  </option>
                ))}
              </select>
            </CompactField>
          </div>
          {showErrors &&
          !(conditionForm.categoryCode && conditionForm.roleCode) ? (
            <ErrorText>직군과 직무를 선택해 주세요.</ErrorText>
          ) : null}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ConditionChoice
              title="근무 방식"
              valueCode={conditionForm.workStyleCode}
              options={workConditionsMeta?.workStyles ?? []}
              onChange={(code) =>
                setConditionForm((current) => ({
                  ...current,
                  workStyleCode: code,
                }))
              }
            />
            <ConditionChoice
              title="근무 형태"
              valueCode={conditionForm.workFormCode}
              options={workConditionsMeta?.workForms ?? []}
              onChange={(code) =>
                setConditionForm((current) => ({
                  ...current,
                  workFormCode: code,
                }))
              }
            />
          </div>
          {showErrors &&
          !(conditionForm.workStyleCode && conditionForm.workFormCode) ? (
            <ErrorText>근무 방식과 근무 형태를 선택해 주세요.</ErrorText>
          ) : null}

          <div className="mt-4">
            <p className="text-[11px] font-semibold text-theme-secondary">
              희망 급여<span className="ml-1 text-theme-danger">*</span>
            </p>
            <p className="mt-1 text-[10px] text-theme-muted">
              만원 단위로 입력해 주세요. 최소 1만원입니다.
            </p>
            <div className="mt-2 grid grid-cols-[1fr_3fr] gap-2">
              <select
                value={conditionForm.payUnitCode}
                onChange={(event) =>
                  setConditionForm((current) => ({
                    ...current,
                    payUnitCode: event.target.value,
                  }))
                }
                disabled={metaLoading}
                className={fieldClassName}
              >
                <option value="">단위 선택</option>
                {(workConditionsMeta?.payUnits ?? []).map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.label}
                  </option>
                ))}
              </select>
              <input
                value={conditionForm.pay}
                onChange={(event) =>
                  setConditionForm((current) => ({
                    ...current,
                    pay: formatNumber(event.target.value),
                  }))
                }
                inputMode="numeric"
                className={fieldClassName}
                placeholder="1만원 이상 입력"
              />
            </div>
            {showErrors && Number(conditionForm.pay.replaceAll(",", "")) < 1 ? (
              <ErrorText>희망 급여를 1만원 이상 입력해 주세요.</ErrorText>
            ) : null}
          </div>

          <div className="mt-4">
            <p className="text-[11px] font-semibold text-theme-secondary">
              최저 수용 금액
            </p>
            <p className="mt-1 text-[10px] text-theme-muted">
              협상 시 수용 가능한 최소 금액입니다. 만원 단위로 입력해 주세요.
              선택 입력이며 비우면 희망 급여를 기준으로 협상합니다.
            </p>
            <input
              value={conditionForm.minPay}
              onChange={(event) =>
                setConditionForm((current) => ({
                  ...current,
                  minPay: formatNumber(event.target.value),
                }))
              }
              inputMode="numeric"
              className={`${fieldClassName} mt-2`}
              placeholder="만원 단위로 입력"
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold text-theme-secondary">
                프로젝트 시작 가능일
              </p>
              <input
                type="date"
                value={conditionForm.startDate}
                onChange={(event) =>
                  setConditionForm((current) => ({
                    ...current,
                    startDate: event.target.value,
                  }))
                }
                disabled={conditionForm.startNegotiable}
                className={`${fieldClassName} mt-2`}
              />
              <label className="mt-2 flex cursor-pointer items-center gap-2 text-[10px] text-theme-secondary">
                <input
                  type="checkbox"
                  checked={conditionForm.startNegotiable}
                  onChange={(event) =>
                    setConditionForm((current) => ({
                      ...current,
                      startNegotiable: event.target.checked,
                    }))
                  }
                  className="accent-[var(--brand)]"
                />
                협의 가능
              </label>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-theme-secondary">
                희망 기간 · 기간 단위
                <span className="ml-1 text-theme-danger">*</span>
              </p>
              <div className="grid grid-cols-[7fr_3fr] gap-2">
                <input
                  value={conditionForm.period}
                  onChange={(event) =>
                    setConditionForm((current) => ({
                      ...current,
                      period: digitsOnly(event.target.value).slice(0, 2),
                    }))
                  }
                  inputMode="numeric"
                  className={fieldClassName}
                  placeholder="1~24"
                />
                <select
                  value={conditionForm.periodUnitCode}
                  onChange={(event) =>
                    setConditionForm((current) => ({
                      ...current,
                      periodUnitCode: event.target.value,
                    }))
                  }
                  disabled={metaLoading}
                  className={fieldClassName}
                >
                  <option value="">단위</option>
                  {(workConditionsMeta?.periodUnits ?? []).map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-2 text-[10px] text-theme-muted">
                기간 값은 1~24까지 입력할 수 있습니다.
              </p>
            </div>
          </div>
          {showErrors && !conditionForm.periodUnitCode ? (
            <ErrorText>기간 단위를 선택해 주세요.</ErrorText>
          ) : null}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ConditionChoice
              title="프리랜서 경험"
              valueCode={conditionForm.freelanceExperience}
              options={[
                { code: "있음", label: "있음" },
                { code: "없음", label: "없음" },
              ]}
              onChange={(code) =>
                setConditionForm((current) => ({
                  ...current,
                  freelanceExperience: code,
                }))
              }
            />
            <div>
              <p className="text-[11px] font-semibold text-theme-secondary">
                전체 경력
              </p>
              <div className="relative mt-2">
                <input
                  value={conditionForm.careerYears}
                  onChange={(event) =>
                    setConditionForm((current) => ({
                      ...current,
                      careerYears: digitsOnly(event.target.value),
                    }))
                  }
                  inputMode="numeric"
                  className={`${fieldClassName} pr-10`}
                  placeholder="선택 입력"
                />
                <span className="pointer-events-none absolute right-3 top-[13px] text-[11px] font-semibold text-theme-secondary">
                  년
                </span>
              </div>
            </div>
          </div>
          {showErrors && !conditionForm.freelanceExperience ? (
            <ErrorText>프리랜서 경험 여부를 선택해 주세요.</ErrorText>
          ) : null}

          <div className="mt-4">
            <p className="text-[11px] font-semibold text-theme-secondary">
              보유 스킬<span className="ml-1 text-theme-danger">*</span>
            </p>
            <p className="mt-1 text-[10px] text-theme-muted">
              스킬을 1개 이상 선택하고 각각 숙련도를 지정해 주세요.
            </p>
            <select
              value=""
              onChange={(event) => {
                const code = event.target.value;
                if (!code) return;
                const option = filteredSkills.find(
                  (skill) => skill.code === code,
                );
                if (option) toggleSkill(option);
              }}
              disabled={filteredSkills.length === 0}
              className={`${fieldClassName} mt-3`}
            >
              <option value="">
                {filteredSkills.length === 0
                  ? "검색 결과가 없습니다"
                  : "스킬 선택"}
              </option>
              {filteredSkills.map((skill) => (
                <option key={skill.code} value={skill.code}>
                  {skill.label}
                </option>
              ))}
            </select>
            <div className="mt-4 space-y-2">
              {conditionForm.skills.map((skill) => (
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
                      setConditionForm((current) => ({
                        ...current,
                        skills: current.skills.map((item) =>
                          item.code === skill.code
                            ? { ...item, levelCode }
                            : item,
                        ),
                      }));
                    }}
                    className="h-8 rounded-md border border-theme bg-surface px-2 text-[10px] outline-none hover:border-brand hover:outline-2 hover:outline-brand focus:border-brand focus:outline-2 focus:outline-brand"
                  >
                    {(workConditionsMeta?.skillLevels ?? []).map((level) => (
                      <option key={level.code} value={level.code}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    aria-label={`${labelOf(skillOptions, skill.code)} 삭제`}
                    onClick={() =>
                      setConditionForm((current) => ({
                        ...current,
                        skills: current.skills.filter(
                          (item) => item.code !== skill.code,
                        ),
                      }))
                    }
                    className="text-[14px] text-theme-muted"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {showErrors &&
            (conditionForm.skills.length === 0 ||
              conditionForm.skills.some((skill) => !skill.levelCode)) ? (
              <ErrorText>
                보유 스킬을 1개 이상 선택하고 숙련도를 모두 지정해 주세요.
              </ErrorText>
            ) : null}
          </div>
        </FormCard>

        <FormCard>
          <CardTitle>학력사항</CardTitle>
          {draft.educations.map((education, index) => (
            <EntryBox key={education.id}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-theme-muted">학력 {index + 1}</p>
                {draft.educations.length > 1 ? (
                  <button
                    type="button"
                    className="text-[14px] text-theme-muted"
                    aria-label="학력 삭제"
                    onClick={() =>
                      update(
                        "educations",
                        draft.educations.filter(
                          (item) => item.id !== education.id,
                        ),
                      )
                    }
                  >
                    ×
                  </button>
                ) : null}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <YearMonthSelect
                  label="입학"
                  year={education.startYear}
                  month={education.startMonth}
                  onChange={(year, month) =>
                    updateEducation(education.id, {
                      startYear: year,
                      startMonth: month,
                    })
                  }
                />
                <span className="text-theme-muted">~</span>
                {education.graduationStatus !== "ATTENDING" ? (
                  <YearMonthSelect
                    label="졸업"
                    year={education.endYear}
                    month={education.endMonth}
                    onChange={(year, month) =>
                      updateEducation(education.id, {
                        endYear: year,
                        endMonth: month,
                      })
                    }
                  />
                ) : null}
              </div>
              <div className="mt-3 grid grid-cols-[1.3fr_1.3fr_.8fr_.7fr] items-end gap-2">
                <CompactField label="학교명">
                  <input
                    value={education.schoolName}
                    maxLength={100}
                    onChange={(event) =>
                      updateEducation(education.id, {
                        schoolName: event.target.value,
                      })
                    }
                    className={compactInputClassName}
                    placeholder="학교명"
                  />
                </CompactField>
                <CompactField label="학과(과)">
                  <input
                    value={education.major}
                    maxLength={100}
                    onChange={(event) =>
                      updateEducation(education.id, {
                        major: event.target.value,
                      })
                    }
                    className={compactInputClassName}
                    placeholder="전공"
                  />
                </CompactField>
                <CompactField label="학력 상태">
                  <select
                    value={education.graduationStatus}
                    onChange={(event) =>
                      updateEducation(education.id, {
                        graduationStatus: event.target
                          .value as GraduationStatus,
                      })
                    }
                    className={compactInputClassName}
                    aria-label="학위"
                  >
                    {GRADUATION_STATUS_OPTIONS.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </CompactField>
                <CompactField label="캠퍼스">
                  <select
                    value={education.campusType}
                    onChange={(event) =>
                      updateEducation(education.id, {
                        campusType: event.target.value as CampusType,
                      })
                    }
                    className={compactInputClassName}
                    aria-label="학력 구분"
                  >
                    {CAMPUS_TYPE_OPTIONS.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </CompactField>
              </div>
            </EntryBox>
          ))}
          {showErrors && !educationsValid ? (
            <ErrorText>학력사항을 입력해 주세요.</ErrorText>
          ) : null}
          <AddButton
            onClick={() =>
              update("educations", [...draft.educations, blankEducation()])
            }
          >
            ＋ 학력 추가
          </AddButton>
        </FormCard>

        <FormCard>
          <CardTitle>경력사항</CardTitle>
          {draft.careers.map((career, index) => (
            <EntryBox key={career.id}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-theme-muted">경력 {index + 1}</p>
                {draft.careers.length > 1 ? (
                  <button
                    type="button"
                    className="text-[14px] text-theme-muted"
                    aria-label="경력 삭제"
                    onClick={() =>
                      update(
                        "careers",
                        draft.careers.filter((item) => item.id !== career.id),
                      )
                    }
                  >
                    ×
                  </button>
                ) : null}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <YearMonthSelect
                  label="시작"
                  year={career.startYear}
                  month={career.startMonth}
                  onChange={(year, month) =>
                    updateCareer(career.id, {
                      startYear: year,
                      startMonth: month,
                    })
                  }
                />
                <span className="text-theme-muted">~</span>
                {!career.isEmployed ? (
                  <YearMonthSelect
                    label="종료"
                    year={career.endYear}
                    month={career.endMonth}
                    onChange={(year, month) =>
                      updateCareer(career.id, {
                        endYear: year,
                        endMonth: month,
                      })
                    }
                  />
                ) : null}
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                <input
                  value={career.companyName}
                  maxLength={100}
                  onChange={(event) =>
                    updateCareer(career.id, { companyName: event.target.value })
                  }
                  className={compactInputClassName}
                  placeholder="회사/기관명"
                />
                <input
                  value={career.department}
                  maxLength={100}
                  onChange={(event) =>
                    updateCareer(career.id, { department: event.target.value })
                  }
                  className={compactInputClassName}
                  placeholder="부서"
                />
                <input
                  value={career.position}
                  maxLength={100}
                  onChange={(event) =>
                    updateCareer(career.id, { position: event.target.value })
                  }
                  className={compactInputClassName}
                  placeholder="직급"
                />
                <label className="flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-theme bg-surface px-2 text-[10px] font-semibold text-theme-secondary hover:border-brand">
                  <input
                    type="checkbox"
                    checked={career.isEmployed}
                    onChange={(event) =>
                      updateCareer(career.id, {
                        isEmployed: event.target.checked,
                      })
                    }
                    className="accent-[var(--brand)]"
                  />
                  재직 중
                </label>
              </div>
              <textarea
                value={career.jobDescription}
                maxLength={2000}
                onChange={(event) =>
                  updateCareer(career.id, {
                    jobDescription: event.target.value,
                  })
                }
                className={`${fieldClassName} mt-3 h-20 py-3`}
                placeholder="담당 업무 · 담당한 역할, 주요 업무와 사용 기술을 구체적으로 작성해 주세요."
              />
            </EntryBox>
          ))}
          {showErrors && !careersValid ? (
            <ErrorText>경력사항을 모두 입력해 주세요.</ErrorText>
          ) : null}
          <AddButton
            onClick={() => update("careers", [...draft.careers, blankCareer()])}
          >
            ＋ 경력 추가
          </AddButton>
        </FormCard>

        <FormCard>
          <CardTitle optional>자격증 및 어학</CardTitle>
          {draft.certificates.length === 0 ? (
            <p className="mt-3 text-[10px] text-theme-muted">
              아직 등록한 자격증이 없습니다.
            </p>
          ) : null}
          {draft.certificates.map((certificate, index) => (
            <EntryBox key={certificate.id}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-theme-muted">
                  자격증 및 어학 {index + 1}
                </p>
                <button
                  type="button"
                  className="text-[14px] text-theme-muted"
                  aria-label="자격증 삭제"
                  onClick={() =>
                    update(
                      "certificates",
                      draft.certificates.filter(
                        (item) => item.id !== certificate.id,
                      ),
                    )
                  }
                >
                  ×
                </button>
              </div>
              <div className="mt-2 grid items-end gap-2 sm:grid-cols-[1fr_1.3fr_1.1fr_.7fr_1fr]">
                <CompactField label="취득일자">
                  <input
                    type="date"
                    value={certificate.acquiredDate}
                    onChange={(event) =>
                      updateCertificate(certificate.id, {
                        acquiredDate: event.target.value,
                      })
                    }
                    className={compactInputClassName}
                  />
                </CompactField>
                <CompactField label="자격증명">
                  <input
                    value={certificate.name}
                    maxLength={100}
                    onChange={(event) =>
                      updateCertificate(certificate.id, {
                        name: event.target.value,
                      })
                    }
                    className={compactInputClassName}
                    placeholder="자격증명 입력"
                  />
                </CompactField>
                <CompactField label="발급기관">
                  <input
                    value={certificate.issuer}
                    maxLength={100}
                    onChange={(event) =>
                      updateCertificate(certificate.id, {
                        issuer: event.target.value,
                      })
                    }
                    className={compactInputClassName}
                    placeholder="발급기관"
                  />
                </CompactField>
                <CompactField label="점수">
                  <input
                    value={certificate.score}
                    maxLength={50}
                    onChange={(event) =>
                      updateCertificate(certificate.id, {
                        score: event.target.value,
                      })
                    }
                    className={compactInputClassName}
                    placeholder="점수"
                  />
                </CompactField>
                <CompactField label="비고">
                  <input
                    value={certificate.note}
                    maxLength={255}
                    onChange={(event) =>
                      updateCertificate(certificate.id, {
                        note: event.target.value,
                      })
                    }
                    className={compactInputClassName}
                    placeholder="비고"
                  />
                </CompactField>
              </div>
            </EntryBox>
          ))}
          {showErrors && !certificatesValid ? (
            <ErrorText>취득일자와 자격증명을 입력해 주세요.</ErrorText>
          ) : null}
          <AddButton
            onClick={() =>
              update("certificates", [
                ...draft.certificates,
                blankCertificate(),
              ])
            }
          >
            ＋ 자격증 및 어학 추가
          </AddButton>
        </FormCard>

        <FormCard>
          <CardTitle>간단 자기소개</CardTitle>
          <p className="mt-1 text-[11px] text-theme-muted">
            주요 경력과 강점, 선호하는 업무 방식과 함께 알릴 역량을 작성해
            주세요.
          </p>
          <textarea
            value={draft.summary}
            onChange={(event) => update("summary", event.target.value)}
            maxLength={1500}
            className={`${fieldClassName} h-56 resize-none py-3 ${showErrors && !draft.summary.trim() ? "border-red-500" : ""}`}
            placeholder="자기소개를 입력하세요..."
          />
          <p className="mt-2 text-right text-[10px] text-theme-muted">
            {draft.summary.length} / 1,500자
          </p>
          {showErrors && !draft.summary.trim() ? (
            <ErrorText>간단 자기소개를 작성해 주세요.</ErrorText>
          ) : null}
        </FormCard>

        <div id="portfolio" className="scroll-mt-6">
          <FormCard>
            <CardTitle>포트폴리오</CardTitle>
            <p className="mt-1 text-[11px] text-theme-muted">
              PDF 파일만 가능하며 최대 용량은 100MB입니다.
            </p>
            <label
              className={`mt-4 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-surface-subtle text-center hover:border-brand hover:outline-2 hover:outline-brand ${showErrors && !hasPortfolio ? "border-red-500" : "border-theme-strong"}`}
            >
              <Upload
                size={24}
                strokeWidth={1.6}
                className="text-theme-muted"
                aria-hidden="true"
              />
              <span className="mt-3 text-[12px] font-bold">
                PDF 파일을 드래그하거나 클릭하여 업로드
              </span>
              <span className="mt-1 text-[10px] text-theme-muted">
                PDF만 가능 · 파일 용량 제한은 서비스 정책을 따릅니다
              </span>
              <input
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  event.currentTarget.value = "";
                  setPortfolioError("");
                  if (!file) return;
                  if (file.type !== "application/pdf") {
                    setPortfolioError(
                      "포트폴리오는 PDF 파일만 등록할 수 있습니다.",
                    );
                    return;
                  }
                  if (file.size > MAX_PORTFOLIO_SIZE) {
                    setPortfolioError(
                      "포트폴리오는 100MB 이하만 등록할 수 있습니다.",
                    );
                    return;
                  }
                  try {
                    setPortfolioUploading(true);
                    const uploaded = await uploadFreelancerFile(
                      file,
                      "PORTFOLIO",
                    );
                    update("portfolioName", uploaded.originalName);
                    update("portfolioFileId", uploaded.fileId);
                  } catch {
                    setPortfolioError(
                      "포트폴리오를 업로드하지 못했습니다. 다시 시도해 주세요.",
                    );
                  } finally {
                    setPortfolioUploading(false);
                  }
                }}
              />
            </label>
            {portfolioError ? <ErrorText>{portfolioError}</ErrorText> : null}
            {portfolioUploading ? (
              <p className="mt-3 text-[11px] text-brand">업로드 중...</p>
            ) : null}
            {draft.portfolioName ? (
              <div className="mt-3 flex items-center gap-3 rounded-md border border-theme bg-success-surface px-3 py-2 text-[11px] font-bold text-theme-success">
                <FileText size={18} className="shrink-0" aria-hidden="true" />
                {draft.portfolioUrl ? (
                  <a
                    href={draft.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="min-w-0 flex-1 truncate underline"
                  >
                    {draft.portfolioName}
                  </a>
                ) : (
                  <span className="min-w-0 flex-1 truncate">
                    {draft.portfolioName}
                  </span>
                )}
                <button
                  type="button"
                  aria-label="포트폴리오 파일 제거"
                  onClick={() => {
                    update("portfolioName", "");
                    update("portfolioFileId", undefined);
                    update("portfolioUrl", null);
                    setPortfolioError("");
                  }}
                  className="shrink-0 text-theme-muted hover:text-theme-danger"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            ) : null}
            {showErrors && !hasPortfolio ? (
              <ErrorText>포트폴리오 PDF 파일을 등록해 주세요.</ErrorText>
            ) : null}
          </FormCard>
        </div>

        <FormCard>
          <CardTitle optional>외부 링크</CardTitle>
          <p className="mt-1 text-[10px] text-theme-muted">
            GitHub, Notion, 블로그 등 원하는 링크를 자유롭게 추가해 주세요.
          </p>
          <div className="mt-3 flex gap-2">
            <input
              value={linkInput}
              onChange={(event) => setLinkInput(event.target.value)}
              className={fieldClassName}
              placeholder="https://"
              type="url"
            />
            <button
              type="button"
              onClick={() => addLink(linkInput, () => setLinkInput(""))}
              className="mt-2 shrink-0 rounded-md bg-brand px-4 text-[11px] font-bold text-brand-contrast"
            >
              링크 추가
            </button>
          </div>
          {linkError ? <ErrorText>{linkError}</ErrorText> : null}
          {draft.links.length ? (
            <ul className="mt-4 space-y-2">
              {draft.links.map((link) => (
                <li
                  key={link.url}
                  className="flex items-center gap-3 rounded-md border border-theme bg-surface-subtle px-3 py-2 text-[10px]"
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="min-w-0 flex-1 truncate text-theme-secondary underline"
                  >
                    {link.url}
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      update(
                        "links",
                        draft.links.filter((item) => item.url !== link.url),
                      )
                    }
                    className="text-theme-danger"
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </FormCard>

        <FormCard>
          <CardTitle>필수 동의</CardTitle>
          {hasSavedResume ? (
            <p className="mt-1 text-[10px] text-theme-muted">
              최초 등록 시 동의한 내용이며, 이후 수정 저장에는 영향을 주지
              않습니다.
            </p>
          ) : null}
          <div className="mt-3 space-y-2">
            <AgreementCheckbox
              label="이력서 정보 수집에 동의합니다."
              checked={draft.agreements.profileCollectionAgreed}
              onChange={(checked) =>
                update("agreements", {
                  ...draft.agreements,
                  profileCollectionAgreed: checked,
                })
              }
            />
            <AgreementCheckbox
              label="이력서 정보 제공(매칭용)에 동의합니다."
              checked={draft.agreements.profileProvisionAgreed}
              onChange={(checked) =>
                update("agreements", {
                  ...draft.agreements,
                  profileProvisionAgreed: checked,
                })
              }
            />
            <AgreementCheckbox
              label="AI 분석 활용에 동의합니다."
              checked={draft.agreements.aiAnalysisAgreed}
              onChange={(checked) =>
                update("agreements", {
                  ...draft.agreements,
                  aiAnalysisAgreed: checked,
                })
              }
            />
            <AgreementCheckbox
              label="경력·포트폴리오 활용에 동의합니다."
              checked={draft.agreements.careerPortfolioUsageAgreed}
              onChange={(checked) =>
                update("agreements", {
                  ...draft.agreements,
                  careerPortfolioUsageAgreed: checked,
                })
              }
            />
          </div>
          {showErrors && !agreementsGate ? (
            <ErrorText>모든 약관에 동의해야 저장할 수 있습니다.</ErrorText>
          ) : null}
        </FormCard>

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
