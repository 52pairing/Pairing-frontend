import { Fragment } from "react";
import Link from "next/link";

import { StepArrow } from "@/features/common/components/SharedUI";
import { FaqSection } from "@/features/common/components/FaqSection";

const STATS = [
  { value: "98.2%", label: "프로젝트 완수율" },
  { value: "4,800+", label: "누적 프로젝트" },
  { value: "12,300+", label: "누적 협상 수" },
  { value: "2,100+", label: "검증된 프리랜서" },
  { value: "4.7점", label: "AI 매칭 만족도" },
  { value: "820억+", label: "누적 프로젝트 금액" },
];

const STEPS = [
  {
    step: "STEP 01",
    title: "프로젝트 정보 등록",
    desc: "직군, 기술 스택, 예산, 기간 등 프로젝트 조건을 입력합니다.",
  },
  {
    step: "STEP 02",
    title: "AI 적합도 기반 프리랜서 추천",
    desc: "임베딩과 LLM을 결합해 프로젝트에 맞는 프리랜서 후보를 추천합니다.",
  },
  {
    step: "STEP 03",
    title: "AI Agent 조건 협상",
    desc: "후보를 직접 선택한 뒤 AI Agent가 희망 조건을 협상합니다. 최종 응답은 사용자가 직접 결정합니다.",
  },
  {
    step: "STEP 04",
    title: "표준계약서 생성 및 계약 체결",
    desc: "합의된 조건으로 표준계약서를 생성하고 사용자가 직접 서명해 계약을 체결합니다.",
  },
];

const FEATURES = [
  {
    title: "AI 기반 조건 협상",
    desc: "AI Agent 간 협상을 통해 양측의 희망 조건을 빠르게 조율합니다.",
  },
  {
    title: "검증된 개인 프리랜서",
    desc: "경력과 포트폴리오가 검증된 프리랜서와 안전하게 연결됩니다.",
  },
  {
    title: "AI 기반 맞춤 추천",
    desc: "기술 스택, 경력, 스타일을 복합적으로 분석해 적합한 프리랜서를 추천합니다.",
  },
  {
    title: "매칭 근거를 보여주는 AI 추천",
    desc: "추천된 프리랜서가 적합한 이유와 주요 매칭 근거를 함께 제공합니다.",
  },
  {
    title: "합의 조건 기반 계약서 생성",
    desc: "협상을 통해 합의된 조건을 반영해 표준계약서를 자동 생성합니다.",
  },
  {
    title: "등급별 혜택 제공",
    desc: "클라이언트와 프리랜서의 등급에 따라 수수료 할인과 우선 매칭 혜택을 제공합니다.",
  },
];

// 리뷰 API 연동 전까지 사용하는 더미 데이터
const REVIEWS = [
  {
    name: "김OO",
    role: "클라이언트",
    rating: 5,
    content:
      "복잡한 협상을 AI Agent가 대신 조율해줘서 계약까지 빠르게 진행됐습니다. 추천 근거도 명확해서 믿음이 갔어요.",
  },
  {
    name: "박OO",
    role: "프리랜서",
    rating: 5,
    content:
      "희망 단가 협상 과정이 부담스럽지 않았고, 계약서 생성도 자동으로 돼서 행정 부담이 줄었습니다.",
  },
  {
    name: "이OO",
    role: "클라이언트",
    rating: 4,
    content:
      "매칭 후보의 AI 적합도 점수와 근거 설명이 인상적이었습니다. 최종 선택을 직접 할 수 있어 좋았어요.",
  },
  {
    name: "최OO",
    role: "프리랜서",
    rating: 5,
    content:
      "프로필 등록 후 빠르게 적합한 프로젝트 요청이 왔고, 협상도 AI가 도와줘서 수월하게 진행됐습니다.",
  },
];

const FREELANCER_GRADE_SUMMARY = [
  {
    tier: "주니어",
    colorClassName: "text-theme-secondary",
    desc: "표준계약서 작성 | 검증된 프로젝트 매칭 | AI 1:1 맞춤 매칭",
  },
  {
    tier: "시니어",
    colorClassName: "text-[#3178f6]",
    desc: "표준계약서 작성 | 검증된 프로젝트 매칭 | AI 1:1 맞춤 매칭 | 우수 클라이언트 매칭 기회 확대",
  },
  {
    tier: "마스터",
    colorClassName: "text-[#7c3cff]",
    desc: "표준계약서 작성 | 검증된 프로젝트 매칭 | AI 1:1 맞춤 매칭 | 우수 클라이언트 매칭 기회 확대 | 수수료 인하",
  },
];

const CLIENT_GRADE_SUMMARY = [
  {
    tier: "실버",
    colorClassName: "text-theme-secondary",
    desc: "프리랜서 매칭 1명 | 프로젝트 최대 1개 등록 | 우수 프리랜서 매칭 기회 확대",
  },
  {
    tier: "골드",
    colorClassName: "text-[#f59e0b]",
    desc: "프리랜서 매칭 1명 | 프로젝트 최대 2개 등록 | 상위 등급 프리랜서 매칭 기회 확대",
  },
  {
    tier: "다이아",
    colorClassName: "text-[#4380ff]",
    desc: "프리랜서 매칭 1명 | 프로젝트 최대 2개 등록 | 상위 등급 프리랜서 매칭 기회 확대 | 수수료 인하",
  },
];

// 비로그인 사용자에게 보여주는 메인 랜딩 페이지
export function GuestLanding() {
  return (
    <>
      {/* 히어로 */}
      <section className="bg-background px-4 pb-16 pt-20 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
          <span
            className="h-1.5 w-1.5 rounded-full bg-blue-600"
            aria-hidden="true"
          />
          AI 기반 프리랜서 매칭 플랫폼
        </span>

        <h1 className="mx-auto mt-6 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-theme-primary sm:text-4xl md:text-5xl">
          나만의 AI 에이전트,
          <br />
          마침내 온전히 페어링되다.
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base text-theme-secondary md:text-lg">
          프로젝트에 꼭 맞는 클라이언트와 프리랜서를
          <br />
          Pairing에서 만나보세요.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup/client"
            className="rounded-lg bg-brand px-6 py-3 text-sm font-bold text-brand-contrast hover:bg-brand-hover"
          >
            프로젝트 등록하기
          </Link>
          <Link
            href="/signup/freelancer"
            className="rounded-lg border border-theme bg-surface px-6 py-3 text-sm font-bold text-theme-primary hover:bg-surface-subtle"
          >
            프리랜서로 시작하기
          </Link>
        </div>
      </section>

      {/* 이용 통계 */}
      <section className="bg-brand px-4 py-10">
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-y-6 text-center sm:grid-cols-3 md:grid-cols-6">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-extrabold text-brand-contrast md:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-brand-contrast/70 md:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 서비스 이용 과정 */}
      <section className="bg-surface-subtle px-4 py-16">
        <div className="mx-auto max-w-[1200px]">
          <SectionHeading
            title="서비스 이용 과정"
            desc="복잡한 과정 없이, 4단계로 프로젝트를 시작하세요."
          />

          <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-stretch">
            {STEPS.map((step, index) => (
              <Fragment key={step.step}>
                <div className="flex-1 rounded-xl border border-theme bg-surface px-6 py-6">
                  <p className="text-xs font-bold text-[#3178f6]">
                    {step.step}
                  </p>
                  <h3 className="mt-2 text-base font-bold text-theme-primary">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-theme-secondary">
                    {step.desc}
                  </p>
                </div>
                {index < STEPS.length - 1 && <StepArrow />}
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Pairing 주요 특징 */}
      <section className="bg-surface px-4 py-16">
        <div className="mx-auto max-w-[1200px]">
          <SectionHeading
            title="Pairing 주요 특징"
            desc="AI 기술과 검증된 프로세스로 더 나은 매칭을 경험하세요."
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl bg-surface-subtle px-6 py-6"
              >
                <h3 className="text-sm font-bold text-theme-primary">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-theme-secondary">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 이용자 리뷰 (더미 데이터, API 연동 전) */}
      <section className="bg-surface-subtle px-4 py-16">
        <div className="mx-auto max-w-[1200px]">
          <SectionHeading
            title="이용자 리뷰"
            desc="실제 이용자들의 솔직한 후기를 확인해보세요."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {REVIEWS.map((review) => (
              <div
                key={`${review.name}-${review.role}`}
                className="rounded-xl border border-theme bg-surface px-6 py-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-sm font-bold text-theme-secondary">
                      {review.name[0]}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-theme-primary">
                        {review.name}
                      </p>
                      <p className="text-xs text-theme-muted">{review.role}</p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <p className="mt-4 text-sm leading-relaxed text-theme-secondary">
                  {review.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 등급 안내 및 혜택 */}
      <section className="bg-surface px-4 py-16">
        <div className="mx-auto max-w-[1200px]">
          <SectionHeading
            title="등급 안내 및 혜택"
            desc="활동 실적에 따라 등급별 혜택을 받으세요."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <GradeSummaryCard
              title="프리랜서 등급"
              items={FREELANCER_GRADE_SUMMARY}
            />
            <GradeSummaryCard
              title="클라이언트 등급"
              items={CLIENT_GRADE_SUMMARY}
            />
          </div>

          <div className="mt-6 flex justify-center">
            <Link
              href="/grade"
              className="rounded-lg border border-theme bg-surface px-6 py-3 text-sm font-bold text-theme-primary hover:bg-surface-subtle"
            >
              등급 혜택 자세히 보기
            </Link>
          </div>
        </div>
      </section>

      {/* 자주 묻는 질문 */}
      <section className="bg-surface-subtle px-4 py-16">
        <div className="mx-auto max-w-[1200px]">
          <SectionHeading title="자주 묻는 질문" />

          <div className="mt-10">
            <FaqSection />
          </div>
        </div>
      </section>

      {/* 지금 바로 시작해보세요 */}
      <section className="bg-brand px-4 py-16 text-center">
        <h2 className="text-2xl font-extrabold text-brand-contrast md:text-3xl">
          지금 바로 시작해보세요
        </h2>
        <p className="mt-3 text-sm text-brand-contrast/80 md:text-base">
          프로젝트에 맞는 프리랜서를 AI로 빠르게 매칭받으세요.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-500"
          >
            지금 시작하기
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-white/40 px-6 py-3 text-sm font-bold text-brand-contrast hover:bg-white/10"
          >
            로그인하러 가기
          </Link>
        </div>
      </section>
    </>
  );
}

/* 섹션 제목 + 설명 (섹션마다 반복되는 헤더) */
function SectionHeading({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-extrabold tracking-tight text-theme-primary md:text-3xl">
        {title}
      </h2>
      {desc && (
        <p className="mt-2 text-sm text-theme-secondary md:text-base">{desc}</p>
      )}
    </div>
  );
}

/* 등급 요약 카드 (프리랜서/클라이언트 공용) */
function GradeSummaryCard({
  title,
  items,
}: {
  title: string;
  items: { tier: string; colorClassName: string; desc: string }[];
}) {
  return (
    <div className="rounded-xl border border-theme bg-surface-subtle px-6 py-5">
      <h3 className="text-sm font-bold text-theme-primary">{title}</h3>

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div
            key={item.tier}
            className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3"
          >
            <span
              className={`shrink-0 text-sm font-extrabold ${item.colorClassName}`}
            >
              {item.tier}
            </span>
            <span className="text-xs leading-relaxed text-theme-secondary">
              {item.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 리뷰 카드의 별점 표시 */
function StarRating({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5 text-sm"
      aria-label={`평점 ${rating}점`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          aria-hidden="true"
          className={index < rating ? "text-[#f59e0b]" : "text-theme-muted"}
        >
          ★
        </span>
      ))}
    </div>
  );
}
