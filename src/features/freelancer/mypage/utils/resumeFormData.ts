import { formatPhoneNumber } from "@/features/auth/utils/formatPhoneNumber";
import type {
  CampusType,
  FreelancerCondition,
  GraduationStatus,
  MetaOption,
  PayUnit,
  PeriodUnit,
  ResumeDetailBody,
  ResumeUpdateRequest,
  SkillLevel,
  WorkForm,
  WorkStyle,
} from "@/features/freelancer/mypage/types/resume";

export const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;
export const MAX_PORTFOLIO_SIZE = 100 * 1024 * 1024;

export const GRADUATION_STATUS_OPTIONS: { code: GraduationStatus; label: string }[] = [
  { code: "GRADUATED", label: "졸업" },
  { code: "EXPECTED", label: "졸업예정" },
  { code: "ATTENDING", label: "재학 중" },
  { code: "LEAVE", label: "휴학" },
  { code: "DROPPED", label: "중퇴" },
];
export const CAMPUS_TYPE_OPTIONS: { code: CampusType; label: string }[] = [
  { code: "MAIN", label: "본교" },
  { code: "BRANCH", label: "분교" },
];

export type EducationForm = {
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
export type CareerForm = {
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
export type CertificateForm = {
  id: string;
  acquiredDate: string;
  name: string;
  issuer: string;
  score: string;
  note: string;
};
export type LinkForm = { url: string };
export type Agreements = {
  profileCollectionAgreed: boolean;
  profileProvisionAgreed: boolean;
  aiAnalysisAgreed: boolean;
  careerPortfolioUsageAgreed: boolean;
};
export type ConditionSkillForm = { code: string; levelCode: string };
export type ConditionForm = {
  categoryCode: string;
  roleCode: string;
  workStyleCode: string;
  workFormCode: string;
  payUnitCode: string;
  pay: string;
  minPay: string;
  startDate: string;
  startNegotiable: boolean;
  period: string;
  periodUnitCode: string;
  freelanceExperience: string;
  careerYears: string;
  skills: ConditionSkillForm[];
};

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}
export function blankEducation(): EducationForm {
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
export function blankCareer(): CareerForm {
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
export function blankCertificate(): CertificateForm {
  return {
    id: makeId(),
    acquiredDate: "",
    name: "",
    issuer: "",
    score: "",
    note: "",
  };
}
export function blankConditionForm(): ConditionForm {
  return {
    categoryCode: "",
    roleCode: "",
    workStyleCode: "",
    workFormCode: "",
    payUnitCode: "",
    pay: "",
    minPay: "",
    startDate: "",
    startNegotiable: false,
    period: "",
    periodUnitCode: "",
    freelanceExperience: "",
    careerYears: "",
    skills: [],
  };
}
export function mapConditionToForm(condition: FreelancerCondition): ConditionForm {
  return {
    categoryCode: condition.jobCategory,
    roleCode: condition.jobRole,
    workStyleCode: condition.workStyle,
    workFormCode: condition.workForm,
    payUnitCode: condition.payUnit,
    pay: condition.payAmount
      ? String(Math.round(condition.payAmount / 10_000))
      : "",
    minPay: condition.minAcceptAmount
      ? String(Math.round(condition.minAcceptAmount / 10_000))
      : "",
    startDate: condition.availableFrom ?? "",
    startNegotiable: condition.startNegotiable,
    period: condition.periodValue ? String(condition.periodValue) : "",
    periodUnitCode: condition.periodUnit,
    freelanceExperience: condition.hasFreelanceExperience ? "있음" : "없음",
    careerYears: condition.careerYears ? String(condition.careerYears) : "",
    skills: condition.skills.map((skill) => ({
      code: skill.skillCode,
      levelCode: skill.skillLevel,
    })),
  };
}
export function buildConditionPayload(form: ConditionForm): FreelancerCondition {
  return {
    jobCategory: form.categoryCode,
    jobRole: form.roleCode,
    workStyle: form.workStyleCode as WorkStyle,
    workForm: form.workFormCode as WorkForm,
    payUnit: form.payUnitCode as PayUnit,
    payAmount: Number(form.pay.replaceAll(",", "")) * 10_000 || 0,
    minAcceptAmount: Number(form.minPay.replaceAll(",", "")) * 10_000 || 0,
    availableFrom: form.startNegotiable ? null : form.startDate || null,
    startNegotiable: form.startNegotiable,
    periodValue: Number(form.period) || 0,
    periodUnit: form.periodUnitCode as PeriodUnit,
    hasFreelanceExperience: form.freelanceExperience === "있음",
    careerYears: Number(form.careerYears) || 0,
    skills: form.skills.map((skill) => ({
      skillCode: skill.code,
      skillLevel: skill.levelCode as SkillLevel,
    })),
  };
}
export function labelOf(options: MetaOption[], code: string) {
  return options.find((option) => option.code === code)?.label ?? code;
}
export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}
export function formatNumber(value: string) {
  const digits = digitsOnly(value);
  return digits ? Number(digits).toLocaleString("ko-KR") : "";
}

export type ResumeDraft = {
  phone: string;
  email: string;
  zipCode: string;
  address: string;
  addressDetail: string;
  summary: string;
  portfolioName: string;
  portfolioFileId?: number;
  portfolioUrl: string | null;
  profileImageName: string;
  profileImagePreview: string;
  profileImageFileId?: number;
  profileImageUrl: string | null;
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

export function emptyDraft(): ResumeDraft {
  return {
    phone: "",
    email: "",
    zipCode: "",
    address: "",
    addressDetail: "",
    summary: "",
    portfolioName: "",
    portfolioFileId: undefined,
    portfolioUrl: null,
    profileImageName: "",
    profileImagePreview: "",
    profileImageFileId: undefined,
    profileImageUrl: null,
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
// 조회 응답은 저장(profileFileId/portfolioFileId 숫자)과 달리 profileImageUrl/portfolioUrl(URL 문자열)만 내려주므로
// 파일 ID는 비워두고 새로 업로드했을 때만 채웁니다.
export function mapApiToDraft(resume: ResumeDetailBody): ResumeDraft {
  return {
    phone: formatPhoneNumber(resume.contactPhone),
    email: resume.contactEmail,
    zipCode: resume.zipCode,
    address: resume.address,
    addressDetail: resume.addressDetail,
    summary: resume.selfIntroduction,
    portfolioName: resume.portfolioUrl ? "등록된 포트폴리오" : "",
    portfolioFileId: undefined,
    portfolioUrl: resume.portfolioUrl,
    profileImageName: resume.profileImageUrl ? "등록된 프로필 사진" : "",
    profileImagePreview: "",
    profileImageFileId: undefined,
    profileImageUrl: resume.profileImageUrl,
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
    links: resume.links.map((link) => ({ url: link.url })),
    agreements: { ...resume.agreements },
  };
}

export function isResumeDraft(value: unknown): value is ResumeDraft {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    "agreements" in (value as object)
  );
}

export function createProfileImagePreview(file: File): Promise<string> {
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
        if (!context)
          return reject(new Error("이미지 미리보기를 만들 수 없습니다."));
        const scale = Math.max(
          canvas.width / image.width,
          canvas.height / image.height,
        );
        const width = image.width * scale;
        const height = image.height * scale;
        context.drawImage(
          image,
          (canvas.width - width) / 2,
          (canvas.height - height) / 2,
          width,
          height,
        );
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function buildResumePayload(
  draft: ResumeDraft,
  conditionForm: ConditionForm,
  effectiveEmail: string,
): ResumeUpdateRequest {
  return {
    condition: buildConditionPayload(conditionForm),
    ...(draft.profileImageFileId == null
      ? {}
      : { profileFileId: draft.profileImageFileId }),
    contactPhone: draft.phone,
    contactEmail: effectiveEmail,
    zipCode: draft.zipCode,
    address: draft.address,
    addressDetail: draft.addressDetail,
    educations: draft.educations.map((education) => ({
      startDate: `${education.startYear}-${education.startMonth}-01`,
      endDate:
        education.graduationStatus === "ATTENDING" ||
        !education.endYear ||
        !education.endMonth
          ? undefined
          : `${education.endYear}-${education.endMonth}-01`,
      schoolName: education.schoolName.trim(),
      major: education.major.trim() || undefined,
      graduationStatus: education.graduationStatus,
      campusType: education.campusType,
    })),
    careers: draft.careers.map((career) => ({
      startDate: `${career.startYear}-${career.startMonth}-01`,
      endDate:
        career.isEmployed || !career.endYear || !career.endMonth
          ? undefined
          : `${career.endYear}-${career.endMonth}-01`,
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
    ...(draft.portfolioFileId == null
      ? {}
      : { portfolioFileId: draft.portfolioFileId }),
    links: draft.links.map((link) => ({ url: link.url })),
    agreements: draft.agreements,
  };
}
