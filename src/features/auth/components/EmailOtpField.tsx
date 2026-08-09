// 이메일 인증 스텝 필드: 도메인 프리셋 선택 + 중복 확인 + 인증번호 발송/재발송/확인
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { EMAIL_DOMAIN_OPTIONS } from "@/features/auth/constants/signupOptions";
import { useDuplicateCheck } from "@/features/auth/hooks/useDuplicateCheck";
import { useEmailOtp } from "@/features/auth/hooks/useEmailOtp";
import { checkEmailDuplicate } from "@/features/auth/services/signupDuplicateCheck";
import type { LoginRole } from "@/features/auth/types";

const CUSTOM_DOMAIN_OPTION = "직접 입력";

interface EmailOtpFieldProps {
  emailLocalPart: string;
  emailDomain: string;
  onLocalPartChange: (value: string) => void;
  onDomainChange: (value: string) => void;
  verified: boolean;
  onVerifiedChange: (verified: boolean) => void;
  /** 후속 API 연동에서 역할별 이메일 중복 확인에 사용 */
  role: LoginRole;
}

export const EmailOtpField = ({
  emailLocalPart,
  emailDomain,
  onLocalPartChange,
  onDomainChange,
  verified,
  onVerifiedChange,
  role,
}: EmailOtpFieldProps) => {
  const [isCustomDomain, setIsCustomDomain] = useState(
    emailDomain.length > 0 && !EMAIL_DOMAIN_OPTIONS.includes(emailDomain),
  );

  const email =
    emailLocalPart && emailDomain ? `${emailLocalPart}@${emailDomain}` : "";
  const isEmailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const duplicateCheck = useDuplicateCheck((value) =>
    checkEmailDuplicate(value, role),
  );

  const otp = useEmailOtp({ email });

  useEffect(() => {
    onVerifiedChange(otp.verified);
    // 인증 완료 상태가 바뀔 때만 부모에 알리면 됨 — onVerifiedChange를 deps에 넣으면
    // 매 렌더 새로 생성되는 인라인 콜백 때문에 patch → 리렌더 → effect 재실행이 반복됨
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp.verified]);

  const handleDomainSelectChange = (value: string) => {
    if (value === CUSTOM_DOMAIN_OPTION) {
      setIsCustomDomain(true);
      onDomainChange("");
      duplicateCheck.reset();
      otp.reset();
      return;
    }

    setIsCustomDomain(false);
    onDomainChange(value);
    duplicateCheck.reset();
    otp.reset();
  };

  // 완성된 이메일에서 포커스가 빠지면 서버에 중복 여부를 확인합니다.
  const handleEmailBlur = () => {
    if (!isEmailFormatValid) return;
    void duplicateCheck.check(email);
  };

  if (verified) {
    return (
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#374151]">
          이메일 <span className="text-[#356DF3]">*</span>
        </label>
        <div className="flex h-11 items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-4 text-sm text-gray-700">
          <span>{email}</span>
          <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
            <Image
              src="/icons/CheckIcon-green.svg"
              alt=""
              width={12}
              height={12}
              aria-hidden="true"
            />
            인증 완료
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#374151]">
        이메일 <span className="text-[#356DF3]">*</span>
      </label>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={emailLocalPart}
          onChange={(e) => {
            onLocalPartChange(e.target.value);
            duplicateCheck.reset();
            otp.reset();
          }}
          onBlur={handleEmailBlur}
          placeholder="이메일 아이디"
          className="h-11 flex-1 rounded-md border border-gray-200 px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#142B4A]"
        />
        <span className="text-sm text-gray-400">@</span>
        {isCustomDomain ? (
          <input
            type="text"
            value={emailDomain}
            onChange={(e) => {
              onDomainChange(e.target.value);
              duplicateCheck.reset();
              otp.reset();
            }}
            onBlur={handleEmailBlur}
            placeholder="도메인 직접 입력"
            className="h-11 flex-1 rounded-md border border-gray-200 px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#142B4A]"
          />
        ) : (
          <select
            value={emailDomain}
            onChange={(e) => {
              handleDomainSelectChange(e.target.value);
            }}
            onBlur={handleEmailBlur}
            className="h-11 flex-1 rounded-md border border-gray-200 px-3 text-sm text-gray-900 outline-none focus:border-[#142B4A]"
          >
            <option value="" disabled>
              도메인 선택
            </option>
            {EMAIL_DOMAIN_OPTIONS.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
            <option value={CUSTOM_DOMAIN_OPTION}>{CUSTOM_DOMAIN_OPTION}</option>
          </select>
        )}
      </div>

      {email.length > 0 && !isEmailFormatValid ? (
        <p className="mt-2 text-xs text-red-500">
          이메일 형식을 확인해 주세요.
        </p>
      ) : null}
      {duplicateCheck.status === "checking" ? (
        <p className="mt-2 text-xs text-gray-400">중복 확인 중...</p>
      ) : null}
      {duplicateCheck.status === "available" ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-green-600">
          <Image
            src="/icons/CheckIcon-green.svg"
            alt=""
            width={12}
            height={12}
            aria-hidden="true"
          />
          사용 가능한 이메일입니다.
        </p>
      ) : null}
      {duplicateCheck.status === "duplicated" ? (
        <p className="mt-2 text-xs text-red-500">
          이미 사용 중인 이메일입니다.
        </p>
      ) : null}
      {duplicateCheck.status === "error" ? (
        <p className="mt-2 text-xs text-red-500">
          {duplicateCheck.errorMessage}
        </p>
      ) : null}

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={otp.handleSend}
          disabled={
            !isEmailFormatValid ||
            !duplicateCheck.isAvailable(email) ||
            otp.secondsLeft > 0 ||
            otp.isSending ||
            otp.remainingSendCount === 0
          }
          className="h-11 rounded-md border border-gray-200 px-4 text-sm font-semibold text-gray-500 transition disabled:cursor-not-allowed disabled:text-gray-300 enabled:hover:bg-gray-50"
        >
          {otp.isSending
            ? "발송 중..."
            : otp.sent
              ? "인증번호 재전송"
              : "인증번호 받기"}
        </button>

        {otp.sent ? (
          <>
            <input
              type="text"
              inputMode="numeric"
              value={otp.code}
              onChange={(e) =>
                otp.setCode(e.target.value.replace(/\D/g, ""))
              }
              maxLength={6}
              placeholder="인증번호 입력"
              className="h-11 w-32 rounded-md border border-gray-200 px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#142B4A]"
            />
            <span className="text-sm font-semibold text-[#356DF3]">
              {String(Math.floor(otp.secondsLeft / 60)).padStart(2, "0")}:
              {String(otp.secondsLeft % 60).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={otp.handleVerify}
              disabled={
                otp.code.length !== 6 ||
                otp.secondsLeft <= 0 ||
                otp.isConfirming
              }
              className="h-11 rounded-md bg-[#356DF3] px-4 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {otp.isConfirming ? "확인 중..." : "인증 확인"}
            </button>
          </>
        ) : null}
      </div>

      {otp.sent ? (
        <p className="mt-2 text-xs text-gray-400">
          {otp.secondsLeft > 0
            ? "인증번호는 표시된 시간 동안 유효합니다."
            : "인증번호가 만료되었습니다. 다시 발송해 주세요."}
        </p>
      ) : null}
      {otp.remainingSendCount !== null ? (
        <p className="mt-1 text-xs text-gray-400">
          1시간 내 남은 발송 횟수: {otp.remainingSendCount}회
        </p>
      ) : null}
      {otp.error ? (
        <p className="mt-2 text-xs text-red-500">{otp.error}</p>
      ) : null}
    </div>
  );
};
