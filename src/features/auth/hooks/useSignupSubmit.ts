"use client";

import { useRef, useState } from "react";

import { ApiException } from "@/lib/api";

type SignupSubmitter<TPayload> = (payload: TPayload) => Promise<unknown>;

// 일반 회원가입의 제출 중 상태와 서버 오류 처리를 공통으로 관리합니다.
export const useSignupSubmit = <TPayload,>(
  submitter: SignupSubmitter<TPayload>,
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const submittingRef = useRef(false);

  const submit = async (payload: TPayload) => {
    if (submittingRef.current) return false;
    submittingRef.current = true;
    setIsSubmitting(true);
    setSubmitError("");

    try {
      await submitter(payload);
      return true;
    } catch (error) {
      setSubmitError(
        error instanceof ApiException
          ? error.message
          : "회원가입 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      );
      return false;
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return { submit, isSubmitting, submitError };
};
