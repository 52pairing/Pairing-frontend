import Link from "next/link";

import { ChevronLeftIcon, CheckCircleIcon, InfoIcon } from "@/features/common/components/SharedUI";

interface GradeTier {
  tier: string;
  borderColor: string;
  headerBg: string;
  pillBorder: string;
  pillTextClassName: string;
  condition: string;
  benefits: string[];
  startFee: string;
  successFee: string;
}

const FREELANCER_GRADES: GradeTier[] = [
  {
    tier: "주니어",
    borderColor: "#bdc9d7",
    headerBg: "#edf3f8",
    pillBorder: "#64748b",
    pillTextClassName: "text-theme-secondary",
    condition: "디폴트 (가입 즉시)",
    benefits: ["표준계약서 작성", "검증된 프로젝트 매칭", "AI 1:1 맞춤 매칭"],
    startFee: "4%",
    successFee: "6%",
  },
  {
    tier: "시니어",
    borderColor: "#4d94ff",
    headerBg: "#edf5ff",
    pillBorder: "#3f83f8",
    pillTextClassName: "text-[#3178f6]",
    condition: "별점 평균 3점 이상 + 완료 건수 5건 이상",
    benefits: ["표준계약서 작성", "검증된 프로젝트 매칭", "AI 1:1 맞춤 매칭", "우수 클라이언트 매칭 확률 증가"],
    startFee: "4%",
    successFee: "6%",
  },
  {
    tier: "마스터",
    borderColor: "#9a6cff",
    headerBg: "#f4f1ff",
    pillBorder: "#8648ff",
    pillTextClassName: "text-[#7c3cff]",
    condition: "별점 평균 4점 이상 + 완료 건수 10건 이상",
    benefits: [
      "표준계약서 작성",
      "검증된 프로젝트 매칭",
      "AI 1:1 맞춤 매칭",
      "우수 클라이언트 매칭 확률 증가",
      "착수금 수수료 1% 인하",
      "성공보수 수수료 1% 인하",
    ],
    startFee: "3%",
    successFee: "5%",
  },
];

const CLIENT_GRADES: GradeTier[] = [
  {
    tier: "실버",
    borderColor: "#9ca8b8",
    headerBg: "#eef2f7",
    pillBorder: "#344054",
    pillTextClassName: "text-theme-secondary",
    condition: "기본 등급",
    benefits: ["매칭 프리랜서 1명", "프로젝트 최대 1개 등록", "우수 프리랜서 매칭 확률 증가"],
    startFee: "3%",
    successFee: "7%",
  },
  {
    tier: "골드",
    borderColor: "#ff9900",
    headerBg: "#fff9eb",
    pillBorder: "#ff9900",
    pillTextClassName: "text-[#f59e0b]",
    condition: "별점 평균 3점 이상 · 완료 건수 10건 이상",
    benefits: ["매칭 프리랜서 1명", "프로젝트 최대 2개 등록", "높은 등급 프리랜서 매칭 확률 증가"],
    startFee: "3%",
    successFee: "7%",
  },
  {
    tier: "다이아",
    borderColor: "#4f83ff",
    headerBg: "#eef5ff",
    pillBorder: "#4f83ff",
    pillTextClassName: "text-[#4380ff]",
    condition: "별점 평균 4점 이상 · 완료 건수 20건 이상",
    benefits: [
      "매칭 프리랜서 1명",
      "프로젝트 최대 2개 등록",
      "높은 등급 프리랜서 매칭 확률 증가",
      "착수금 수수료 1% 인하",
      "성공보수 수수료 1% 인하",
    ],
    startFee: "2%",
    successFee: "6%",
  },
];

// 비로그인 사용자도 볼 수 있는 등급 혜택 공개 페이지
export function GradeBenefit() {
  return (
    <main className="min-h-screen bg-surface-subtle text-theme-primary">
      <div className="mx-auto w-full max-w-[960px] px-4 py-10">
        <Link
          href="/"
          className="flex w-fit items-center gap-1 text-xs text-theme-muted transition hover:text-theme-secondary"
        >
          <ChevronLeftIcon size={12} />
          메인으로
        </Link>

        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-theme-primary">등급 혜택 안내</h1>
        <p className="mt-2 text-sm text-theme-secondary">
          프리랜서와 클라이언트는 활동 실적에 따라 등급이 자동으로 산정되며, 등급이 높을수록 더 많은 혜택을 받을 수
          있습니다.
        </p>

        <section className="mt-8">
          <h2 className="text-lg font-extrabold text-theme-primary">프리랜서 등급</h2>
          <div className="mt-4 space-y-4">
            {FREELANCER_GRADES.map((grade) => (
              <GradeTierCard key={grade.tier} {...grade} />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-extrabold text-theme-primary">클라이언트 등급</h2>
          <div className="mt-4 space-y-4">
            {CLIENT_GRADES.map((grade) => (
              <GradeTierCard key={grade.tier} {...grade} />
            ))}
          </div>
        </section>

        <div className="mt-6 flex items-start gap-2 rounded-lg bg-[#edf5fb] px-4 py-3">
          <InfoIcon size={14} />
          <p className="text-xs leading-relaxed text-theme-secondary">
            계약 금액이 1억 원 이상이면 클라이언트 수수료가 추가로 인하됩니다. 등급은 매월 자동으로 산정되며, 자세한
            조건은 로그인 후 확인할 수 있습니다.
          </p>
        </div>
      </div>
    </main>
  );
}

function GradeTierCard({ tier, borderColor, headerBg, pillBorder, pillTextClassName, condition, benefits, startFee, successFee }: GradeTier) {
  return (
    <div className="overflow-hidden rounded-xl border bg-surface" style={{ borderColor }}>
      <div className="flex flex-wrap items-center gap-3 border-b px-5 py-3" style={{ backgroundColor: headerBg, borderColor }}>
        <span
          className={`inline-flex min-w-[64px] items-center justify-center rounded-full border bg-surface px-3 py-1 text-sm font-extrabold ${pillTextClassName}`}
          style={{ borderColor: pillBorder }}
        >
          {tier}
        </span>
        <span className="text-xs text-theme-secondary">{condition}</span>
      </div>

      <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
        <div className="space-y-2">
          {benefits.map((benefit) => (
            <div key={benefit} className="flex items-center gap-2">
              <CheckCircleIcon color="#111827" />
              <span className="text-xs text-theme-secondary">{benefit}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="flex-1 rounded-lg border border-theme bg-surface-subtle px-3 py-2 text-center">
            <p className="text-[10px] text-theme-muted">착수금 수수료</p>
            <p className="mt-1 text-base font-extrabold text-theme-primary">{startFee}</p>
          </div>
          <div className="flex-1 rounded-lg border border-theme bg-surface-subtle px-3 py-2 text-center">
            <p className="text-[10px] text-theme-muted">성공보수 수수료</p>
            <p className="mt-1 text-base font-extrabold text-theme-primary">{successFee}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
