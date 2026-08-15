"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ProfileUpdateVerificationModal } from "@/features/auth/components/ProfileUpdateVerificationModal";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { formatPhoneNumber } from "@/features/auth/utils/formatPhoneNumber";
import {
  getFreelancerGradeCriteria,
  getMyGrade,
} from "@/features/freelancer/mypage/services/grade";
import type {
  GradeCriteriaResponse,
  MyGradeResponse,
} from "@/features/freelancer/mypage/types/grade";
import { getFreelancerProfile } from "@/features/freelancer/mypage/services/freelancerProfile";
import type { FreelancerMyPageResponse } from "@/features/freelancer/mypage/types/profile";
import { FreelancerMyPageLayout } from "./FreelancerMyPageLayout";

const EMPTY_VALUE = "확인 필요";

export function FreelancerProfile() {
  const router = useRouter();
  const user = useCurrentUser();
  const [profile, setProfile] = useState<FreelancerMyPageResponse | null>(null);
  const [myGrade, setMyGrade] = useState<MyGradeResponse | null>(null);
  const [gradeCriteria, setGradeCriteria] = useState<GradeCriteriaResponse[]>(
    [],
  );
  const [gradeError, setGradeError] = useState("");
  const [verificationOpen, setVerificationOpen] = useState(false);
  const initial = (profile?.name ?? user?.name)?.trim().charAt(0) || "프";

  useEffect(() => {
    let cancelled = false;
    getFreelancerProfile()
      .then((value) => {
        if (!cancelled) setProfile(value);
      })
      .catch(() => null);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getMyGrade(), getFreelancerGradeCriteria()])
      .then(([grade, criteria]) => {
        if (cancelled) return;
        setMyGrade(grade);
        setGradeCriteria(criteria);
      })
      .catch((error) => {
        if (!cancelled)
          setGradeError(
            error instanceof Error
              ? error.message
              : "등급 정보를 불러오지 못했습니다.",
          );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <FreelancerMyPageLayout activeMenu="profile">
      <section className="min-w-0 overflow-hidden rounded-xl border border-theme bg-surface px-5 py-6 sm:px-7 sm:py-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[16px] font-bold">기본 정보</h2>
          <button
            type="button"
            onClick={() => setVerificationOpen(true)}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-brand px-4 text-[12px] font-bold text-brand hover:bg-surface-subtle"
          >
            <span aria-hidden="true">✎</span>
            수정
          </button>
        </div>

        <div className="mt-7 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div
            className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-brand text-[26px] font-bold text-brand-contrast"
            aria-hidden="true"
          >
            {initial}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="min-w-0 break-words text-[20px] font-extrabold">
                {profile?.name ?? user?.name ?? "프리랜서 회원"}
              </p>
              <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-600">
                {myGrade?.label ?? "등급 확인 중"}
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
            value={profile?.name ?? user?.name ?? "불러오는 중"}
            muted={!profile && !user}
          />
          <ProfileField
            label="이메일"
            value={profile?.email ?? user?.email ?? "불러오는 중"}
            muted={!profile && !user}
          />
          <ProfileField
            label="생년월일"
            value={profile?.birthDate ?? EMPTY_VALUE}
            muted={!profile?.birthDate}
          />
          <ProfileField
            label="전화번호"
            value={
              profile?.phone ? formatPhoneNumber(profile.phone) : EMPTY_VALUE
            }
            muted={!profile?.phone}
          />
          <ProfileField
            label="주소"
            value={profile?.address ?? EMPTY_VALUE}
            muted={!profile?.address}
          />
        </dl>
      </section>

      <GradeProgress
        grade={myGrade}
        criteria={gradeCriteria}
        error={gradeError}
      />
      {profile?.email ? (
        <ProfileUpdateVerificationModal
          open={verificationOpen}
          email={profile.email}
          onClose={() => setVerificationOpen(false)}
          onVerified={() => {
            sessionStorage.setItem("freelancer-profile-edit-verified", "true");
            setVerificationOpen(false);
            router.push("/freelancer/mypage/profile/edit");
          }}
        />
      ) : null}
    </FreelancerMyPageLayout>
  );
}

function parsePromotionTargets(condition: string) {
  const rating = condition.match(/별점(?: 평균)?\s*([\d.]+)점/)?.[1];
  const projects = condition.match(
    /완료(?: 프로젝트)?(?: 건수)?\s*(\d+)건/,
  )?.[1];
  return {
    rating: rating ? Number(rating) : null,
    projects: projects ? Number(projects) : null,
  };
}

function GradeProgress({
  grade,
  criteria,
  error,
}: {
  grade: MyGradeResponse | null;
  criteria: GradeCriteriaResponse[];
  error: string;
}) {
  const targetCriteria = grade?.nextGrade
    ? criteria.find((item) => item.grade === grade.nextGrade)
    : null;
  const targets = parsePromotionTargets(
    targetCriteria?.promotionCondition ?? "",
  );
  const rating = grade?.ratingAverage ?? 0;
  const completedProjects = grade?.completedProjectCount ?? 0;
  const targetLabel =
    targetCriteria?.label ??
    (grade && !grade.nextGrade ? "최고 등급" : "확인 중");

  return (
    <section
      className="mt-8 min-w-0 overflow-hidden rounded-xl border border-theme bg-surface px-5 py-6 sm:px-7"
      aria-labelledby="freelancer-grade-progress"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="freelancer-grade-progress" className="text-[16px] font-bold">
          {grade?.nextGrade ? `다음 등급(${targetLabel})까지` : "등급 현황"}
        </h2>
        <span className="rounded-full bg-surface-muted px-3 py-1 text-[11px] font-bold text-theme-muted">
          {grade?.label ?? "등급 확인 중"}
        </span>
      </div>
      <div className="mt-5 space-y-5">
        <ProgressRow
          label="별점 평균"
          value={rating}
          target={targets.rating}
          suffix="점"
        />
        <ProgressRow
          label="완료 프로젝트"
          value={completedProjects}
          target={targets.projects}
          suffix="건"
        />
      </div>
      {grade?.nextGradeGuide ? (
        <p className="mt-4 text-[11px] font-semibold text-theme-secondary">
          {grade.nextGradeGuide}
        </p>
      ) : null}
      {grade?.checkedGuide ? (
        <p className="mt-2 break-words rounded-lg bg-surface-subtle px-3 py-3 text-[11px] font-semibold leading-5 text-theme-muted sm:px-4">
          {grade.checkedGuide}
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="mt-4 text-[11px] font-semibold text-theme-danger"
        >
          {error}
        </p>
      ) : null}
    </section>
  );
}

function ProgressRow({
  label,
  value,
  target,
  suffix,
}: {
  label: string;
  value: number;
  target: number | null;
  suffix: string;
}) {
  const progress =
    target && target > 0
      ? Math.min(100, Math.max(0, (value / target) * 100))
      : 0;
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] font-bold">
        <p>{label}</p>
        <p className="text-theme-muted">
          {target == null
            ? `${value}${suffix}`
            : `${value}${suffix} / ${target}${suffix}`}
        </p>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
        aria-label={`${label} 달성률`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <span
          className="block h-full rounded-full bg-brand transition-[width]"
          style={{ width: `${progress}%` }}
        />
      </div>
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
