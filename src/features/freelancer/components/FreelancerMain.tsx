"use client";

import Link from "next/link";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import {
  StepArrow,
  StepCheckIcon,
} from "@/features/common/components/SharedUI";

export function FreelancerMain() {
  const user = useCurrentUser();

  return (
    <main
      className="min-h-screen bg-surface-subtle text-theme-primary"
      style={{
        fontFamily:
          '"Pretendard", "Noto Sans KR", Arial, Helvetica, sans-serif',
      }}
    >
      <section className="bg-gradient-to-br from-[#183b5f] via-[#28557f] to-[#386b99]">
        <div className="mx-auto flex min-h-[400px] max-w-[1080px] flex-col justify-center px-5 py-16 sm:px-8">
          {/* 등급 */}
          <span className="mb-5 w-fit rounded-full bg-[#4678a6] px-4 py-1.5 text-xs font-bold text-white">
            시니어 등급
          </span>

          {/* 메인 문구 */}
          <h1 className="text-4xl font-extrabold leading-[1.28] tracking-[-0.04em] text-white sm:text-[44px]">
            {user?.name ? `${user.name} 님,` : "회원님,"}
            <br />
            <span className="text-[#a8cbe8]">오늘도 좋은 프로젝트를</span>
            <br />
            만나보세요.
          </h1>

          {/* 설명 */}
          <p className="mt-5 text-sm leading-[1.8] text-[#c2d3e3] sm:text-base">
            AI가 회사 규모, 기술 스택, 예산을 분석해
            <br />딱 맞는 프로젝트를 먼저 추천해 드립니다.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/freelancer/mypage/profile"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-7 text-sm font-extrabold text-[#17365d] transition hover:bg-[#edf4fa]"
            >
              프로필 등록하기
              <span className="ml-2 text-[14px]" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1080px] px-5 pb-24 pt-14 sm:px-8 sm:pt-16">
        <section>
          <div className="text-center">
            <p className="text-xs font-extrabold tracking-[0.22em] text-[#2868f0]">
              HOW IT WORKS
            </p>

            <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.04em] text-theme-primary sm:text-[28px]">
              페어링에서 프로젝트가 성사되는 방법
            </h2>
          </div>

          {/* 진행 카드 */}
          <div className="mt-12 grid items-center gap-5 md:grid-cols-[1fr_22px_1fr_22px_1fr]">
            {/* STEP 1 */}
            <article className="flex min-h-[210px] flex-col items-center justify-center rounded-2xl border border-theme bg-surface px-7 py-9 text-center">
              <p className="text-xs font-extrabold tracking-[0.1em] text-[#3975ef]">
                STEP 1
              </p>

              <h3 className="mt-4 text-base font-extrabold text-theme-primary">
                프로필 등록하기
              </h3>

              <p className="mt-4 text-sm leading-[1.8] text-theme-secondary">
                희망 조건과 경력, 포트폴리오를 등록하면 AI 맞춤 추천이
                시작됩니다.
              </p>
            </article>

            <StepArrow />

            {/* STEP 2 */}
            <article className="flex min-h-[210px] flex-col items-center justify-center rounded-2xl border border-theme bg-surface px-7 py-9 text-center">
              <p className="text-xs font-extrabold tracking-[0.1em] text-[#3975ef]">
                STEP 2
              </p>

              <h3 className="mt-4 text-base font-extrabold text-theme-primary">
                프로젝트 요청 받기
              </h3>

              <p className="mt-4 text-sm leading-[1.8] text-theme-secondary">
                클라이언트가 AI 추천 결과를 통해 프리랜서에게 직접 프로젝트를
                제안합니다.
              </p>
            </article>

            <StepArrow />

            {/* STEP 3 */}
            <article className="flex min-h-[210px] flex-col items-center justify-center rounded-2xl border border-theme bg-surface px-7 py-9 text-center">
              <p className="text-xs font-extrabold tracking-[0.1em] text-[#3975ef]">
                STEP 3
              </p>

              <h3 className="mt-4 text-base font-extrabold text-theme-primary">
                조건 협상 및 계약
              </h3>

              <p className="mt-4 text-sm leading-[1.8] text-theme-secondary">
                AI 협상 채널에서 조건을 조율하고, 완료되면 표준 계약서가
                생성됩니다.
              </p>
            </article>
          </div>
        </section>

        <section className="mt-12">
          {/* 제목 */}
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="text-xs font-extrabold tracking-[0.22em] text-[#2868f0]">
                GRADE BENEFITS
              </p>

              <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.04em] text-theme-primary">
                등급별 혜택 안내
              </h2>

              <p className="mt-2 text-sm text-[#697586]">
                별점 평균과 완료 건수 기준으로 등급이 매월 자동 산정됩니다.
              </p>
            </div>

            <Link
              href="/freelancer/grade"
              className="flex h-10 shrink-0 items-center gap-2 rounded-lg border border-theme bg-surface px-5 text-xs font-bold text-[#334155] transition hover:bg-surface-subtle"
            >
              등급 안내 자세히 보기
              <span className="text-[12px]" aria-hidden="true">
                ›
              </span>
            </Link>
          </div>

          <div className="mt-[17px] hidden overflow-hidden rounded-[12px] border border-theme bg-surface md:block">
            <table className="w-full table-fixed border-collapse text-left">
              {/* Header */}
              <thead className="bg-[#eaf1f7]">
                <tr className="h-12 text-xs font-bold text-theme-secondary">
                  <th className="w-[11%] px-3">등급</th>
                  <th className="w-[16%] px-3">승급 조건</th>
                  <th className="w-[16%] px-3">등급 유지</th>
                  <th className="w-[37%] px-3">주요 혜택</th>
                  <th className="w-[20%] px-3">수수료</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-t border-theme align-top">
                  {/* 등급 */}
                  <td className="px-3 py-4">
                    <span className="inline-flex rounded-full bg-surface-muted px-3 py-1.5 text-xs font-bold text-theme-secondary">
                      주니어
                    </span>
                  </td>

                  {/* 승급조건 */}
                  <td className="px-4 py-5 text-xs font-semibold leading-[1.7] text-theme-primary">
                    기본 등급
                  </td>

                  {/* 등급 유지 */}
                  <td className="px-4 py-5 text-xs leading-[1.7] text-theme-secondary">
                    6개월 내 프로젝트 경험 유지
                  </td>

                  {/* 주요 혜택 */}
                  <td className="px-3 py-4">
                    <div className="space-y-[6px]">
                      <BenefitItem text="표준계약서 작성" />

                      <BenefitItem text="검증된 프로젝트 매칭" />

                      <BenefitItem text="AI 1:1 맞춤 매칭" />
                    </div>
                  </td>

                  {/* 수수료 */}
                  <td className="px-3 py-4">
                    <span className="inline-flex rounded-md bg-surface-muted px-3 py-1.5 text-xs font-semibold text-theme-secondary">
                      기본 수수료
                    </span>
                  </td>
                </tr>
                <tr className="border-t border-theme align-top">
                  {/* 등급 */}
                  <td className="px-3 py-4">
                    <span className="inline-flex rounded-full bg-[#eaf3ff] px-3 py-1.5 text-xs font-bold text-[#3978ef]">
                      시니어
                    </span>
                  </td>

                  {/* 승급조건 */}
                  <td className="px-4 py-5 text-xs font-semibold leading-[1.7] text-theme-primary">
                    별점 3점↑
                    <br />+ 완료 5건↑
                  </td>

                  {/* 등급 유지 */}
                  <td className="px-4 py-5 text-xs leading-[1.7] text-theme-secondary">
                    6개월 내 프로젝트 경험 유지
                  </td>

                  {/* 주요 혜택 */}
                  <td className="px-3 py-4">
                    <div className="space-y-[6px]">
                      <BenefitItem text="표준계약서 작성" />

                      <BenefitItem text="검증된 프로젝트 매칭" />

                      <BenefitItem text="AI 1:1 맞춤 매칭" />

                      <BenefitItem text="우수 클라이언트 매칭 확률 증가" />
                    </div>
                  </td>

                  {/* 수수료 */}
                  <td className="px-3 py-4">
                    <span className="inline-flex rounded-md bg-surface-muted px-3 py-1.5 text-xs font-semibold text-theme-secondary">
                      기본 수수료
                    </span>
                  </td>
                </tr>

                <tr className="border-t border-theme align-top">
                  {/* 등급 */}
                  <td className="px-3 py-4">
                    <span className="inline-flex rounded-full bg-[#f2eaff] px-3 py-1.5 text-xs font-bold text-[#8b5cf6]">
                      마스터
                    </span>
                  </td>

                  {/* 승급조건 */}
                  <td className="px-4 py-5 text-xs font-semibold leading-[1.7] text-theme-primary">
                    별점 4점↑
                    <br />+ 완료 10건↑
                  </td>

                  {/* 등급 유지 */}
                  <td className="px-4 py-5 text-xs leading-[1.7] text-theme-secondary">
                    6개월 내 프로젝트 경험 유지
                  </td>

                  {/* 주요 혜택 */}
                  <td className="px-3 py-4">
                    <div className="space-y-[6px]">
                      <BenefitItem text="표준계약서 작성" />

                      <BenefitItem text="검증된 프로젝트 매칭" />

                      <BenefitItem text="AI 1:1 맞춤 매칭" />

                      <BenefitItem text="우수 클라이언트 매칭 확률 증가" />

                      <BenefitItem text="착수금·성공보수 수수료 각 1% 인하" />
                    </div>
                  </td>

                  {/* 수수료 */}
                  <td className="px-3 py-4">
                    <span className="inline-flex whitespace-nowrap rounded-md bg-[#f5efff] px-3 py-1.5 text-xs font-bold text-[#8b5cf6]">
                      수수료 각 1% 인하 (총 2%↓)
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 space-y-3 md:hidden">
            {/* 주니어 */}
            <article className="rounded-xl border border-theme bg-surface p-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-surface-muted px-3 py-1 text-[11px] font-bold text-theme-secondary">
                  주니어
                </span>

                <span className="rounded-md bg-surface-muted px-2 py-1 text-[10px] text-theme-secondary">
                  기본 수수료
                </span>
              </div>

              <div className="mt-4 border-t border-theme pt-4">
                <p className="text-[10px] text-theme-muted">승급 조건</p>
                <p className="mt-1 text-[11px] font-semibold text-theme-primary">
                  기본 등급
                </p>
              </div>

              <div className="mt-4">
                <p className="text-[10px] text-theme-muted">등급 유지</p>
                <p className="mt-1 text-[11px] text-theme-secondary">
                  6개월 내 프로젝트 경험 유지
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <BenefitItem text="표준계약서 작성" />
                <BenefitItem text="검증된 프로젝트 매칭" />
                <BenefitItem text="AI 1:1 맞춤 매칭" />
              </div>
            </article>

            {/* 시니어 */}
            <article className="rounded-xl border border-theme bg-surface p-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#eaf3ff] px-3 py-1 text-[11px] font-bold text-[#3978ef]">
                  시니어
                </span>

                <span className="rounded-md bg-surface-muted px-2 py-1 text-[10px] text-theme-secondary">
                  기본 수수료
                </span>
              </div>

              <div className="mt-4 border-t border-theme pt-4">
                <p className="text-[10px] text-theme-muted">승급 조건</p>
                <p className="mt-1 text-[11px] font-semibold text-theme-primary">
                  별점 3점↑ + 완료 5건↑
                </p>
              </div>

              <div className="mt-4">
                <p className="text-[10px] text-theme-muted">등급 유지</p>
                <p className="mt-1 text-[11px] text-theme-secondary">
                  6개월 내 프로젝트 경험 유지
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <BenefitItem text="표준계약서 작성" />
                <BenefitItem text="검증된 프로젝트 매칭" />
                <BenefitItem text="AI 1:1 맞춤 매칭" />
                <BenefitItem text="우수 클라이언트 매칭 확률 증가" />
              </div>
            </article>

            {/* 마스터 */}
            <article className="rounded-xl border border-theme bg-surface p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-[#f2eaff] px-3 py-1 text-[11px] font-bold text-[#8b5cf6]">
                  마스터
                </span>

                <span className="rounded-md bg-[#f5efff] px-2 py-1 text-[10px] font-bold text-[#8b5cf6]">
                  수수료 각 1% 인하
                </span>
              </div>

              <div className="mt-4 border-t border-theme pt-4">
                <p className="text-[10px] text-theme-muted">승급 조건</p>
                <p className="mt-1 text-[11px] font-semibold text-theme-primary">
                  별점 4점↑ + 완료 10건↑
                </p>
              </div>

              <div className="mt-4">
                <p className="text-[10px] text-theme-muted">등급 유지</p>
                <p className="mt-1 text-[11px] text-theme-secondary">
                  6개월 내 프로젝트 경험 유지
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <BenefitItem text="표준계약서 작성" />
                <BenefitItem text="검증된 프로젝트 매칭" />
                <BenefitItem text="AI 1:1 맞춤 매칭" />
                <BenefitItem text="우수 클라이언트 매칭 확률 증가" />
                <BenefitItem text="착수금·성공보수 수수료 각 1% 인하" />
              </div>
            </article>
          </div>
        </section>
      </section>
    </main>
  );
}

/* =========================================================
   BENEFIT ITEM
========================================================= */

function BenefitItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-[5px]">
      <StepCheckIcon color="#18B875" size={9} />

      <span className="text-xs leading-[1.55] text-[#526174]">{text}</span>
    </div>
  );
}
