"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getProjectJobCategories,
  getProjectJobRoles,
  getProjectSkills,
  getProjectWorkConditions,
} from "@/features/client/projects/services/projectPreReview";
import type { ProjectMetaOption } from "@/features/client/projects/types/preReview";
import { getCandidateProfile } from "@/features/matching/services/matching";
import type { CandidateProfileResponse, PayUnit } from "@/features/matching/types/matching";
import { ApiException } from "@/lib/api";

interface CandidateProfileProps {
  projectId: number;
  candidateId: number;
  /** 서버 컴포넌트에서 미리 조회한 값(있으면 클라이언트 재조회 생략, 없으면 기존처럼 클라이언트에서 조회) */
  initialProfile?: CandidateProfileResponse | null;
}

const PAY_UNIT_LABEL: Record<PayUnit, string> = {
  HOURLY: "시급",
  DAILY: "일급",
  MONTHLY: "월",
};

const GRADE_LABEL: Record<string, string> = {
  JUNIOR: "주니어",
  SENIOR: "시니어",
  MASTER: "마스터",
};

const GRADUATION_STATUS_LABEL: Record<string, string> = {
  GRADUATED: "졸업",
  EXPECTED: "졸업예정",
  ATTENDING: "재학 중",
  LEAVE: "휴학",
  DROPPED: "중퇴",
};

const CAMPUS_TYPE_LABEL: Record<string, string> = { MAIN: "본교", BRANCH: "분교" };

const formatDate = (value: string | null) => (value ? value.replaceAll("-", ".") : "");

const toLabelMap = (options: ProjectMetaOption[]) =>
  Object.fromEntries(options.map((option) => [option.code, option.label]));

interface MetaLabels {
  jobCategory: Record<string, string>;
  jobRole: Record<string, string>;
  skill: Record<string, string>;
  workStyle: Record<string, string>;
  workForm: Record<string, string>;
  periodUnit: Record<string, string>;
  skillLevel: Record<string, string>;
}

export function CandidateProfile({
  projectId,
  candidateId,
  initialProfile = null,
}: CandidateProfileProps) {
  const [candidate, setCandidate] = useState<CandidateProfileResponse | null>(initialProfile);
  const [labels, setLabels] = useState<MetaLabels | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        // 서버에서 이미 가져온 값이 있으면 재조회를 생략하고, 실패했을 때만(null) 클라이언트에서 조회한다.
        const [profile, jobCategories, jobRoles, skills, workConditions] = await Promise.all([
          initialProfile ? Promise.resolve(initialProfile) : getCandidateProfile(candidateId),
          getProjectJobCategories(),
          getProjectJobRoles(),
          getProjectSkills(),
          getProjectWorkConditions(),
        ]);
        if (cancelled) return;
        setCandidate(profile);
        setLabels({
          jobCategory: toLabelMap(jobCategories),
          jobRole: toLabelMap(jobRoles),
          skill: toLabelMap(skills),
          workStyle: toLabelMap(workConditions.workStyles),
          workForm: toLabelMap(workConditions.workForms),
          periodUnit: toLabelMap(workConditions.periodUnits),
          skillLevel: toLabelMap(workConditions.skillLevels ?? []),
        });
      } catch (error) {
        if (cancelled) return;
        setErrorMessage(
          error instanceof ApiException ? error.message : "프로필을 불러오지 못했습니다.",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    Promise.resolve().then(() => {
      if (!cancelled) void loadProfile();
    });

    return () => {
      cancelled = true;
    };
  }, [candidateId, initialProfile]);

  return (
    <main className="min-h-screen bg-surface-subtle px-4 py-6 text-theme-primary sm:px-5">
      <div className="mx-auto w-full max-w-[720px]">
        <Link
          href={`/client/projects/${projectId}?tab=candidates`}
          className="flex w-fit items-center gap-2 text-[13px] font-bold text-theme-secondary hover:text-theme-primary"
        >
          ← 추천 후보 목록으로 돌아가기
        </Link>

        {isLoading ? (
          <div className="mt-5 flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-[14px] border border-theme bg-surface text-[13px] font-semibold text-theme-secondary">
            <span
              className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent"
              aria-hidden="true"
            />
            프로필을 불러오고 있습니다.
          </div>
        ) : candidate && labels ? (
          <CandidateProfileView candidate={candidate} labels={labels} />
        ) : (
          <div className="mt-5 flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-[14px] border border-theme bg-surface px-5 text-center text-[13px] text-theme-secondary">
            <p>{errorMessage || "프로필을 불러오지 못했습니다."}</p>
          </div>
        )}
      </div>
    </main>
  );
}

function CandidateProfileView({
  candidate,
  labels,
}: {
  candidate: CandidateProfileResponse;
  labels: MetaLabels;
}) {
  const { condition, resume } = candidate;
  const skills = condition.skills ?? [];
  const educations = resume.educations ?? [];
  const careers = resume.careers ?? [];
  const certificates = resume.certificates ?? [];

  return (
    <div className="mt-5 space-y-4">
      <div className="rounded-[10px] border border-[#c9dcfa] bg-[#eef6ff] px-5 py-4 text-[13px] leading-6 text-theme-secondary">
        <strong className="block text-theme-primary">매칭 당시 등록된 프로필입니다.</strong>
        {formatDate(candidate.capturedAt.slice(0, 10))} 추천 시점에 저장된 프리랜서 정보가
        표시됩니다.
        <span className="block font-semibold text-[#d97706]">
          프리랜서가 이후 프로필을 수정했더라도 현재 데이터에는 반영되지 않을 수 있습니다.
        </span>
      </div>

      <ProfileSection>
        <div className="flex items-start gap-4">
          {candidate.profileImageUrl ?? resume.profileImageUrl ? (
            <Image
              src={(candidate.profileImageUrl ?? resume.profileImageUrl) as string}
              alt=""
              width={56}
              height={56}
              className="h-14 w-14 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand text-[18px] font-extrabold text-white">
              {candidate.name.slice(0, 1)}
            </div>
          )}
          <div>
            <h1 className="text-[20px] font-extrabold">{candidate.name}</h1>
            <p className="mt-1 text-[13px] font-semibold text-theme-secondary">
              {labels.jobCategory[condition.jobCategory] ?? condition.jobCategory} ·{" "}
              {labels.jobRole[condition.jobRole] ?? condition.jobRole} · {condition.careerYears}
              년 경력 · {GRADE_LABEL[candidate.grade] ?? candidate.grade}
            </p>
            {candidate.ratingAverage != null ? (
              <p className="mt-2 text-[12px] font-bold text-[#e7a317]">
                ★ {candidate.ratingAverage.toFixed(1)}{" "}
                <span className="font-medium text-theme-muted">
                  ({candidate.reviewCount}건)
                </span>
              </p>
            ) : null}
          </div>
        </div>
      </ProfileSection>

      <ProfileSection title="희망 업무 조건">
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <ConditionItem label="근무 방식" value={labels.workStyle[condition.workStyle] ?? condition.workStyle} />
          <ConditionItem label="근무 형태" value={labels.workForm[condition.workForm] ?? condition.workForm} />
          <ConditionItem
            label="희망 급여"
            value={`${PAY_UNIT_LABEL[condition.payUnit]} ${condition.payAmount.toLocaleString("ko-KR")}원`}
          />
          <ConditionItem
            label="최소 수용 금액"
            value={`${condition.minAcceptAmount.toLocaleString("ko-KR")}원`}
          />
          <ConditionItem
            label="시작 가능일"
            value={condition.availableFrom ? formatDate(condition.availableFrom) : "협의 가능"}
          />
          <ConditionItem
            label="희망 계약 기간"
            value={`${condition.periodValue}${labels.periodUnit[condition.periodUnit] ?? condition.periodUnit}`}
          />
          <ConditionItem
            label="프리랜서 경험"
            value={condition.hasFreelanceExperience ? "있음" : "없음"}
          />
          <ConditionItem
            label="시작일 협의"
            value={condition.startNegotiable ? "가능" : "불가"}
          />
        </dl>
      </ProfileSection>

      <ProfileSection title="보유 기술">
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill.skillCode}
              className="rounded-full border border-[#8bb5ff] bg-[#f7faff] px-3 py-1.5 text-[12px] font-semibold text-[#3478f6]"
            >
              {labels.skill[skill.skillCode] ?? skill.skillCode}
              <span className="ml-1 text-theme-muted">
                · {labels.skillLevel[skill.skillLevel] ?? skill.skillLevel}
              </span>
            </span>
          ))}
        </div>
      </ProfileSection>

      <ProfileSection title="AI 추천 이유">
        <div className="flex flex-wrap gap-2">
          {candidate.fitReasons.map((reason) => (
            <span
              key={reason}
              className="rounded-[6px] border border-theme bg-surface-muted px-3 py-1.5 text-[12px] font-semibold text-theme-secondary"
            >
              {reason}
            </span>
          ))}
        </div>
      </ProfileSection>

      {resume.selfIntroduction ? (
        <ProfileSection title="자기소개">
          <p className="whitespace-pre-line text-[13px] leading-7 text-theme-secondary">
            {resume.selfIntroduction}
          </p>
        </ProfileSection>
      ) : null}

      {educations.length > 0 ? (
        <ProfileSection title="학력사항">
          <div className="space-y-3">
            {educations.map((education) => (
              <div
                key={`${education.schoolName}-${education.startDate}`}
                className="border-b border-theme pb-3 first:pt-0 last:border-0 last:pb-0"
              >
                <p className="text-[11px] text-theme-muted">
                  {formatDate(education.startDate)} - {formatDate(education.endDate)}
                </p>
                <p className="mt-1 text-[13px] font-extrabold">
                  {education.schoolName}
                  {education.major ? ` · ${education.major}` : ""}
                </p>
                <p className="mt-1 text-[12px] text-theme-secondary">
                  {GRADUATION_STATUS_LABEL[education.graduationStatus] ?? education.graduationStatus}
                  {" · "}
                  {CAMPUS_TYPE_LABEL[education.campusType] ?? education.campusType}
                </p>
              </div>
            ))}
          </div>
        </ProfileSection>
      ) : null}

      {careers.length > 0 ? (
        <ProfileSection title="경력사항">
          <div className="space-y-3">
            {careers.map((career) => (
              <div
                key={`${career.companyName}-${career.startDate}`}
                className="border-b border-theme pb-3 first:pt-0 last:border-0 last:pb-0"
              >
                <p className="text-[11px] text-theme-muted">
                  {formatDate(career.startDate)} - {career.endDate ? formatDate(career.endDate) : "재직 중"}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <h3 className="text-[13px] font-extrabold">{career.companyName}</h3>
                  {!career.endDate ? (
                    <span className="rounded-full bg-success-surface px-2 py-1 text-[10px] font-bold text-theme-success">
                      재직 중
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-[12px] text-theme-secondary">
                  {[career.department, career.position].filter(Boolean).join(" · ")}
                </p>
                {career.jobDescription ? (
                  <p className="mt-2 whitespace-pre-line text-[12px] leading-6 text-theme-secondary">
                    {career.jobDescription}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </ProfileSection>
      ) : null}

      {certificates.length > 0 ? (
        <ProfileSection title="자격증">
          <div className="space-y-3">
            {certificates.map((certificate) => (
              <div
                key={`${certificate.name}-${certificate.acquiredDate}`}
                className="border-b border-theme pb-3 first:pt-0 last:border-0 last:pb-0"
              >
                <p className="text-[11px] text-theme-muted">{formatDate(certificate.acquiredDate)}</p>
                <p className="mt-1 text-[13px] font-extrabold">{certificate.name}</p>
                <p className="mt-1 text-[12px] text-theme-secondary">
                  {[certificate.issuer, certificate.score].filter(Boolean).join(" · ")}
                </p>
              </div>
            ))}
          </div>
        </ProfileSection>
      ) : null}

      {resume.portfolioUrl || resume.links.length > 0 ? (
        <ProfileSection title="포트폴리오 및 외부 링크">
          <div className="space-y-2">
            {resume.portfolioUrl ? (
              <a
                href={resume.portfolioUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-[8px] bg-surface-muted px-4 py-3 text-[11px] font-semibold"
              >
                포트폴리오 보기
                <span>↗</span>
              </a>
            ) : null}
            {resume.links.map((link) => (
              <a
                key={link}
                href={link}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-[8px] bg-surface-muted px-4 py-3 text-[10px] font-semibold"
              >
                {link}
                <span>↗</span>
              </a>
            ))}
          </div>
        </ProfileSection>
      ) : null}

      <p className="rounded-[8px] bg-surface-muted px-4 py-3 text-[11px] leading-5 text-theme-muted">
        연락처 정보는 매칭 요청이 수락되고 계약이 진행된 후 확인할 수 있습니다.
      </p>
    </div>
  );
}

function ProfileSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[12px] border border-theme bg-surface p-5">
      {title ? <h2 className="mb-3 text-[15px] font-extrabold">{title}</h2> : null}
      {children}
    </section>
  );
}

function ConditionItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[9px] border border-theme bg-surface-subtle px-4 py-3">
      <dt className="text-[11px] text-theme-muted">{label}</dt>
      <dd className="mt-2 text-[13px] font-bold">{value}</dd>
    </div>
  );
}
