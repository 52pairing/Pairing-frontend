"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getWithdrawalEligibility,
  withdrawAccount,
} from "@/features/common/services/withdrawal";
import type { WithdrawalBlocker } from "@/features/common/types/withdrawal";
import { ApiException } from "@/lib/api";

export const WITHDRAWAL_CONFIRMATION_TEXT = "탈퇴하겠습니다";
export const WITHDRAWAL_REASON_MAX_LENGTH = 500;

type EligibilityStatus = "loading" | "error" | "ready";

function getEligibilityErrorMessage(error: unknown) {
  if (error instanceof ApiException && error.status === 401) {
    return "로그인이 필요합니다.";
  }
  return error instanceof Error
    ? error.message
    : "탈퇴 가능 여부를 확인하지 못했습니다.";
}

function getWithdrawErrorMessage(error: unknown) {
  if (!(error instanceof ApiException)) {
    return error instanceof Error ? error.message : "탈퇴를 처리하지 못했습니다.";
  }
  if (error.errorCode === "AC_009") {
    return "확인 문구가 일치하지 않습니다. 다시 입력해 주세요.";
  }
  if (error.errorCode === "AC_010") {
    return "진행 중인 프로젝트 또는 계약이 있어 탈퇴할 수 없습니다. 안내를 다시 확인해 주세요.";
  }
  if (error.errorCode === "AC_011") {
    return "미납 수수료가 있어 탈퇴할 수 없습니다. 결제 후 다시 시도해 주세요.";
  }
  if (error.errorCode === "GLOBAL_002") {
    return "안내 사항 동의와 확인 문구 입력을 완료해 주세요.";
  }
  if (error.status === 401) {
    return "로그인이 필요합니다.";
  }
  return error.message || "탈퇴를 처리하지 못했습니다.";
}

/**
 * 회원 탈퇴 화면(클라이언트/프리랜서 공통)의 탈퇴 가능 여부 조회와 탈퇴 요청 상태를 관리합니다.
 * AC_010/AC_011(진행 중인 프로젝트·계약, 미납 수수료)로 실패하면 안내가 최신 상태를 반영하도록 조회를 다시 부릅니다.
 * AC_008(이미 탈퇴한 계정)은 탈퇴가 이미 처리된 것과 동일하게 완료 상태로 취급합니다.
 */
export function useWithdrawal() {
  const [status, setStatus] = useState<EligibilityStatus>("loading");
  const [eligibilityError, setEligibilityError] = useState("");
  const [withdrawable, setWithdrawable] = useState(false);
  const [blockers, setBlockers] = useState<WithdrawalBlocker[]>([]);

  const [agreed, setAgreed] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [completed, setCompleted] = useState(false);

  const loadEligibility = useCallback(async () => {
    setStatus("loading");
    setEligibilityError("");
    try {
      const eligibility = await getWithdrawalEligibility();
      setWithdrawable(eligibility.withdrawable);
      setBlockers(eligibility.blockers);
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      setEligibilityError(getEligibilityErrorMessage(error));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) void loadEligibility();
    });
    return () => {
      cancelled = true;
    };
  }, [loadEligibility]);

  const canSubmit =
    withdrawable &&
    agreed &&
    confirmation.trim() === WITHDRAWAL_CONFIRMATION_TEXT &&
    !isSubmitting;

  const submit = useCallback(async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setSubmitError("");

    try {
      await withdrawAccount({
        agreed,
        confirmText: confirmation.trim(),
        reason: reason.trim() || undefined,
      });
      setCompleted(true);
    } catch (error) {
      if (error instanceof ApiException && error.errorCode === "AC_008") {
        setCompleted(true);
        return;
      }
      if (
        error instanceof ApiException &&
        (error.errorCode === "AC_010" || error.errorCode === "AC_011")
      ) {
        await loadEligibility();
      }
      setSubmitError(getWithdrawErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }, [agreed, canSubmit, confirmation, loadEligibility, reason]);

  return {
    status,
    eligibilityError,
    withdrawable,
    blockers,
    agreed,
    setAgreed,
    confirmation,
    setConfirmation,
    reason,
    setReason,
    isSubmitting,
    submitError,
    completed,
    canSubmit,
    submit,
    retryEligibility: loadEligibility,
  };
}
