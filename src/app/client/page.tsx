import Link from "next/link";

export default function ClientHomePage() {
  return (
    <main
      className="min-h-screen bg-[#f7f8fa] text-[#172033]"
      style={{
        fontFamily:
          '"Pretendard", "Noto Sans KR", Arial, Helvetica, sans-serif',
      }}
    >
      {/* 상단 히어로 영역 */}
      <section className="bg-gradient-to-br from-[#102943] via-[#1e426f] to-[#234ed8]">
        <div className="mx-auto flex min-h-[316px] max-w-[744px] flex-col justify-center px-5 py-12 sm:px-8">
          <div className="mb-4 w-fit rounded-full bg-[#3979f6] px-3 py-1 text-[10px] font-bold text-white">
            골드 등급
          </div>

          <h1 className="text-[29px] font-extrabold leading-[1.35] tracking-[-0.04em] text-white sm:text-[31px]">
            오이랩 님,
            <br />
            <span className="text-[#8dc3ff]">딱 맞는 프리랜서를</span>
            <br />
            찾아드립니다.
          </h1>

          <p className="mt-4 text-[11px] leading-5 text-[#b8c6d9]">
            AI가 기술 스택, 경력, 예산을 분석해 최적의 후보를 먼저 추천해
            드립니다.
          </p>

          <div className="mt-10 flex flex-wrap gap-2">
            <button
              type="button"
              className="h-[38px] rounded-lg bg-[#102c4d] px-6 text-[11px] font-bold text-white shadow-sm transition hover:bg-[#0c223d]"
            >
              프로젝트 등록하기
            </button>

            <button
              type="button"
              className="h-[38px] rounded-lg border border-white/10 bg-white/10 px-6 text-[11px] font-semibold text-white transition hover:bg-white/15"
            >
              내 프로젝트 보기
            </button>
          </div>
        </div>
      </section>

      {/* 콘텐츠 영역 */}
      <section className="mx-auto max-w-[744px] px-5 pb-16 pt-10 sm:px-8 sm:pt-12">
        {/* 진행 방법 */}
        <div className="text-center">
          <p className="text-[9px] font-extrabold tracking-[0.22em] text-[#2868f0]">
            HOW IT WORKS
          </p>

          <h2 className="mt-2 text-[18px] font-extrabold tracking-[-0.04em] text-[#172033]">
            페어링에서 프로젝트가 성사되는 방법
          </h2>
        </div>

        <div className="mt-12 grid items-center gap-4 md:grid-cols-[1fr_18px_1fr_18px_1fr]">
          {/* STEP 1 */}
          <article className="flex min-h-[142px] flex-col items-center justify-center rounded-[13px] border border-[#e1e5eb] bg-white px-5 py-7 text-center shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
            <p className="text-[8px] font-extrabold tracking-[0.08em] text-[#3975ef]">
              STEP 1
            </p>

            <h3 className="mt-3 text-[12px] font-extrabold text-[#172033]">
              프리랜서 요청하기
            </h3>

            <p className="mt-3 text-[9px] leading-[1.7] text-[#8993a4]">
              프로젝트 조건을 등록하면 AI가 최적의 프리랜서를 추천합니다.
              원하는 후보에게 직접 매칭 요청을 보내세요.
            </p>
          </article>

          <div className="hidden justify-center text-[#9da7b5] md:flex">
            <svg
              width="8"
              height="14"
              viewBox="0 0 8 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 1L7 7L1 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* STEP 2 */}
          <article className="flex min-h-[142px] flex-col items-center justify-center rounded-[13px] border border-[#e1e5eb] bg-white px-5 py-7 text-center shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
            <p className="text-[8px] font-extrabold tracking-[0.08em] text-[#3975ef]">
              STEP 2
            </p>

            <h3 className="mt-3 text-[12px] font-extrabold text-[#172033]">
              조건 협상 진행
            </h3>

            <p className="mt-3 text-[9px] leading-[1.7] text-[#8993a4]">
              AI 협상 서버에서 급여·기간·범위를 최대 15라운드 내 조율합니다.
              협상은 자동으로 기록됩니다.
            </p>
          </article>

          <div className="hidden justify-center text-[#9da7b5] md:flex">
            <svg
              width="8"
              height="14"
              viewBox="0 0 8 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 1L7 7L1 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* STEP 3 */}
          <article className="flex min-h-[142px] flex-col items-center justify-center rounded-[13px] border border-[#e1e5eb] bg-white px-5 py-7 text-center shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
            <p className="text-[8px] font-extrabold tracking-[0.08em] text-[#3975ef]">
              STEP 3
            </p>

            <h3 className="mt-3 text-[12px] font-extrabold text-[#172033]">
              계약 성사
            </h3>

            <p className="mt-3 text-[9px] leading-[1.7] text-[#8993a4]">
              협상이 완료되면 표준 계약서가 자동 생성됩니다. 양측 서명 후
              프로젝트가 즉시 시작됩니다.
            </p>
          </article>
        </div>

        {/* 등급별 혜택 */}
        <section className="mt-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[9px] font-extrabold tracking-[0.2em] text-[#2868f0]">
                GRADE BENEFITS
              </p>

              <h2 className="mt-2 text-[17px] font-extrabold tracking-[-0.04em] text-[#172033]">
                등급별 혜택 안내
              </h2>

              <p className="mt-1 text-[9px] text-[#8993a4]">
                프로젝트 완료 실적에 따라 등급이 자동 산정됩니다.
              </p>
            </div>

            <Link
              href="/client/grade"
              className="flex h-[29px] w-fit items-center gap-2 rounded-md border border-[#dfe4ea] bg-white px-4 text-[9px] font-bold text-[#334155] transition hover:bg-[#f8fafc]"
            >
              등급 안내 자세히 보기
              <span aria-hidden="true">›</span>
            </Link>
          </div>

          {/* 데스크톱 테이블 */}
          <div className="mt-4 hidden overflow-hidden rounded-[13px] border border-[#e1e5eb] bg-white md:block">
            <table className="w-full table-fixed border-collapse text-left">
              <thead className="bg-[#eaf0f6]">
                <tr className="h-[31px] text-[8px] font-bold text-[#405064]">
                  <th className="w-[13%] px-4">등급</th>
                  <th className="w-[20%] px-4">달성 조건</th>
                  <th className="w-[18%] px-4">수수료율</th>
                  <th className="w-[52%] px-4">주요 혜택</th>
                </tr>
              </thead>

              <tbody>
                {/* 실버 */}
                <tr className="h-[45px] border-t border-[#edf0f3] text-[8px] text-[#596579]">
                  <td className="px-4">
                    <span className="inline-flex rounded-full bg-[#eef2f5] px-3 py-1 font-bold text-[#64748b]">
                      실버
                    </span>
                  </td>

                  <td className="px-4">기본 등급</td>

                  <td className="px-4 font-bold text-[#0068a9]">
                    착수 3% · 성공 7%
                  </td>

                  <td className="px-4">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-[#677386]">
                        <CheckIcon />
                        프로젝트 1개 등록
                      </span>

                      <span className="flex items-center gap-1 text-[#677386]">
                        <CheckIcon />
                        우수 프리랜서 매칭확률 증가
                      </span>
                    </div>
                  </td>
                </tr>

                {/* 골드 */}
                <tr className="h-[45px] border-t border-[#edf0f3] text-[8px] text-[#596579]">
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
                      <span className="flex items-center gap-1 text-[#677386]">
                        <CheckIcon />
                        프로젝트 2개 등록
                      </span>

                      <span className="flex items-center gap-1 text-[#677386]">
                        <CheckIcon />
                        우수 프리랜서 매칭확률 증가
                      </span>
                    </div>
                  </td>
                </tr>

                {/* 다이아 */}
                <tr className="h-[45px] border-t border-[#edf0f3] text-[8px] text-[#596579]">
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
                      <span className="flex items-center gap-1 text-[#677386]">
                        <CheckIcon />
                        프로젝트 2개 등록
                      </span>

                      <span className="flex items-center gap-1 text-[#677386]">
                        <CheckIcon />
                        최우수 프리랜서 매칭확률 증가
                      </span>

                      <span className="flex items-center gap-1 text-[#677386]">
                        <CheckIcon />
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
            <article className="rounded-xl border border-[#e1e5eb] bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#eef2f5] px-3 py-1 text-[11px] font-bold text-[#64748b]">
                  실버
                </span>
                <span className="text-[11px] font-bold text-[#0068a9]">
                  착수 3% · 성공 7%
                </span>
              </div>

              <p className="mt-3 text-[11px] text-[#596579]">기본 등급</p>

              <div className="mt-3 space-y-2 text-[11px] text-[#677386]">
                <p className="flex items-center gap-1">
                  <CheckIcon />
                  프로젝트 1개 등록
                </p>
                <p className="flex items-center gap-1">
                  <CheckIcon />
                  우수 프리랜서 매칭 확률 증가
                </p>
              </div>
            </article>

            <article className="rounded-xl border border-[#e1e5eb] bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#fff5df] px-3 py-1 text-[11px] font-bold text-[#e99b13]">
                  골드
                </span>
                <span className="text-[11px] font-bold text-[#0068a9]">
                  착수 3% · 성공 7%
                </span>
              </div>

              <p className="mt-3 text-[11px] text-[#596579]">
                별점 3점 이상, 건수 10개 이상
              </p>

              <div className="mt-3 space-y-2 text-[11px] text-[#677386]">
                <p className="flex items-center gap-1">
                  <CheckIcon />
                  프로젝트 2개 등록
                </p>
                <p className="flex items-center gap-1">
                  <CheckIcon />
                  우수 프리랜서 매칭 확률 증가
                </p>
              </div>
            </article>

            <article className="rounded-xl border border-[#e1e5eb] bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#eaf3ff] px-3 py-1 text-[11px] font-bold text-[#3978ef]">
                  다이아
                </span>
                <span className="text-[11px] font-bold text-[#0068a9]">
                  착수 2% · 성공 6%
                </span>
              </div>

              <p className="mt-3 text-[11px] text-[#596579]">
                별점 4점 이상, 건수 20개 이상
              </p>

              <div className="mt-3 space-y-2 text-[11px] text-[#677386]">
                <p className="flex items-center gap-1">
                  <CheckIcon />
                  프로젝트 2개 등록
                </p>
                <p className="flex items-center gap-1">
                  <CheckIcon />
                  최우수 프리랜서 매칭 확률 증가
                </p>
                <p className="flex items-center gap-1">
                  <CheckIcon />
                  수수료 인하
                </p>
              </div>
            </article>
          </div>

          <p className="mt-2 text-[8px] text-[#929bab]">
            * 현재 등급:{" "}
            <strong className="font-bold text-[#596579]">골드</strong> · 다이아
            등급까지 완료 프로젝트 20건 남음
          </p>
        </section>
      </section>
    </main>
  );
}

function CheckIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="5" cy="5" r="4" stroke="#35B77A" strokeWidth="1" />
      <path
        d="M3.2 5.1L4.4 6.3L6.9 3.8"
        stroke="#35B77A"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}