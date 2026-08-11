// 계정 잠금 해제 모달 - 이메일 인증코드 발송 후 코드 입력으로 잠금 해제
// email-verifications/confirm을 거치지 않고 코드를 /unlock에 바로 넣는 방식 (문서 9절)

"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/features/common/components/Modal";
import { sendVerificationCode } from "@/features/auth/services/emailVerification";
import { unlockAccount } from "@/features/auth/services/unlockAccount";
import type { LoginRole } from "@/features/auth/types";
import { ApiException } from "@/lib/api";

interface UnlockAccountModalProps {
  open: boolean;
  email: string;
  role: LoginRole;
  onClose: () => void;
  onUnlocked: () => void;
}

export const UnlockAccountModal = ({
  open,
  email,
  role,
  onClose,
  onUnlocked,
}: UnlockAccountModalProps) => {
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  const reset = () => {
    setSent(false);
    setCode("");
    setError("");
    setSecondsLeft(0);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const sendCode = async () => {
    setIsSending(true);
    setError("");

    try {
      const result = await sendVerificationCode({ email, purpose: "UNLOCK" });
      const seconds = Math.max(
        Math.floor(
          (new Date(result.expiresAt).getTime() - Date.now()) / 1000,
        ),
        0,
      );
      setSecondsLeft(seconds);
      setSent(true);
    } catch (sendError) {
      setError(
        sendError instanceof ApiException
          ? sendError.message
          : "인증코드 발송 중 문제가 발생했습니다.",
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirm = async () => {
    if (!code) return;
    setIsConfirming(true);
    setError("");

    try {
      await unlockAccount({ email, role, code });
      reset();
      onUnlocked();
    } catch (confirmError) {
      setError(
        confirmError instanceof ApiException
          ? confirmError.message
          : "인증 확인 중 문제가 발생했습니다.",
      );
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="flex flex-1 flex-col">
        <h2 className="text-lg font-bold text-theme-primary">계정 잠금 해제</h2>

        {sent ? (
          <>
            <p className="mt-2 text-sm text-theme-secondary">
              {email}로 인증코드를 보냈습니다. 메일함에서 확인해 주세요.
            </p>

            <input
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="인증코드 6자리"
              maxLength={6}
              className="mt-4 h-11 w-full rounded-md border border-theme px-4 text-sm outline-none focus:border-brand"
            />

            <button
              type="button"
              onClick={sendCode}
              disabled={isSending || secondsLeft > 0}
              className="mt-3 self-start text-xs font-medium text-theme-secondary underline disabled:cursor-not-allowed disabled:text-theme-muted"
            >
              {secondsLeft > 0
                ? `인증코드 재발송 (${secondsLeft}s)`
                : "인증코드 다시 받기"}
            </button>
          </>
        ) : (
          <p className="mt-2 text-sm text-theme-secondary">
            {email}로 인증코드를 보내드려요. 받은 코드를 입력하면 계정 잠금이
            풀립니다.
          </p>
        )}

        {error ? (
          <p className="mt-2 text-xs font-medium text-red-500">{error}</p>
        ) : null}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 rounded-lg border border-theme bg-surface px-4 py-3 text-sm font-semibold text-theme-secondary hover:bg-surface-subtle"
          >
            취소
          </button>
          {sent ? (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!code || isConfirming}
              className="flex-1 rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isConfirming ? "확인 중..." : "확인"}
            </button>
          ) : (
            <button
              type="button"
              onClick={sendCode}
              disabled={isSending}
              className="flex-1 rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isSending ? "발송 중..." : "인증코드 받기"}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
