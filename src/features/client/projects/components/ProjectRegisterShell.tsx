import Link from "next/link";
import type { ReactNode } from "react";

import { ChevronLeftIcon } from "@/features/common/components/SharedUI";
import { ProjectStepper } from "@/features/client/projects/components/ProjectStepper";

/**
 * 프로젝트 등록 위저드 6개 스텝이 공유하는 공통 레이아웃(chrome).
 * 배경 + 컨테이너 + 뒤로가기 링크 + 카드 + 상단 Stepper까지 담고,
 * 각 스텝은 카드 안 본문(children)만 넘깁니다.
 * 본문의 폭/여백(max-w 등)은 스텝마다 다를 수 있어 각 스텝이 직접 제어합니다.
 */
export function ProjectRegisterShell({
  currentStep,
  backHref,
  backLabel = "이전",
  children,
}: {
  /** 현재 단계 번호 (1~6) */
  currentStep: number;
  /** 뒤로가기 링크 경로. 없으면 링크를 표시하지 않음 */
  backHref?: string;
  /** 뒤로가기 링크 문구 */
  backLabel?: string;
  children: ReactNode;
}) {
  return (
    <main
      className="min-h-screen bg-surface-subtle text-theme-primary"
      style={{
        fontFamily:
          '"Pretendard", "Noto Sans KR", Arial, Helvetica, sans-serif',
      }}
    >
      <div className="mx-auto w-full max-w-[860px] px-5 pb-14 pt-5">
        {backHref ? (
          <Link
            href={backHref}
            className="flex w-fit items-center gap-1 text-[12px] font-medium text-[#7b8797] transition hover:text-theme-secondary"
          >
            <ChevronLeftIcon size={13} />
            {backLabel}
          </Link>
        ) : null}

        <section className="mt-6 rounded-[14px] border border-theme bg-surface px-7 pb-8 pt-10 shadow-[0_1px_2px_rgba(15,23,42,0.02)] sm:px-8">
          <ProjectStepper currentStep={currentStep} />

          {children}
        </section>
      </div>
    </main>
  );
}
