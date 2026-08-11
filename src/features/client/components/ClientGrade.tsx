import Link from "next/link";
import {
  BenefitRow,
  ChevronLeftIcon,
  CheckCircleIcon,
  InfoIcon,
} from "@/features/common/components/SharedUI";

export function ClientGrade() {
  return (
    <main className="min-h-screen bg-surface-subtle text-theme-primary">
      <div className="mx-auto w-full max-w-[820px] px-4 py-5">
        {/* 페이지 상단 */}
        <header>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link
                href="/client"
                className="flex w-fit items-center gap-1 text-[12px] text-theme-muted transition hover:text-[#4b5563]"
              >
                <ChevronLeftIcon />
                메인으로
              </Link>

              <h1 className="mt-2 text-[21px] font-extrabold tracking-[-0.04em] text-theme-primary">
                클라이언트 등급 안내
              </h1>

              <p className="mt-1.5 text-[12px] text-theme-muted">
                프로젝트 완료 실적과 평점에 따라 등급이 자동으로 산정됩니다.
              </p>
            </div>

            <div className="pt-6 text-right">
              <p className="text-[10px] text-theme-muted">등급 유지 기준</p>
              <p className="mt-1 text-[11px] font-bold text-theme-primary">
                12개월 내 프로젝트 경험 · 매월 체크
              </p>
            </div>
          </div>
        </header>

        {/* 실버 등급 */}
        <section className="mt-4 overflow-hidden rounded-[12px] border border-[#9ca8b8] bg-surface">
          <div className="flex flex-col justify-between gap-3 bg-[#eef2f7] px-5 py-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="inline-flex min-w-[64px] items-center justify-center rounded-full border border-[#344054] bg-surface px-3 py-1 text-[14px] font-extrabold text-theme-secondary">
                실버
              </span>

              <div>
                <p className="text-[12px] font-bold text-theme-primary">승급 조건</p>
                <p className="mt-1 text-[12px] text-theme-primary">기본 등급</p>
              </div>
            </div>

          </div>

          <div className="grid md:grid-cols-2">
            <div className="border-b border-theme px-5 py-4 md:border-b-0 md:border-r">
              <h2 className="text-[13px] font-extrabold text-theme-primary">
                주요 혜택
              </h2>

              <div className="mt-3 space-y-2.5">
                <BenefitRow
                  label="매칭 프리랜서 수"
                  value="1명"
                  iconColor="#475467"
                />
                <BenefitRow
                  label="프로젝트 등록"
                  value="최대 1개"
                  iconColor="#475467"
                />
                <BenefitRow
                  label="우수 프리랜서 매칭"
                  value="매칭 확률 증가"
                  iconColor="#475467"
                />
              </div>
            </div>

            <div className="px-5 py-4">
              <h2 className="text-[13px] font-extrabold text-theme-primary">
                수수료
              </h2>

              <p className="mt-2.5 text-[10px] text-theme-muted">착수금</p>

              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <FeeBox condition="1억 미만" rate="3%" />
                <FeeBox condition="1억 이상" rate="2%" />
              </div>

              <p className="mt-2.5 text-[10px] text-theme-muted">성공보수</p>

              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <FeeBox condition="1억 미만" rate="7%" />
                <FeeBox condition="1억 이상" rate="6%" />
              </div>
            </div>
          </div>
        </section>

        {/* 골드 등급 */}
        <section className="mt-4 overflow-hidden rounded-[12px] border border-[#ff9900] bg-surface">
          <div className="flex flex-col justify-between gap-3 border-b border-[#ff9900] bg-[#fff9eb] px-5 py-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="inline-flex min-w-[64px] items-center justify-center rounded-full border border-[#ff9900] bg-surface px-3 py-1 text-[14px] font-extrabold text-[#f59e0b]">
                골드
              </span>

              <div>
                <p className="text-[12px] font-bold text-theme-primary">승급 조건</p>
                <p className="mt-1 text-[12px] text-theme-primary">
                  별점 평균 3점 이상 · 완료 건수 10건 이상
                </p>
              </div>
            </div>

          </div>

          <div className="grid md:grid-cols-2">
            <div className="border-b border-theme px-5 py-4 md:border-b-0 md:border-r">
              <h2 className="text-[13px] font-extrabold text-theme-primary">
                주요 혜택
              </h2>

              <div className="mt-3 space-y-2.5">
                <BenefitRow
                  label="매칭 프리랜서 수"
                  value="1명"
                  iconColor="#f59e0b"
                />
                <BenefitRow
                  label="프로젝트 등록"
                  value="최대 2개"
                  iconColor="#f59e0b"
                />
                <BenefitRow
                  label="높은 등급 프리랜서 매칭"
                  value="매칭 확률 증가"
                  iconColor="#f59e0b"
                />
              </div>
            </div>

            <div className="px-5 py-4">
              <h2 className="text-[13px] font-extrabold text-theme-primary">
                수수료
              </h2>

              <p className="mt-2.5 text-[10px] text-theme-muted">착수금</p>

              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <FeeBox condition="1억 미만" rate="3%" accent="#f59e0b" />
                <FeeBox condition="1억 이상" rate="2%" accent="#f59e0b" />
              </div>

              <p className="mt-2.5 text-[10px] text-theme-muted">성공보수</p>

              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <FeeBox condition="1억 미만" rate="7%" accent="#f59e0b" />
                <FeeBox condition="1억 이상" rate="6%" accent="#f59e0b" />
              </div>
            </div>
          </div>
        </section>

        {/* 다이아 등급 */}
        <section className="mt-4 overflow-hidden rounded-[12px] border border-[#4f83ff] bg-surface">
          <div className="flex flex-col justify-between gap-3 border-b border-[#4f83ff] bg-[#eef5ff] px-5 py-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="inline-flex min-w-[72px] items-center justify-center rounded-full border border-[#4f83ff] bg-surface px-3 py-1 text-[14px] font-extrabold text-[#4380ff]">
                다이아
              </span>

              <div>
                <p className="text-[12px] font-bold text-theme-primary">승급 조건</p>
                <p className="mt-1 text-[12px] text-theme-primary">
                  별점 평균 4점 이상 · 완료 건수 20건 이상
                </p>
              </div>
            </div>

          </div>

          <div className="grid md:grid-cols-2">
            <div className="border-b border-theme px-5 py-4 md:border-b-0 md:border-r">
              <h2 className="text-[13px] font-extrabold text-theme-primary">
                주요 혜택
              </h2>

              <div className="mt-3 space-y-2.5">
                <BenefitRow
                  label="매칭 프리랜서 수"
                  value="1명"
                  iconColor="#4380ff"
                />
                <BenefitRow
                  label="프로젝트 등록"
                  value="최대 2개"
                  iconColor="#4380ff"
                />
                <BenefitRow
                  label="높은 등급 프리랜서 매칭"
                  value="매칭 확률 증가"
                  iconColor="#4380ff"
                />
                <BenefitRow
                  label="착수금 수수료"
                  value="1% 인하"
                  iconColor="#4380ff"
                />
                <BenefitRow
                  label="성공보수 수수료"
                  value="1% 인하 (총 2%↓)"
                  iconColor="#4380ff"
                />
              </div>
            </div>

            <div className="px-5 py-4">
              <h2 className="text-[13px] font-extrabold text-theme-primary">
                수수료
              </h2>

              <p className="mt-2.5 text-[10px] text-theme-muted">착수금</p>

              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <FeeBox condition="1억 미만" rate="2%" accent="#4380ff" />
                <FeeBox condition="1억 이상" rate="1%" accent="#4380ff" />
              </div>

              <p className="mt-2.5 text-[10px] text-theme-muted">성공보수</p>

              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <FeeBox condition="1억 미만" rate="6%" accent="#4380ff" />
                <FeeBox condition="1억 이상" rate="5%" accent="#4380ff" />
              </div>
            </div>
          </div>
        </section>

        {/* 수수료 발생 기준 */}
        <section className="mt-5 rounded-[12px] border border-[#dce1e8] bg-surface px-5 py-4">
          <h2 className="text-[14px] font-extrabold text-theme-primary">
            수수료 발생 기준
          </h2>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <article className="rounded-[9px] border border-theme bg-surface-subtle px-4 py-3">
              <div className="flex items-center gap-2">
                <WalletIcon />
                <h3 className="text-[13px] font-extrabold text-theme-primary">
                  착수금 수수료
                </h3>
              </div>

              <p className="mt-2 text-[11px] font-bold text-theme-primary">
                프로젝트 등록 후 매칭 완료 단계에 한 번 발생
              </p>

              <p className="mt-1.5 text-[10px] leading-4 text-theme-muted">
                실제 용역비는 클라이언트가 프리랜서에게 직접 지급합니다.
              </p>
            </article>

            <article className="rounded-[9px] border border-theme bg-surface-subtle px-4 py-3">
              <div className="flex items-center gap-2">
                <CheckCircleIcon color="#22b573" />
                <h3 className="text-[13px] font-extrabold text-theme-primary">
                  성공보수 수수료
                </h3>
              </div>

              <p className="mt-2 text-[11px] font-bold text-theme-primary">
                프로젝트 수행 완료 후 완료 대기 상태 전환 시 발생
              </p>

              <p className="mt-1.5 text-[10px] leading-4 text-theme-muted">
                성공보수 수수료 결제 완료 시 프로젝트 상태가 완료로
                전환됩니다.
              </p>
            </article>
          </div>
        </section>

        {/* 하단 안내 */}
        <div className="mt-3 flex items-start gap-2 rounded-[9px] border border-[#f1ad2b] bg-[#fff8e9] px-4 py-2.5">
          <InfoIcon />

          <p className="text-[10px] leading-4 text-theme-secondary">
            등급은 회원 등록 시 사전 안내되며, 등급 유지 여부는 매월
            자동으로 체크됩니다. 기존일 기준 12개월 내 프로젝트 경험이
            없으면 하위 등급으로 조정될 수 있습니다.
          </p>
        </div>
      </div>
    </main>
  );
}

function FeeBox({
  condition,
  rate,
  accent = "#344054",
}: {
  condition: string;
  rate: string;
  accent?: string;
}) {
  return (
    <div className="rounded-[7px] border border-theme bg-surface-subtle px-3 py-2">
      <p className="text-[10px] text-[#a0a8b5]">{condition}</p>

      <p
        className="mt-0.5 text-[16px] font-extrabold"
        style={{ color: accent }}
      >
        {rate}
      </p>
    </div>
  );
}

function WalletIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect
        x="2"
        y="3.2"
        width="11"
        height="8.6"
        rx="1.5"
        stroke="#22b573"
        strokeWidth="1.1"
      />
      <path
        d="M2.5 5.5H12.5"
        stroke="#22b573"
        strokeWidth="1.1"
      />
      <path
        d="M9.5 8.5H11"
        stroke="#22b573"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}
