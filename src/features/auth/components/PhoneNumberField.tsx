// 휴대폰번호 입력 + 역할별 서버 중복 확인
"use client";

import Image from "next/image";
import { useRef } from "react";

import { useDuplicateCheck } from "@/features/auth/hooks/useDuplicateCheck";
import { checkPhoneDuplicate } from "@/features/auth/services/signupDuplicateCheck";
import type { LoginRole } from "@/features/auth/types";
import { formatPhoneNumber } from "@/features/auth/utils/formatPhoneNumber";

const PHONE_LENGTH = 13; // "010-0000-0000"

interface PhoneNumberFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  role: LoginRole;
}

export const PhoneNumberField = ({
  label,
  value,
  onChange,
  checked,
  onCheckedChange,
  role,
}: PhoneNumberFieldProps) => {
  const duplicateCheck = useDuplicateCheck(
    (phone) => checkPhoneDuplicate(phone, role),
    checked ? value : undefined,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const isFormatValid = value.length === PHONE_LENGTH;

  const handleBlur = async () => {
    if (!isFormatValid) return;
    onCheckedChange(await duplicateCheck.check(value));
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-theme-secondary">
        {label} <span className="text-[#356DF3]">*</span>
      </label>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          const input = e.target;
          const cursor = input.selectionStart ?? input.value.length;
          const digitsBeforeCursor = input.value
            .slice(0, cursor)
            .replace(/\D/g, "").length;
          const formatted = formatPhoneNumber(input.value);

          // 자동 하이픈이 추가·제거되며 캐럿이 끝으로 밀려나 번호가 좌우로 튀는 것을
          // 막기 위해, 입력하던 숫자 기준 위치로 캐럿을 직접 복원한다.
          input.value = formatted;
          let digitsSeen = 0;
          let newPosition = formatted.length;
          for (let i = 0; i < formatted.length; i++) {
            if (digitsSeen === digitsBeforeCursor) {
              newPosition = i;
              break;
            }
            if (/\d/.test(formatted[i])) digitsSeen++;
          }
          input.setSelectionRange(newPosition, newPosition);

          onChange(formatted);
          onCheckedChange(false);
          duplicateCheck.reset();
        }}
        onBlur={handleBlur}
        placeholder="010-0000-0000"
        className={`h-11 w-full rounded-md border px-4 text-sm text-theme-primary outline-none placeholder:text-theme-muted focus:border-brand ${
          value && !isFormatValid
            ? "border-red-400"
            : "border-theme"
        }`}
      />
      {value && !isFormatValid ? (
        <p className="mt-2 text-xs text-red-500">
          올바른 휴대폰 번호를 입력해 주세요.
        </p>
      ) : null}
      {duplicateCheck.status === "checking" ? (
        <p className="mt-2 text-xs text-theme-muted">중복 확인 중...</p>
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
          사용 가능한 번호입니다.
        </p>
      ) : null}
      {duplicateCheck.status === "duplicated" ? (
        <p className="mt-2 text-xs text-red-500">
          이미 사용 중인 휴대폰 번호입니다.
        </p>
      ) : null}
      {duplicateCheck.status === "error" ? (
        <p className="mt-2 text-xs text-red-500">
          {duplicateCheck.errorMessage}
        </p>
      ) : null}
    </div>
  );
};

export const isPhoneNumberValid = (value: string) =>
  value.length === PHONE_LENGTH;
