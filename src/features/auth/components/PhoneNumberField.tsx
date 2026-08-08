// 휴대폰번호 입력 + 디자인 확인용 중복 확인
"use client";

import Image from "next/image";
import { useState } from "react";

import type { LoginRole } from "@/features/auth/types";
import { formatPhoneNumber } from "@/features/auth/utils/formatPhoneNumber";

const PHONE_LENGTH = 13; // "010-0000-0000"

type CheckStatus = "idle" | "available";

interface PhoneNumberFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  role: LoginRole;
}

export const PhoneNumberField = ({
  label,
  value,
  onChange,
}: PhoneNumberFieldProps) => {
  const [status, setStatus] = useState<CheckStatus>("idle");

  const isFormatValid = value.length === PHONE_LENGTH;

  const handleBlur = () => {
    if (!isFormatValid) return;
    setStatus("available");
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#374151]">
        {label} <span className="text-[#356DF3]">*</span>
      </label>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          onChange(formatPhoneNumber(e.target.value));
          setStatus("idle");
        }}
        onBlur={handleBlur}
        placeholder="010-0000-0000"
        className={`h-11 w-full rounded-md border px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#142B4A] ${
          value && !isFormatValid
            ? "border-red-400"
            : "border-gray-200"
        }`}
      />
      {value && !isFormatValid ? (
        <p className="mt-2 text-xs text-red-500">
          올바른 휴대폰 번호를 입력해 주세요.
        </p>
      ) : null}
      {status === "available" ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-green-600">
          <Image
            src="/icons/CheckIcon-green.svg"
            alt=""
            width={12}
            height={12}
            aria-hidden="true"
          />
          사용 가능한 번호입니다.
        </p>
      ) : null}
    </div>
  );
};

export const isPhoneNumberValid = (value: string) =>
  value.length === PHONE_LENGTH;
