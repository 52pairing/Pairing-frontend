"use client";

import { useEffect, useRef, useState } from "react";

import {
  confirmVerificationCode,
  sendVerificationCode,
} from "@/features/auth/services/emailVerification";
import { ApiException } from "@/lib/api";
import type { VerificationPurpose } from "@/features/auth/types";

interface UseEmailOtpOptions {
  email: string;
  purpose?: VerificationPurpose;
}

const getSecondsLeft = (expiresAt: string) =>
  Math.max(Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000), 0);

// 회원가입 이메일 인증의 발송·확인·서버 만료시간을 관리합니다.
export const useEmailOtp = ({ email, purpose = "SIGNUP" }: UseEmailOtpOptions) => {
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [remainingSendCount, setRemainingSendCount] = useState<number | null>(
    null,
  );
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => setSecondsLeft(getSecondsLeft(expiresAt));
    updateTimer();
    const timer = window.setInterval(updateTimer, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  const reset = () => {
    requestIdRef.current += 1;
    setSent(false);
    setVerified(false);
    setExpiresAt("");
    setSecondsLeft(0);
    setRemainingSendCount(null);
    setCode("");
    setError(null);
    setIsSending(false);
    setIsConfirming(false);
  };

  const handleSend = async () => {
    if (!email || isSending || remainingSendCount === 0) return;

    const requestId = ++requestIdRef.current;
    setIsSending(true);
    setError(null);

    try {
      const result = await sendVerificationCode({ email, purpose });
      if (requestId !== requestIdRef.current) return;

      setSent(true);
      setVerified(false);
      setCode("");
      setExpiresAt(result.expiresAt);
      setSecondsLeft(getSecondsLeft(result.expiresAt));
      setRemainingSendCount(result.remainingSendCount);
    } catch (sendError) {
      if (requestId !== requestIdRef.current) return;

      if (sendError instanceof ApiException && sendError.errorCode === "AU_003") {
        setRemainingSendCount(0);
      }
      setError(
        sendError instanceof ApiException
          ? sendError.message
          : "인증코드 발송 중 문제가 발생했습니다.",
      );
    } finally {
      if (requestId === requestIdRef.current) setIsSending(false);
    }
  };

  const handleVerify = async () => {
    if (!email || !code || secondsLeft <= 0 || isConfirming) return false;

    const requestId = ++requestIdRef.current;
    setIsConfirming(true);
    setError(null);

    try {
      await confirmVerificationCode({ email, purpose, code });
      if (requestId !== requestIdRef.current) return;

      setVerified(true);
      setExpiresAt("");
      setSecondsLeft(0);
      return true;
    } catch (confirmError) {
      if (requestId !== requestIdRef.current) return;

      if (
        confirmError instanceof ApiException &&
        ["AU_005", "AU_012"].includes(confirmError.errorCode)
      ) {
        setExpiresAt("");
        setSecondsLeft(0);
      }
      setError(
        confirmError instanceof ApiException
          ? confirmError.message
          : "인증코드 확인 중 문제가 발생했습니다.",
      );
      return false;
    } finally {
      if (requestId === requestIdRef.current) setIsConfirming(false);
    }
  };

  return {
    sent,
    verified,
    secondsLeft,
    remainingSendCount,
    code,
    setCode,
    error,
    isSending,
    isConfirming,
    reset,
    handleSend,
    handleVerify,
  };
};
