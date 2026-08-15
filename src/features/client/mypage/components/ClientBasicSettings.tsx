"use client";

import { useState } from "react";
import { MyPagePasswordChange } from "@/features/auth/components/MyPagePasswordChange";
import { ThemeControl } from "@/features/common/theme/ThemeControl";
import { ClientMyPageLayout } from "./ClientMyPageLayout";

export function ClientBasicSettings() {
  const [showPassword, setShowPassword] = useState(false);
  return <ClientMyPageLayout activeMenu="settings"><section className="rounded-xl border border-theme bg-surface px-5 py-6 sm:px-7"><h2 className="text-[16px] font-bold">기본 설정</h2><SettingRow title="화면 테마" description="사용할 화면 테마를 선택합니다."><ThemeControl /></SettingRow><SettingRow title="비밀번호 변경" description="이메일 인증 후 새 비밀번호를 설정합니다."><button type="button" onClick={() => setShowPassword((value) => !value)} className="h-9 rounded-md border border-brand px-4 text-[12px] font-bold text-brand">{showPassword ? "닫기" : "변경하기"}</button></SettingRow>{showPassword ? <MyPagePasswordChange role="CLIENT" embedded onClose={() => setShowPassword(false)} /> : null}</section></ClientMyPageLayout>;
}

function SettingRow({ title, description, children }: { title: string; description: string; children: React.ReactNode }) { return <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-theme pt-5"><div><h3 className="text-[13px] font-bold">{title}</h3><p className="mt-1 text-[11px] font-semibold text-theme-muted">{description}</p></div>{children}</div>; }
