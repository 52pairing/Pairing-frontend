"use client";

import { useEffect, useState } from "react";
import { MyPagePasswordChange } from "@/features/auth/components/MyPagePasswordChange";
import { ThemeControl } from "@/features/common/theme/ThemeControl";
import {
  getMatchingSettings,
  updateMatchingSettings,
} from "@/features/matching/services/matching";
import type { MatchingSettingsResponse } from "@/features/matching/types/matching";
import { FreelancerMyPageLayout } from "./FreelancerMyPageLayout";

export function FreelancerBasicSettings() {
  const [showPassword, setShowPassword] = useState(false);
  const [matchingSettings, setMatchingSettings] =
    useState<MatchingSettingsResponse | null>(null);
  const [isMatchingSaving, setIsMatchingSaving] = useState(false);
  const [matchingError, setMatchingError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getMatchingSettings()
      .then((response) => {
        if (!cancelled) setMatchingSettings(response);
      })
      .catch((error) => {
        if (!cancelled)
          setMatchingError(
            error instanceof Error
              ? error.message
              : "매칭 설정을 불러오지 못했습니다.",
          );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleMatchingPaused = async () => {
    if (!matchingSettings || isMatchingSaving) return;
    setIsMatchingSaving(true);
    setMatchingError("");
    try {
      setMatchingSettings(
        await updateMatchingSettings({
          aiMatchingAgreed: matchingSettings.aiMatchingAgreed,
          matchingPaused: !matchingSettings.matchingPaused,
        }),
      );
    } catch (error) {
      setMatchingError(
        error instanceof Error
          ? error.message
          : "매칭 설정을 변경하지 못했습니다.",
      );
    } finally {
      setIsMatchingSaving(false);
    }
  };

  const toggleMatchingAgreement = async () => {
    if (!matchingSettings || isMatchingSaving) return;
    setIsMatchingSaving(true);
    setMatchingError("");
    try {
      setMatchingSettings(
        await updateMatchingSettings({
          aiMatchingAgreed: !matchingSettings.aiMatchingAgreed,
          matchingPaused: matchingSettings.matchingPaused,
        }),
      );
    } catch (error) {
      setMatchingError(
        error instanceof Error
          ? error.message
          : "AI 매칭 동의 설정을 변경하지 못했습니다.",
      );
    } finally {
      setIsMatchingSaving(false);
    }
  };

  return (
    <FreelancerMyPageLayout activeMenu="settings">
      <section className="rounded-xl border border-theme bg-surface px-5 py-6 sm:px-7">
        <h2 className="text-[16px] font-bold">기본 설정</h2>
        <SettingRow
          title="화면 테마"
          description="사용할 화면 테마를 선택합니다."
        >
          <ThemeControl />
        </SettingRow>
        <SettingRow
          title="비밀번호 변경"
          description="이메일 인증 후 새 비밀번호를 설정합니다."
        >
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="h-9 rounded-md border border-brand px-4 text-[12px] font-bold text-brand"
          >
            {showPassword ? "닫기" : "변경하기"}
          </button>
        </SettingRow>
        {showPassword ? (
          <MyPagePasswordChange
            role="FREELANCER"
            embedded
            onClose={() => setShowPassword(false)}
          />
        ) : null}
      </section>

      <section
        id="matching-settings"
        className="mt-4 min-w-0 scroll-mt-6 overflow-hidden rounded-xl border border-theme bg-surface px-5 py-6 sm:px-7"
      >
        <h2 className="text-[16px] font-bold">AI 매칭 설정</h2>
        <div className="mt-4 border-t border-theme pt-5">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <button
              type="button"
              role="switch"
              aria-checked={
                matchingSettings
                  ? matchingSettings.aiMatchingAgreed &&
                    !matchingSettings.matchingPaused
                  : false
              }
              aria-label="AI 매칭"
              disabled={
                !matchingSettings ||
                isMatchingSaving ||
                !matchingSettings.aiMatchingAgreed
              }
              onClick={() => void toggleMatchingPaused()}
              className={`relative mt-0.5 h-6 w-11 shrink-0 overflow-hidden rounded-full transition-colors disabled:cursor-not-allowed ${matchingSettings?.aiMatchingAgreed && !matchingSettings.matchingPaused ? "bg-brand" : "bg-surface-muted"}`}
            >
              <span
                className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${matchingSettings?.aiMatchingAgreed && !matchingSettings.matchingPaused ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
            <div className="min-w-0">
              <p
                className={`text-[13px] font-bold ${matchingSettings?.matchable ? "text-emerald-600" : "text-theme-secondary"}`}
              >
                {isMatchingSaving
                  ? "AI 매칭 설정 저장 중"
                  : !matchingSettings
                    ? "AI 매칭 설정 확인 중"
                    : matchingSettings.matchable
                      ? "AI 매칭 받는 중"
                      : "AI 매칭 중지됨"}
              </p>
              <p className="mt-1 break-words text-[12px] font-semibold leading-5 text-theme-muted">
                프로필과 이력서를 기반으로 새로운 프로젝트 추천을 받을 수
                있습니다.
              </p>
            </div>
          </div>
          {matchingSettings?.unmatchableReason ? (
            <p className="mt-4 rounded-lg border border-[#f1dfa6] bg-[#fff8d9] px-3 py-3 text-[11px] font-semibold leading-5 text-[#a15c22]">
              {matchingSettings.unmatchableReason}
            </p>
          ) : null}
          {matchingError ? (
            <p
              role="alert"
              className="mt-4 text-[11px] font-semibold text-theme-danger"
            >
              {matchingError}
            </p>
          ) : null}
          <p className="mt-5 break-words rounded-lg border border-blue-200 bg-blue-50 px-3 py-3 text-[11px] font-semibold leading-5 text-blue-600 sm:px-4">
            현재 진행 중인 요청과 협상에는 영향을 주지 않습니다.
          </p>
        </div>
      </section>
    </FreelancerMyPageLayout>
  );
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-theme pt-5">
      <div>
        <h3 className="text-[13px] font-bold">{title}</h3>
        <p className="mt-1 text-[11px] font-semibold text-theme-muted">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}
