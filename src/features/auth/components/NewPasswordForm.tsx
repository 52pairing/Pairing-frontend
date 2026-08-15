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
  { key: "length", label: "8~20자", test: (v) => v.length >= 8 && v.length <= 20 },
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
  isSubmitting: boolean;
  error?: string;
  // 검증을 통과한 새 비밀번호 값을 그대로 전달 (API 호출은 부모 페이지 책임)
  onSubmit: (newPassword: string) => void;
  temporaryPassword?: boolean;
}

export const NewPasswordForm = ({
  isSubmitting,
  error,
  onSubmit,
  temporaryPassword = true,
}: NewPasswordFormProps) => {
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
    if (!isFormValid || isSubmitting) return;
    onSubmit(password);
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-theme-primary">
          새 비밀번호를 등록해 주세요.
        </h1>
        <p className="mt-2 text-sm font-medium text-theme-secondary">
          {temporaryPassword
            ? "계정 보호를 위해 기존 임시 비밀번호와 다른 새로운 비밀번호를 입력해 주세요."
            : "현재와 다른 새로운 비밀번호를 입력해 주세요."}
        </p>
      </div>

      {temporaryPassword ? (
        <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
          보안을 위해 새로운 비밀번호를 등록해야 합니다. 등록 전까지 다른 서비스에 접근할 수 없습니다.
        </div>
      ) : null}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="newPassword"
            className="mb-2 block text-sm font-semibold text-brand"
          >
            새 비밀번호 <span className="text-blue-500">*</span>
          </label>
          <div className="relative">
            <input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              value={password}
              maxLength={20}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="새 비밀번호를 입력해 주세요."
              className="h-11 w-full rounded-md border border-theme px-4 pr-12 text-sm text-theme-primary outline-none placeholder:text-theme-muted focus:border-brand"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-theme-muted hover:text-theme-secondary"
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
                    passed ? "text-green-600" : "text-theme-muted"
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
            className="mb-2 block text-sm font-semibold text-brand"
          >
            새 비밀번호 확인 <span className="text-blue-500">*</span>
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              maxLength={20}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="비밀번호를 다시 입력해 주세요."
              className="h-11 w-full rounded-md border border-theme px-4 pr-12 text-sm text-theme-primary outline-none placeholder:text-theme-muted focus:border-brand"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-theme-muted hover:text-theme-secondary"
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

        {error ? (
          <p className="text-xs font-medium text-red-500">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="h-11 w-full rounded-md bg-brand text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:bg-gray-300 enabled:hover:bg-brand"
        >
          {isSubmitting ? "등록 중..." : "새 비밀번호 등록"}
        </button>
      </form>
    </>
  );
};
