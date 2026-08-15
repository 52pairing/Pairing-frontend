"use client";

import { useState } from "react";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useEmailOtp } from "@/features/auth/hooks/useEmailOtp";
import { changePassword } from "@/features/auth/services/changePassword";
import { ClientMyPageSidebar } from "@/features/client/components/ClientMyPageSidebar";
import { FreelancerMyPageSidebar } from "@/features/freelancer/components/FreelancerMyPageSidebar";
import { ApiException } from "@/lib/api";

interface MyPagePasswordChangeProps {
  role: "CLIENT" | "FREELANCER";
  embedded?: boolean;
  onClose?: () => void;
}

type PasswordStep = "email" | "password" | "done";

const isValidPassword = (value: string) =>
  value.length >= 8 &&
  value.length <= 20 &&
  /[A-Za-z]/.test(value) &&
  /[0-9]/.test(value) &&
  /[^A-Za-z0-9]/.test(value);

export function MyPagePasswordChange({ role, embedded = false, onClose }: MyPagePasswordChangeProps) {
  const user = useCurrentUser();
  const otp = useEmailOtp({ email: user?.email ?? "", purpose: "PASSWORD_CHANGE" });
  const [step, setStep] = useState<PasswordStep>("email");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const effectiveStep: PasswordStep = user?.tempPassword && step === "email" ? "password" : step;

  const handleNext = () => {
    if (otp.verified) setStep("password");
  };

  const handlePasswordChange = async () => {
    if (!isValidPassword(password) || password !== passwordConfirm || isSubmitting) return;
    setIsSubmitting(true);
    setFormError("");

    try {
      await changePassword({ newPassword: password, newPasswordConfirm: passwordConfirm });
      setStep("done");
    } catch (error) {
      if (error instanceof ApiException && error.errorCode === "AU_006") {
        otp.reset();
        setStep("email");
      }
      setFormError(error instanceof ApiException ? error.message : "비밀번호 변경 중 문제가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sidebar = role === "CLIENT" ? <ClientMyPageSidebar activeMenu="password" /> : <FreelancerMyPageSidebar activeMenu="password" />;
  const isPasswordStepValid = isValidPassword(password) && password === passwordConfirm;
  const passwordSection = (
    <section className="min-h-[360px] min-w-0 overflow-hidden rounded-xl border border-theme bg-surface px-5 py-5 shadow-[0_1px_2px_rgba(16,24,40,0.02)] sm:px-6 sm:py-6">
      <div className="flex items-start justify-between gap-4">
        <div><h2 className="text-[16px] font-extrabold tracking-[-0.02em]">비밀번호 변경</h2><p className="mt-1 text-[11px] font-medium text-theme-muted">안전한 계정 사용을 위해 이메일 인증이 필요합니다.</p></div>
        {embedded && onClose ? <button type="button" onClick={onClose} className="shrink-0 text-[12px] font-semibold text-theme-muted hover:text-brand">닫기</button> : null}
      </div>
      <PasswordStepper step={effectiveStep} />
      {effectiveStep === "email" ? <EmailVerificationStep userEmail={user?.email} otp={otp} onNext={handleNext} onCancel={onClose} /> : null}
      {effectiveStep === "password" ? <PasswordForm password={password} passwordConfirm={passwordConfirm} error={formError} isSubmitting={isSubmitting} isValid={isPasswordStepValid} onPasswordChange={setPassword} onPasswordConfirmChange={setPasswordConfirm} onPrevious={user?.tempPassword ? (onClose ?? (() => history.back())) : () => setStep("email")} onSubmit={handlePasswordChange} /> : null}
      {effectiveStep === "done" ? <CompletionStep /> : null}
    </section>
  );

  if (embedded) {
    return (
      <div className="mx-auto mt-4 max-w-[620px] pt-1">
        <PasswordStepper step={effectiveStep} />
        {effectiveStep === "email" ? <EmailVerificationStep userEmail={user?.email} otp={otp} onNext={handleNext} onCancel={onClose} /> : null}
        {effectiveStep === "password" ? <PasswordForm password={password} passwordConfirm={passwordConfirm} error={formError} isSubmitting={isSubmitting} isValid={isPasswordStepValid} onPasswordChange={setPassword} onPasswordConfirmChange={setPasswordConfirm} onPrevious={user?.tempPassword ? (onClose ?? (() => history.back())) : () => setStep("email")} onSubmit={handlePasswordChange} /> : null}
        {effectiveStep === "done" ? <CompletionStep /> : null}
      </div>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-surface-subtle px-4 py-8 text-theme-primary sm:px-6 lg:py-12">
      <div className="mx-auto w-full max-w-[1105px]">
        <h1 className="text-[23px] font-extrabold tracking-[-0.04em] sm:text-[26px]">마이페이지</h1>
        <div className="mt-8 grid min-w-0 grid-cols-1 gap-6 md:grid-cols-[200px_minmax(0,1fr)] md:items-start">
          {sidebar}
          <div className="min-w-0 flex-1 space-y-4">
            <AccountSummary name={user?.name} email={user?.email} role={role} />
            {passwordSection}
          </div>
        </div>
      </div>
    </main>
  );
}

function AccountSummary({ name, email, role }: { name?: string; email?: string; role: "CLIENT" | "FREELANCER" }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-theme bg-surface px-5 py-6 shadow-[0_1px_2px_rgba(16,24,40,0.02)] sm:px-7 sm:py-7">
      <h2 className="text-[16px] font-bold">기본 정보</h2>
      <div className="mt-7 flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
        <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-surface-muted text-[26px] font-bold text-brand" aria-hidden="true">{name?.trim().charAt(0) || "기"}</div>
        <div className="min-w-0">
          <p className="break-words text-[20px] font-extrabold">{name ?? (role === "CLIENT" ? "기업 회원" : "프리랜서 회원")}</p>
          <p className="mt-1 break-words text-[13px] font-semibold text-theme-secondary">{role === "CLIENT" ? "담당자" : "이름"}: {name ?? "불러오는 중"}</p>
        </div>
      </div>
      <dl className="mt-7 grid gap-x-16 gap-y-5 border-t border-theme pt-6 sm:grid-cols-2">
        <div className="min-w-0"><dt className="text-[12px] font-semibold text-theme-muted">업무 이메일</dt><dd className="mt-1 break-all text-[14px] font-bold">{email ?? "불러오는 중"}</dd></div>
        <div><dt className="text-[12px] font-semibold text-theme-muted">계정 유형</dt><dd className="mt-1 text-[14px] font-bold">{role === "CLIENT" ? "클라이언트" : "프리랜서"}</dd></div>
      </dl>
    </section>
  );
}

function PasswordStepper({ step }: { step: PasswordStep }) {
  const current = step === "email" ? 1 : step === "password" ? 2 : 3;
  const labels = ["이메일 인증", "비밀번호 설정", "완료"];
  return (
    <ol className="mt-5 grid grid-cols-3 px-1" aria-label="비밀번호 변경 진행 단계">
      {labels.map((label, index) => {
        const number = index + 1;
        const complete = number < current || step === "done";
        const active = number === current;
        return (
          <li key={label} className="relative flex flex-col items-center">
            {index > 0 ? <span className="absolute right-1/2 top-3 h-px w-full bg-theme" aria-hidden="true" /> : null}
            <span className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-extrabold transition-colors ${complete ? "border-[#17365d] bg-[#17365d] text-white" : active ? "border-brand bg-brand text-white shadow-[0_0_0_3px_rgba(23,54,93,0.08)]" : "border-theme bg-surface text-theme-muted"}`}>{complete ? "✓" : number}</span>
            <span className={`mt-2 text-[10px] font-bold ${active ? "text-brand" : "text-theme-muted"}`}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

type EmailOtpState = ReturnType<typeof useEmailOtp>;

function EmailVerificationStep({ userEmail, otp, onNext, onCancel }: { userEmail?: string; otp: EmailOtpState; onNext: () => void; onCancel?: () => void }) {
  return (
    <div className="mt-5 border-t border-theme pt-4">
      <div className="flex items-start gap-2.5 rounded-[9px] bg-surface-subtle px-3.5 py-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-brand shadow-sm" aria-hidden="true"><MailIcon /></span>
        <div><p className="text-[11px] font-medium text-theme-muted">인증 코드를 받을 이메일</p><p className="mt-0.5 break-all text-[12px] font-bold text-theme-primary">{userEmail ?? "사용자 정보를 불러오는 중입니다"}</p></div>
      </div>
      {!otp.sent ? (
        <button type="button" onClick={otp.handleSend} disabled={!userEmail || otp.isSending || otp.remainingSendCount === 0} className="mt-3 h-9 w-full rounded-[7px] bg-brand text-[12px] font-bold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-theme-muted">{otp.isSending ? "인증 코드 발송 중..." : "인증 코드 발송"}</button>
      ) : (
        <div className="mt-3 flex min-w-0 flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1"><input aria-label="인증 코드 6자리" value={otp.code} onChange={(event) => otp.setCode(event.target.value.replace(/\D/g, ""))} inputMode="numeric" maxLength={6} placeholder="인증 코드 6자리 입력" className="h-9 w-full rounded-[7px] border border-theme bg-surface px-3 pr-14 text-center text-[12px] font-bold tracking-[0.24em] outline-none transition placeholder:tracking-normal placeholder:text-theme-muted hover:border-brand focus:border-brand focus:ring-2 focus:ring-brand/10" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-theme-danger">{Math.floor(otp.secondsLeft / 60)}:{String(otp.secondsLeft % 60).padStart(2, "0")}</span></div>
          <button type="button" onClick={otp.handleVerify} disabled={otp.code.length !== 6 || otp.secondsLeft <= 0 || otp.isConfirming || otp.verified} className="h-9 shrink-0 rounded-[7px] bg-brand px-5 text-[12px] font-bold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-theme-muted">{otp.isConfirming ? "확인 중" : "확인"}</button>
        </div>
      )}
      {otp.verified ? <p className="mt-3 flex items-center gap-1.5 text-[12px] font-bold text-emerald-600"><span className="flex h-4 w-4 items-center justify-center rounded-full border border-emerald-500 text-[9px]">✓</span> 인증이 완료되었습니다.</p> : null}
      {otp.sent && !otp.verified ? <button type="button" onClick={otp.handleSend} disabled={otp.isSending || otp.secondsLeft > 0 || otp.remainingSendCount === 0} className="mt-3 text-[11px] font-semibold text-theme-muted underline underline-offset-2 disabled:no-underline">인증 코드 재발송</button> : null}
      {otp.error ? <p role="alert" className="mt-2 text-[12px] font-semibold text-theme-danger">{otp.error}</p> : null}
      <div className="mt-4 flex flex-wrap justify-end gap-2"><button type="button" onClick={() => onCancel ? onCancel() : history.back()} className="h-9 rounded-[7px] border border-theme px-4 text-[11px] font-bold text-theme-secondary transition hover:bg-surface-subtle">취소</button><button type="button" onClick={onNext} disabled={!otp.verified} className="h-9 rounded-[7px] bg-brand px-5 text-[11px] font-bold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-theme-muted">다음</button></div>
    </div>
  );
}

interface PasswordFormProps {
  password: string;
  passwordConfirm: string;
  error: string;
  isSubmitting: boolean;
  isValid: boolean;
  onPasswordChange: (value: string) => void;
  onPasswordConfirmChange: (value: string) => void;
  onPrevious: () => void;
  onSubmit: () => void;
}

function PasswordForm(props: PasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  return (
    <div className="mt-5 border-t border-theme pt-4">
      <label htmlFor="myPageNewPassword" className="text-[12px] font-bold text-theme-secondary">새 비밀번호</label>
      <div className="relative mt-1.5"><input id="myPageNewPassword" type={showPassword ? "text" : "password"} value={props.password} maxLength={20} onChange={(event) => props.onPasswordChange(event.target.value)} placeholder="영문·숫자·특수문자 포함 8~20자" className="h-9 w-full rounded-[7px] border border-theme bg-surface px-3 pr-11 text-[12px] outline-none transition placeholder:text-theme-muted hover:border-brand focus:border-brand focus:ring-2 focus:ring-brand/10" /><VisibilityButton visible={showPassword} onClick={() => setShowPassword((value) => !value)} /></div>
      <label htmlFor="myPagePasswordConfirm" className="mt-4 block text-[12px] font-bold text-theme-secondary">새 비밀번호 확인</label>
      <div className="relative mt-1.5"><input id="myPagePasswordConfirm" type={showPasswordConfirm ? "text" : "password"} value={props.passwordConfirm} maxLength={20} onChange={(event) => props.onPasswordConfirmChange(event.target.value)} placeholder="새 비밀번호를 한 번 더 입력해 주세요" className="h-9 w-full rounded-[7px] border border-theme bg-surface px-3 pr-11 text-[12px] outline-none transition placeholder:text-theme-muted hover:border-brand focus:border-brand focus:ring-2 focus:ring-brand/10" /><VisibilityButton visible={showPasswordConfirm} onClick={() => setShowPasswordConfirm((value) => !value)} /></div>
      <div className="mt-4 rounded-[9px] bg-surface-subtle px-4 py-3 text-[11px] font-medium leading-5 text-theme-muted"><p>• 8~20자로 입력해 주세요.</p><p>• 영문, 숫자, 특수문자를 각각 1개 이상 포함해 주세요.</p></div>
      {props.passwordConfirm && props.password !== props.passwordConfirm ? <p role="alert" className="mt-2 text-[12px] font-semibold text-theme-danger">비밀번호가 일치하지 않습니다.</p> : null}
      {props.error ? <p role="alert" className="mt-2 text-[12px] font-semibold text-theme-danger">{props.error}</p> : null}
      <div className="mt-4 flex flex-wrap justify-end gap-2"><button type="button" onClick={props.onPrevious} className="h-9 rounded-[7px] border border-theme px-4 text-[11px] font-bold text-theme-secondary transition hover:bg-surface-subtle">이전</button><button type="button" onClick={props.onSubmit} disabled={!props.isValid || props.isSubmitting} className="h-9 rounded-[7px] bg-brand px-5 text-[11px] font-bold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-theme-muted">{props.isSubmitting ? "변경 중..." : "변경 완료"}</button></div>
    </div>
  );
}

function CompletionStep() {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand" aria-hidden="true">
        <CheckIcon />
      </span>
      <p className="mt-5 text-[17px] font-extrabold tracking-[-0.02em]">비밀번호가 변경되었습니다.</p>
      <p className="mt-2 text-[12px] font-medium text-theme-muted">다음 로그인부터 새 비밀번호를 사용해 주세요.</p>
      <button type="button" onClick={() => window.location.replace("/login?passwordChanged=true")} className="mt-7 h-10 rounded-[7px] bg-brand px-7 text-[12px] font-bold text-white transition hover:bg-brand-hover">확인</button>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MailIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6.5h16v11H4v-11Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="m5 7 7 6 7-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function VisibilityButton({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"} className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-theme-muted transition hover:bg-surface-subtle hover:text-theme-secondary"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.7"/>{visible ? null : <path d="m4 4 16 16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>}</svg></button>;
}
