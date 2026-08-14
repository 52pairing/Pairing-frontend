"use client";

import Link from "next/link";
import { useCurrentUserState } from "@/features/auth/hooks/useCurrentUser";
import type { CurrentUserResponse } from "@/features/auth/types";
import { StepArrow, StepCheckIcon } from "@/features/common/components/SharedUI";

interface ClientMainProps {
  initialUser?: CurrentUserResponse | null;
}

export function ClientMain({ initialUser = null }: ClientMainProps) {
  const { user, isLoading } = useCurrentUserState(initialUser);

  return (
    <main
      className="min-h-screen bg-surface-subtle text-theme-primary"
      style={{
        fontFamily:
          '"Pretendard", "Noto Sans KR", Arial, Helvetica, sans-serif',
      }}
    >
      {/* 상단 히어로 영역 */}
      <section className="bg-gradient-to-br from-[#183b5f] via-[#28557f] to-[#386b99]">
        <div className="mx-auto flex min-h-[400px] max-w-[1080px] flex-col justify-center px-5 py-16 sm:px-8">
          <div className="mb-5 w-fit rounded-full bg-[#4678a6] px-4 py-1.5 text-xs font-bold text-white">
            골드 등급
          </div>

          <h1 className="text-4xl font-extrabold leading-[1.3] tracking-[-0.04em] text-white sm:text-[44px]">
            {isLoading ? (
              <span aria-label="사용자 정보 불러오는 중" className="invisible inline-block w-[5.5em]" aria-hidden="true">
                회원님,
              </span>
            ) : user?.name ? (
              `${user.name} 님,`
            ) : (
              "회원님,"
            )}
            <br />
            <span className="text-[#a8cbe8]">딱 맞는 프리랜서를</span>
            <br />
            찾아드립니다.
          </h1>

          <p className="mt-5 text-sm leading-6 text-[#c2d3e3] sm:text-base">
            AI가 기술 스택, 경력, 예산을 분석해 최적의 후보를 먼저 추천해
            드립니다.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <button
              type="button"
              className="h-12 rounded-lg bg-[#1d466d] px-7 text-sm font-bold text-white shadow-sm transition hover:bg-[#173a5b]"
            >
              프로젝트 등록하기
            </button>

            <button
              type="button"
              className="h-12 rounded-lg border border-white/10 bg-surface/10 px-7 text-sm font-semibold text-white transition hover:bg-surface/15"
            >
              내 프로젝트 보기
            </button>
          </div>
        </div>
      </section>

      {/* 콘텐츠 영역 */}
      <section className="mx-auto max-w-[1080px] px-5 pb-24 pt-14 sm:px-8 sm:pt-16">
        {/* 진행 방법 */}
        <div className="text-center">
          <p className="text-xs font-extrabold tracking-[0.22em] text-[#2868f0]">
            HOW IT WORKS
          </p>

          <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.04em] text-theme-primary sm:text-[28px]">
            페어링에서 프로젝트가 성사되는 방법
          </h2>
        </div>

        <div className="mt-12 grid items-center gap-5 md:grid-cols-[1fr_22px_1fr_22px_1fr]">
          {/* STEP 1 */}
          <article className="flex min-h-[210px] flex-col items-center justify-center rounded-2xl border border-theme bg-surface px-7 py-9 text-center shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
            <p className="text-xs font-extrabold tracking-[0.08em] text-[#3975ef]">
              STEP 1
            </p>

            <h3 className="mt-4 text-base font-extrabold text-theme-primary">
              프리랜서 요청하기
            </h3>

            <p className="mt-4 text-sm leading-[1.7] text-theme-muted">
              프로젝트 조건을 등록하면 AI가 최적의 프리랜서를 추천합니다.
              원하는 후보에게 직접 매칭 요청을 보내세요.
            </p>
          </article>

          <StepArrow />

          {/* STEP 2 */}
          <article className="flex min-h-[210px] flex-col items-center justify-center rounded-2xl border border-theme bg-surface px-7 py-9 text-center shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
            <p className="text-xs font-extrabold tracking-[0.08em] text-[#3975ef]">
              STEP 2
            </p>

            <h3 className="mt-4 text-base font-extrabold text-theme-primary">
              조건 협상 진행
            </h3>

            <p className="mt-4 text-sm leading-[1.7] text-theme-muted">
              AI 협상 서버에서 급여·기간·범위를 최대 15라운드 내 조율합니다.
              협상은 자동으로 기록됩니다.
            </p>
          </article>

          <StepArrow />

          {/* STEP 3 */}
          <article className="flex min-h-[210px] flex-col items-center justify-center rounded-2xl border border-theme bg-surface px-7 py-9 text-center shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
            <p className="text-xs font-extrabold tracking-[0.08em] text-[#3975ef]">
              STEP 3
            </p>

            <h3 className="mt-4 text-base font-extrabold text-theme-primary">
              계약 성사
            </h3>

            <p className="mt-4 text-sm leading-[1.7] text-theme-muted">
              협상이 완료되면 표준 계약서가 자동 생성됩니다. 양측 서명 후
              프로젝트가 즉시 시작됩니다.
            </p>
          </article>
        </div>

        {/* 등급별 혜택 */}
        <section className="mt-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold tracking-[0.2em] text-[#2868f0]">
                GRADE BENEFITS
              </p>

              <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.04em] text-theme-primary">
                등급별 혜택 안내
              </h2>

              <p className="mt-2 text-sm text-theme-muted">
                프로젝트 완료 실적에 따라 등급이 자동 산정됩니다.
              </p>
            </div>

            <Link
              href="/client/grade"
              className="flex h-10 w-fit items-center gap-2 rounded-lg border border-theme bg-surface px-5 text-xs font-bold text-[#334155] transition hover:bg-surface-subtle"
            >
              등급 안내 자세히 보기
              <span aria-hidden="true">›</span>
            </Link>
          </div>

          {/* 데스크톱 테이블 */}
          <div className="mt-4 hidden overflow-hidden rounded-[13px] border border-theme bg-surface md:block">
            <table className="w-full table-fixed border-collapse text-left">
              <thead className="bg-[#eaf0f6]">
                <tr className="h-12 text-xs font-bold text-[#405064]">
                  <th className="w-[13%] px-4">등급</th>
                  <th className="w-[20%] px-4">달성 조건</th>
                  <th className="w-[18%] px-4">수수료율</th>
                  <th className="w-[52%] px-4">주요 혜택</th>
                </tr>
              </thead>

              <tbody>
                {/* 실버 */}
                <tr className="h-16 border-t border-theme text-xs text-theme-secondary">
                  <td className="px-4">
                    <span className="inline-flex rounded-full bg-[#eef2f5] px-3 py-1 font-bold text-theme-secondary">
                      실버
                    </span>
                  </td>

                  <td className="px-4">기본 등급</td>

                  <td className="px-4 font-bold text-[#0068a9]">
                    착수 3% · 성공 7%
                  </td>

                  <td className="px-4">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-theme-secondary">
                        <StepCheckIcon />
                        프로젝트 1개 등록
                      </span>

                      <span className="flex items-center gap-1 text-theme-secondary">
                        <StepCheckIcon />
                        우수 프리랜서 매칭확률 증가
                      </span>
                    </div>
                  </td>
                </tr>

                {/* 골드 */}
                <tr className="h-16 border-t border-theme text-xs text-theme-secondary">
                  <td className="px-4">
                    <span className="inline-flex rounded-full bg-[#fff5df] px-3 py-1 font-bold text-[#e99b13]">
                      골드
                    </span>
                  </td>

                  <td className="px-4">별점 3점 이상, 건수 10개 이상</td>

                  <td className="px-4 font-bold text-[#0068a9]">
                    착수 3% · 성공 7%
                  </td>

                  <td className="px-4">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-theme-secondary">
                        <StepCheckIcon />
                        프로젝트 2개 등록
                      </span>

                      <span className="flex items-center gap-1 text-theme-secondary">
                        <StepCheckIcon />
                        우수 프리랜서 매칭확률 증가
                      </span>
                    </div>
                  </td>
                </tr>

                {/* 다이아 */}
                <tr className="h-16 border-t border-theme text-xs text-theme-secondary">
                  <td className="px-4">
                    <span className="inline-flex rounded-full bg-[#eaf3ff] px-3 py-1 font-bold text-[#3978ef]">
                      다이아
                    </span>
                  </td>

                  <td className="px-4">별점 4점 이상, 건수 20개 이상</td>

                  <td className="px-4 font-bold text-[#0068a9]">
                    착수 2% · 성공 6%
                  </td>

                  <td className="px-4">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-theme-secondary">
                        <StepCheckIcon />
                        프로젝트 2개 등록
                      </span>

                      <span className="flex items-center gap-1 text-theme-secondary">
                        <StepCheckIcon />
                        최우수 프리랜서 매칭확률 증가
                      </span>

                      <span className="flex items-center gap-1 text-theme-secondary">
                        <StepCheckIcon />
                        수수료 인하
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 모바일 등급 카드 */}
          <div className="mt-4 space-y-3 md:hidden">
            <article className="rounded-xl border border-theme bg-surface p-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#eef2f5] px-3 py-1 text-[11px] font-bold text-theme-secondary">
                  실버
                </span>
                <span className="text-[11px] font-bold text-[#0068a9]">
                  착수 3% · 성공 7%
                </span>
              </div>

              <p className="mt-3 text-[11px] text-theme-secondary">기본 등급</p>

              <div className="mt-3 space-y-2 text-[11px] text-theme-secondary">
                <p className="flex items-center gap-1">
                  <StepCheckIcon />
                  프로젝트 1개 등록
                </p>
                <p className="flex items-center gap-1">
                  <StepCheckIcon />
                  우수 프리랜서 매칭 확률 증가
                </p>
              </div>
            </article>

            <article className="rounded-xl border border-theme bg-surface p-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#fff5df] px-3 py-1 text-[11px] font-bold text-[#e99b13]">
                  골드
                </span>
                <span className="text-[11px] font-bold text-[#0068a9]">
                  착수 3% · 성공 7%
                </span>
              </div>

              <p className="mt-3 text-[11px] text-theme-secondary">
                별점 3점 이상, 건수 10개 이상
              </p>

              <div className="mt-3 space-y-2 text-[11px] text-theme-secondary">
                <p className="flex items-center gap-1">
                  <StepCheckIcon />
                  프로젝트 2개 등록
                </p>
                <p className="flex items-center gap-1">
                  <StepCheckIcon />
                  우수 프리랜서 매칭 확률 증가
                </p>
              </div>
            </article>

            <article className="rounded-xl border border-theme bg-surface p-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#eaf3ff] px-3 py-1 text-[11px] font-bold text-[#3978ef]">
                  다이아
                </span>
                <span className="text-[11px] font-bold text-[#0068a9]">
                  착수 2% · 성공 6%
                </span>
              </div>

              <p className="mt-3 text-[11px] text-theme-secondary">
                별점 4점 이상, 건수 20개 이상
              </p>

              <div className="mt-3 space-y-2 text-[11px] text-theme-secondary">
                <p className="flex items-center gap-1">
                  <StepCheckIcon />
                  프로젝트 2개 등록
                </p>
                <p className="flex items-center gap-1">
                  <StepCheckIcon />
                  최우수 프리랜서 매칭 확률 증가
                </p>
                <p className="flex items-center gap-1">
                  <StepCheckIcon />
                  수수료 인하
                </p>
              </div>
            </article>
          </div>
        </section>
      </section>
    </main>
  );
}
