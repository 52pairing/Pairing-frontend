"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";

import { LoadingState } from "@/features/common/components/Loading";
import { ConfirmModal } from "@/features/common/components/Modal";
import { ChevronLeftIcon } from "@/features/common/components/SharedUI";
import { ProjectRegisterShell } from "@/features/client/projects/components/ProjectRegisterShell";
import {
  PROJECT_REGISTER_BASE,
  nextStep,
  prevStep,
} from "@/features/client/projects/constants/steps";
import { useProjectRegister } from "@/features/client/projects/context/ProjectRegisterContext";
import {
  createProjectPreReview,
  getProjectJobRoles,
} from "@/features/client/projects/services/projectPreReview";
import type {
  ProjectJobRoleOption,
  ProjectPreReviewResponse,
} from "@/features/client/projects/types/preReview";

const STEP = 5;
type Phase = "intro" | "loading" | "result" | "error";

export function ProjectReview() {
  const router = useRouter();
  const { form, reset } = useProjectRegister();
  const prev = prevStep(STEP);
  const next = nextStep(STEP);
  const recruits = form.recruits ?? [];

  const [phase, setPhase] = useState<Phase>("intro");
  const [result, setResult] = useState<ProjectPreReviewResponse | null>(null);
  const [jobRoles, setJobRoles] = useState<ProjectJobRoleOption[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditNoticeOpen, setIsEditNoticeOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  const startCheck = async () => {
    if (recruits.length === 0) return;

    setPhase("loading");
    setErrorMessage("");

    try {
      const invalidPosition = recruits.find(
        (recruit) =>
          !recruit.job ||
          recruit.count < 1 ||
          recruit.count > 50 ||
          recruit.skills.length < 1 ||
          recruit.skills.length > 63,
      );

      if (invalidPosition) {
        throw new Error(
          "직무, 모집 인원(1~50명), 요구 스킬(1~63개)을 확인해주세요.",
        );
      }

      const options = await getProjectJobRoles();
      const codeByLabel = new Map(options.map((option) => [option.label, option.code]));
      const positions = recruits.map((recruit) => {
        const jobRole = options.some((option) => option.code === recruit.job)
          ? recruit.job
          : codeByLabel.get(recruit.job);

        if (!jobRole) {
          throw new Error(`${recruit.job || "선택한 직무"}의 서버 코드를 찾을 수 없습니다.`);
        }

        return {
          jobRole,
          headcount: recruit.count,
          skills: recruit.skills,
        };
      });
      const response = await createProjectPreReview({ positions });

      if (
        response.items.length !== positions.length ||
        response.items.some(
          (item) =>
            item.positionIndex < 0 || item.positionIndex >= positions.length,
        )
      ) {
        throw new Error("사전 검수 결과의 포지션 정보가 요청과 일치하지 않습니다.");
      }

      setJobRoles(options);
      setResult(response);
      setPhase("result");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "사전 검수 중 오류가 발생했습니다.",
      );
      setPhase("error");
    }
  };

  const confirmEdit = () => {
    setIsEditNoticeOpen(false);
    router.push(`${PROJECT_REGISTER_BASE}/roles`);
  };

  const confirmCancel = () => {
    reset();
    router.push("/client");
  };

  return (
    <ProjectRegisterShell currentStep={STEP} backHref="/client" backLabel="홈으로">
      {phase === "intro" ? (
        <>
          <ReviewHeader title="사전 검수">
            등록 전 현재 프리랜서 풀을 기준으로 직무별 예상 후보 수와 매칭 가능성을 확인합니다.
          </ReviewHeader>
          <div className="mx-auto mt-6 max-w-[720px] rounded-[12px] border border-theme bg-[#fbfcfd] px-5 py-4">
            <p className="text-[11px] font-extrabold text-theme-primary">검수 항목</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <CheckItem>직무 · 모집 인원</CheckItem>
              <CheckItem>요구 스킬</CheckItem>
            </div>
          </div>
          <BottomBar>
            <BackButton onClick={() => prev && router.push(prev.path)} />
            <PrimaryButton onClick={startCheck} disabled={recruits.length === 0}>
              사전 검수 시작하기
            </PrimaryButton>
          </BottomBar>
        </>
      ) : null}

      {phase === "loading" ? (
        <LoadingState
          size="lg"
          className="mt-12 py-16"
          message={"사전 검수 진행 중\n현재 프리랜서 풀을 기준으로 예상 후보 수와 매칭 가능성을 분석하고 있습니다."}
        />
      ) : null}

      {phase === "error" ? (
        <>
          <ReviewHeader title="사전 검수를 완료하지 못했습니다.">
            {errorMessage}
          </ReviewHeader>
          <BottomBar>
            <BackButton onClick={() => prev && router.push(prev.path)} />
            <PrimaryButton onClick={startCheck}>다시 시도</PrimaryButton>
          </BottomBar>
        </>
      ) : null}

      {phase === "result" && result ? (
        <>
          <ReviewHeader title="사전 검수 결과">{result.notice}</ReviewHeader>
          <div className="mx-auto mt-6 max-w-[720px] space-y-3">
            {[...result.items]
              .sort((a, b) => a.positionIndex - b.positionIndex)
              .map((item) => (
              <ResultCard
                key={item.positionIndex}
                item={item}
                label={
                  jobRoles.find((option) => option.code === item.jobRole)?.label ??
                  item.jobRole
                }
              />
            ))}
          </div>
          <BottomBar align="end">
            <SecondaryButton onClick={() => setIsEditNoticeOpen(true)}>
              등록 수정
            </SecondaryButton>
            {!result.allMatchable ? (
              <DangerButton onClick={() => setIsCancelConfirmOpen(true)}>
                등록 취소
              </DangerButton>
            ) : null}
            <PrimaryButton onClick={() => next && router.push(next.path)}>
              입력한 내용으로 등록하기
            </PrimaryButton>
          </BottomBar>
        </>
      ) : null}

      <ConfirmModal
        open={isEditNoticeOpen}
        title="직군 모집 단계로 이동합니다."
        description="입력한 상태는 그대로 유지됩니다."
        confirmText="이동하기"
        onConfirm={confirmEdit}
        onClose={() => setIsEditNoticeOpen(false)}
      />
      <ConfirmModal
        open={isCancelConfirmOpen}
        title="정말로 취소하시겠습니까?"
        description="입력한 프로젝트 등록 정보가 모두 삭제됩니다."
        confirmText="예"
        cancelText="아니요"
        variant="danger"
        onConfirm={confirmCancel}
        onClose={() => setIsCancelConfirmOpen(false)}
      />
    </ProjectRegisterShell>
  );
}

function ReviewHeader({ title, children }: { title: string; children: ReactNode }) {
  return (
    <header className="mx-auto mt-12 max-w-[720px]">
      <h1 className="text-[22px] font-extrabold tracking-[-0.04em] text-theme-primary">{title}</h1>
      <p className="mt-2 whitespace-pre-line text-[12px] font-medium text-theme-secondary">{children}</p>
    </header>
  );
}

function ResultCard({ item, label }: { item: ProjectPreReviewResponse["items"][number]; label: string }) {
  const summary = (
    <p className="mt-1 text-[11px] text-theme-secondary">
      모집 인원 {item.headcount}명 · 예상 후보 {item.expectedCandidateCount}명
      <span className={`ml-1 font-bold ${item.matchable ? "text-[#12b76a]" : "text-theme-danger"}`}>
        · {item.matchable ? "매칭 가능" : "후보 부족"}
      </span>
    </p>
  );

  if (item.matchable) {
    return <div className="flex items-center justify-between rounded-[10px] border border-theme bg-surface px-5 py-4"><div><p className="text-[13px] font-extrabold text-theme-primary">{label}</p>{summary}</div><StatusIcon matchable /></div>;
  }

  return (
    <div className="rounded-[10px] border border-[#f04438] bg-[#fef4f4] px-5 py-4">
      <div className="flex items-center justify-between"><div><p className="text-[13px] font-extrabold text-theme-primary">{label}</p>{summary}</div><StatusIcon matchable={false} /></div>
      <div className="mt-4 border-t border-[#f6cccc] pt-3 text-[11px] leading-5 text-[#8a4b4b]">
        <p className="font-bold text-[#e11d48]">현재 조건에 맞는 {label} 후보가 모집 인원보다 부족합니다.</p>
        <p className="mt-2">직무 또는 요구 스킬을 조정하면 더 많은 후보를 확인할 수 있습니다.</p>
      </div>
    </div>
  );
}

function BottomBar({ children, align = "between" }: { children: ReactNode; align?: "between" | "end" }) {
  return <div className="mt-8 border-t border-theme pt-6"><div className={`flex items-center gap-2 ${align === "end" ? "justify-end" : "justify-between"}`}>{children}</div></div>;
}

function BaseButton({ children, onClick, className, disabled = false }: { children: ReactNode; onClick: () => void; className: string; disabled?: boolean }) {
  return <button type="button" onClick={onClick} disabled={disabled} className={`flex h-[42px] items-center justify-center rounded-[8px] px-5 text-[12px] font-bold transition ${className}`}>{children}</button>;
}

function BackButton({ onClick }: { onClick: () => void }) {
  return <BaseButton onClick={onClick} className="gap-1 border border-theme bg-surface text-theme-secondary hover:bg-surface-subtle"><ChevronLeftIcon size={13} />이전</BaseButton>;
}
function PrimaryButton({ children, onClick, disabled = false }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return <BaseButton onClick={onClick} disabled={disabled} className={disabled ? "cursor-not-allowed bg-[#a7b0bf] text-white" : "bg-brand text-white hover:bg-brand"}>{children}</BaseButton>;
}
function SecondaryButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <BaseButton onClick={onClick} className="border border-theme bg-surface text-theme-secondary hover:bg-surface-subtle">{children}</BaseButton>;
}
function DangerButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <BaseButton onClick={onClick} className="border border-[#f04438] bg-surface text-theme-danger hover:bg-[#fef2f2]">{children}</BaseButton>;
}

function CheckItem({ children }: { children: ReactNode }) {
  return <span className="flex items-center gap-2 text-[11px] font-semibold text-theme-secondary"><span className="text-theme-muted">✓</span>{children}</span>;
}

function StatusIcon({ matchable }: { matchable: boolean }) {
  return <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-bold ${matchable ? "bg-[#e7f7ee] text-[#12b76a]" : "bg-[#fdecec] text-theme-danger"}`} aria-label={matchable ? "매칭 가능" : "후보 부족"}>{matchable ? "✓" : "!"}</span>;
}
