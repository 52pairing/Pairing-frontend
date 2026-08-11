import Link from "next/link";
import {
  BenefitRow,
  ChevronLeftIcon,
  CheckCircleIcon,
  InfoIcon,
} from "@/features/common/components/SharedUI";

export function FreelancerGrade() {
  return (
    <main
      className="min-h-screen bg-surface-subtle text-theme-primary"
      style={{
        fontFamily:
          '"Pretendard", "Noto Sans KR", Arial, Helvetica, sans-serif',
      }}
    >
      <div className="mx-auto w-full max-w-[820px] px-4 py-5">
        {/* =====================================================
            HEADER
        ===================================================== */}
        <header>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link
                href="/freelancer"
                className="flex w-fit items-center gap-1 text-[12px] text-theme-muted transition hover:text-theme-secondary"
              >
                <ChevronLeftIcon size={12} />
                메인으로
              </Link>

              <h1 className="mt-2 text-[21px] font-extrabold tracking-[-0.04em] text-theme-primary">
                프리랜서 등급 안내
              </h1>

              <p className="mt-1.5 text-[12px] text-theme-secondary">
                별점 평균과 완료 건수 기준으로 등급이 매월 자동 산정됩니다.
              </p>
            </div>

            <div className="pt-6 text-right">
              <p className="text-[10px] text-theme-muted">등급 유지 기준</p>

              <p className="mt-1 text-[11px] font-bold text-theme-primary">
                6개월 내 프로젝트 경험 · 매월 체크
              </p>
            </div>
          </div>
        </header>

        {/* =====================================================
            JUNIOR
        ===================================================== */}
        <section className="mt-4 overflow-hidden rounded-[12px] border border-[#bdc9d7] bg-surface">
          {/* 카드 헤더 */}
          <div className="flex items-center border-b border-[#d8e0e9] bg-[#edf3f8] px-5 py-3">
            <span className="flex min-w-[72px] items-center justify-center rounded-full border border-[#64748b] bg-surface px-3 py-1 text-[14px] font-extrabold text-theme-secondary">
              주니어
            </span>

            <div className="ml-3">
              <p className="text-[11px] font-bold text-theme-secondary">
                승급 조건
              </p>

              <p className="mt-1 text-[12px] font-semibold text-theme-primary">
                디폴트 (가입 즉시)
              </p>
            </div>
          </div>

          {/* 카드 본문 */}
          <div className="grid md:grid-cols-2">
            {/* 주요 혜택 */}
            <div className="border-b border-theme px-5 py-4 md:border-b-0 md:border-r">
              <h2 className="text-[12px] font-extrabold text-theme-primary">
                주요 혜택
              </h2>

              <div className="mt-3 space-y-2.5">
                <BenefitRow
                  label="표준계약서 작성"
                  value="제공"
                  iconColor="#111827"
                />

                <BenefitRow
                  label="검증된 프로젝트 매칭"
                  value="제공"
                  iconColor="#111827"
                />

                <BenefitRow
                  label="AI 1:1 맞춤 매칭"
                  value="제공"
                  iconColor="#111827"
                />
              </div>
            </div>

            {/* 수수료 */}
            <div className="px-5 py-4">
              <h2 className="text-[12px] font-extrabold text-theme-primary">
                수수료
              </h2>

              <div className="mt-3">
                <p className="text-[10px] text-theme-muted">
                  착수금 수수료
                </p>

                <div className="mt-1.5 flex items-center gap-3">
                  <FeeBox rate="4%" type="junior" />

                  <span className="text-[10px] text-theme-secondary">
                    마스터 적용 없음
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-[10px] text-theme-muted">
                  성공보수 수수료
                </p>

                <div className="mt-1.5 flex items-center gap-3">
                  <FeeBox rate="6%" type="junior" />

                  <span className="text-[10px] text-theme-secondary">
                    마스터 적용 없음
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            SENIOR
        ===================================================== */}
        <section className="mt-4 overflow-hidden rounded-[12px] border border-[#4d94ff] bg-surface">
          {/* 카드 헤더 */}
          <div className="flex items-center border-b border-[#8bb9ff] bg-[#edf5ff] px-5 py-3">
            <span className="flex min-w-[72px] items-center justify-center rounded-full border border-[#3f83f8] bg-surface px-3 py-1 text-[14px] font-extrabold text-[#3178f6]">
              시니어
            </span>

            <div className="ml-3">
              <p className="text-[11px] font-bold text-[#3178f6]">
                승급 조건
              </p>

              <p className="mt-1 text-[12px] font-semibold text-theme-primary">
                별점 평균 3점 이상 + 완료 건수 5건 이상
              </p>
            </div>
          </div>

          {/* 카드 본문 */}
          <div className="grid md:grid-cols-2">
            {/* 주요 혜택 */}
            <div className="border-b border-theme px-5 py-4 md:border-b-0 md:border-r">
              <h2 className="text-[12px] font-extrabold text-theme-primary">
                주요 혜택
              </h2>

              <div className="mt-3 space-y-2.5">
                <BenefitRow
                  label="표준계약서 작성"
                  value="제공"
                  iconColor="#111827"
                />

                <BenefitRow
                  label="검증된 프로젝트 매칭"
                  value="제공"
                  iconColor="#111827"
                />

                <BenefitRow
                  label="AI 1:1 맞춤 매칭"
                  value="제공"
                  iconColor="#111827"
                />

                <BenefitRow
                  label="우수 클라이언트 매칭"
                  value="확률 증가"
                  iconColor="#111827"
                />
              </div>
            </div>

            {/* 수수료 */}
            <div className="px-5 py-4">
              <h2 className="text-[12px] font-extrabold text-theme-primary">
                수수료
              </h2>

              <div className="mt-3">
                <p className="text-[10px] text-theme-muted">
                  착수금 수수료
                </p>

                <div className="mt-1.5 flex items-center gap-3">
                  <FeeBox rate="4%" type="senior" />

                  <span className="text-[10px] text-theme-secondary">
                    마스터 적용 없음
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-[10px] text-theme-muted">
                  성공보수 수수료
                </p>

                <div className="mt-1.5 flex items-center gap-3">
                  <FeeBox rate="6%" type="senior" />

                  <span className="text-[10px] text-theme-secondary">
                    마스터 적용 없음
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            MASTER
        ===================================================== */}
        <section className="mt-4 overflow-hidden rounded-[12px] border border-[#9a6cff] bg-surface">
          {/* 카드 헤더 */}
          <div className="flex items-center border-b border-[#c4abff] bg-[#f4f1ff] px-5 py-3">
            <span className="flex min-w-[72px] items-center justify-center rounded-full border border-[#8648ff] bg-surface px-3 py-1 text-[14px] font-extrabold text-[#7c3cff]">
              마스터
            </span>

            <div className="ml-3">
              <p className="text-[11px] font-bold text-[#7c3cff]">
                승급 조건
              </p>

              <p className="mt-1 text-[12px] font-semibold text-theme-primary">
                별점 평균 4점 이상 + 완료 건수 10건 이상
              </p>
            </div>
          </div>

          {/* 카드 본문 */}
          <div className="grid md:grid-cols-2">
            {/* 주요 혜택 */}
            <div className="border-b border-theme px-5 py-4 md:border-b-0 md:border-r">
              <h2 className="text-[12px] font-extrabold text-theme-primary">
                주요 혜택
              </h2>

              <div className="mt-3 space-y-2.5">
                <BenefitRow
                  label="표준계약서 작성"
                  value="제공"
                  iconColor="#111827"
                />

                <BenefitRow
                  label="검증된 프로젝트 매칭"
                  value="제공"
                  iconColor="#111827"
                />

                <BenefitRow
                  label="AI 1:1 맞춤 매칭"
                  value="제공"
                  iconColor="#111827"
                />

                <BenefitRow
                  label="우수 클라이언트 매칭"
                  value="확률 증가"
                  iconColor="#111827"
                />

                <BenefitRow
                  label="착수금 수수료"
                  value="1% 인하"
                  iconColor="#111827"
                />

                <BenefitRow
                  label="성공보수 수수료"
                  value="1% 인하 (총 2%↓)"
                  iconColor="#111827"
                />
              </div>
            </div>

            {/* 수수료 */}
            <div className="px-5 py-4">
              <h2 className="text-[12px] font-extrabold text-theme-primary">
                수수료
              </h2>

              <div className="mt-3">
                <p className="text-[10px] text-theme-muted">
                  착수금 수수료
                </p>

                <div className="mt-1.5 flex items-center gap-3">
                  <FeeBox rate="3%" type="master" />

                  <span className="text-[10px] text-theme-secondary">
                    기본 4% → 1% 인하
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-[10px] text-theme-muted">
                  성공보수 수수료
                </p>

                <div className="mt-1.5 flex items-center gap-3">
                  <FeeBox rate="5%" type="master" />

                  <span className="text-[10px] text-theme-secondary">
                    기본 6% → 1% 인하
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FEE STANDARD
        ===================================================== */}
        <section className="mt-5 rounded-[12px] border border-theme bg-surface px-5 py-4">
          <h2 className="text-[13px] font-extrabold text-theme-primary">
            수수료 발생 기준
          </h2>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {/* 착수금 수수료 */}
            <article className="rounded-[9px] border border-theme bg-surface-subtle px-4 py-3">
              <div className="flex items-center gap-2">
                <CardIcon />

                <h3 className="text-[12px] font-extrabold text-theme-primary">
                  착수금 수수료
                </h3>
              </div>

              <p className="mt-2 text-[10px] font-bold text-[#3178f6]">
                계약서 서명 시 발생
              </p>

              <p className="mt-1.5 text-[10px] leading-4 text-theme-secondary">
                클라이언트가 서명과 동시에 착수금 수수료를 결제합니다.
                프리랜서는 별도로 납부하지 않습니다.
              </p>
            </article>

            {/* 성공보수 수수료 */}
            <article className="rounded-[9px] border border-theme bg-surface-subtle px-4 py-3">
              <div className="flex items-center gap-2">
                <CheckCircleIcon color="#20b26b" />

                <h3 className="text-[12px] font-extrabold text-theme-primary">
                  성공보수 수수료
                </h3>
              </div>

              <p className="mt-2 text-[10px] font-bold text-[#3178f6]">
                프로젝트 「정산 대기」 상태 전환 시 발생
              </p>

              <p className="mt-1.5 text-[10px] leading-4 text-theme-secondary">
                프로젝트 완료 후 성공보수 수수료를 결제해야 계약이 최종
                종료됩니다.
              </p>
            </article>
          </div>
        </section>

        {/* =====================================================
            INFO
        ===================================================== */}
        <div className="mt-3 flex items-start gap-2 rounded-[9px] bg-[#edf5fb] px-4 py-2.5">
          <InfoIcon size={14} />

          <p className="text-[10px] font-medium leading-4 text-theme-secondary">
            등급은 회원 등록 시 사전 안내되며, 매월 자동으로 체크됩니다.
            기존일 기준 6개월 내 프로젝트 경험이 없으면 하위 등급으로
            조정될 수 있습니다.
          </p>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   FEE BOX
========================================================= */

function FeeBox({
  rate,
  type,
}: {
  rate: string;
  type: "junior" | "senior" | "master";
}) {
  let borderColor = "#cbd5e1";
  let textColor = "#64748b";
  let backgroundColor = "#f3f6f9";

  if (type === "senior") {
    borderColor = "#9bc2ff";
    textColor = "#3178f6";
    backgroundColor = "#f4f8ff";
  }

  if (type === "master") {
    borderColor = "#c8afff";
    textColor = "#7c3cff";
    backgroundColor = "#f8f5ff";
  }

  return (
    <div
      className="flex h-[46px] min-w-[68px] items-center justify-center rounded-[7px] border px-3"
      style={{
        borderColor,
        backgroundColor,
      }}
    >
      <span
        className="text-[16px] font-extrabold"
        style={{
          color: textColor,
        }}
      >
        {rate}
      </span>
    </div>
  );
}

/* =========================================================
   ICONS
========================================================= */

function CardIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect
        x="2"
        y="3"
        width="12"
        height="10"
        rx="2"
        stroke="#3178f6"
        strokeWidth="1.2"
      />

      <path
        d="M3 6H13"
        stroke="#3178f6"
        strokeWidth="1.2"
      />
    </svg>
  );
}
