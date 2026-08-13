"use client";

import Link from "next/link";
import { useState } from "react";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { MyPagePasswordChange } from "@/features/auth/components/MyPagePasswordChange";
import { FreelancerMyPageLayout } from "./FreelancerMyPageLayout";

const EMPTY_VALUE = "확인 필요";

export function FreelancerProfile() {
  const user = useCurrentUser();
  const [isMatchingEnabled, setIsMatchingEnabled] = useState(true);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const initial = user?.name?.trim().charAt(0) || "프";

  return (
    <FreelancerMyPageLayout activeMenu="profile">
      <section className="min-w-0 overflow-hidden rounded-xl border border-theme bg-surface px-5 py-6 sm:px-7 sm:py-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[16px] font-bold">기본 정보</h2>
          <Link
            href="/freelancer/mypage/profile/edit"
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-brand px-4 text-[12px] font-bold text-brand hover:bg-surface-subtle"
          >
            <span aria-hidden="true">✎</span>
            수정
          </Link>
        </div>

        <div className="mt-7 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div
            className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-blue-600 text-[26px] font-bold text-white"
            aria-hidden="true"
          >
            {initial}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="min-w-0 break-words text-[20px] font-extrabold">
                {user?.name ?? "프리랜서 회원"}
              </p>
              <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-600">
                등급 확인 필요
              </span>
            </div>
            <p className="mt-1 break-words text-[12px] font-semibold leading-5 text-theme-secondary sm:text-[13px]">
              전문 분야와 경력은 내 이력서에서 관리할 수 있습니다.
            </p>
          </div>
        </div>

        <dl className="mt-7 grid min-w-0 gap-x-16 gap-y-5 border-t border-theme pt-6 sm:grid-cols-2">
          <ProfileField
            label="이름"
            value={user?.name ?? "불러오는 중"}
            muted={!user}
          />
          <ProfileField
            label="이메일"
            value={user?.email ?? "불러오는 중"}
            muted={!user}
          />
          <ProfileField label="생년월일" value={EMPTY_VALUE} muted />
          <ProfileField label="전화번호" value={EMPTY_VALUE} muted />
        </dl>
      </section>

      <section className="mt-4 min-w-0 rounded-xl border border-theme bg-surface px-5 py-5 sm:px-7">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-[16px] font-bold">비밀번호 변경</h2>
            <p className="mt-1 text-[12px] font-semibold text-theme-muted">
              이메일 인증 후 새 비밀번호를 설정합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPasswordChange((visible) => !visible)}
            aria-expanded={showPasswordChange}
            className="self-start rounded-md border border-brand px-4 py-2 text-[12px] font-bold text-brand hover:bg-surface-subtle sm:self-auto"
          >
            {showPasswordChange ? "닫기" : "변경하기"}
          </button>
        </div>
        {showPasswordChange ? (
          <MyPagePasswordChange
            role="FREELANCER"
            embedded
            onClose={() => setShowPasswordChange(false)}
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
              aria-checked={isMatchingEnabled}
              aria-label="AI 매칭"
              onClick={() => setIsMatchingEnabled((enabled) => !enabled)}
              className={`relative mt-0.5 h-6 w-11 shrink-0 overflow-hidden rounded-full transition-colors ${isMatchingEnabled ? "bg-brand" : "bg-surface-muted"}`}
            >
              <span
                className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${isMatchingEnabled ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
            <div className="min-w-0">
              <p
                className={`text-[13px] font-bold ${isMatchingEnabled ? "text-emerald-600" : "text-theme-secondary"}`}
              >
                AI 매칭 {isMatchingEnabled ? "받는 중" : "중지됨"}
              </p>
              <p className="mt-1 break-words text-[12px] font-semibold leading-5 text-theme-muted">
                프로필과 이력서를 기반으로 새로운 프로젝트 추천을 받을 수
                있습니다.
              </p>
            </div>
          </div>
          <p className="mt-5 break-words rounded-lg border border-blue-200 bg-blue-50 px-3 py-3 text-[11px] font-semibold leading-5 text-blue-600 sm:px-4">
            현재 진행 중인 요청과 협상에는 영향을 주지 않습니다.
          </p>
        </div>
      </section>

      <GradeProgress />
    </FreelancerMyPageLayout>
  );
}

function GradeProgress() {
  return (
    <section
      className="mt-8 min-w-0 overflow-hidden rounded-xl border border-theme bg-surface px-5 py-6 sm:px-7"
      aria-labelledby="freelancer-grade-progress"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="freelancer-grade-progress" className="text-[16px] font-bold">
          다음 등급까지
        </h2>
        <span className="rounded-full bg-surface-muted px-3 py-1 text-[11px] font-bold text-theme-muted">
          등급 정보 확인 필요
        </span>
      </div>
      <div className="mt-5 space-y-5">
        <ProgressRow label="별점 평균" />
        <ProgressRow label="완료 프로젝트" />
      </div>
      <p className="mt-4 break-words rounded-lg bg-surface-subtle px-3 py-3 text-[11px] font-semibold leading-5 text-theme-muted sm:px-4">
        등급과 승급 기준은 서버에서 제공하는 회원 통계를 기준으로 표시됩니다.
      </p>
    </section>
  );
}

function ProgressRow({ label }: { label: string }) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] font-bold">
        <p>{label}</p>
        <p className="text-theme-muted">확인 필요</p>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
        aria-label={`${label} 달성률`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
      />
    </div>
  );
}

function ProfileField({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[12px] font-semibold text-theme-muted">{label}</dt>
      <dd
        className={`mt-1 break-all text-[14px] font-bold ${muted ? "text-theme-muted" : "text-theme-primary"}`}
      >
        {value}
      </dd>
    </div>
  );
}
