"use client";

import Link from "next/link";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { ClientMyPageLayout } from "@/features/client/mypage/components/ClientMyPageLayout";

const EMPTY_VALUE = "확인 필요";

export function ClientProfile() {
  const user = useCurrentUser();
  const initial = user?.name?.trim().charAt(0) || "기";

  return (
    <ClientMyPageLayout activeMenu="profile">
      <section className="rounded-xl border border-theme bg-surface px-7 py-7 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[16px] font-bold">기본 정보</h2>
          <Link
            href="/client/mypage/company"
            className="rounded-md border border-brand px-4 py-2 text-[12px] font-bold text-brand hover:bg-surface-subtle"
          >
            수정
          </Link>
        </div>
        <div className="mt-8 flex items-center gap-5">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-surface-muted text-[28px] font-bold text-brand"
            aria-hidden="true"
          >
            {initial}
          </div>
          <div>
            <p className="text-[20px] font-extrabold">
              {user?.name ?? "기업 회원"}
            </p>
            <p className="mt-1 text-[13px] font-semibold text-theme-secondary">
              담당자: {user?.name ?? "불러오는 중"}
            </p>
          </div>
        </div>
        <dl className="mt-8 grid gap-x-16 gap-y-5 sm:grid-cols-2">
          <ProfileField label="사업자등록번호" value={EMPTY_VALUE} muted />
          <ProfileField
            label="업무 이메일"
            value={user?.email ?? "불러오는 중"}
            muted={!user}
          />
          <ProfileField label="사업 분야" value={EMPTY_VALUE} muted />
          <ProfileField label="직원 수" value={EMPTY_VALUE} muted />
          <ProfileField label="휴대폰번호" value={EMPTY_VALUE} muted />
        </dl>
      </section>

      <section className="mt-4 flex flex-col gap-4 rounded-xl border border-theme bg-surface px-7 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <h2 className="text-[16px] font-bold">비밀번호 변경</h2>
          <p className="mt-1 text-[13px] font-semibold text-theme-muted">
            이메일 인증 후 새 비밀번호를 설정합니다.
          </p>
        </div>
        <Link
          href="/client/mypage/password"
          className="self-start rounded-md border border-brand px-4 py-2 text-[12px] font-bold text-brand hover:bg-surface-subtle sm:self-auto"
        >
          변경하기
        </Link>
      </section>

      <GradeProgress />
    </ClientMyPageLayout>
  );
}

function GradeProgress() {
  return (
    <section
      className="mt-10 rounded-xl border border-theme bg-surface px-7 py-6 sm:px-8"
      aria-labelledby="grade-progress-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="grade-progress-title" className="text-[16px] font-bold">
          다음 등급까지
        </h2>
        <div className="flex items-center gap-2 text-[11px] font-bold">
          <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-amber-700">
            골드
          </span>
          <span className="text-theme-muted" aria-hidden="true">
            →
          </span>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-600">
            다이아
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        <ProgressRow
          icon="★"
          iconClassName="text-amber-500"
          label="별점 평균"
          summary={
            <>
              <span className="text-theme-muted">현재 </span>4.2점{" "}
              <span className="text-theme-muted">/ 목표 </span>4.0점{" "}
              <span className="text-emerald-600">· ✓ 달성</span>
            </>
          }
          progress={100}
          barClassName="bg-emerald-500"
        />
        <ProgressRow
          icon="▢"
          iconClassName="text-theme-secondary"
          label="완료 프로젝트"
          summary={
            <>
              <span className="text-theme-muted">현재 </span>10건{" "}
              <span className="text-theme-muted">/ 목표 </span>20건{" "}
              <span className="text-blue-600">· 10건 남음</span>
            </>
          }
          progress={50}
          barClassName="bg-gradient-to-r from-brand to-blue-500"
        />
      </div>

      <p className="mt-4 rounded-lg bg-surface-subtle px-4 py-3 text-[11px] font-semibold text-theme-muted">
        다이아 등급 승급 조건: 별점 4점 이상 + 완료 프로젝트 20건 이상 · 등급은
        매월 1일 자동 산정됩니다.
      </p>
    </section>
  );
}

function ProgressRow({
  icon,
  iconClassName,
  label,
  summary,
  progress,
  barClassName,
}: {
  icon: string;
  iconClassName: string;
  label: string;
  summary: React.ReactNode;
  progress: number;
  barClassName: string;
}) {
  return (
    <div>
      <div className="flex flex-col gap-1 text-[12px] font-bold sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2">
          <span className={iconClassName} aria-hidden="true">
            {icon}
          </span>
          {label}
        </p>
        <p>{summary}</p>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
        aria-label={`${label} 달성률`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div
          className={`h-full rounded-full ${barClassName}`}
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
    <div>
      <dt className="text-[12px] font-semibold text-theme-muted">{label}</dt>
      <dd
        className={`mt-1 text-[14px] font-bold ${muted ? "text-theme-muted" : "text-theme-primary"}`}
      >
        {value}
      </dd>
    </div>
  );
}
