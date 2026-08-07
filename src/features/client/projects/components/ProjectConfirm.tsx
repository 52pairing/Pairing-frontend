"use client";

// Step 6 · 최종 확인 (이용약관 동의 및 등록)
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";

import { ChevronLeftIcon } from "@/features/common/components/SharedUI";
import { ProjectRegisterShell } from "@/features/client/projects/components/ProjectRegisterShell";
import {
  PROJECT_REGISTER_BASE,
  prevStep,
} from "@/features/client/projects/constants/steps";
import { useProjectRegister } from "@/features/client/projects/context/ProjectRegisterContext";
import type {
  WorkMethod,
  WorkType,
} from "@/features/client/projects/types/project";

const STEP = 6;

const WORK_METHOD_LABEL: Record<WorkMethod, string> = {
  REMOTE: "재택",
  ONSITE: "상주",
  ALL: "모두 가능",
};

const WORK_TYPE_LABEL: Record<WorkType, string> = {
  FULL_TIME: "풀타임",
  PART_TIME: "파트타임",
  ALL: "모두 가능",
};

export function ProjectConfirm() {
  const router = useRouter();
  const { form } = useProjectRegister();
  const prev = prevStep(STEP);

  const recruits = form.recruits ?? [];
  const totalCount = recruits.reduce((sum, r) => sum + r.count, 0);

  // 예상 착수금 수수료 (계약 금액 1억 미만 3% / 이상 2% — Step1 안내 기준)
  const budgetWon = (form.budget ?? 0) * 10000;
  const feeRate = budgetWon >= 100_000_000 ? 0.02 : 0.03;
  const fee = Math.round(budgetWon * feeRate);

  const [agree, setAgree] = useState({
    terms: false,
    privacy: false,
    projectInfo: false,
  });
  const [finalConfirm, setFinalConfirm] = useState(false);

  const allAgreed = agree.terms && agree.privacy && agree.projectInfo;
  const canRegister = allAgreed && finalConfirm;

  const toggleAll = (checked: boolean) => {
    setAgree({ terms: checked, privacy: checked, projectInfo: checked });
  };

  const goPrev = () => {
    if (prev) router.push(prev.path);
  };

  const goEdit = () => {
    router.push(`${PROJECT_REGISTER_BASE}/details`);
  };

  const handleRegister = () => {
    if (!canRegister) return;

    // TODO: 실제 프로젝트 등록 API 연동 예정.
    // 등록 완료 페이지에서 요약을 보여주므로 여기서 Context를 비우지 않습니다.
    router.push(`${PROJECT_REGISTER_BASE}/complete`);
  };

  const startText = form.startNegotiable
    ? form.startDate
      ? `${form.startDate} (협의 가능)`
      : "협의 가능"
    : form.startDate || "-";

  return (
    <ProjectRegisterShell currentStep={STEP} backHref="/client" backLabel="홈으로">
      <div className="mx-auto mt-12 max-w-[720px]">
        <header>
          <h1 className="text-[22px] font-extrabold tracking-[-0.04em] text-[#111827]">
            이용약관 동의 및 최종 확인
          </h1>

          <p className="mt-2 text-[12px] font-medium text-[#667085]">
            입력하신 내용을 확인하고 약관에 동의 후 등록해주세요.
          </p>
        </header>

        {/* 프로젝트 기본 정보 */}
        <SummaryCard title="프로젝트 기본 정보">
          <InfoRow label="프로젝트 이름" value={form.projectName || "-"} />
          <InfoRow label="시작 희망일" value={startText} />
          <InfoRow
            label="예상 기간"
            value={
              form.durationMonths != null ? `${form.durationMonths}개월` : "-"
            }
          />
          <InfoRow
            label="전체 예산"
            value={
              form.budget != null
                ? `${budgetWon.toLocaleString("ko-KR")}원`
                : "-"
            }
          />
          <InfoRow
            label="근무 방식"
            value={form.workMethod ? WORK_METHOD_LABEL[form.workMethod] : "-"}
          />
          <InfoRow
            label="근무 형태"
            value={form.workType ? WORK_TYPE_LABEL[form.workType] : "-"}
          />
        </SummaryCard>

        {/* 직군별 모집 인원 */}
        <SummaryCard title={`직군별 모집 인원 · 총 ${totalCount}명`}>
          <div className="space-y-3 py-2">
            {recruits.map((recruit) => (
              <div
                key={recruit.id}
                className="rounded-[10px] bg-[#f7f8fa] px-5 py-4"
              >
                <p className="text-[12px] font-extrabold text-[#111827]">
                  {recruit.job || "직무 미지정"} · {recruit.count}명
                </p>

                <p className="mt-1 text-[11px] leading-5 text-[#667085]">
                  희망 경력: {recruit.experience}년 이상 · 요구 스킬:{" "}
                  {recruit.skills.length > 0 ? recruit.skills.join(", ") : "-"}
                </p>
              </div>
            ))}
          </div>
        </SummaryCard>

        {/* 상세 내용 */}
        <SummaryCard
          title="상세 내용"
          action={
            <button
              type="button"
              onClick={goEdit}
              className="rounded-[6px] border border-[#c7d6ee] bg-white px-3 py-[5px] text-[11px] font-bold text-[#3b73ff] transition hover:bg-[#f4f8ff]"
            >
              수정하기
            </button>
          }
        >
          <div className="space-y-4 py-2">
            <DetailSection label="현재 상황" text={form.projectStatus} />
            <DetailSection label="주요 업무" text={form.mainTasks} />
            <DetailSection label="업무 범위" text={form.scope} />
            {form.additionalInfo ? (
              <DetailSection label="기타 전달사항" text={form.additionalInfo} />
            ) : null}
          </div>
        </SummaryCard>

        {/* 예상 착수금 수수료 */}
        <SummaryCard title="예상 착수금 수수료">
          <div className="py-2">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-bold text-[#344054]">
                클라이언트 착수금 수수료 ({Math.round(feeRate * 100)}%)
              </p>

              <p className="text-[15px] font-extrabold text-[#111827]">
                {fee.toLocaleString("ko-KR")}원
              </p>
            </div>

            <p className="mt-2 text-[10px] leading-5 text-[#98a2b3]">
              계약 체결 시 발생합니다. 성공보수 수수료는 프로젝트 완료 후
              발생합니다.
              <br />
              실제 용역비는 플랫폼을 거치지 않고 클라이언트가 프리랜서에게 직접
              지급합니다.
            </p>
          </div>
        </SummaryCard>

        {/* 이용약관 동의 */}
        <SummaryCard
          title="이용약관 동의"
          action={
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={allAgreed}
                onChange={(e) => toggleAll(e.target.checked)}
                className="h-[15px] w-[15px] cursor-pointer accent-[#17365d]"
              />
              <span className="text-[12px] font-bold text-[#111827]">
                전체 동의
              </span>
            </label>
          }
        >
          <div>
            <AgreeRow
              label="서비스 이용약관 동의"
              checked={agree.terms}
              onChange={(v) => setAgree((p) => ({ ...p, terms: v }))}
            />
            <AgreeRow
              label="개인정보 수집 및 이용 동의"
              checked={agree.privacy}
              onChange={(v) => setAgree((p) => ({ ...p, privacy: v }))}
            />
            <AgreeRow
              label="프로젝트 정보 활용 동의"
              checked={agree.projectInfo}
              onChange={(v) => setAgree((p) => ({ ...p, projectInfo: v }))}
            />
          </div>
        </SummaryCard>

        {/* 최종 확인 체크 */}
        <label className="mt-4 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={finalConfirm}
            onChange={(e) => setFinalConfirm(e.target.checked)}
            className="mt-[2px] h-[15px] w-[15px] cursor-pointer accent-[#17365d]"
          />
          <span className="text-[11px] font-semibold leading-5 text-[#344054]">
            프로젝트 등록 내용과 매칭·협상·계약·수수료 안내를 모두 확인했으며
            이에 동의합니다.
            <span className="ml-1 font-bold text-[#f04438]">(필수)</span>
          </span>
        </label>
      </div>

      {/* 하단 */}
      <div className="mt-8 border-t border-[#e2e7ec] pt-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={goPrev}
            className="flex h-[42px] cursor-pointer items-center gap-1 rounded-[8px] border border-[#dce2e8] bg-white px-5 text-[11px] font-semibold text-[#596579] transition hover:bg-[#f8fafc]"
          >
            <ChevronLeftIcon size={13} />
            이전
          </button>

          <button
            type="button"
            onClick={handleRegister}
            disabled={!canRegister}
            className={`flex h-[42px] min-w-[132px] items-center justify-center rounded-[8px] px-6 text-[12px] font-bold text-white transition ${
              canRegister
                ? "cursor-pointer bg-[#17365d] hover:bg-[#102a49]"
                : "cursor-not-allowed bg-[#a7b0bf]"
            }`}
          >
            프로젝트 등록하기
          </button>
        </div>
      </div>
    </ProjectRegisterShell>
  );
}

/* =========================================================
   요약 카드 / 행
========================================================= */

function SummaryCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mt-4 rounded-[12px] border border-[#dce2e8] bg-white">
      <div className="flex items-center justify-between border-b border-[#eef1f5] px-6 py-4">
        <h2 className="text-[13px] font-extrabold text-[#111827]">{title}</h2>
        {action}
      </div>

      <div className="px-6 py-2">{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start gap-4 border-t border-[#f1f3f6] py-4 first:border-t-0">
      <span className="w-[92px] shrink-0 text-[12px] font-medium text-[#98a2b3]">
        {label}
      </span>
      <span className="text-[12px] font-bold text-[#111827]">{value}</span>
    </div>
  );
}

function DetailSection({ label, text }: { label: string; text?: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium text-[#98a2b3]">{label}</p>
      <p className="mt-1 whitespace-pre-line text-[12px] font-semibold leading-6 text-[#344054]">
        {text || "-"}
      </p>
    </div>
  );
}

function AgreeRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between border-t border-[#f1f3f6] py-3 first:border-t-0">
      <span className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-[15px] w-[15px] cursor-pointer accent-[#17365d]"
        />
        <span className="text-[12px] font-semibold text-[#344054]">
          {label}
        </span>
      </span>

      <span className="text-[11px] font-bold text-[#f04438]">필수</span>
    </label>
  );
}
