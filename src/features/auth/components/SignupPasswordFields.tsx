// 회원가입 비밀번호/확인 공용 필드. 비밀번호 찾기의 NewPasswordForm과 인터랙션은
// 같지만 규칙(SIGNUP_PASSWORD_RULES, 상한 20자 포함 5항목)이 달라 별도 컴포넌트로 둡니다.
"use client";

import Image from "next/image";
import { useState } from "react";

import { SIGNUP_PASSWORD_RULES } from "@/features/auth/constants/signupPolicy";

interface SignupPasswordFieldsProps {
  password: string;
  confirmPassword: string;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
}

export const SignupPasswordFields = ({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
}: SignupPasswordFieldsProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isConfirmTouched = confirmPassword.length > 0;
  const isConfirmMatched = isConfirmTouched && password === confirmPassword;

  return (
    <>
      <div>
        <label
          htmlFor="signupPassword"
          className="mb-2 block text-sm font-semibold text-[#374151]"
        >
          비밀번호 <span className="text-[#356DF3]">*</span>
        </label>

        <div className="relative">
          <input
            id="signupPassword"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="비밀번호를 입력해 주세요."
            className="h-11 w-full rounded-md border border-gray-200 px-4 pr-12 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#142B4A]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-700"
          >
            {showPassword ? "숨김" : "보기"}
          </button>
        </div>

        <ul className="mt-3 grid grid-cols-2 gap-1">
          {SIGNUP_PASSWORD_RULES.map((rule) => {
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
          htmlFor="signupConfirmPassword"
          className="mb-2 block text-sm font-semibold text-[#374151]"
        >
          비밀번호 확인 <span className="text-[#356DF3]">*</span>
        </label>

        <div className="relative">
          <input
            id="signupConfirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            placeholder="비밀번호를 다시 입력해 주세요."
            className="h-11 w-full rounded-md border border-gray-200 px-4 pr-12 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#142B4A]"
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
    </>
  );
};

export const isSignupPasswordValid = (
  password: string,
  confirmPassword: string,
) =>
  SIGNUP_PASSWORD_RULES.every((rule) => rule.test(password)) &&
  password.length > 0 &&
  password === confirmPassword;
