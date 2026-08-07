"use client";

// Step 6 · 최종 확인 (제출)
import { ProjectRegisterShell } from "@/features/client/projects/components/ProjectRegisterShell";
import { prevStep } from "@/features/client/projects/constants/steps";
// import { useProjectRegister } from "@/features/client/projects/context/ProjectRegisterContext";

const STEP = 6;

export function ProjectConfirm() {
  // const { form, reset } = useProjectRegister();
  // API 연동 시: 여기서 최종 제출 (services의 createProject(toProjectRegisterRequest(form)) 호출)
  const prev = prevStep(STEP);

  return (
    <ProjectRegisterShell currentStep={STEP} backHref={prev?.path} backLabel="이전">
      <div className="mx-auto mt-12 max-w-[700px]">
        <h1 className="text-[24px] font-extrabold tracking-[-0.04em] text-[#111827]">
          최종 확인
        </h1>

        <p className="mt-3 text-[12px] font-semibold leading-6 text-[#667085]">
          (준비 중) 입력한 내용을 요약해 보여주고, 제출 버튼을 배치하세요.
        </p>

        <button
          type="button"
          disabled
          className="mt-8 flex h-[56px] w-full cursor-not-allowed items-center justify-center rounded-[10px] bg-[#a7b0bf] text-[15px] font-bold text-white"
        >
          프로젝트 등록 (API 연동 예정)
        </button>
      </div>
    </ProjectRegisterShell>
  );
}
