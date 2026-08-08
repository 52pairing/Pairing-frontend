// 클라이언트 회원가입 기업 정보 단계에서 사용하는 입력 필드 모음
"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import {
  BUSINESS_FIELD_OPTIONS,
  EMPLOYEE_COUNT_OPTIONS,
} from "@/features/auth/constants/signupOptions";
import {
  formatBusinessRegistrationNumber,
  isValidBusinessRegistrationNumberFormat,
} from "@/features/auth/utils/formatBusinessRegistrationNumber";

type CheckStatus = "idle" | "available";

interface BusinessRegistrationNumberFieldProps {
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  onCheckedChange: (checked: boolean) => void;
}

// 사업자등록번호 입력 + 디자인 확인용 중복 확인
export const BusinessRegistrationNumberField = ({
  value,
  checked,
  onChange,
  onCheckedChange,
}: BusinessRegistrationNumberFieldProps) => {
  // 스텝을 벗어났다 돌아와도 이미 확인된 상태라면 배지가 유지되도록 초기값에 반영
  const [status, setStatus] = useState<CheckStatus>(
    checked ? "available" : "idle",
  );

  const isFormatValid = isValidBusinessRegistrationNumberFormat(value);

  const handleChange = (next: string) => {
    onChange(formatBusinessRegistrationNumber(next));
    onCheckedChange(false);
    setStatus("idle");
  };

  const handleCheck = () => {
    if (!isFormatValid) return;
    setStatus("available");
    onCheckedChange(true);
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#374151]">
        사업자등록번호 <span className="text-[#356DF3]">*</span>
      </label>

      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="숫자 10자리"
          className={`h-11 flex-1 rounded-md border px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#142B4A] ${
            "border-gray-200"
          }`}
        />
        <button
          type="button"
          onClick={handleCheck}
          disabled={!isFormatValid}
          className="h-11 shrink-0 rounded-md border border-gray-200 px-4 text-sm font-semibold text-gray-500 transition disabled:cursor-not-allowed disabled:text-gray-300 enabled:hover:bg-gray-50"
        >
          중복 확인
        </button>
      </div>

      {status === "available" ? (
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
      {!checked && value.length > 0 && isFormatValid && status === "idle" ? (
        <p className="mt-2 text-xs text-gray-400">
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
  const options = BUSINESS_FIELD_OPTIONS;

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
      <label className="mb-2 block text-sm font-semibold text-[#374151]">
        사업 분야 <span className="text-[#356DF3]">*</span>
      </label>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`h-11 w-full rounded-md border border-gray-200 px-4 text-left text-sm outline-none focus:border-[#142B4A] disabled:cursor-not-allowed disabled:text-gray-300 ${
          selectedLabel ? "text-gray-900" : "text-gray-400"
        }`}
      >
        {selectedLabel ?? "사업 분야를 선택해 주세요."}
      </button>


      {open ? (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-md">
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
                  className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                    option.code === value
                      ? "font-semibold text-[#142B4A]"
                      : "text-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              </li>
            ))}
            {filtered.length === 0 ? (
              <li className="px-4 py-2 text-sm text-gray-400">
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
  const options = EMPLOYEE_COUNT_OPTIONS;

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#374151]">
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
                  ? "border-[#142B4A] bg-[#F7F8FA] text-[#142B4A]"
                  : "border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
