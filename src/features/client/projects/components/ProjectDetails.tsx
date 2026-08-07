"use client";

// Step 4 · 상세정보
import Link from "next/link";

import { ProjectRegisterShell } from "@/features/client/projects/components/ProjectRegisterShell";
import { nextStep, prevStep } from "@/features/client/projects/constants/steps";
// import { useProjectRegister } from "@/features/client/projects/context/ProjectRegisterContext";

const STEP = 4;

export function ProjectDetails() {
  // const { form, patch } = useProjectRegister();
  const prev = prevStep(STEP);
  const next = nextStep(STEP);

  return (
    <ProjectRegisterShell currentStep={STEP} backHref={prev?.path} backLabel="이전">
      <div className="mx-auto mt-12 max-w-[700px]">
        <h1 className="text-[24px] font-extrabold tracking-[-0.04em] text-[#111827]">
          상세정보
        </h1>

        <p className="mt-3 text-[12px] font-semibold leading-6 text-[#667085]">
          (준비 중) 이 단계의 입력 폼을 여기에 구현하세요.
        </p>

        {next ? (
          <Link
            href={next.path}
            className="mt-8 flex h-[56px] w-full items-center justify-center rounded-[10px] bg-[#17365d] text-[15px] font-bold text-white transition hover:bg-[#102a49]"
          >
            다음 단계로
          </Link>
        ) : null}
      </div>
    </ProjectRegisterShell>
  );
}
