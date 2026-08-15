// 클라이언트 회원가입 기업 정보 단계에서 사용하는 입력 필드 모음
"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { useDuplicateCheck } from "@/features/auth/hooks/useDuplicateCheck";
import { useSignupOptions } from "@/features/auth/hooks/useSignupOptions";
import { checkBusinessNoDuplicate } from "@/features/auth/services/signupDuplicateCheck";
import {
  getBusinessFields,
  getEmployeeCounts,
} from "@/features/auth/services/signupMeta";
import {
  formatBusinessRegistrationNumber,
  isValidBusinessRegistrationNumberFormat,
} from "@/features/auth/utils/formatBusinessRegistrationNumber";

interface BusinessRegistrationNumberFieldProps {
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  onCheckedChange: (checked: boolean) => void;
}

// 사업자등록번호 입력 + 서버 중복 확인
export const BusinessRegistrationNumberField = ({
  value,
  checked,
  onChange,
  onCheckedChange,
}: BusinessRegistrationNumberFieldProps) => {
  const duplicateCheck = useDuplicateCheck(
    checkBusinessNoDuplicate,
    checked ? value : undefined,
  );

  const isFormatValid = isValidBusinessRegistrationNumberFormat(value);

  const handleChange = (next: string) => {
    onChange(formatBusinessRegistrationNumber(next));
    onCheckedChange(false);
    duplicateCheck.reset();
  };

  const handleCheck = async () => {
    if (!isFormatValid) return;
    onCheckedChange(await duplicateCheck.check(value));
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-theme-secondary">
        사업자등록번호 <span className="text-[#356DF3]">*</span>
      </label>

      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="숫자 10자리"
          className={`h-11 flex-1 rounded-md border px-4 text-sm text-theme-primary outline-none placeholder:text-theme-muted focus:border-brand ${
            "border-theme"
          }`}
        />
        <button
          type="button"
          onClick={handleCheck}
          disabled={!isFormatValid || duplicateCheck.status === "checking"}
          className="h-11 shrink-0 rounded-md border border-theme px-4 text-sm font-semibold text-theme-secondary transition disabled:cursor-not-allowed disabled:text-theme-muted enabled:hover:bg-surface-subtle"
        >
          {duplicateCheck.status === "checking" ? "확인 중..." : "중복 확인"}
        </button>
      </div>

      {duplicateCheck.status === "available" ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-green-600">
          <Image
            src="/icons/CheckIcon-green.svg"
            alt=""
            width={12}
            height={12}
            aria-hidden="true"
          />
          사용 가능한 사업자등록번호입니다.
        </p>
      ) : null}
      {duplicateCheck.status === "duplicated" ? (
        <p className="mt-2 text-xs text-red-500">
          이미 사용 중인 사업자등록번호입니다.
        </p>
      ) : null}
      {duplicateCheck.status === "error" ? (
        <p className="mt-2 text-xs text-red-500">
          {duplicateCheck.errorMessage}
        </p>
      ) : null}
      {!checked &&
      value.length > 0 &&
      isFormatValid &&
      duplicateCheck.status === "idle" ? (
        <p className="mt-2 text-xs text-theme-muted">
          중복 확인을 눌러 사용 가능 여부를 확인해 주세요.
        </p>
      ) : null}
    </div>
  );
};

interface BusinessFieldSelectProps {
  value: string;
  onChange: (value: string) => void;
}

// 사업 분야 선택 (검색 가능한 콤보박스)
export const BusinessFieldSelect = ({
  value,
  onChange,
}: BusinessFieldSelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { options, isLoading, isError, retry } =
    useSignupOptions(getBusinessFields);

  const selectedLabel = options.find((option) => option.code === value)?.label;

  const filtered = useMemo(
    () =>
      options.filter((option) =>
        option.label.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [options, search],
  );

  const handleSelect = (optionCode: string) => {
    onChange(optionCode);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="relative">
      <label className="mb-2 block text-sm font-semibold text-theme-secondary">
        사업 분야 <span className="text-[#356DF3]">*</span>
      </label>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={isLoading || isError}
        className={`h-11 w-full rounded-md border border-theme px-4 text-left text-sm outline-none focus:border-brand disabled:cursor-not-allowed disabled:text-theme-muted ${
          selectedLabel ? "text-theme-primary" : "text-theme-muted"
        }`}
      >
        {isLoading
          ? "사업 분야를 불러오는 중..."
          : selectedLabel ?? "사업 분야를 선택해 주세요."}
      </button>

      {isError ? (
        <LoadError message="사업 분야를 불러오지 못했습니다." onRetry={retry} />
      ) : null}
      {open ? (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-theme bg-surface shadow-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="검색..."
            className="w-full border-b border-gray-100 px-4 py-2 text-sm outline-none"
          />
          <ul className="max-h-60 overflow-y-auto py-1">
            {filtered.map((option) => (
              <li key={option.code}>
                <button
                  type="button"
                  onClick={() => handleSelect(option.code)}
                  className={`block w-full px-4 py-2 text-left text-sm hover:bg-surface-subtle ${
                    option.code === value
                      ? "font-semibold text-[#142B4A]"
                      : "text-theme-secondary"
                  }`}
                >
                  {option.label}
                </button>
              </li>
            ))}
            {filtered.length === 0 ? (
              <li className="px-4 py-2 text-sm text-theme-muted">
                검색 결과가 없습니다.
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

interface EmployeeCountSelectProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

// 직원 수 선택 (pill 버튼 — client/projects의
// SelectButton 패턴을 auth 도메인 안에 동일하게 복제. 색상 토큰이 달라 cross-domain import는 하지 않음)
export const EmployeeCountSelect = ({
  value,
  onChange,
}: EmployeeCountSelectProps) => {
  const { options, isLoading, isError, retry } =
    useSignupOptions(getEmployeeCounts);

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-theme-secondary">
        직원 수 <span className="text-[#356DF3]">*</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option.code;

          return (
            <button
              key={option.code}
              type="button"
              onClick={() => onChange(option.code)}
              className={`h-10 rounded-md border px-4 text-sm font-semibold transition ${
                selected
                  ? "border-brand bg-surface-subtle text-[#142B4A]"
                  : "border-theme text-theme-secondary hover:bg-surface-subtle"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {isLoading ? (
        <p className="mt-2 text-xs text-theme-muted">직원 수를 불러오는 중...</p>
      ) : null}
      {isError ? (
        <LoadError message="직원 수를 불러오지 못했습니다." onRetry={retry} />
      ) : null}
    </div>
  );
};

// 목록을 불러오지 못했을 때 보여주는 간단한 재시도 UI입니다.
function LoadError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="mt-2 flex items-center gap-2 text-xs text-red-500">
      <span>{message}</span>
      <button type="button" onClick={onRetry} className="font-semibold underline">
        다시 시도
      </button>
    </div>
  );
}
