"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileUpdateVerificationModal } from "@/features/auth/components/ProfileUpdateVerificationModal";
import { formatPhoneNumber } from "@/features/auth/utils/formatPhoneNumber";
import { uploadFreelancerFile } from "@/features/freelancer/mypage/services/freelancerFiles";
import { getFreelancerProfile, updateFreelancerProfile } from "@/features/freelancer/mypage/services/freelancerProfile";
import type { FreelancerMyPageResponse } from "@/features/freelancer/mypage/types/profile";
import { AddressFields } from "@/features/common/components/AddressFields";
import { EMPTY_ADDRESS_PARTS, type AddressParts } from "@/features/common/types/address";
import { FreelancerMyPageLayout } from "./FreelancerMyPageLayout";

const inputClass = "h-11 w-full rounded-md border border-theme bg-surface px-4 text-[12px] font-semibold outline-none focus:border-brand";

export function FreelancerBasicProfileEdit() {
  const router = useRouter();
  const [profile, setProfile] = useState<FreelancerMyPageResponse | null>(null);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState<AddressParts>(EMPTY_ADDRESS_PARTS);
  const [profileFileId, setProfileFileId] = useState<number>();
  const [profilePreview, setProfilePreview] = useState("");
  const [verified, setVerified] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [reauthOpen, setReauthOpen] = useState(false);
  const [reauthRequired, setReauthRequired] = useState(false);

  useEffect(() => {
    getFreelancerProfile().then((value) => {
      setProfile(value);
      setPhone(formatPhoneNumber(value.phone ?? ""));
      setAddress(value.addressParts ?? EMPTY_ADDRESS_PARTS);
      setProfilePreview(value.profileImageUrl ?? "");
    }).catch((error) => setMessage(error instanceof Error ? error.message : "기본 정보를 불러오지 못했습니다."));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const allowed = sessionStorage.getItem("freelancer-profile-edit-verified") === "true";
      sessionStorage.removeItem("freelancer-profile-edit-verified");
      setVerified(allowed);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (verified === null) return <FreelancerMyPageLayout activeMenu="profile"><p className="rounded-xl border border-theme bg-surface p-8 text-center text-[12px] text-theme-muted">인증 정보를 확인하는 중입니다.</p></FreelancerMyPageLayout>;
  if (!verified) return <FreelancerMyPageLayout activeMenu="profile"><section className="rounded-xl border border-theme bg-surface p-8 text-center"><p className="text-[12px] font-semibold text-theme-muted">기본 정보 화면에서 이메일 인증 후 수정할 수 있습니다.</p><button type="button" onClick={() => router.replace("/freelancer/mypage/profile")} className="mt-4 h-10 rounded-md bg-brand px-5 text-[12px] font-bold text-white">기본 정보로 이동</button></section></FreelancerMyPageLayout>;
  if (!profile) return <FreelancerMyPageLayout activeMenu="profile"><p className="rounded-xl border border-theme bg-surface p-8 text-center text-[12px] text-theme-muted">{message || "기본 정보를 불러오는 중입니다."}</p></FreelancerMyPageLayout>;

  const initial = profile.name.trim().charAt(0) || "프";

  const save = async () => {
    if (!verified || saving || reauthRequired) return;
    setSaving(true); setMessage("");
    try {
      await updateFreelancerProfile({ phone: phone.trim() || undefined, address, aiMatchingAgreed: profile.aiMatchingAgreed, ...(profileFileId == null ? {} : { profileFileId }) });
      router.replace("/freelancer/mypage/profile");
    } catch (error) { setMessage(error instanceof Error ? `${error.message} 다시 저장하려면 이메일 인증이 필요합니다.` : "기본 정보를 저장하지 못했습니다. 다시 인증해 주세요."); setReauthRequired(true); setReauthOpen(true); }
    finally { setSaving(false); }
  };

  return (
    <FreelancerMyPageLayout activeMenu="profile">
      <section className="rounded-xl border border-theme bg-surface px-5 py-6 sm:px-7">
        <div className="flex items-center justify-between"><h2 className="text-[16px] font-bold">기본 정보 수정</h2><button type="button" onClick={() => router.back()} className="text-[12px] font-bold text-theme-muted">취소</button></div>
        <div className="mt-7 flex items-center gap-5">
          <label className="group relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-brand bg-cover bg-center text-[28px] font-bold text-brand-contrast" style={profilePreview ? { backgroundImage: `url(${profilePreview})` } : undefined}>
            {profilePreview ? null : initial}
            <span className="absolute inset-x-0 bottom-0 bg-black/60 py-1 text-center text-[9px] font-bold text-white">사진 변경</span>
            <input type="file" accept="image/jpeg,image/png" className="sr-only" onChange={async (event) => { const file = event.target.files?.[0]; event.currentTarget.value = ""; if (!file) return; if (!["image/jpeg", "image/png"].includes(file.type) || file.size > 5 * 1024 * 1024) return setMessage("JPG 또는 PNG 파일을 5MB 이하로 선택해 주세요."); try { const uploaded = await uploadFreelancerFile(file, "PROFILE_IMAGE"); setProfileFileId(uploaded.fileId); setProfilePreview(URL.createObjectURL(file)); setMessage("프로필 사진이 업로드되었습니다. 저장 버튼을 눌러 반영해 주세요."); } catch (error) { setMessage(error instanceof Error ? error.message : "사진을 업로드하지 못했습니다."); } }} />
          </label>
          <div><p className="text-[14px] font-bold">프로필 사진</p><p className="mt-1 text-[11px] font-semibold leading-5 text-theme-muted">JPG 또는 PNG · 최대 5MB</p></div>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2"><Disabled label="이름" value={profile.name} /><Disabled label="이메일" value={profile.email} /><Disabled label="생년월일" value={profile.birthDate ?? "미등록"} /><Field label="전화번호"><input value={phone} maxLength={13} inputMode="numeric" onChange={(event) => setPhone(formatPhoneNumber(event.target.value))} className={inputClass} /></Field><div className="sm:col-span-2"><AddressFields value={address} onChange={setAddress} /></div>{message ? <p role="status" className="text-[11px] font-semibold text-theme-muted sm:col-span-2">{message}</p> : null}<div className="flex justify-end sm:col-span-2"><button type="button" disabled={saving || reauthRequired || !address.roadAddress} onClick={() => void save()} className="h-11 rounded-md bg-brand px-6 text-[12px] font-bold text-white disabled:opacity-40">{saving ? "저장 중" : "저장"}</button></div></div>
      </section>
      <ProfileUpdateVerificationModal open={reauthOpen} email={profile.email} onClose={() => setReauthOpen(false)} onVerified={() => { setReauthRequired(false); setReauthOpen(false); }} />
    </FreelancerMyPageLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label><span className="mb-2 block text-[11px] font-semibold text-theme-muted">{label}</span>{children}</label>; }
function Disabled({ label, value }: { label: string; value: string }) { return <Field label={label}><input value={value} disabled className={`${inputClass} cursor-not-allowed bg-surface-subtle text-theme-muted`} /></Field>; }
