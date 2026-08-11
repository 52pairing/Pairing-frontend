"use client";

import Link from "next/link";
import { useState } from "react";

import type {
  CandidateMatchStatus,
  RecommendedCandidate,
} from "@/features/matching/types/candidate";

interface CandidateProfileProps {
  projectId: number;
  candidate: RecommendedCandidate;
}

const ACTION_LABEL: Record<CandidateMatchStatus, string> = {
  recommended: "매칭 요청 보내기",
  requested: "요청 전송 완료",
  accepted: "협상 시작하기",
};

export function CandidateProfile({
  projectId,
  candidate,
}: CandidateProfileProps) {
  const [status, setStatus] = useState<CandidateMatchStatus>(candidate.status);
  const requestMatching = () => {
    if (status === "recommended") setStatus("requested");
  };

  return (
    <main className="min-h-screen bg-surface-subtle px-4 py-6 text-theme-primary sm:px-5">
      <div className="mx-auto w-full max-w-[1000px]">
        <Link
          href={`/client/projects/${projectId}?tab=candidates`}
          className="flex w-fit items-center gap-2 text-[13px] font-bold text-theme-secondary hover:text-theme-primary"
        >
          ← 추천 후보 목록으로 돌아가기
        </Link>

        <div className="mt-5 rounded-[10px] border border-[#c9dcfa] bg-[#eef6ff] px-5 py-4 text-[13px] leading-6 text-theme-secondary">
          <strong className="block text-theme-primary">
            매칭 당시 등록된 프로필입니다.
          </strong>
          현재 화면에는 이 프로젝트의 매칭이 시작된 시점에 저장된 프리랜서
          정보가 표시됩니다.
          <span className="block font-semibold text-[#d97706]">
            프리랜서가 프로필을 수정했더라도 현재 데이터에는 반영되지 않을 수
            있습니다.
          </span>
        </div>

        <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_255px]">
          <div className="space-y-3">
            <ProfileHeader candidate={candidate} />
            <ProfileSection title="희망 업무 조건">
              <Conditions candidate={candidate} />
            </ProfileSection>
            <ProfileSection title="보유 기술 및 숙련도">
              <p className="mb-3 text-[12px] font-bold text-[#3478f6]">
                보유 기술 {candidate.skills.length}개 · 숙련도 정보
              </p>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill, index) => (
                  <span
                    key={skill}
                    className="rounded-full border border-[#8bb5ff] bg-[#f7faff] px-3 py-1.5 text-[12px] font-semibold text-[#3478f6]"
                  >
                    ✓ {skill}{" "}
                    <span className="ml-1 text-theme-muted">
                      · {index < 3 ? "고급" : "중급"}
                    </span>
                  </span>
                ))}
              </div>
            </ProfileSection>
            <ProfileSection title="AI 매칭 분석">
              <div className="flex items-end gap-3">
                <strong className="text-[28px] leading-none text-[#3478f6]">
                  {candidate.matchScore}%
                </strong>
                <span className="text-[12px] font-bold text-theme-secondary">
                  AI 적합도
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full bg-[#3478f6]"
                  style={{ width: `${candidate.matchScore}%` }}
                />
              </div>
              <h3 className="mt-5 text-[13px] font-extrabold">추천 이유</h3>
              <ul className="mt-2 space-y-1.5">
                {candidate.recommendationReasons.slice(0, 4).map((reason) => (
                  <li
                    key={reason}
                    className="flex gap-2 text-[12px] leading-5 text-theme-secondary"
                  >
                    <span className="font-bold text-theme-success">✓</span>
                    {reason}합니다.
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-[8px] bg-surface-muted px-3 py-2.5 text-[11px] leading-5 text-theme-muted">
                AI 적합도는 등록된 조건을 기반으로 제공되는 참고 정보입니다.
              </p>
            </ProfileSection>
            <ProfileSection title="자기소개">
              <p className="text-[13px] leading-7 text-theme-secondary">
                {candidate.introduction} React와 Next.js를 중심으로 5년간 다양한
                서비스를 개발해왔으며, 디자인 시스템 구축과 성능 최적화 경험이
                있습니다. 팀의 목표를 이해하고 안정적인 결과물을 만드는 것을
                중요하게 생각합니다.
              </p>
            </ProfileSection>
            <ProfileSection title="학력사항">
              <TimelineItem
                period="2020.03 - 2024.02"
                title={candidate.education}
                subtitle="컴퓨터공학과 · 졸업"
              />
            </ProfileSection>
            <ProfileSection title="경력사항">
              {candidate.careers.map((career, index) => (
                <div
                  key={`${career.company}-${career.period}`}
                  className="border-b border-theme py-2 first:pt-0 last:border-0 last:pb-0"
                >
                  <TimelineItem
                    period={career.period}
                    title={career.company}
                    subtitle={career.role}
                    badge={index === 0 ? "재직 중" : undefined}
                  />
                  <p className="mt-3 whitespace-pre-line text-[12px] leading-6 text-theme-secondary">
                    담당 업무:
                    <br />
                    {career.description}
                    <br />
                    React 및 Next.js 기반 페이지 구현
                    <br />
                    디자인 시스템 구축 및 공통 컴포넌트 개발
                  </p>
                </div>
              ))}
            </ProfileSection>
            <ProfileSection title="자격증 및 어학">
              <TimelineItem
                period="2025.05"
                title="정보처리기사"
                subtitle="한국산업인력공단"
              />
              <div className="mt-4 border-t border-theme pt-4">
                <TimelineItem period="2025.10" title="TOEIC" subtitle="900점" />
              </div>
            </ProfileSection>
            <ProfileSection title="포트폴리오">
              <div className="flex items-center justify-between rounded-[9px] bg-surface-muted px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-[#ffe5e8] text-[14px]">
                    ▣
                  </span>
                  <div>
                    <p className="text-[10px] font-bold">
                      frontend-portfolio.pdf
                    </p>
                    <p className="mt-1 text-[9px] text-theme-muted">
                      24.5MB · 2026.07.30 등록
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-[6px] border border-theme-strong bg-surface px-3 py-1.5 text-[9px] font-bold"
                  >
                    미리보기
                  </button>
                  <button
                    type="button"
                    className="px-2 text-[9px] font-semibold text-theme-secondary"
                  >
                    다운로드
                  </button>
                </div>
              </div>
            </ProfileSection>
            <ProfileSection title="외부 링크">
              <ExternalLink href="https://github.com/" />
              <ExternalLink href="https://www.notion.com" />
            </ProfileSection>
            <ProfileSection title="받은 평점 및 리뷰">
              <div className="flex items-center gap-8 rounded-[9px] bg-surface-muted px-5 py-4">
                <div className="text-center">
                  <strong className="block text-[22px]">
                    {candidate.rating}
                  </strong>
                  <span className="text-[#e7a317]">★★★★★</span>
                </div>
                <div className="text-[9px] leading-5 text-theme-secondary">
                  <p>받은 평가 {candidate.reviewCount}건</p>
                  <p className="font-bold">Professional 등급</p>
                </div>
              </div>
              <Review
                title="웹 서비스 개발"
                date="2026.06"
                body="일정 내에 깔끔하게 결과물을 납품해주신 프리랜서였습니다. 커뮤니케이션도 원활했어요."
              />
              <Review
                title="쇼핑몰 프론트엔드"
                date="2026.03"
                body="기술 수준이 높고 꼼꼼하게 작업해주셨습니다. 다음에도 함께 하고 싶습니다."
              />
            </ProfileSection>
          </div>

          <aside className="sticky top-4 rounded-[12px] border border-theme bg-surface p-5">
            <h2 className="text-[13px] font-extrabold leading-5">
              이 프리랜서와 프로젝트를 진행하고 싶으신가요?
            </h2>
            <p className="mt-2 text-[11px] leading-5 text-theme-secondary">
              매칭 요청을 보내면 프리랜서가 프로젝트 정보를 확인하고 수락 또는
              거절할 수 있습니다.
            </p>
            <dl className="mt-5 space-y-3 text-[12px]">
              <SummaryRow label="프로젝트명" value="AI 추천 시스템 구축" />
              <SummaryRow label="제안 예산" value="월 450~550만원" />
              <SummaryRow label="예상 기간" value="6개월" />
              <SummaryRow label="시작 예정일" value="2026.08.20" />
              <SummaryRow label="근무 방식" value="재택" />
              <SummaryRow label="필요 직무" value={candidate.role} />
            </dl>
            <button
              type="button"
              onClick={requestMatching}
              disabled={status === "requested"}
              className="mt-5 h-10 w-full rounded-[8px] bg-brand text-[13px] font-bold text-white hover:bg-brand-hover disabled:cursor-default disabled:bg-surface-muted disabled:text-theme-secondary"
            >
              {ACTION_LABEL[status]}
            </button>
            {status === "requested" ? (
              <p
                role="status"
                className="mt-3 text-center text-[11px] font-semibold text-[#3478f6]"
              >
                프리랜서의 응답을 기다리고 있습니다.
              </p>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  );
}

function ProfileHeader({ candidate }: { candidate: RecommendedCandidate }) {
  return (
    <section className="rounded-[12px] border border-theme bg-surface p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#e9eff6] text-[18px] font-extrabold text-brand">
          {candidate.name.slice(0, 1)}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[20px] font-extrabold">{candidate.name}</h1>
            <span className="rounded-full border border-theme px-2.5 py-1 text-[11px] font-bold text-theme-secondary">
              개인 프리랜서
            </span>
          </div>
          <p className="mt-1 text-[13px] font-semibold text-theme-secondary">
            개발 · 프론트엔드 개발자 · {candidate.careerYears}년
          </p>
          <p className="mt-2 text-[12px] leading-5 text-theme-secondary">
            프리랜서 경력 {candidate.careerYears}년　
            <span className="text-[#e7a317]">★★★★★</span> 평점{" "}
            {candidate.rating} · 리뷰 {candidate.reviewCount}건　Professional
            등급　
            <span className="font-bold text-[#3478f6]">
              AI 적합도 {candidate.matchScore}%
            </span>
          </p>
          <p className="mt-2 text-[11px] text-theme-muted">
            최근 업데이트 2026.07.30 · 연락처 정보는 매칭 및 계약이 완료된 후
            확인할 수 있습니다.
          </p>
        </div>
      </div>
    </section>
  );
}
function ProfileSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[12px] border border-theme bg-surface p-5">
      <h2 className="mb-2 text-[15px] font-extrabold">{title}</h2>
      {children}
    </section>
  );
}
function Conditions({ candidate }: { candidate: RecommendedCandidate }) {
  const items = [
    ["직군", "개발"],
    ["직무", candidate.role],
    ["근무 방식", "재택"],
    ["근무 형태", "풀타임"],
    ["희망 급여", candidate.desiredRate.replace("월 ", "")],
    ["프로젝트 시작 가능일", "2026.08.20부터 가능"],
    ["희망 계약 기간", "6개월"],
    ["프로젝트 경험", "있음"],
    ["프로젝트 경력", `${candidate.careerYears - 1}년`],
  ];
  return (
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="rounded-[9px] border border-theme bg-surface-subtle px-4 py-3"
        >
          <dt className="text-[11px] text-theme-muted">{label}</dt>
          <dd className="mt-2 text-[13px] font-bold">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
function TimelineItem({
  period,
  title,
  subtitle,
  badge,
}: {
  period: string;
  title: string;
  subtitle: string;
  badge?: string;
}) {
  return (
    <div>
      <p className="text-[11px] text-theme-muted">{period}</p>
      <div className="mt-2 flex items-center gap-2">
        <h3 className="text-[13px] font-extrabold">{title}</h3>
        {badge ? (
          <span className="rounded-full bg-success-surface px-2 py-1 text-[10px] font-bold text-theme-success">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-[12px] text-theme-secondary">{subtitle}</p>
    </div>
  );
}
function ExternalLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="mb-2 flex items-center justify-between rounded-[8px] bg-surface-muted px-4 py-3 text-[10px] font-semibold last:mb-0"
    >
      {href}
      <span>↗</span>
    </a>
  );
}
function Review({
  title,
  date,
  body,
}: {
  title: string;
  date: string;
  body: string;
}) {
  return (
    <article className="mt-3 rounded-[9px] border border-theme bg-surface-subtle px-4 py-3">
      <div className="flex justify-between">
        <p className="text-[9px] font-bold text-[#e7a317]">
          ★★★★★　<span className="text-theme-primary">{title}</span>
        </p>
        <span className="text-[8px] text-theme-muted">{date}</span>
      </div>
      <p className="mt-2 text-[9px] leading-4 text-theme-secondary">{body}</p>
    </article>
  );
}
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="shrink-0 text-theme-muted">{label}</dt>
      <dd className="text-right font-bold text-theme-primary">{value}</dd>
    </div>
  );
}
