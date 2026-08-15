"use client";

import Link from "next/link";

import { Modal } from "@/features/common/components/Modal";
import { ErrorState } from "@/features/common/components/ErrorState";
import { LoadingState } from "@/features/common/components/Loading";
import {
  WITHDRAWAL_CONFIRMATION_TEXT,
  WITHDRAWAL_REASON_MAX_LENGTH,
  useWithdrawal,
} from "@/features/common/hooks/useWithdrawal";
import type { WithdrawalBlocker } from "@/features/common/types/withdrawal";
import { FreelancerMyPageLayout } from "./FreelancerMyPageLayout";

const CANCELLATION_NOTICES = [
  "탈퇴 후 1년 동안 관리 목적에 따라 개인정보가 보관됩니다.",
  "완료된 프로젝트 내역과 작성된 리뷰는 삭제되지 않습니다.",
  "탈퇴한 계정은 복구하기 어려우니 신중하게 선택해 주세요.",
  "탈퇴 후 동일 이메일로 재가입은 30일 이후 가능합니다.",
] as const;

export function FreelancerAccountCancellation() {
  const withdrawal = useWithdrawal();

  return (
    <FreelancerMyPageLayout activeMenu="cancel">
      <section className="rounded-xl border border-theme bg-surface px-5 py-6 sm:px-8 sm:py-7">
        <h2 className="text-[16px] font-bold text-theme-danger">회원 탈퇴</h2>

        {withdrawal.status === "loading" ? (
          <LoadingState message="탈퇴 가능 여부를 확인하는 중입니다." />
        ) : withdrawal.status === "error" ? (
          <ErrorState
            description={withdrawal.eligibilityError}
            onRetry={() => void withdrawal.retryEligibility()}
          />
        ) : !withdrawal.withdrawable ? (
          <BlockedCancellation blockers={withdrawal.blockers} />
        ) : (
          <CancellationForm
            agreed={withdrawal.agreed}
            confirmation={withdrawal.confirmation}
            reason={withdrawal.reason}
            canSubmit={withdrawal.canSubmit}
            isSubmitting={withdrawal.isSubmitting}
            submitError={withdrawal.submitError}
            onAgreedChange={withdrawal.setAgreed}
            onConfirmationChange={withdrawal.setConfirmation}
            onReasonChange={withdrawal.setReason}
            onSubmit={() => void withdrawal.submit()}
          />
        )}
      </section>

      <Modal
        open={withdrawal.completed}
        onClose={() => window.location.replace("/")}
        size="md"
        labelledBy="freelancer-cancel-complete-title"
        describedBy="freelancer-cancel-complete-description"
      >
        <h2 id="freelancer-cancel-complete-title" className="text-[20px] font-extrabold tracking-[-0.02em]">
          탈퇴가 완료되었습니다
        </h2>
        <p id="freelancer-cancel-complete-description" className="mt-4 text-[13px] font-semibold leading-6 text-theme-secondary">
          이용해 주셔서 감사합니다. 메인 화면으로 이동합니다.
        </p>
        <button
          type="button"
          onClick={() => window.location.replace("/")}
          className="mt-7 h-11 w-full rounded-md bg-brand text-[13px] font-bold text-white hover:bg-brand-hover"
        >
          확인
        </button>
      </Modal>
    </FreelancerMyPageLayout>
  );
}

function CancellationForm({
  agreed,
  confirmation,
  reason,
  canSubmit,
  isSubmitting,
  submitError,
  onAgreedChange,
  onConfirmationChange,
  onReasonChange,
  onSubmit,
}: {
  agreed: boolean;
  confirmation: string;
  reason: string;
  canSubmit: boolean;
  isSubmitting: boolean;
  submitError: string;
  onAgreedChange: (value: boolean) => void;
  onConfirmationChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="mt-6">
      <div className="rounded-xl border border-red-200 bg-danger-surface px-5 py-5">
        <h3 className="text-[13px] font-bold text-theme-danger">탈퇴 전 반드시 확인해 주세요.</h3>
        <ul className="mt-3 space-y-2.5 text-[12px] font-semibold leading-5 text-theme-secondary">
          {CANCELLATION_NOTICES.map((notice) => (
            <li key={notice} className="flex gap-2">
              <span className="text-theme-danger" aria-hidden="true">•</span>
              <span>{notice}</span>
            </li>
          ))}
        </ul>
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(event) => onAgreedChange(event.target.checked)}
          className="mt-0.5 h-4 w-4 accent-red-600"
        />
        <span className="text-[12px] font-semibold leading-5 text-theme-secondary">
          위 안내 사항을 모두 확인했으며, 탈퇴로 인한 데이터 처리에 동의합니다.
        </span>
      </label>

      {agreed ? (
        <>
          <div className="mt-7">
            <label htmlFor="freelancer-cancel-reason" className="text-[12px] font-semibold text-theme-muted">
              탈퇴 사유 <span className="font-medium">(선택)</span>
            </label>
            <textarea
              id="freelancer-cancel-reason"
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              maxLength={WITHDRAWAL_REASON_MAX_LENGTH}
              placeholder="더 나은 서비스를 위해 탈퇴 사유를 알려주세요."
              className="mt-2 min-h-[96px] w-full resize-y rounded-md border border-theme bg-surface px-4 py-3 text-[13px] font-semibold outline-none placeholder:text-theme-muted focus:border-theme-danger"
            />
            <p className="mt-1 text-right text-[11px] text-theme-muted">
              {reason.length}/{WITHDRAWAL_REASON_MAX_LENGTH}
            </p>
          </div>

          <div className="mt-4">
            <label htmlFor="freelancer-cancel-confirmation" className="text-[12px] font-semibold text-theme-muted">
              탈퇴를 계속하려면 아래에 <strong className="text-theme-danger">“{WITHDRAWAL_CONFIRMATION_TEXT}”</strong>를 입력해 주세요.
            </label>
            <input
              id="freelancer-cancel-confirmation"
              value={confirmation}
              onChange={(event) => onConfirmationChange(event.target.value)}
              autoComplete="off"
              placeholder={WITHDRAWAL_CONFIRMATION_TEXT}
              className="mt-2 h-11 w-full rounded-md border border-theme bg-surface px-4 text-[13px] font-semibold outline-none placeholder:text-theme-muted focus:border-theme-danger"
            />
          </div>
        </>
      ) : null}

      {submitError ? (
        <p role="alert" className="mt-4 text-[12px] font-semibold text-theme-danger">
          {submitError}
        </p>
      ) : null}

      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        aria-busy={isSubmitting}
        className="mt-5 h-11 rounded-md border border-red-400 px-5 text-[13px] font-bold text-theme-danger transition hover:bg-danger-surface disabled:cursor-not-allowed disabled:border-red-200 disabled:text-red-300"
      >
        {isSubmitting ? "처리 중..." : "회원 탈퇴"}
      </button>
    </div>
  );
}

function BlockedCancellation({ blockers }: { blockers: WithdrawalBlocker[] }) {
  return (
    <div className="mt-6">
      <div className="rounded-xl border border-red-200 bg-danger-surface px-5 py-5">
        <h3 className="text-[13px] font-bold text-theme-danger">현재 탈퇴할 수 없는 상태입니다.</h3>
        <ul className="mt-3 space-y-2 text-[12px] font-semibold text-theme-secondary">
          {blockers.map((blocker) => (
            <li key={blocker.type}>
              • {blocker.label}
              {blocker.type !== "UNPAID_SETTLEMENT" ? ` ${blocker.count}건` : ""}{" "}
              <Link href={blocker.linkUrl} className="ml-1 text-blue-600 underline">
                확인하기
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <button type="button" disabled className="mt-5 h-11 rounded-md border border-red-200 px-5 text-[13px] font-bold text-red-300">
        회원 탈퇴 신청
      </button>
    </div>
  );
}
