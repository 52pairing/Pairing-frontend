// 새 비밀번호 등록 입력 폼

"use client";

import Image from "next/image";
import { useState } from "react";

interface PasswordRule {
  key: string;
  label: string;
  test: (value: string) => boolean;
}

// 프로젝트 공통 비밀번호 정책: 8자 이상 + 대소문자 + 숫자 + 특수문자
const PASSWORD_RULES: PasswordRule[] = [
  { key: "length", label: "8자 이상", test: (v) => v.length >= 8 },
  {
    key: "case",
    label: "영문 대문자와 소문자 포함",
    test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v),
  },
  { key: "number", label: "숫자 포함", test: (v) => /[0-9]/.test(v) },
  {
    key: "special",
    label: "특수문자 포함",
    test: (v) => /[^A-Za-z0-9]/.test(v),
  },
];

interface NewPasswordFormProps {
  onSubmit: () => void;
}

export const NewPasswordForm = ({ onSubmit }: NewPasswordFormProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isPasswordValid = PASSWORD_RULES.every((rule) => rule.test(password));
  const isConfirmTouched = confirmPassword.length > 0;
  const isConfirmMatched = isConfirmTouched && password === confirmPassword;
  const isFormValid = isPasswordValid && isConfirmMatched;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isFormValid) return;
    onSubmit();
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#111827]">
          새 비밀번호를 등록해 주세요.
        </h1>
        <p className="mt-2 text-sm font-medium text-gray-500">
          계정 보호를 위해 기존 임시 비밀번호와 다른 새로운 비밀번호를 입력해
          주세요.
        </p>
      </div>

      <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
        보안을 위해 새로운 비밀번호를 등록해야 합니다. 등록 전까지 다른 서비스에
        접근할 수 없습니다.
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="newPassword"
            className="mb-2 block text-sm font-semibold text-[#0b1f3a]"
          >
            새 비밀번호 <span className="text-blue-500">*</span>
          </label>
          <div className="relative">
            <input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="새 비밀번호를 입력해 주세요."
              className="h-11 w-full rounded-md border border-gray-200 px-4 pr-12 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#0b1f3a]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-700"
            >
              {showPassword ? "숨김" : "보기"}
            </button>
          </div>

          <ul className="mt-3 space-y-1">
            {PASSWORD_RULES.map((rule) => {
              const passed = rule.test(password);
              return (
                <li
                  key={rule.key}
                  className={`flex items-center gap-1.5 text-xs ${
                    passed ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {passed ? (
                    <Image
                      src="/icons/CheckIcon-green.svg"
                      alt=""
                      width={12}
                      height={12}
                      aria-hidden="true"
                    />
                  ) : (
                    <span className="inline-block h-3 w-3" aria-hidden="true" />
                  )}
                  {rule.label}
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-semibold text-[#0b1f3a]"
          >
            새 비밀번호 확인 <span className="text-blue-500">*</span>
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="비밀번호를 다시 입력해 주세요."
              className="h-11 w-full rounded-md border border-gray-200 px-4 pr-12 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#0b1f3a]"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-700"
            >
              {showConfirmPassword ? "숨김" : "보기"}
            </button>
          </div>

          {isConfirmTouched ? (
            isConfirmMatched ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-green-600">
                <Image
                  src="/icons/CheckIcon-green.svg"
                  alt=""
                  width={12}
                  height={12}
                  aria-hidden="true"
                />
                비밀번호가 일치합니다.
              </p>
            ) : (
              <p className="mt-2 text-xs text-red-500">
                비밀번호가 일치하지 않습니다.
              </p>
            )
          ) : null}
        </div>

        <button
          type="submit"
          disabled={!isFormValid}
          className="h-11 w-full rounded-md bg-[#0b1f3a] text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:bg-gray-300 enabled:hover:bg-[#102b50]"
        >
          새 비밀번호 등록
        </button>
      </form>
    </>
  );
};
