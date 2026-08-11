"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

interface SuccessFeeCompleteProps {
  role: "client" | "freelancer";
}

const SETTLEMENT_ROWS = [
  ["계약 금액", "24,000,000원"],
  ["착수 수수료 (4%)", "960,000원"],
  ["성공보수 수수료 (6%)", "1,440,000원"],
  ["전체 플랫폼 수수료", "2,400,000원"],
  ["착수 수수료 결제일", "2026.09.02"],
  ["성공보수 결제일", "2027.01.04"],
  ["프로젝트 최종 종료일", "2027.01.04"],
] as const;

export function SuccessFeeComplete({ role }: SuccessFeeCompleteProps) {
  const params = useParams<{ projectId?: string; contractId?: string }>();
  const historyHref = role === "client"
    ? `/client/projects/${params.projectId}?tab=progress&completed=true`
    : "/freelancer/contracts";

  return (
    <main className="min-h-[calc(100dvh-60px)] bg-surface-subtle px-5 py-8 text-theme-primary">
      <div className="mx-auto w-full max-w-[1040px] text-center">
        <div className="mx-auto flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#d9fbe8] text-[25px] font-bold">✓</div>
        <h1 className="mt-5 text-[20px] font-extrabold tracking-[-0.04em] text-theme-success">모든 정산이 완료되었습니다.</h1>
        <p className="mt-3 text-[12px] font-semibold text-theme-secondary">프로젝트 검수와 성공보수 수수료 결제가 완료되어 프로젝트가 최종 종료되었습니다.</p>

        <section className="mt-7 rounded-xl border border-theme bg-surface px-6 py-6 text-left">
          <h2 className="text-[13px] font-bold">최종 정산 요약</h2>
          <dl className="mt-4">
            {SETTLEMENT_ROWS.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-5 border-b border-theme py-3 text-[11px] last:border-b-0">
                <dt className="font-semibold text-theme-muted">{label}</dt>
                <dd className="font-bold text-theme-primary">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link href={historyHref} className="flex h-11 items-center justify-center rounded-lg border border-theme bg-surface text-[12px] font-semibold text-theme-secondary hover:bg-surface-subtle">전체 정산 내역 보기</Link>
          <button type="button" onClick={() => window.print()} className="h-11 rounded-lg border border-theme bg-surface text-[12px] font-semibold text-theme-secondary hover:bg-surface-subtle">계약서 다운로드</button>
        </div>
        <button type="button" className="mt-3 h-11 w-full rounded-lg bg-brand text-[12px] font-bold text-white hover:bg-brand">
          {role === "client" ? "프리랜서 평가하기" : "클라이언트 평가하기"}
        </button>
      </div>
    </main>
  );
}
