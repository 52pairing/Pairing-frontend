"use client";

import { useEffect, useState } from "react";
import { ProfileUpdateVerificationModal } from "@/features/auth/components/ProfileUpdateVerificationModal";
import { formatPhoneNumber } from "@/features/auth/utils/formatPhoneNumber";
import { ClientMyPageLayout } from "@/features/client/mypage/components/ClientMyPageLayout";
import { getClientGradeCriteria, getClientMyGrade } from "@/features/client/mypage/services/grade";
import { deleteCompanyLogoFile, getClientProfile, updateClientProfile, uploadCompanyLogo } from "@/features/client/mypage/services/clientProfile";
import type { ClientGradeCriteriaResponse, ClientMyGradeResponse } from "@/features/client/mypage/types/grade";
import type { ClientMyPageResponse, ClientProfileUpdateRequest, EmployeeCountCode } from "@/features/client/mypage/types/profile";
import { AddressFields } from "@/features/common/components/AddressFields";
import { EMPTY_ADDRESS_PARTS, type AddressParts } from "@/features/common/types/address";

const EMPLOYEE_OPTIONS: Array<{ value: EmployeeCountCode; label: string }> = [
  { value: "SIZE_1_4", label: "1~4명" }, { value: "SIZE_5_9", label: "5~9명" },
  { value: "SIZE_10_49", label: "10~49명" }, { value: "SIZE_50_299", label: "50~299명" },
  { value: "SIZE_300_OVER", label: "300명 이상" },
];

const BUSINESS_FIELD_LABELS: Record<string, string> = {
  IT_CONTENTS_AI: "IT·콘텐츠·AI", GAME: "게임", SALES_DISTRIBUTION_LOGISTICS: "영업·유통·물류",
  MANUFACTURING: "제조", ADVANCED_SCIENCE: "첨단과학", OTHER_SERVICE: "기타 서비스", FINANCE: "금융",
  EDUCATION: "교육", REAL_ESTATE: "부동산", ARTS_SPORTS_LEISURE: "예술·스포츠·여가",
  HEALTH_WELFARE: "보건·복지", CONSTRUCTION: "건설", LODGING_FOOD: "숙박·음식",
  AGRICULTURE_FISHERY: "농림·어업", MARKETING: "마케팅", WATER_ENVIRONMENT: "수도·환경",
  ELECTRICITY_GAS: "전기·가스", PUBLIC_ADMIN_DEFENSE: "공공행정·국방", MINING: "광업", MEDICAL_HEALTHCARE: "의료·헬스케어",
};

type EditableProfile = Pick<ClientProfileUpdateRequest, "companyName" | "employeeCount"> & { phone: string; address: AddressParts };

export function ClientProfile() {
  const [profile, setProfile] = useState<ClientMyPageResponse | null>(null);
  const [draft, setDraft] = useState<EditableProfile | null>(null);
  const [logoFileId, setLogoFileId] = useState<number>();
  const [logoPreview, setLogoPreview] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [reauthRequired, setReauthRequired] = useState(false);
  const [grade, setGrade] = useState<ClientMyGradeResponse | null>(null);
  const [criteria, setCriteria] = useState<ClientGradeCriteriaResponse[]>([]);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getClientProfile(), getClientMyGrade(), getClientGradeCriteria()]).then((results) => {
      if (!active) return;
      const [profileResult, gradeResult, criteriaResult] = results;
      if (profileResult.status === "fulfilled") setProfile(profileResult.value);
      else setError(profileResult.reason instanceof Error ? profileResult.reason.message : "기본 정보를 불러오지 못했습니다.");
      if (gradeResult.status === "fulfilled") setGrade(gradeResult.value);
      if (criteriaResult.status === "fulfilled") setCriteria(criteriaResult.value);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const beginEdit = () => {
    if (!profile) return;
    setDraft({ companyName: profile.companyName, employeeCount: profile.employeeCount, phone: formatPhoneNumber(profile.phone ?? ""), address: profile.addressParts ?? EMPTY_ADDRESS_PARTS });
    setLogoFileId(undefined); setLogoPreview(""); setError(""); setEditing(true);
  };

  const save = async () => {
    if (!draft || reauthRequired || !draft.companyName.trim()) return;
    setSaving(true); setError("");
    try {
      const updated = await updateClientProfile({
        companyName: draft.companyName.trim(), employeeCount: draft.employeeCount,
        ...(draft.phone.trim() ? { phone: draft.phone.trim() } : {}),
        address: draft.address,
        ...(logoFileId == null ? {} : { logoFileId }),
      });
      setProfile(updated); setEditing(false); setLogoPreview("");
    } catch (saveError) { setError(saveError instanceof Error ? `${saveError.message} 다시 저장하려면 이메일 인증이 필요합니다.` : "기본 정보를 저장하지 못했습니다. 다시 인증해 주세요."); setReauthRequired(true); setVerificationOpen(true); }
    finally { setSaving(false); }
  };

  if (loading) return <ClientMyPageLayout activeMenu="profile"><p className="rounded-xl border border-theme bg-surface p-8 text-center text-[13px] text-theme-muted">기본 정보를 불러오는 중입니다.</p></ClientMyPageLayout>;
  if (!profile) return <ClientMyPageLayout activeMenu="profile"><p role="alert" className="rounded-xl border border-theme bg-surface p-8 text-center text-[13px] text-theme-danger">{error || "기본 정보를 불러오지 못했습니다."}</p></ClientMyPageLayout>;

  const initial = profile.companyName.trim().charAt(0) || "기";
  return (
    <ClientMyPageLayout activeMenu="profile">
      <section className="rounded-xl border border-theme bg-surface px-7 py-7 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[16px] font-bold">기본 정보</h2>
          {editing ? (
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditing(false)} className="h-9 rounded-md border border-theme px-4 text-[12px] font-bold text-theme-secondary transition hover:bg-surface-subtle">취소</button>
              <button type="button" onClick={() => void save()} disabled={reauthRequired || !draft || !draft.companyName.trim() || !draft.address.roadAddress || saving} className="h-9 rounded-md bg-brand px-4 text-[12px] font-bold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-theme-muted">{saving ? "저장 중" : "저장"}</button>
            </div>
          ) : <button type="button" onClick={() => setVerificationOpen(true)} className="rounded-md border border-brand px-4 py-2 text-[12px] font-bold text-brand hover:bg-surface-subtle">수정</button>}
        </div>
        <div className="mt-8 flex items-center gap-5">
          {editing ? <label className="group relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-surface-muted bg-cover bg-center text-[28px] font-bold text-brand" style={(logoPreview || profile.logoUrl) ? { backgroundImage: `url(${logoPreview || profile.logoUrl})` } : undefined}>{logoPreview || profile.logoUrl ? null : initial}<span className="absolute inset-x-0 bottom-0 bg-black/60 py-1 text-center text-[9px] font-bold text-white">사진 변경</span><input type="file" accept="image/jpeg,image/png" className="sr-only" onChange={async (e) => { const file = e.target.files?.[0]; e.currentTarget.value = ""; if (!file) return; if (!["image/jpeg", "image/png"].includes(file.type)) return setError("프로필 사진은 JPG 또는 PNG 파일만 등록할 수 있습니다."); if (file.size > 5 * 1024 * 1024) return setError("프로필 사진은 5MB 이하만 등록할 수 있습니다."); try { if (logoFileId != null) await deleteCompanyLogoFile(logoFileId).catch(() => null); const uploaded = await uploadCompanyLogo(file); setLogoFileId(uploaded.fileId); setLogoPreview(URL.createObjectURL(file)); } catch (uploadError) { setError(uploadError instanceof Error ? uploadError.message : "프로필 사진 업로드에 실패했습니다."); } }} /></label> : <div role="img" aria-label="프로필 사진" className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-surface-muted bg-cover bg-center text-[28px] font-bold text-brand" style={profile.logoUrl ? { backgroundImage: `url(${profile.logoUrl})` } : undefined}>{profile.logoUrl ? null : initial}</div>}
          <div><p className="text-[20px] font-extrabold">{profile.companyName}</p><p className="mt-1 text-[13px] font-semibold text-theme-secondary">담당자: {profile.name}</p><p className="mt-1 text-[12px] font-semibold text-amber-600">★ {(profile.ratingAverage ?? 0).toFixed(1)} · 리뷰 {profile.reviewCount}건 · {grade?.label ?? profile.grade}</p></div>
        </div>
        {editing && draft ? (
          <div className="mt-7 grid gap-x-4 gap-y-4 sm:grid-cols-2">
            <EditField label="기업명"><input value={draft.companyName} maxLength={100} onChange={(e) => setDraft({ ...draft, companyName: e.target.value })} className={inputClass} /></EditField>
            <EditField label="직원 수"><select value={draft.employeeCount} onChange={(e) => setDraft({ ...draft, employeeCount: e.target.value as EmployeeCountCode })} className={inputClass}>{EMPLOYEE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></EditField>
            <DisabledField label="담당자명" value={profile.name} /><DisabledField label="사업자등록번호" value={profile.businessNo} />
            <DisabledField label="사업 분야" value={BUSINESS_FIELD_LABELS[profile.businessField] ?? profile.businessField} /><DisabledField label="업무 이메일" value={profile.email} />
            <EditField label="휴대폰번호"><input value={draft.phone} maxLength={13} inputMode="numeric" onChange={(e) => setDraft({ ...draft, phone: formatPhoneNumber(e.target.value) })} className={inputClass} /></EditField>
            <div className="sm:col-span-2"><AddressFields label="회사 주소" value={draft.address} onChange={(address) => setDraft({ ...draft, address })} /></div>
            {error ? <p role="alert" className="text-[11px] font-semibold text-theme-danger sm:col-span-2">{error}</p> : null}
          </div>
        ) : <ProfileDetails profile={profile} />}
      </section>
      <GradeProgress grade={grade} criteria={criteria} />
      <ProfileUpdateVerificationModal open={verificationOpen} email={profile.email} onClose={() => setVerificationOpen(false)} onVerified={() => { setReauthRequired(false); setVerificationOpen(false); if (!editing) beginEdit(); }} />
    </ClientMyPageLayout>
  );
}

const inputClass = "h-11 w-full rounded-md border border-theme bg-surface px-4 text-[13px] font-semibold text-theme-primary outline-none transition placeholder:text-theme-muted hover:border-brand focus:border-brand";
function EditField({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-[12px] font-semibold text-theme-muted">{label}</span>{children}</label>; }
function DisabledField({ label, value }: { label: string; value: string }) { return <EditField label={label}><input value={value} disabled className={`${inputClass} cursor-not-allowed bg-surface-subtle text-theme-muted`} /></EditField>; }
function ProfileDetails({ profile }: { profile: ClientMyPageResponse }) { const rows = [["기업명", profile.companyName], ["직원 수", EMPLOYEE_OPTIONS.find((o) => o.value === profile.employeeCount)?.label ?? profile.employeeCount], ["담당자명", profile.name], ["사업자등록번호", profile.businessNo], ["사업 분야", BUSINESS_FIELD_LABELS[profile.businessField] ?? profile.businessField], ["업무 이메일", profile.email], ["휴대폰번호", profile.phone ? formatPhoneNumber(profile.phone) : "미등록"], ["회사 주소", profile.address ?? "미등록"]]; return <dl className="mt-8 grid gap-x-16 gap-y-5 sm:grid-cols-2">{rows.map(([label, value]) => <div key={label}><dt className="text-[12px] font-semibold text-theme-muted">{label}</dt><dd className="mt-1 break-words text-[14px] font-bold">{value}</dd></div>)}</dl>; }

function parseTargets(condition: string) { const rating = condition.match(/별점(?: 평균)?\s*([\d.]+)점/)?.[1]; const projects = condition.match(/완료(?: 프로젝트)?(?: 건수)?\s*(\d+)건/)?.[1]; return { rating: rating ? Number(rating) : null, projects: projects ? Number(projects) : null }; }
function GradeProgress({ grade, criteria }: { grade: ClientMyGradeResponse | null; criteria: ClientGradeCriteriaResponse[] }) { const target = grade?.nextGrade ? criteria.find((item) => item.grade === grade.nextGrade) : null; const goals = parseTargets(target?.promotionCondition ?? ""); return <section className="mt-10 rounded-xl border border-theme bg-surface px-7 py-6 sm:px-8"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-[16px] font-bold">다음 등급까지</h2><div className="flex items-center gap-2 text-[11px] font-bold"><span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-amber-700">{grade?.label ?? "확인 중"}</span>{target ? <><span className="text-theme-muted" aria-hidden="true">→</span><span className="rounded-full bg-blue-50 px-3 py-1 text-blue-600">{target.label}</span></> : null}</div></div><div className="mt-5 space-y-5"><Progress icon="★" iconClassName="text-amber-500" label="별점 평균" value={grade?.ratingAverage ?? 0} target={goals.rating} suffix="점" /><Progress icon="▢" iconClassName="text-theme-secondary" label="완료 프로젝트" value={grade?.completedProjectCount ?? 0} target={goals.projects} suffix="건" /></div>{grade?.nextGradeGuide ? <p className="mt-4 text-[11px] font-semibold text-theme-secondary">{grade.nextGradeGuide}</p> : null}{grade?.checkedGuide ? <p className="mt-2 rounded-lg bg-surface-subtle px-4 py-3 text-[11px] font-semibold text-theme-muted">{grade.checkedGuide}</p> : null}</section>; }
function Progress({ icon, iconClassName, label, value, target, suffix }: { icon: string; iconClassName: string; label: string; value: number; target: number | null; suffix: string }) { const percent = target && target > 0 ? Math.min(100, Math.max(0, value / target * 100)) : 0; const achieved = target != null && value >= target; return <div><div className="flex flex-col gap-1 text-[12px] font-bold sm:flex-row sm:items-center sm:justify-between"><span className="flex items-center gap-2"><span className={iconClassName} aria-hidden="true">{icon}</span>{label}</span><span><span className="text-theme-muted">현재 </span>{value}{suffix}{target == null ? "" : <><span className="text-theme-muted"> / 목표 </span>{target}{suffix}<span className={achieved ? "text-emerald-600" : "text-blue-600"}>{achieved ? " · ✓ 달성" : ` · ${Math.max(0, target - value)}${suffix} 남음`}</span></>}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-label={`${label} 달성률`} aria-valuenow={Math.round(percent)} aria-valuemin={0} aria-valuemax={100}><span className={`block h-full rounded-full ${achieved ? "bg-emerald-500" : "bg-gradient-to-r from-brand to-blue-500"}`} style={{ width: `${percent}%` }} /></div></div>; }
