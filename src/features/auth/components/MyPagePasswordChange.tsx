"use client";

import { useState } from "react";

import { NewPasswordForm } from "@/features/auth/components/NewPasswordForm";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useEmailOtp } from "@/features/auth/hooks/useEmailOtp";
import { changePassword } from "@/features/auth/services/changePassword";
import { ClientMyPageSidebar } from "@/features/client/components/ClientMyPageSidebar";
import { FreelancerMyPageSidebar } from "@/features/freelancer/components/FreelancerMyPageSidebar";
import { ApiException } from "@/lib/api";

interface MyPagePasswordChangeProps {
  role: "CLIENT" | "FREELANCER";
}

export function MyPagePasswordChange({ role }: MyPagePasswordChangeProps) {
  const user = useCurrentUser();
  const otp = useEmailOtp({
    email: user?.email ?? "",
    purpose: "PASSWORD_CHANGE",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const handlePasswordChange = async (newPassword: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setFormError("");

    try {
      await changePassword({
        newPassword,
        newPasswordConfirm: newPassword,
      });
      window.location.replace("/login?passwordChanged=true");
    } catch (error) {
      if (error instanceof ApiException && error.errorCode === "AU_006") {
        otp.reset();
      }
      setFormError(
        error instanceof ApiException
          ? error.message
          : "비밀번호 변경 중 문제가 발생했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const sidebar =
    role === "CLIENT" ? (
      <ClientMyPageSidebar activeMenu="password" />
    ) : (
      <FreelancerMyPageSidebar activeMenu="password" />
    );

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-7 text-[#172033] sm:px-5">
      <div className="mx-auto w-full max-w-[1200px]">
        <h1 className="text-[24px] font-extrabold tracking-[-0.04em]">마이페이지</h1>
        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start">
          {sidebar}
          <section className="min-w-0 flex-1 rounded-xl border border-[#dde3ea] bg-white px-6 py-8 sm:px-10">
            {!otp.verified ? (
              <div className="mx-auto max-w-[520px]">
                <h2 className="text-lg font-bold">비밀번호 변경</h2>
                <p className="mt-2 text-sm text-gray-500">
                  계정 이메일로 본인 인증을 완료한 뒤 비밀번호를 변경할 수 있습니다.
                </p>
                <label className="mt-6 block text-sm font-semibold text-gray-700">
                  계정 이메일
                </label>
                <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  {user?.email ?? "사용자 정보를 불러오는 중..."}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={otp.handleSend}
                    disabled={!user?.email || otp.isSending || otp.secondsLeft > 0 || otp.remainingSendCount === 0}
                    className="h-11 rounded-md border border-gray-200 px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:text-gray-300"
                  >
                    {otp.isSending ? "발송 중..." : otp.sent ? "인증번호 재전송" : "인증번호 받기"}
                  </button>
                  {otp.sent ? (
                    <>
                      <input
                        value={otp.code}
                        onChange={(event) => otp.setCode(event.target.value.replace(/\D/g, ""))}
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="인증번호 6자리"
                        className="h-11 w-40 rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-[#142B4A]"
                      />
                      <span className="text-sm font-semibold text-[#356DF3]">
                        {String(Math.floor(otp.secondsLeft / 60)).padStart(2, "0")}:{String(otp.secondsLeft % 60).padStart(2, "0")}
                      </span>
                      <button
                        type="button"
                        onClick={otp.handleVerify}
                        disabled={otp.code.length !== 6 || otp.secondsLeft <= 0 || otp.isConfirming}
                        className="h-11 rounded-md bg-[#356DF3] px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        {otp.isConfirming ? "확인 중..." : "인증 확인"}
                      </button>
                    </>
                  ) : null}
                </div>
                {otp.remainingSendCount !== null ? (
                  <p className="mt-2 text-xs text-gray-400">남은 발송 횟수: {otp.remainingSendCount}회</p>
                ) : null}
                {otp.error ? <p className="mt-2 text-xs text-red-500">{otp.error}</p> : null}
              </div>
            ) : (
              <div className="mx-auto max-w-[520px]">
                <NewPasswordForm
                  isSubmitting={isSubmitting}
                  error={formError}
                  onSubmit={handlePasswordChange}
                  temporaryPassword={false}
                />
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
