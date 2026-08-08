"use client";

import { useEffect, useState } from "react";

interface UseEmailOtpOptions {
  email: string;
}

// 회원가입 디자인 확인용 로컬 인증 흐름입니다. 실제 API는 후속 작업에서 연동합니다.
export const useEmailOtp = ({ email }: UseEmailOtpOptions) => {
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        const next = Math.max(0, current - 1);
        if (next === 0) setSent(false);
        return next;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  const handleSend = () => {
    if (!email) return;
    setError(null);
    setSent(true);
    setVerified(false);
    setCode("");
    setSecondsLeft(180);
  };

  const handleVerify = () => {
    if (!code) return;
    setError(null);
    setVerified(true);
  };

  return {
    sent,
    verified,
    secondsLeft,
    code,
    setCode,
    error,
    handleSend,
    handleVerify,
  };
};
