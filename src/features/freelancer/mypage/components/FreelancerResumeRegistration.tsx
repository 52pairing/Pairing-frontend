"use client";

import { FileText, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { formatPhoneNumber } from "@/features/auth/utils/formatPhoneNumber";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { ApiException } from "@/lib/api";
import {
  getFreelancerResume,
  getFreelancerResumeDraft,
  updateFreelancerResume,
  updateFreelancerResumeDraft,
} from "@/features/freelancer/mypage/services/freelancerResume";
import { uploadFreelancerFile } from "@/features/freelancer/mypage/services/freelancerFiles";
import type {
  CampusType,
  GraduationStatus,
  ResumeUpdateRequest,
} from "@/features/freelancer/mypage/types/resume";
import {
  FormCard,
  ProfileRegistrationShell,
  fieldClassName,
  labelClassName,
} from "./ProfileRegistrationShell";

type Screen = "form" | "review" | "complete";
const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_PORTFOLIO_SIZE = 100 * 1024 * 1024;

const GRADUATION_STATUS_OPTIONS: { code: GraduationStatus; label: string }[] = [
  { code: "GRADUATED", label: "졸업" },
  { code: "EXPECTED", label: "졸업예정" },
  { code: "ATTENDING", label: "재학 중" },
  { code: "LEAVE", label: "휴학" },
  { code: "DROPPED", label: "중퇴" },
];
const CAMPUS_TYPE_OPTIONS: { code: CampusType; label: string }[] = [
  { code: "MAIN", label: "본교" },
  { code: "BRANCH", label: "분교" },
];

type EducationForm = {
  id: string;
  startYear: string;
  startMonth: string;
  endYear: string;
  endMonth: string;
  schoolName: string;
  major: string;
  graduationStatus: GraduationStatus;
  campusType: CampusType;
};
type CareerForm = {
  id: string;
  startYear: string;
  startMonth: string;
  endYear: string;
  endMonth: string;
  companyName: string;
  department: string;
  position: string;
  jobDescription: string;
  isEmployed: boolean;
};
type CertificateForm = {
  id: string;
  acquiredDate: string;
  name: string;
  issuer: string;
  score: string;
  note: string;
};
type LinkForm = { type: string; url: string };
type Agreements = {
  profileCollectionAgreed: boolean;
  profileProvisionAgreed: boolean;
  aiAnalysisAgreed: boolean;
  careerPortfolioUsageAgreed: boolean;
};

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}
function blankEducation(): EducationForm {
  return {
    id: makeId(),
    startYear: "",
    startMonth: "",
    endYear: "",
    endMonth: "",
    schoolName: "",
    major: "",
    graduationStatus: "GRADUATED",
    campusType: "MAIN",
  };
}
function blankCareer(): CareerForm {
  return {
    id: makeId(),
    startYear: "",
    startMonth: "",
    endYear: "",
    endMonth: "",
    companyName: "",
    department: "",
    position: "",
    jobDescription: "",
    isEmployed: false,
  };
}
function blankCertificate(): CertificateForm {
  return { id: makeId(), acquiredDate: "", name: "", issuer: "", score: "", note: "" };
}

type ResumeDraft = {
  phone: string;
  email: string;
  zipCode: string;
  address: string;
  addressDetail: string;
  summary: string;
  portfolioName: string;
  portfolioFileId?: number;
  profileImageName: string;
  profileImagePreview: string;
  profileImageFileId?: number;
  educations: EducationForm[];
  careers: CareerForm[];
  certificates: CertificateForm[];
  links: LinkForm[];
  agreements: Agreements;
};

const EMPTY_AGREEMENTS: Agreements = {
  profileCollectionAgreed: false,
  profileProvisionAgreed: false,
  aiAnalysisAgreed: false,
  careerPortfolioUsageAgreed: false,
};

function emptyDraft(): ResumeDraft {
  return {
    phone: "",
    email: "",
    zipCode: "",
    address: "",
    addressDetail: "",
    summary: "",
    portfolioName: "",
    portfolioFileId: undefined,
    profileImageName: "",
    profileImagePreview: "",
    profileImageFileId: undefined,
    educations: [blankEducation()],
    careers: [blankCareer()],
    certificates: [],
    links: [],
    agreements: { ...EMPTY_AGREEMENTS },
  };
}

function parseDate(date?: string | null) {
  if (!date) return { year: "", month: "" };
  const [year, month] = date.split("-");
  return { year: year ?? "", month: month ?? "" };
}

// 서버에 저장된 이력서를 화면 상태로 되돌립니다.
function mapApiToDraft(resume: ResumeUpdateRequest): ResumeDraft {
  return {
    phone: resume.contactPhone,
    email: resume.contactEmail,
    zipCode: resume.zipCode,
    address: resume.address,
    addressDetail: resume.addressDetail,
    summary: resume.selfIntroduction,
    portfolioName: resume.portfolioFileId ? "등록된 포트폴리오" : "",
    portfolioFileId: resume.portfolioFileId,
    profileImageName: resume.profileFileId ? "등록된 프로필 사진" : "",
    profileImagePreview: "",
    profileImageFileId: resume.profileFileId,
    educations: resume.educations.length
      ? resume.educations.map((education) => {
        const start = parseDate(education.startDate);
        const end = parseDate(education.endDate);
        return {
          id: makeId(),
          startYear: start.year,
          startMonth: start.month,
          endYear: end.year,
          endMonth: end.month,
          schoolName: education.schoolName,
          major: education.major ?? "",
          graduationStatus: education.graduationStatus,
          campusType: education.campusType,
        };
      })
      : [blankEducation()],
    careers: resume.careers.length
      ? resume.careers.map((career) => {
        const start = parseDate(career.startDate);
        const end = parseDate(career.endDate);
        return {
          id: makeId(),
          startYear: start.year,
          startMonth: start.month,
          endYear: end.year,
          endMonth: end.month,
          companyName: career.companyName,
          department: career.department ?? "",
          position: career.position ?? "",
          jobDescription: career.jobDescription ?? "",
          isEmployed: !career.endDate,
        };
      })
      : [blankCareer()],
    certificates: resume.certificates.map((certificate) => ({
      id: makeId(),
      acquiredDate: certificate.acquiredDate,
      name: certificate.name,
      issuer: certificate.issuer ?? "",
      score: certificate.score ?? "",
      note: certificate.note ?? "",
    })),
    links: resume.links.map((link, index) => ({ type: `링크 ${index + 1}`, url: link.url })),
    agreements: { ...resume.agreements },
  };
}

function isResumeDraft(value: unknown): value is ResumeDraft {
  return Boolean(value) && typeof value === "object" && "agreements" in (value as object);
}

function createProfileImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("이미지를 읽을 수 없습니다."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("이미지를 표시할 수 없습니다."));
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 350;
        canvas.height = 450;
        const context = canvas.getContext("2d");
        if (!context) return reject(new Error("이미지 미리보기를 만들 수 없습니다."));
        const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
        const width = image.width * scale;
        const height = image.height * scale;
        context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function FreelancerResumeRegistration() {
  const currentUser = useCurrentUser();
  const formRef = useRef<HTMLFormElement>(null);
  const [screen, setScreen] = useState<Screen>("form");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [draft, setDraft] = useState<ResumeDraft>(emptyDraft);
  const [showErrors, setShowErrors] = useState(false);
  const [profileImageError, setProfileImageError] = useState("");
  const [portfolioError, setPortfolioError] = useState("");
  const [profileImageUploading, setProfileImageUploading] = useState(false);
  const [portfolioUploading, setPortfolioUploading] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [githubInput, setGithubInput] = useState("");
  const [notionInput, setNotionInput] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [draftSaving, setDraftSaving] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");

  const name = currentUser?.name ?? "회원정보 확인 중";
  const effectiveEmail = draft.email || currentUser?.email || "";

  useEffect(() => {
    let active = true;
    getFreelancerResume()
      .then(async (detail) => {
        if (!active) return;
        if (detail.resume) {
          setDraft(mapApiToDraft(detail.resume));
          setScreen("review");
          return;
        }
        const draftResponse = await getFreelancerResumeDraft().catch(() => null);
        if (active && draftResponse && isResumeDraft(draftResponse.payload)) {
          setDraft(draftResponse.payload);
        }
      })
      .catch(() => {
        if (active) setLoadError("이력서 정보를 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.");
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
      educations: current.educations.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  const updateCareer = (id: string, patch: Partial<CareerForm>) =>
    setDraft((current) => ({
      ...current,
      careers: current.careers.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  const updateCertificate = (id: string, patch: Partial<CertificateForm>) =>
    setDraft((current) => ({
      ...current,
      certificates: current.certificates.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));

  const addLink = (type: string, url: string, clear: () => void) => {
    const normalized = url.trim();
    if (!/^https?:\/\//i.test(normalized)) {
      setLinkError("http:// 또는 https://로 시작하는 링크를 입력해 주세요.");
      return;
    }
    update("links", [...draft.links.filter((link) => link.type !== type), { type, url: normalized }]);
    setLinkError("");
    clear();
  };

  const educationsValid = draft.educations.every(
    (item) => item.schoolName.trim() && item.startYear && item.startMonth,
  );
  const careersValid = draft.careers.every(
    (item) => item.companyName.trim() && item.department.trim() && item.jobDescription.trim() && item.startYear && item.startMonth,
  );
  const agreementsValid = Object.values(draft.agreements).every(Boolean);
  const isValid = Boolean(
    name.trim() &&
    draft.profileImageFileId &&
    draft.phone.trim() &&
    effectiveEmail.trim() &&
    draft.zipCode.trim() &&
    draft.address.trim() &&
    educationsValid &&
    careersValid &&
    draft.summary.trim() &&
    draft.portfolioFileId &&
    agreementsValid,
  );

  const buildPayload = (): ResumeUpdateRequest => ({
    profileFileId: draft.profileImageFileId,
    contactPhone: draft.phone,
    contactEmail: effectiveEmail,
    zipCode: draft.zipCode,
    address: draft.address,
    addressDetail: draft.addressDetail,
    educations: draft.educations.map((education) => ({
      startDate: `${education.startYear}-${education.startMonth}-01`,
      endDate:
        education.graduationStatus === "ATTENDING" || !education.endYear || !education.endMonth
          ? undefined
          : `${education.endYear}-${education.endMonth}-01`,
      schoolName: education.schoolName.trim(),
      major: education.major.trim() || undefined,
      graduationStatus: education.graduationStatus,
      campusType: education.campusType,
    })),
    careers: draft.careers.map((career) => ({
      startDate: `${career.startYear}-${career.startMonth}-01`,
      endDate: career.isEmployed || !career.endYear || !career.endMonth ? undefined : `${career.endYear}-${career.endMonth}-01`,
      companyName: career.companyName.trim(),
      department: career.department.trim() || undefined,
      position: career.position.trim() || undefined,
      jobDescription: career.jobDescription.trim() || undefined,
    })),
    certificates: draft.certificates.map((certificate) => ({
      acquiredDate: certificate.acquiredDate,
      name: certificate.name.trim(),
      issuer: certificate.issuer.trim() || undefined,
      score: certificate.score.trim() || undefined,
      note: certificate.note.trim() || undefined,
    })),
    selfIntroduction: draft.summary,
    portfolioFileId: draft.portfolioFileId,
    links: draft.links.map((link) => ({ url: link.url })),
    agreements: draft.agreements,
  });

  const review = async () => {
    if (!isValid) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setSubmitError("");
    setSubmitting(true);
    try {
      await updateFreelancerResume(buildPayload());
      setScreen("review");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitError(
        error instanceof ApiException ? error.message : "이력서 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.",
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
      <ProfileRegistrationShell step={2} title="내 이력서" description="이력서 정보를 불러오는 중입니다.">
        <p className="rounded-lg border border-theme bg-surface px-4 py-6 text-center text-[12px] text-theme-secondary">
          불러오는 중...
        </p>
      </ProfileRegistrationShell>
    );
  }

  if (screen === "complete")
    return <CompleteScreen name={name} onView={() => setScreen("review")} />;
  if (screen === "review")
    return <ReviewScreen name={name} phone={draft.phone} email={effectiveEmail} draft={draft} onEdit={() => setScreen("form")} />;

  return (
    <ProfileRegistrationShell
      step={2}
      title="내 이력서"
      description="이력서와 포트폴리오 정보를 관리합니다."
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
        <ResumeSaveStatus />
        {loadError ? <ErrorText>{loadError}</ErrorText> : null}
        <FormCard>
          <CardTitle>기본 정보</CardTitle>
          <div className="mt-5 grid items-start gap-6 sm:grid-cols-[132px_1fr]">
            <label className="group flex w-[126px] flex-col items-start text-left text-[10px] font-semibold text-theme-muted">
              <span className="w-full text-left">프로필 사진</span>
              <span
                className="relative mt-2 flex h-[162px] w-[126px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-md border border-theme bg-surface-subtle bg-cover bg-center text-theme-secondary group-hover:border-brand group-hover:outline-2 group-hover:outline-brand"
                style={draft.profileImagePreview ? { backgroundImage: `url(${draft.profileImagePreview})` } : undefined}
              >
                {!draft.profileImagePreview ? (
                  <>
                    <Upload size={24} strokeWidth={1.7} aria-hidden="true" />
                    <span className="mt-2 text-[9px]">3.5 × 4.5 비율</span>
                  </>
                ) : null}
                {draft.profileImagePreview ? (
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
                    setProfileImageError("JPG 또는 PNG 파일만 등록할 수 있습니다.");
                    return;
                  }
                  if (file.size > MAX_PROFILE_IMAGE_SIZE) {
                    setProfileImageError("프로필 사진은 5MB 이하만 등록할 수 있습니다.");
                    return;
                  }
                  try {
                    const preview = await createProfileImagePreview(file);
                    update("profileImagePreview", preview);
                    setProfileImageUploading(true);
                    const uploaded = await uploadFreelancerFile(file, "PROFILE_IMAGE");
                    update("profileImageName", uploaded.originalName);
                    update("profileImageFileId", uploaded.fileId);
                  } catch {
                    update("profileImageName", "");
                    update("profileImagePreview", "");
                    update("profileImageFileId", undefined);
                    setProfileImageError("사진을 업로드하지 못했습니다. 다시 시도해 주세요.");
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
                  <span className="shrink-0 text-[9px] font-bold text-brand">사진 변경</span>
                </span>
              ) : null}
            </label>
            <div className="grid gap-x-3 gap-y-2 sm:grid-cols-2">
              <Field label="성명" value={name} readOnly />
              <Field label="생년월일" value="회원정보에서 가져온 값" readOnly />
              <Field
                label="전화번호"
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
                error={showErrors && !draft.zipCode.trim()}
                maxLength={10}
                placeholder="우편번호"
              />
              <Field
                label="주소"
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
                  onChange={(event) => update("addressDetail", event.target.value)}
                  placeholder="상세주소를 입력해주세요"
                />
              </label>
            </div>
          </div>
          {profileImageError ? <ErrorText>{profileImageError}</ErrorText> : null}
          {showErrors && !draft.profileImageFileId ? (
            <ErrorText>확인 페이지에 표시할 프로필 사진을 다시 선택해 주세요.</ErrorText>
          ) : null}
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
                    onClick={() => update("educations", draft.educations.filter((item) => item.id !== education.id))}
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
                  onChange={(year, month) => updateEducation(education.id, { startYear: year, startMonth: month })}
                />
                <span className="text-theme-muted">~</span>
                {education.graduationStatus !== "ATTENDING" ? (
                  <YearMonthSelect
                    label="졸업"
                    year={education.endYear}
                    month={education.endMonth}
                    onChange={(year, month) => updateEducation(education.id, { endYear: year, endMonth: month })}
                  />
                ) : null}
              </div>
              <div className="mt-3 grid items-end gap-2 sm:grid-cols-[1.3fr_1.3fr_.8fr_.7fr]">
                <CompactField label="학교명">
                  <input
                    value={education.schoolName}
                    maxLength={100}
                    onChange={(event) => updateEducation(education.id, { schoolName: event.target.value })}
                    className={compactInputClassName}
                    placeholder="학교명"
                  />
                </CompactField>
                <CompactField label="학과(과)">
                  <input
                    value={education.major}
                    maxLength={100}
                    onChange={(event) => updateEducation(education.id, { major: event.target.value })}
                    className={compactInputClassName}
                    placeholder="전공"
                  />
                </CompactField>
                <CompactField label="학력 상태">
                  <select
                    value={education.graduationStatus}
                    onChange={(event) => updateEducation(education.id, { graduationStatus: event.target.value as GraduationStatus })}
                    className={compactInputClassName}
                    aria-label="학위"
                  >
                    {GRADUATION_STATUS_OPTIONS.map((option) => (
                      <option key={option.code} value={option.code}>{option.label}</option>
                    ))}
                  </select>
                </CompactField>
                <CompactField label="캠퍼스">
                  <select
                    value={education.campusType}
                    onChange={(event) => updateEducation(education.id, { campusType: event.target.value as CampusType })}
                    className={compactInputClassName}
                    aria-label="학력 구분"
                  >
                    {CAMPUS_TYPE_OPTIONS.map((option) => (
                      <option key={option.code} value={option.code}>{option.label}</option>
                    ))}
                  </select>
                </CompactField>
              </div>
            </EntryBox>
          ))}
          {showErrors && !educationsValid ? <ErrorText>학력사항을 입력해 주세요.</ErrorText> : null}
          <AddButton onClick={() => update("educations", [...draft.educations, blankEducation()])}>
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
                    onClick={() => update("careers", draft.careers.filter((item) => item.id !== career.id))}
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
                  onChange={(year, month) => updateCareer(career.id, { startYear: year, startMonth: month })}
                />
                <span className="text-theme-muted">~</span>
                {!career.isEmployed ? (
                  <YearMonthSelect
                    label="종료"
                    year={career.endYear}
                    month={career.endMonth}
                    onChange={(year, month) => updateCareer(career.id, { endYear: year, endMonth: month })}
                  />
                ) : null}
                <label className="ml-auto flex cursor-pointer items-center gap-1 text-[10px] text-theme-secondary">
                  <input
                    type="checkbox"
                    checked={career.isEmployed}
                    onChange={(event) => updateCareer(career.id, { isEmployed: event.target.checked })}
                    className="accent-[var(--brand)]"
                  />{" "}
                  재직 중
                </label>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <input
                  value={career.companyName}
                  maxLength={100}
                  onChange={(event) => updateCareer(career.id, { companyName: event.target.value })}
                  className={compactInputClassName}
                  placeholder="회사/기관명"
                />
                <input
                  value={career.department}
                  maxLength={100}
                  onChange={(event) => updateCareer(career.id, { department: event.target.value })}
                  className={compactInputClassName}
                  placeholder="부서"
                />
                <input
                  value={career.position}
                  maxLength={100}
                  onChange={(event) => updateCareer(career.id, { position: event.target.value })}
                  className={compactInputClassName}
                  placeholder="직급"
                />
              </div>
              <textarea
                value={career.jobDescription}
                maxLength={2000}
                onChange={(event) => updateCareer(career.id, { jobDescription: event.target.value })}
                className={`${fieldClassName} mt-3 h-20 py-3`}
                placeholder="담당 업무 · 담당한 역할, 주요 업무와 사용 기술을 구체적으로 작성해 주세요."
              />
            </EntryBox>
          ))}
          {showErrors && !careersValid ? <ErrorText>경력사항을 모두 입력해 주세요.</ErrorText> : null}
          <AddButton onClick={() => update("careers", [...draft.careers, blankCareer()])}>
            ＋ 경력 추가
          </AddButton>
        </FormCard>

        <FormCard>
          <CardTitle optional>자격증 및 어학</CardTitle>
          {draft.certificates.length === 0 ? (
            <p className="mt-3 text-[10px] text-theme-muted">아직 등록한 자격증이 없습니다.</p>
          ) : null}
          {draft.certificates.map((certificate, index) => (
            <EntryBox key={certificate.id}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-theme-muted">자격증 및 어학 {index + 1}</p>
                <button
                  type="button"
                  className="text-[14px] text-theme-muted"
                  aria-label="자격증 삭제"
                  onClick={() => update("certificates", draft.certificates.filter((item) => item.id !== certificate.id))}
                >
                  ×
                </button>
              </div>
              <div className="mt-2 grid items-end gap-2 sm:grid-cols-[1fr_1.3fr_1.1fr_.7fr_1fr]">
                <CompactField label="취득일자">
                  <input
                    type="date"
                    value={certificate.acquiredDate}
                    onChange={(event) => updateCertificate(certificate.id, { acquiredDate: event.target.value })}
                    className={compactInputClassName}
                  />
                </CompactField>
                <CompactField label="자격증명">
                  <input
                    value={certificate.name}
                    maxLength={100}
                    onChange={(event) => updateCertificate(certificate.id, { name: event.target.value })}
                    className={compactInputClassName}
                    placeholder="자격증명 입력"
                  />
                </CompactField>
                <CompactField label="발급기관">
                  <input
                    value={certificate.issuer}
                    maxLength={100}
                    onChange={(event) => updateCertificate(certificate.id, { issuer: event.target.value })}
                    className={compactInputClassName}
                    placeholder="발급기관"
                  />
                </CompactField>
                <CompactField label="점수">
                  <input
                    value={certificate.score}
                    maxLength={50}
                    onChange={(event) => updateCertificate(certificate.id, { score: event.target.value })}
                    className={compactInputClassName}
                    placeholder="점수"
                  />
                </CompactField>
                <CompactField label="비고">
                  <input
                    value={certificate.note}
                    maxLength={255}
                    onChange={(event) => updateCertificate(certificate.id, { note: event.target.value })}
                    className={compactInputClassName}
                    placeholder="비고"
                  />
                </CompactField>
              </div>
            </EntryBox>
          ))}
          <AddButton onClick={() => update("certificates", [...draft.certificates, blankCertificate()])}>
            ＋ 자격증 및 어학 추가
          </AddButton>
        </FormCard>

        <FormCard>
          <CardTitle>간단 자기소개</CardTitle>
          <p className="mt-1 text-[11px] text-theme-muted">
            주요 경력과 강점, 선호하는 업무 방식과 함께 알릴 역량을 작성해 주세요.
          </p>
          <textarea
            value={draft.summary}
            onChange={(event) => update("summary", event.target.value)}
            maxLength={1500}
            className={`${fieldClassName} h-36 resize-none py-3 ${showErrors && !draft.summary.trim() ? "border-red-500" : ""}`}
            placeholder="자기소개를 입력하세요..."
          />
          <p className="mt-2 text-right text-[10px] text-theme-muted">{draft.summary.length} / 1,500자</p>
          {showErrors && !draft.summary.trim() ? <ErrorText>간단 자기소개를 작성해 주세요.</ErrorText> : null}
        </FormCard>

        <div id="portfolio" className="scroll-mt-6">
          <FormCard>
            <CardTitle>포트폴리오</CardTitle>
            <p className="mt-1 text-[11px] text-theme-muted">PDF 파일만 가능하며 최대 용량은 100MB입니다.</p>
            <label
              className={`mt-4 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-surface-subtle text-center hover:border-brand hover:outline-2 hover:outline-brand ${showErrors && !draft.portfolioFileId ? "border-red-500" : "border-theme-strong"}`}
            >
              <Upload size={24} strokeWidth={1.6} className="text-theme-muted" aria-hidden="true" />
              <span className="mt-3 text-[12px] font-bold">PDF 파일을 드래그하거나 클릭하여 업로드</span>
              <span className="mt-1 text-[10px] text-theme-muted">PDF만 가능 · 파일 용량 제한은 서비스 정책을 따릅니다</span>
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
                    setPortfolioError("포트폴리오는 PDF 파일만 등록할 수 있습니다.");
                    return;
                  }
                  if (file.size > MAX_PORTFOLIO_SIZE) {
                    setPortfolioError("포트폴리오는 100MB 이하만 등록할 수 있습니다.");
                    return;
                  }
                  try {
                    setPortfolioUploading(true);
                    const uploaded = await uploadFreelancerFile(file, "PORTFOLIO");
                    update("portfolioName", uploaded.originalName);
                    update("portfolioFileId", uploaded.fileId);
                  } catch {
                    update("portfolioName", "");
                    update("portfolioFileId", undefined);
                    setPortfolioError("포트폴리오를 업로드하지 못했습니다. 다시 시도해 주세요.");
                  } finally {
                    setPortfolioUploading(false);
                  }
                }}
              />
            </label>
            {portfolioError ? <ErrorText>{portfolioError}</ErrorText> : null}
            {portfolioUploading ? <p className="mt-3 text-[11px] text-brand">업로드 중...</p> : null}
            {draft.portfolioName ? (
              <div className="mt-3 flex items-center gap-3 rounded-md border border-theme bg-success-surface px-3 py-2 text-[11px] font-bold text-theme-success">
                <FileText size={18} className="shrink-0" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{draft.portfolioName}</span>
                <button
                  type="button"
                  aria-label="포트폴리오 파일 제거"
                  onClick={() => {
                    update("portfolioName", "");
                    update("portfolioFileId", undefined);
                    setPortfolioError("");
                  }}
                  className="shrink-0 text-theme-muted hover:text-theme-danger"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            ) : null}
            {showErrors && !draft.portfolioFileId ? <ErrorText>포트폴리오 PDF 파일을 등록해 주세요.</ErrorText> : null}
          </FormCard>
        </div>

        <FormCard>
          <CardTitle optional>GitHub</CardTitle>
          <div className="mt-3 flex gap-2 mb-5">
            <input
              value={githubInput}
              onChange={(event) => setGithubInput(event.target.value)}
              className={fieldClassName}
              placeholder="https://"
              type="url"
            />
            <button
              type="button"
              onClick={() => addLink("GitHub", githubInput, () => setGithubInput(""))}
              className="mt-2 shrink-0 rounded-md bg-brand px-4 text-[11px] font-bold text-brand-contrast"
            >
              링크 추가
            </button>
          </div>

          <CardTitle optional>Notion</CardTitle>
          <div className="mt-3 flex gap-2">
            <input
              value={notionInput}
              onChange={(event) => setNotionInput(event.target.value)}
              className={fieldClassName}
              placeholder="https://"
              type="url"
            />
            <button
              type="button"
              onClick={() => addLink("Notion", notionInput, () => setNotionInput(""))}
              className="mt-2 shrink-0 rounded-md bg-brand px-4 text-[11px] font-bold text-brand-contrast"
            >
              링크 추가
            </button>
          </div>
          {linkError ? <ErrorText>{linkError}</ErrorText> : null}
          {draft.links.length ? (
            <ul className="mt-4 space-y-2">
              {draft.links.map((link) => (
                <li key={link.type} className="flex items-center gap-3 rounded-md border border-theme bg-surface-subtle px-3 py-2 text-[10px]">
                  <span className="shrink-0 font-bold text-brand">{link.type}</span>
                  <a href={link.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-theme-secondary underline">
                    {link.url}
                  </a>
                  <button
                    type="button"
                    onClick={() => update("links", draft.links.filter((item) => item.type !== link.type))}
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
          <div className="mt-3 space-y-2">
            <AgreementCheckbox
              label="이력서 정보 수집에 동의합니다."
              checked={draft.agreements.profileCollectionAgreed}
              onChange={(checked) => update("agreements", { ...draft.agreements, profileCollectionAgreed: checked })}
            />
            <AgreementCheckbox
              label="이력서 정보 제공(매칭용)에 동의합니다."
              checked={draft.agreements.profileProvisionAgreed}
              onChange={(checked) => update("agreements", { ...draft.agreements, profileProvisionAgreed: checked })}
            />
            <AgreementCheckbox
              label="AI 분석 활용에 동의합니다."
              checked={draft.agreements.aiAnalysisAgreed}
              onChange={(checked) => update("agreements", { ...draft.agreements, aiAnalysisAgreed: checked })}
            />
            <AgreementCheckbox
              label="경력·포트폴리오 활용에 동의합니다."
              checked={draft.agreements.careerPortfolioUsageAgreed}
              onChange={(checked) => update("agreements", { ...draft.agreements, careerPortfolioUsageAgreed: checked })}
            />
          </div>
          {showErrors && !agreementsValid ? <ErrorText>모든 약관에 동의해야 저장할 수 있습니다.</ErrorText> : null}
        </FormCard>

        {submitError ? <ErrorText>{submitError}</ErrorText> : null}
        {draftMessage ? <p className="text-[10px] font-semibold text-theme-secondary">{draftMessage}</p> : null}

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

function ReviewScreen({
  name,
  phone,
  email,
  draft,
  onEdit,
}: {
  name: string;
  phone: string;
  email: string;
  draft: ResumeDraft;
  onEdit: () => void;
}) {
  return (
    <ProfileRegistrationShell step={2} title="내 이력서" description="등록된 이력서와 포트폴리오 정보를 확인할 수 있습니다.">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="rounded-lg border border-warning-border bg-warning-surface px-4 py-3 text-[11px] font-bold text-theme-warning">
          수정한 프로필은 새로운 추천과 매칭부터 반영됩니다.
        </p>
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 self-end rounded-md bg-brand px-6 py-3 text-[12px] font-bold text-brand-contrast hover:bg-brand-hover sm:self-auto"
        >
          수정하기
        </button>
      </div>
      <div className="mt-4 space-y-3">
        <ReviewCard
          title="기본 정보"
          imagePreview={draft.profileImagePreview}
          imageName={draft.profileImageName}
          rows={[
            ["성명", name],
            ["전화번호", phone],
            ["이메일", email],
            ["주소", [draft.zipCode, draft.address, draft.addressDetail].filter(Boolean).join(" ")],
          ]}
        />
        {draft.educations.map((education, index) => (
          <ReviewCard
            key={education.id}
            title={`학력사항 ${draft.educations.length > 1 ? index + 1 : ""}`}
            rows={[
              ["학교명", education.schoolName],
              ["학과(과)", education.major],
              ["학력 상태", GRADUATION_STATUS_OPTIONS.find((o) => o.code === education.graduationStatus)?.label ?? ""],
            ]}
          />
        ))}
        {draft.careers.map((career, index) => (
          <ReviewCard
            key={career.id}
            title={`경력사항 ${draft.careers.length > 1 ? index + 1 : ""}`}
            rows={[
              ["회사/기관명", career.companyName],
              ["부서 · 직급", [career.department, career.position].filter(Boolean).join(" · ")],
              ["재직 상태", career.isEmployed ? "재직 중" : "근무 종료"],
              ["담당 업무", career.jobDescription],
            ]}
          />
        ))}
        <ReviewCard title="자기소개" rows={[["내용", draft.summary]]} />
        {draft.certificates.map((certificate, index) => (
          <ReviewCard
            key={certificate.id}
            title={`자격증 및 어학 ${draft.certificates.length > 1 ? index + 1 : ""}`}
            rows={[
              ["취득일자", certificate.acquiredDate || "미입력"],
              ["자격증명", certificate.name || "미입력"],
              ["발급기관", certificate.issuer || "미입력"],
              ["점수", certificate.score || "미입력"],
              ["비고", certificate.note || "미입력"],
            ]}
          />
        ))}
        <ReviewCard
          title="포트폴리오 · 링크"
          rows={[["파일", draft.portfolioName], ...draft.links.map((link) => [link.type, link.url])]}
        />
      </div>
    </ProfileRegistrationShell>
  );
}

function CompleteScreen({ name, onView }: { name: string; onView: () => void }) {
  return (
    <main className="min-h-screen bg-background px-4 py-16 text-center text-theme-primary">
      <div className="mx-auto max-w-[580px]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-surface text-3xl text-theme-success">✓</div>
        <h1 className="mt-6 text-[25px] font-extrabold">프리랜서 프로필 등록이 완료되었습니다.</h1>
        <p className="mt-2 text-[12px] text-theme-secondary">등록된 프로필을 바탕으로 적합한 프로젝트를 추천해 드립니다.</p>
        <section className="mt-8 rounded-xl border border-theme bg-surface p-7 text-left">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted text-xl font-bold text-brand">
              {name.charAt(0)}
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold">{name}</h2>
            </div>
          </div>
        </section>
        <button type="button" onClick={onView} className="mt-6 inline-flex rounded-md border border-theme bg-surface px-6 py-3 text-[12px] font-bold">
          내 프로필 보기
        </button>
      </div>
    </main>
  );
}

function ReviewCard({
  title,
  rows,
  imagePreview,
  imageName,
}: {
  title: string;
  rows: (string | undefined)[][];
  imagePreview?: string;
  imageName?: string;
}) {
  return (
    <FormCard>
      <h2 className="text-[14px] font-extrabold">{title}</h2>
      <div className={imagePreview ? "mt-4 grid gap-5 sm:grid-cols-[126px_1fr]" : "mt-4"}>
        {imagePreview ? (
          <div className="w-[126px]">
            <div
              className="h-[162px] w-[126px] rounded-md border border-theme bg-cover bg-center"
              style={{ backgroundImage: `url(${imagePreview})` }}
              role="img"
              aria-label="등록한 프로필 사진 미리보기"
            />
            {imageName ? <p className="mt-2 truncate text-[9px] text-theme-muted">{imageName}</p> : null}
          </div>
        ) : null}
        <dl className="grid gap-3 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="min-w-0 text-[11px]">
              <dt className="font-semibold text-theme-secondary">{label}</dt>
              <dd className="mt-2 min-h-10 break-all rounded-md border border-theme bg-surface px-3 py-2.5 font-semibold text-theme-primary">
                {value || "미입력"}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </FormCard>
  );
}

function ResumeSaveStatus() {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-theme bg-surface px-4 py-3 text-[10px] font-semibold text-theme-muted">
        <span className="rounded-full bg-success-surface px-3 py-1.5 font-bold text-theme-success">이력서 정보</span>
        <span>마지막 수정일은 저장된 이력서 정보를 기준으로 표시됩니다.</span>
      </div>
      <p className="rounded-lg border border-warning-border bg-warning-surface px-4 py-3 text-[10px] font-semibold leading-5 text-theme-warning">
        수정한 이력서는 새로운 추천과 매칭부터 반영되며, 이미 진행 중인 요청과 협상에는 영향을 주지 않습니다.
      </p>
    </>
  );
}

function CardTitle({ children, optional = false }: { children: ReactNode; optional?: boolean }) {
  return (
    <h2 className={labelClassName}>
      {children}
      {optional ? (
        <span className="ml-1 text-[10px] font-medium text-theme-muted">(선택)</span>
      ) : (
        <span className="ml-1 text-theme-danger">*</span>
      )}
    </h2>
  );
}
const compactInputClassName =
  "h-9 min-w-0 rounded-md border border-theme bg-surface px-2.5 text-[10px] font-semibold text-theme-primary outline-none placeholder:text-theme-muted hover:border-brand hover:outline-2 hover:outline-brand focus:border-brand focus:outline-2 focus:outline-brand disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-theme-secondary disabled:hover:border-theme disabled:hover:outline-0";

function CompactField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid min-w-0 gap-1.5 text-[9px] font-semibold text-theme-muted">
      {label}
      {children}
    </label>
  );
}

function YearMonthSelect({
  label,
  year,
  month,
  onChange,
}: {
  label: string;
  year: string;
  month: string;
  onChange: (year: string, month: string) => void;
}) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 60 }, (_, index) => String(currentYear - index));
  const months = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));
  return (
    <span className="flex items-center gap-1">
      <select aria-label={`${label} 연도`} value={year} onChange={(event) => onChange(event.target.value, month)} className="h-9 min-w-[64px] rounded-md border border-theme bg-surface px-2 text-[10px] font-semibold text-theme-primary outline-none hover:border-brand hover:outline-2 hover:outline-brand focus:border-brand focus:outline-2 focus:outline-brand">
        <option value="">연도</option>
        {years.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
      <select aria-label={`${label} 월`} value={month} onChange={(event) => onChange(year, event.target.value)} className="h-9 min-w-[56px] rounded-md border border-theme bg-surface px-2 text-[10px] font-semibold text-theme-primary outline-none hover:border-brand hover:outline-2 hover:outline-brand focus:border-brand focus:outline-2 focus:outline-brand">
        <option value="">월</option>
        {months.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
    </span>
  );
}

function EntryBox({ children }: { children: ReactNode }) {
  return <div className="mt-4 rounded-lg border border-theme bg-surface p-4">{children}</div>;
}
function AddButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 h-10 w-full rounded-md border border-dashed border-theme-strong text-[11px] font-bold text-theme-secondary hover:border-brand hover:text-brand"
    >
      {children}
    </button>
  );
}
function AgreementCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[11px] font-semibold text-theme-secondary">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="accent-[var(--brand)]" />
      {label}
    </label>
  );
}
function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p data-form-error="true" className="mt-2 text-[10px] font-bold text-theme-danger">
      {children}
    </p>
  );
}
function Field({
  label,
  value,
  onChange,
  error = false,
  type = "text",
  placeholder,
  inputMode,
  readOnly = false,
  maxLength,
}: {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
  type?: string;
  placeholder?: string;
  inputMode?: "numeric";
  readOnly?: boolean;
  maxLength?: number;
}) {
  return (
    <label className="block text-[11px] font-semibold text-theme-secondary">
      {label}
      <input
        className={`${fieldClassName} ${readOnly ? "cursor-not-allowed bg-surface-muted text-theme-muted" : ""} ${error ? "border-red-500" : ""}`}
        type={type}
        inputMode={inputMode}
        readOnly={readOnly}
        maxLength={maxLength}
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        placeholder={placeholder}
      />
      {error ? <span className="mt-1 block text-[10px] font-bold text-theme-danger">필수 정보를 입력해 주세요.</span> : null}
    </label>
  );
}
function scrollToFirstError(form: HTMLFormElement | null) {
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const error = form?.querySelector<HTMLElement>('[data-form-error="true"]');
      const section = error?.closest("section");
      if (!error || !section) return;
      section.scrollIntoView({ behavior: "smooth", block: "center" });
      section
        .querySelector<HTMLElement>("input:not(:disabled), select:not(:disabled), textarea:not(:disabled), button")
        ?.focus({ preventScroll: true });
    }),
  );
}
