"use client";

import { FileText, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { formatPhoneNumber } from "@/features/auth/utils/formatPhoneNumber";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import {
  FormCard,
  ProfileRegistrationShell,
  fieldClassName,
  labelClassName,
} from "./ProfileRegistrationShell";

type Screen = "form" | "review" | "complete";
const RESUME_STORAGE_KEY = "pairing.freelancer.profile.step2";
const PROFILE_STORAGE_KEY = "pairing.freelancer.profile.step1";
const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_PORTFOLIO_SIZE = 100 * 1024 * 1024;
type ResumeDraft = {
  phone: string;
  email: string;
  address: string;
  summary: string;
  portfolioName: string;
  profileImageName: string;
  profileImagePreview: string;
  schoolName: string;
  major: string;
  companyName: string;
  departmentRank: string;
  careerTask: string;
  isEnrolled: boolean;
  isEmployed: boolean;
  educationStatus: string;
  links: { type: string; url: string }[];
  certificateDate: string;
  certificateName: string;
  certificateIssuer: string;
  certificateScore: string;
  certificateNote: string;
};
type ProfileReviewDraft = {
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
  skills: { name: string; level: string }[];
};
const EMPTY_RESUME_DRAFT: ResumeDraft = {
  phone: "",
  email: "",
  address: "",
  summary: "",
  portfolioName: "",
  profileImageName: "",
  profileImagePreview: "",
  schoolName: "",
  major: "",
  companyName: "",
  departmentRank: "",
  careerTask: "",
  isEnrolled: false,
  isEmployed: false,
  educationStatus: "졸업",
  links: [],
  certificateDate: "",
  certificateName: "",
  certificateIssuer: "",
  certificateScore: "",
  certificateNote: "",
};

function loadResumeDraft(): ResumeDraft {
  if (typeof window === "undefined") return EMPTY_RESUME_DRAFT;
  const saved = sessionStorage.getItem(RESUME_STORAGE_KEY);
  if (!saved) return EMPTY_RESUME_DRAFT;
  try {
    return { ...EMPTY_RESUME_DRAFT, ...JSON.parse(saved) };
  } catch {
    sessionStorage.removeItem(RESUME_STORAGE_KEY);
    return EMPTY_RESUME_DRAFT;
  }
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

function loadProfileReviewDraft(): ProfileReviewDraft {
  const empty: ProfileReviewDraft = {
    category: "",
    role: "",
    affiliation: "",
    workStyle: "",
    payUnit: "",
    pay: "",
    workForm: "",
    startDate: "",
    startNegotiable: false,
    period: "",
    periodUnit: "",
    freelanceExperience: "",
    careerYears: "",
    skills: [],
  };
  if (typeof window === "undefined") return empty;
  const saved = sessionStorage.getItem(PROFILE_STORAGE_KEY);
  if (!saved) return empty;
  try {
    return { ...empty, ...JSON.parse(saved) };
  } catch {
    return empty;
  }
}

export function FreelancerResumeRegistration() {
  const currentUser = useCurrentUser();
  const formRef = useRef<HTMLFormElement>(null);
  const [initialDraft] = useState(loadResumeDraft);
  const [screen, setScreen] = useState<Screen>("review");
  const name = currentUser?.name ?? "회원정보 확인 중";
  const [phone, setPhone] = useState(initialDraft.phone);
  const [email, setEmail] = useState(initialDraft.email);
  const effectiveEmail = email || currentUser?.email || "";
  const [address, setAddress] = useState(initialDraft.address);
  const [summary, setSummary] = useState(initialDraft.summary);
  const [portfolioName, setPortfolioName] = useState(
    initialDraft.portfolioName,
  );
  const [showErrors, setShowErrors] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(initialDraft.isEnrolled);
  const [isEmployed, setIsEmployed] = useState(initialDraft.isEmployed);
  const [profileImageName, setProfileImageName] = useState(
    initialDraft.profileImageName,
  );
  const [profileImagePreview, setProfileImagePreview] = useState(
    initialDraft.profileImagePreview,
  );
  const [profileImageError, setProfileImageError] = useState("");
  const [portfolioError, setPortfolioError] = useState("");
  const [schoolName, setSchoolName] = useState(initialDraft.schoolName);
  const [major, setMajor] = useState(initialDraft.major);
  const [companyName, setCompanyName] = useState(initialDraft.companyName);
  const [departmentRank, setDepartmentRank] = useState(
    initialDraft.departmentRank,
  );
  const [careerTask, setCareerTask] = useState(initialDraft.careerTask);
  const [educationStatus, setEducationStatus] = useState(
    initialDraft.educationStatus,
  );
  const [githubInput, setGithubInput] = useState("");
  const [notionInput, setNotionInput] = useState("");
  const [links, setLinks] = useState<{ type: string; url: string }[]>(
    initialDraft.links,
  );
  const [linkError, setLinkError] = useState("");
  const [certificateDate, setCertificateDate] = useState(
    initialDraft.certificateDate,
  );
  const [certificateName, setCertificateName] = useState(
    initialDraft.certificateName,
  );
  const [certificateIssuer, setCertificateIssuer] = useState(
    initialDraft.certificateIssuer,
  );
  const [certificateScore, setCertificateScore] = useState(
    initialDraft.certificateScore,
  );
  const [certificateNote, setCertificateNote] = useState(
    initialDraft.certificateNote,
  );
  const addLink = (type: string, url: string, clear: () => void) => {
    const normalized = url.trim();
    if (!/^https?:\/\//i.test(normalized)) {
      setLinkError("http:// 또는 https://로 시작하는 링크를 입력해 주세요.");
      return;
    }
    setLinks((current) => [
      ...current.filter((link) => link.type !== type),
      { type, url: normalized },
    ]);
    setLinkError("");
    clear();
  };
  useEffect(() => {
    sessionStorage.setItem(
      RESUME_STORAGE_KEY,
      JSON.stringify({
        phone,
        email: effectiveEmail,
        address,
        summary,
        portfolioName,
        profileImageName,
        profileImagePreview,
        schoolName,
        major,
        companyName,
        departmentRank,
        careerTask,
        isEnrolled,
        isEmployed,
        educationStatus,
        links,
        certificateDate,
        certificateName,
        certificateIssuer,
        certificateScore,
        certificateNote,
      }),
    );
  }, [
    phone,
    effectiveEmail,
    address,
    summary,
    portfolioName,
    profileImageName,
    profileImagePreview,
    schoolName,
    major,
    companyName,
    departmentRank,
    careerTask,
    isEnrolled,
    isEmployed,
    educationStatus,
    links,
    certificateDate,
    certificateName,
    certificateIssuer,
    certificateScore,
    certificateNote,
  ]);

  const isValid = Boolean(
    name.trim() &&
    profileImageName &&
    profileImagePreview &&
    phone.trim() &&
    effectiveEmail.trim() &&
    address.trim() &&
    schoolName.trim() &&
    major.trim() &&
    companyName.trim() &&
    departmentRank.trim() &&
    careerTask.trim() &&
    summary.trim() &&
    portfolioName,
  );
  const review = () => {
    if (!isValid) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setScreen("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (screen === "complete")
    return <CompleteScreen name={name} onView={() => setScreen("review")} />;
  if (screen === "review")
    return (
      <ReviewScreen
        name={name}
        phone={phone}
        email={effectiveEmail}
        address={address}
        summary={summary}
        portfolioName={portfolioName}
        profileImageName={profileImageName}
        profileImagePreview={profileImagePreview}
        schoolName={schoolName}
        major={major}
        educationStatus={educationStatus}
        isEnrolled={isEnrolled}
        companyName={companyName}
        departmentRank={departmentRank}
        careerTask={careerTask}
        isEmployed={isEmployed}
        links={links}
        certificateDate={certificateDate}
        certificateName={certificateName}
        certificateIssuer={certificateIssuer}
        certificateScore={certificateScore}
        certificateNote={certificateNote}
        onEdit={() => setScreen("form")}
      />
    );

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
          review();
          if (!isValid) scrollToFirstError(formRef.current);
        }}
      >
        <ResumeSaveStatus />
        <FormCard>
          <CardTitle>기본 정보</CardTitle>
          <div className="mt-5 grid items-start gap-6 sm:grid-cols-[132px_1fr]">
            <label className="group flex w-[126px] flex-col items-start text-left text-[10px] font-semibold text-theme-muted">
              <span className="w-full text-left">프로필 사진</span>
              <span
                className="relative mt-2 flex h-[162px] w-[126px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-md border border-theme bg-surface-subtle bg-cover bg-center text-theme-secondary group-hover:border-brand group-hover:outline-2 group-hover:outline-brand"
                style={
                  profileImagePreview
                    ? { backgroundImage: `url(${profileImagePreview})` }
                    : undefined
                }
              >
                {!profileImagePreview ? (
                  <>
                    <Upload size={24} strokeWidth={1.7} aria-hidden="true" />
                    <span className="mt-2 text-[9px]">3.5 × 4.5 비율</span>
                  </>
                ) : null}
                {profileImagePreview ? (
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
                    setProfileImageName("");
                    setProfileImagePreview("");
                    setProfileImageError(
                      "JPG 또는 PNG 파일만 등록할 수 있습니다.",
                    );
                    return;
                  }
                  if (file.size > MAX_PROFILE_IMAGE_SIZE) {
                    setProfileImageName("");
                    setProfileImagePreview("");
                    setProfileImageError(
                      "프로필 사진은 5MB 이하만 등록할 수 있습니다.",
                    );
                    return;
                  }
                  try {
                    const preview = await createProfileImagePreview(file);
                    setProfileImageName(file.name);
                    setProfileImagePreview(preview);
                  } catch {
                    setProfileImageName("");
                    setProfileImagePreview("");
                    setProfileImageError("사진 미리보기를 만들 수 없습니다. 다른 이미지를 선택해 주세요.");
                  }
                }}
              />
              {profileImageName ? (
                <span className="mt-2 flex w-[126px] items-center justify-between gap-2">
                  <span className="min-w-0 flex-1 truncate text-left text-[9px] text-theme-success">
                    {profileImageName}
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
                value={phone}
                onChange={(value) => setPhone(formatPhoneNumber(value))}
                error={showErrors && !phone.trim()}
                inputMode="numeric"
                placeholder="'-' 제외하고 입력해주세요"
              />
              <Field
                label="이메일"
                type="email"
                value={effectiveEmail}
                onChange={setEmail}
                error={showErrors && !email.trim()}
                placeholder="ex) hongildon@pairing.com"
              />
              <label className="block text-[11px] font-semibold text-theme-secondary sm:col-span-2">
                주소 <span className="text-theme-danger">*</span>
                <input
                  className={`${fieldClassName} mt-2`}
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="주소를 입력해주세요"
                />
              </label>
            </div>
          </div>
          {profileImageError ? (
            <ErrorText>{profileImageError}</ErrorText>
          ) : null}
          {showErrors && !(profileImageName && profileImagePreview) ? (
            <ErrorText>확인 페이지에 표시할 프로필 사진을 다시 선택해 주세요.</ErrorText>
          ) : null}
        </FormCard>

        <FormCard>
          <CardTitle>학력사항</CardTitle>
          <EntryBox>
            <p className="text-[10px] text-theme-muted">학력 1</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <CompactSelect
                label="입학 연도"
                options={["2008", "2009", "2010"]}
              />
              <CompactSelect label="입학 월" options={["01", "02", "03"]} />
              <span className="text-theme-muted">~</span>
              {!isEnrolled ? (
                <>
                  <CompactSelect
                    label="졸업 연도"
                    options={["2012", "2013", "2014"]}
                  />
                  <CompactSelect label="졸업 월" options={["01", "02", "03"]} />
                </>
              ) : null}
              <label className="ml-auto flex cursor-pointer items-center gap-1 text-[10px] text-theme-secondary">
                <input
                  type="checkbox"
                  checked={isEnrolled}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setIsEnrolled(checked);
                    if (checked) setEducationStatus("재학 중");
                  }}
                  className="accent-[var(--brand)]"
                />{" "}
                재학 중
              </label>
            </div>
            <div className="mt-3 grid items-end gap-2 sm:grid-cols-[1.3fr_1.3fr_.8fr_.7fr]">
              <CompactField label="학교명">
                <input
                  value={schoolName}
                  onChange={(event) => setSchoolName(event.target.value)}
                  className={compactInputClassName}
                  placeholder="학교명"
                />
              </CompactField>
              <CompactField label="학과(과)">
                <input
                  value={major}
                  onChange={(event) => setMajor(event.target.value)}
                  className={compactInputClassName}
                  placeholder="전공"
                />
              </CompactField>
              <CompactField label="학력 상태">
                <select
                  value={educationStatus}
                  onChange={(event) => setEducationStatus(event.target.value)}
                  disabled={isEnrolled}
                  className={`${compactInputClassName} disabled:cursor-not-allowed disabled:bg-surface-muted`}
                  aria-label="학위"
                >
                  <option>졸업</option>
                  <option>재학 중</option>
                  <option>수료</option>
                </select>
              </CompactField>
              <CompactField label="캠퍼스">
                <select
                  className={compactInputClassName}
                  aria-label="학력 구분"
                >
                  <option>본교</option>
                  <option>분교</option>
                </select>
              </CompactField>
            </div>
          </EntryBox>
          {showErrors && !(schoolName.trim() && major.trim()) ? (
            <ErrorText>학력사항을 입력해 주세요.</ErrorText>
          ) : null}
          <AddButton>＋ 학력 추가</AddButton>
        </FormCard>

        <ResumePreferenceCards />

        <FormCard>
          <CardTitle>경력사항</CardTitle>
          <EntryBox>
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-theme-muted">경력 1</p>
              <button
                type="button"
                className="text-[14px] text-theme-muted"
                aria-label="경력 삭제"
              >
                ×
              </button>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <CompactSelect
                label="시작 연도"
                options={["2022", "2023", "2024"]}
              />
              <CompactSelect label="시작 월" options={["01", "02", "03"]} />
              <span className="text-theme-muted">~</span>
              {!isEmployed ? (
                <>
                  <CompactSelect
                    label="종료 연도"
                    options={["2024", "2025", "2026"]}
                  />
                  <CompactSelect label="종료 월" options={["01", "02", "03"]} />
                </>
              ) : null}
              <label className="ml-auto flex cursor-pointer items-center gap-1 text-[10px] text-theme-secondary">
                <input
                  type="checkbox"
                  checked={isEmployed}
                  onChange={(event) => setIsEmployed(event.target.checked)}
                  className="accent-[var(--brand)]"
                />{" "}
                재직 중
              </label>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <input
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                className={compactInputClassName}
                placeholder="회사/기관명"
              />
              <input
                value={departmentRank}
                onChange={(event) => setDepartmentRank(event.target.value)}
                className={compactInputClassName}
                placeholder="부서 및 직급"
              />
            </div>
            <textarea
              value={careerTask}
              onChange={(event) => setCareerTask(event.target.value)}
              className={`${fieldClassName} mt-3 h-20 py-3`}
              placeholder="담당 업무 · 담당한 역할, 주요 업무와 사용 기술을 구체적으로 작성해 주세요."
            />
          </EntryBox>
          {showErrors &&
          !(
            companyName.trim() &&
            departmentRank.trim() &&
            careerTask.trim()
          ) ? (
            <ErrorText>경력사항을 모두 입력해 주세요.</ErrorText>
          ) : null}
          <AddButton>＋ 경력 추가</AddButton>
        </FormCard>

        <FormCard>
          <CardTitle optional>자격증 및 어학</CardTitle>
          <EntryBox>
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-theme-muted">자격증 및 어학 1</p>
              <button
                type="button"
                className="text-[14px] text-theme-muted"
                aria-label="자격증 삭제"
              >
                ×
              </button>
            </div>
            <div className="mt-2 grid items-end gap-2 sm:grid-cols-[1fr_1.3fr_1.1fr_.7fr_1fr]">
              <CompactField label="취득일자">
                <input
                  type="date"
                  value={certificateDate}
                  onChange={(event) => setCertificateDate(event.target.value)}
                  className={compactInputClassName}
                />
              </CompactField>
              <CompactField label="자격증명">
                <input
                  value={certificateName}
                  onChange={(event) => setCertificateName(event.target.value)}
                  className={compactInputClassName}
                  placeholder="자격증명 입력"
                />
              </CompactField>
              <CompactField label="발급기관">
                <input
                  value={certificateIssuer}
                  onChange={(event) => setCertificateIssuer(event.target.value)}
                  className={compactInputClassName}
                  placeholder="발급기관"
                />
              </CompactField>
              <CompactField label="점수">
                <input
                  value={certificateScore}
                  onChange={(event) => setCertificateScore(event.target.value)}
                  className={compactInputClassName}
                  placeholder="점수"
                />
              </CompactField>
              <CompactField label="비고">
                <input
                  value={certificateNote}
                  onChange={(event) => setCertificateNote(event.target.value)}
                  className={compactInputClassName}
                  placeholder="비고"
                />
              </CompactField>
            </div>
          </EntryBox>
          <AddButton>＋ 자격증 및 어학 추가</AddButton>
        </FormCard>

        <FormCard>
          <CardTitle>간단 자기소개</CardTitle>
          <p className="mt-1 text-[11px] text-theme-muted">
            주요 경력과 강점, 선호하는 업무 방식과 함께 알릴 역량을 작성해
            주세요.
          </p>
          <textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            maxLength={1500}
            className={`${fieldClassName} h-36 resize-none py-3 ${showErrors && !summary.trim() ? "border-red-500" : ""}`}
            placeholder="자기소개를 입력하세요..."
          />
          <p className="mt-2 text-right text-[10px] text-theme-muted">
            {summary.length} / 1,500자
          </p>
          {showErrors && !summary.trim() ? (
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
            className={`mt-4 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-surface-subtle text-center hover:border-brand hover:outline-2 hover:outline-brand ${showErrors && !portfolioName ? "border-red-500" : "border-theme-strong"}`}
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
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.currentTarget.value = "";
                setPortfolioError("");
                if (!file) return;
                if (file.type !== "application/pdf") {
                  setPortfolioName("");
                  setPortfolioError(
                    "포트폴리오는 PDF 파일만 등록할 수 있습니다.",
                  );
                  return;
                }
                if (file.size > MAX_PORTFOLIO_SIZE) {
                  setPortfolioName("");
                  setPortfolioError(
                    "포트폴리오는 100MB 이하만 등록할 수 있습니다.",
                  );
                  return;
                }
                setPortfolioName(file.name);
              }}
            />
          </label>
          {portfolioError ? <ErrorText>{portfolioError}</ErrorText> : null}
          {portfolioName ? (
            <div className="mt-3 flex items-center gap-3 rounded-md border border-theme bg-success-surface px-3 py-2 text-[11px] font-bold text-theme-success">
              <FileText size={18} className="shrink-0" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">{portfolioName}</span>
              <button
                type="button"
                aria-label="포트폴리오 파일 제거"
                onClick={() => {
                  setPortfolioName("");
                  setPortfolioError("");
                }}
                className="shrink-0 text-theme-muted hover:text-theme-danger"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          ) : null}
          {showErrors && !portfolioName ? (
            <ErrorText>포트폴리오 PDF 파일을 등록해 주세요.</ErrorText>
          ) : null}
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
              onClick={() =>
                addLink("GitHub", githubInput, () => setGithubInput(""))
              }
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
              onClick={() =>
                addLink("Notion", notionInput, () => setNotionInput(""))
              }
              className="mt-2 shrink-0 rounded-md bg-brand px-4 text-[11px] font-bold text-brand-contrast"
            >
              링크 추가
            </button>
          </div>
          {linkError ? <ErrorText>{linkError}</ErrorText> : null}
          {links.length ? (
            <ul className="mt-4 space-y-2">
              {links.map((link) => (
                <li
                  key={link.type}
                  className="flex items-center gap-3 rounded-md border border-theme bg-surface-subtle px-3 py-2 text-[10px]"
                >
                  <span className="shrink-0 font-bold text-brand">
                    {link.type}
                  </span>
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
                      setLinks((current) =>
                        current.filter((item) => item.type !== link.type),
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
              className="rounded-md border border-theme bg-surface px-5 py-3 text-[12px] font-bold"
            >
              임시 저장
            </button>
            <button
              type="submit"
              className="rounded-md bg-brand px-6 py-3 text-[12px] font-bold text-brand-contrast hover:bg-brand-hover"
            >
              변경사항 저장
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
  address,
  summary,
  portfolioName,
  profileImageName,
  profileImagePreview,
  schoolName,
  major,
  educationStatus,
  isEnrolled,
  companyName,
  departmentRank,
  careerTask,
  isEmployed,
  links,
  certificateDate,
  certificateName,
  certificateIssuer,
  certificateScore,
  certificateNote,
  onEdit,
}: {
  name: string;
  phone: string;
  email: string;
  address: string;
  summary: string;
  portfolioName: string;
  profileImageName: string;
  profileImagePreview: string;
  schoolName: string;
  major: string;
  educationStatus: string;
  isEnrolled: boolean;
  companyName: string;
  departmentRank: string;
  careerTask: string;
  isEmployed: boolean;
  links: { type: string; url: string }[];
  certificateDate: string;
  certificateName: string;
  certificateIssuer: string;
  certificateScore: string;
  certificateNote: string;
  onEdit: () => void;
}) {
  const profile = loadProfileReviewDraft();
  const skillText = profile.skills
    .map((skill) => `${skill.name} (${skill.level})`)
    .join(" · ");

  return (
    <ProfileRegistrationShell
      step={2}
      title="내 이력서"
      description="등록된 이력서와 포트폴리오 정보를 확인할 수 있습니다."
    >
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
            imagePreview={profileImagePreview}
            imageName={profileImageName}
            rows={[
              ["성명", name],
            ["전화번호", phone],
            ["이메일", email],
            ["주소", address],
          ]}
        />
        <ReviewCard
          title="희망 조건"
          rows={[
            ["직군", profile.category],
            ["직무", profile.role],
            ["소속", profile.affiliation || "없음"],
            ["근무 방식", profile.workStyle],
            ["근무 형태", profile.workForm],
            ["희망 급여", `${profile.payUnit} ${profile.pay}만원`],
            [
              "시작 가능일",
              profile.startNegotiable ? "협의 가능" : profile.startDate,
            ],
            ["예상 기간", `${profile.period}${profile.periodUnit}`],
            ["프리랜서 경험", profile.freelanceExperience],
            ["전체 경력", `${profile.careerYears}년`],
          ]}
        />
        <ReviewCard title="보유 스킬" rows={[["스킬 · 숙련도", skillText]]} />

        <ReviewCard
          title="학력사항"
          rows={[
            ["학교명", schoolName],
            ["학과(과)", major],
            ["학력 상태", isEnrolled ? "재학 중" : educationStatus],
          ]}
        />
        <ReviewCard
          title="경력사항"
          rows={[
            ["회사/기관명", companyName],
            ["부서 및 직급", departmentRank],
            ["재직 상태", isEmployed ? "재직 중" : "근무 종료"],
            ["담당 업무", careerTask],
          ]}
        />
        <ReviewCard title="자기소개" rows={[["내용", summary]]} />
        {certificateName ||
        certificateIssuer ||
        certificateScore ||
        certificateNote ? (
          <ReviewCard
            title="자격증 및 어학"
            rows={[
              ["취득일자", certificateDate || "미입력"],
              ["자격증명", certificateName || "미입력"],
              ["발급기관", certificateIssuer || "미입력"],
              ["점수", certificateScore || "미입력"],
              ["비고", certificateNote || "미입력"],
            ]}
          />
        ) : null}
        <ReviewCard
          title="포트폴리오 · 링크"
          rows={[
            ["파일", portfolioName],
            ...links.map((link) => [link.type, link.url]),
          ]}
        />
      </div>
    </ProfileRegistrationShell>
  );
}

function CompleteScreen({
  name,
  onView,
}: {
  name: string;
  onView: () => void;
}) {
  return (
    <main className="min-h-screen bg-background px-4 py-16 text-center text-theme-primary">
      <div className="mx-auto max-w-[580px]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-surface text-3xl text-theme-success">
          ✓
        </div>
        <h1 className="mt-6 text-[25px] font-extrabold">
          프리랜서 프로필 등록이 완료되었습니다.
        </h1>
        <p className="mt-2 text-[12px] text-theme-secondary">
          등록된 프로필을 바탕으로 적합한 프로젝트를 추천해 드립니다.
        </p>
        <section className="mt-8 rounded-xl border border-theme bg-surface p-7 text-left">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted text-xl font-bold text-brand">
              {name.charAt(0)}
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold">{name}</h2>
              <p className="mt-1 text-[11px] text-theme-secondary">
                웹 디자이너 · 전체 경력 1년
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {["React", "Next.js", "Python", "Node.js"].map((skill) => (
                  <span
                    key={skill}
                    className="rounded border border-theme bg-surface-subtle px-2 py-1 text-[10px] font-bold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
        <button
          type="button"
          onClick={onView}
          className="mt-6 inline-flex rounded-md border border-theme bg-surface px-6 py-3 text-[12px] font-bold"
        >
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
  rows: string[][];
  imagePreview?: string;
  imageName?: string;
}) {
  return (
    <FormCard>
      <h2 className="text-[14px] font-extrabold">{title}</h2>
      <div
        className={
          imagePreview ? "mt-4 grid gap-5 sm:grid-cols-[126px_1fr]" : "mt-4"
        }
      >
        {imagePreview ? (
          <div className="w-[126px]">
            <div
              className="h-[162px] w-[126px] rounded-md border border-theme bg-cover bg-center"
              style={{ backgroundImage: `url(${imagePreview})` }}
              role="img"
              aria-label="등록한 프로필 사진 미리보기"
            />
            {imageName ? (
              <p className="mt-2 truncate text-[9px] text-theme-muted">
                {imageName}
              </p>
            ) : null}
          </div>
        ) : null}
        <dl className="grid gap-3 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="min-w-0 text-[11px]">
              <dt className="font-semibold text-theme-secondary">{label}</dt>
              <dd className="mt-2 min-h-10 break-all rounded-md border border-theme bg-white px-3 py-2.5 font-semibold text-theme-primary">
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
        <span className="rounded-full bg-success-surface px-3 py-1.5 font-bold text-theme-success">
          이력서 등록 완료
        </span>
        <span>마지막 수정일은 저장된 이력서 정보를 기준으로 표시됩니다.</span>
      </div>
      <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-[10px] font-semibold leading-5 text-blue-600">
        수정한 이력서는 새로운 추천과 매칭부터 반영되며, 이미 진행 중인 요청과 협상에는 영향을 주지 않습니다.
      </p>
    </>
  );
}

function ResumePreferenceCards() {
  const [pay, setPay] = useState("5,000,000");
  const [startDate, setStartDate] = useState("");
  const [period, setPeriod] = useState("6");
  const [periodUnit, setPeriodUnit] = useState("개월");
  const [careerYears, setCareerYears] = useState("5");
  const [skills, setSkills] = useState([
    { name: "React", level: "고급" },
    { name: "TypeScript", level: "고급" },
    { name: "Next.js", level: "중급" },
    { name: "Node.js", level: "중급" },
  ]);

  return (
    <>
      <FormCard>
        <CardTitle>기본 희망 조건</CardTitle>
        <div className="mt-4 grid gap-x-4 gap-y-4 sm:grid-cols-2">
          <CompactField label="직군">
            <select className={compactInputClassName} defaultValue="개발">
              <option>개발</option>
              <option>디자인</option>
            </select>
          </CompactField>
          <CompactField label="직무">
            <select className={compactInputClassName} defaultValue="프론트엔드 개발자">
              <option>프론트엔드 개발자</option>
              <option>백엔드 개발자</option>
            </select>
          </CompactField>
          <CompactField label="소속">
            <select className={compactInputClassName} defaultValue="개인">
              <option>개인</option>
            </select>
          </CompactField>
          <fieldset>
            <legend className="text-[9px] font-semibold text-theme-muted">근무 방식</legend>
            <div className="mt-2 flex flex-wrap gap-4 text-[10px] font-semibold">
              {['재택', '상주', '모두 가능'].map((item, index) => (
                <label key={item} className="flex items-center gap-1.5">
                  <input type="radio" name="resume-work-style" defaultChecked={index === 2} className="accent-[var(--brand)]" />
                  {item}
                </label>
              ))}
            </div>
          </fieldset>
          <CompactField label="급여 단위">
            <select className={compactInputClassName} defaultValue="월급">
              <option>월급</option>
              <option>일급</option>
              <option>시급</option>
            </select>
          </CompactField>
          <CompactField label="희망 급여">
            <div className="grid grid-cols-[minmax(0,1fr)_42px] items-center gap-2">
              <input
                className={compactInputClassName}
                value={pay}
                onChange={(event) => setPay(formatNumber(event.target.value))}
                inputMode="numeric"
                aria-label="희망 급여"
              />
              <span className="text-[10px] font-semibold text-theme-muted">원</span>
            </div>
          </CompactField>
          <CompactField label="프로젝트 시작 가능일">
            <input
              className={compactInputClassName}
              type="date"
              min={getTodayDateString()}
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </CompactField>
          <CompactField label="예상 기간">
            <div className="grid grid-cols-[minmax(0,1fr)_72px] gap-2">
              <input
                className={compactInputClassName}
                value={period}
                onChange={(event) => setPeriod(digitsOnly(event.target.value).slice(0, 2))}
                inputMode="numeric"
                min="1"
                max="24"
                aria-label="예상 기간"
              />
              <select value={periodUnit} onChange={(event) => setPeriodUnit(event.target.value)} className={compactInputClassName} aria-label="예상 기간 단위">
                <option>개월</option>
                <option>주</option>
              </select>
            </div>
          </CompactField>
          <CompactField label="프리랜서 경험">
            <select className={compactInputClassName} defaultValue="있음">
              <option>있음</option>
              <option>없음</option>
            </select>
          </CompactField>
          <CompactField label="전체 경력 연수">
            <div className="grid grid-cols-[minmax(0,1fr)_42px] items-center gap-2">
              <input
                className={compactInputClassName}
                value={careerYears}
                onChange={(event) => setCareerYears(digitsOnly(event.target.value).slice(0, 2))}
                inputMode="numeric"
                min="1"
                aria-label="전체 경력 연수"
              />
              <span className="text-[10px] font-semibold text-theme-muted">년</span>
            </div>
          </CompactField>
        </div>
      </FormCard>

      <FormCard>
        <CardTitle>보유 스킬</CardTitle>
        <input className={fieldClassName} placeholder="스킬 검색" />
        <div className="mt-3 space-y-2">
          {skills.map((skill) => (
            <div key={skill.name} className="flex min-w-0 items-center gap-3 rounded-md bg-surface-subtle px-3 py-2.5">
              <span className="min-w-0 flex-1 truncate text-[10px] font-semibold">{skill.name}</span>
              <select
                aria-label={`${skill.name} 숙련도`}
                value={skill.level}
                onChange={(event) => setSkills((current) => current.map((item) => item.name === skill.name ? { ...item, level: event.target.value } : item))}
                className="h-8 rounded-md border border-theme bg-surface px-3 text-[10px] font-semibold"
              >
                <option>초급</option>
                <option>중급</option>
                <option>고급</option>
              </select>
              <button type="button" aria-label={`${skill.name} 삭제`} onClick={() => setSkills((current) => current.filter((item) => item.name !== skill.name))} className="shrink-0 text-[12px] text-theme-danger">×</button>
            </div>
          ))}
        </div>
      </FormCard>
    </>
  );
}
function CardTitle({
  children,
  optional = false,
}: {
  children: ReactNode;
  optional?: boolean;
}) {
  return (
    <h2 className={labelClassName}>
      {children}
      {optional ? (
        <span className="ml-1 text-[10px] font-medium text-theme-muted">
          (선택)
        </span>
      ) : (
        <span className="ml-1 text-theme-danger">*</span>
      )}
    </h2>
  );
}
const compactInputClassName =
  "h-9 min-w-0 rounded-md border border-theme bg-surface px-2.5 text-[10px] font-semibold text-theme-primary outline-none placeholder:text-theme-muted hover:border-brand hover:outline-2 hover:outline-brand focus:border-brand focus:outline-2 focus:outline-brand disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-theme-secondary disabled:hover:border-theme disabled:hover:outline-0";

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function formatNumber(value: string) {
  const digits = digitsOnly(value);
  return digits ? Number(digits).toLocaleString("ko-KR") : "";
}
function CompactField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid min-w-0 gap-1.5 text-[9px] font-semibold text-theme-muted">
      {label}
      {children}
    </label>
  );
}
function CompactSelect({
  label,
  options,
  disabled = false,
  disabledLabel = "해당 없음",
}: {
  label: string;
  options: string[];
  disabled?: boolean;
  disabledLabel?: string;
}) {
  return (
    <select
      aria-label={label}
      disabled={disabled}
      className="h-9 min-w-[64px] rounded-md border border-theme bg-surface px-2 text-[10px] font-semibold text-theme-primary outline-none hover:border-brand hover:outline-2 hover:outline-brand focus:border-brand focus:outline-2 focus:outline-brand disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-theme-muted disabled:hover:border-theme disabled:hover:outline-0"
    >
      <option>{disabled ? disabledLabel : options[0]}</option>
      {options.slice(1).map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}
function EntryBox({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 rounded-lg border border-theme bg-surface p-4">
      {children}
    </div>
  );
}
function AddButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      className="mt-3 h-10 w-full rounded-md border border-dashed border-theme-strong text-[11px] font-bold text-theme-secondary hover:border-brand hover:text-brand"
    >
      {children}
    </button>
  );
}
function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p
      data-form-error="true"
      className="mt-2 text-[10px] font-bold text-theme-danger"
    >
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
}: {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
  type?: string;
  placeholder?: string;
  inputMode?: "numeric";
  readOnly?: boolean;
}) {
  return (
    <label className="block text-[11px] font-semibold text-theme-secondary">
      {label}
      <input
        className={`${fieldClassName} ${readOnly ? "cursor-not-allowed bg-surface-muted text-theme-muted" : ""} ${error ? "border-red-500" : ""}`}
        type={type}
        inputMode={inputMode}
        readOnly={readOnly}
        value={value}
        onChange={
          onChange ? (event) => onChange(event.target.value) : undefined
        }
        placeholder={placeholder}
      />
      {error ? (
        <span className="mt-1 block text-[10px] font-bold text-theme-danger">
          필수 정보를 입력해 주세요.
        </span>
      ) : null}
    </label>
  );
}
function scrollToFirstError(form: HTMLFormElement | null) {
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const error = form?.querySelector<HTMLElement>(
        '[data-form-error="true"]',
      );
      const section = error?.closest("section");
      if (!error || !section) return;
      section.scrollIntoView({ behavior: "smooth", block: "center" });
      section
        .querySelector<HTMLElement>(
          "input:not(:disabled), select:not(:disabled), textarea:not(:disabled), button",
        )
        ?.focus({ preventScroll: true });
    }),
  );
}
