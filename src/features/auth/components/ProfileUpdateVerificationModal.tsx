"use client";

import { useId } from "react";
import { useEmailOtp } from "@/features/auth/hooks/useEmailOtp";
import { Modal } from "@/features/common/components/Modal";

interface ProfileUpdateVerificationModalProps {
  open: boolean;
  email: string;
  title?: string;
  description?: string;
  onVerified: () => void;
  onClose: () => void;
}

export function ProfileUpdateVerificationModal({ open, email, title = "이메일 인증", description = "본인 확인을 완료해야 정보를 수정할 수 있습니다.", onVerified, onClose }: ProfileUpdateVerificationModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const otp = useEmailOtp({ email, purpose: "PROFILE_UPDATE" });
  const close = () => { otp.reset(); onClose(); };
  const confirm = async () => {
    if (await otp.handleVerify()) {
      otp.reset();
      onVerified();
    }
  };

  return <Modal open={open} onClose={close} labelledBy={titleId} describedBy={descriptionId} closeOnOverlayClick={false}>
    <h2 id={titleId} className="text-center text-lg font-bold">{title}</h2>
    <p id={descriptionId} className="mt-2 text-center text-sm leading-6 text-theme-secondary">{description}</p>
    <p className="mt-4 rounded-lg bg-surface-subtle px-3 py-2 text-center text-xs font-semibold text-theme-muted">{email}</p>
    {otp.sent ? <div className="relative mt-4"><input value={otp.code} onChange={(event) => otp.setCode(event.target.value.replace(/\D/g, ""))} onKeyDown={(event) => { if (event.key === "Enter") void confirm(); }} maxLength={6} inputMode="numeric" placeholder="인증코드 6자리" autoComplete="one-time-code" className="h-11 w-full rounded-md border border-theme bg-surface px-3 pr-16 text-sm outline-none focus:border-brand" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-theme-danger">{Math.floor(otp.secondsLeft / 60)}:{String(otp.secondsLeft % 60).padStart(2, "0")}</span></div> : null}
    {otp.error ? <p role="alert" className="mt-3 text-center text-xs font-semibold text-theme-danger">{otp.error}</p> : null}
    {otp.sent && !otp.verified ? <button type="button" onClick={() => void otp.handleSend()} disabled={otp.isSending || otp.secondsLeft > 0 || otp.remainingSendCount === 0} className="mt-3 self-start text-[11px] font-semibold text-theme-muted underline disabled:no-underline">인증코드 재발송{otp.remainingSendCount == null ? "" : ` (남은 ${otp.remainingSendCount}회)`}</button> : null}
    <div className="mt-6 flex gap-2"><button type="button" onClick={close} disabled={otp.isSending || otp.isConfirming} className="h-11 flex-1 rounded-md border border-theme text-sm font-bold">취소</button><button type="button" onClick={() => void (otp.sent ? confirm() : otp.handleSend())} disabled={otp.isSending || otp.isConfirming || (otp.sent && (otp.code.length !== 6 || otp.secondsLeft <= 0))} className="h-11 flex-1 rounded-md bg-brand text-sm font-bold text-white disabled:opacity-50">{otp.isSending ? "발송 중" : otp.isConfirming ? "확인 중" : otp.sent ? "인증 확인" : "인증코드 발송"}</button></div>
  </Modal>;
}
