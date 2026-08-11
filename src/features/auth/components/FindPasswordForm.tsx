// 비밀번호 찾기 - 1단계 입력 폼

"use client";

import Image from "next/image";
import Link from "next/link";
import type { LoginRole } from "@/features/auth/types";

interface FindPasswordFormProps {
  role: LoginRole;
  email: string;
  name: string;
  phone: string;
  isFormValid: boolean;
  isSubmitting: boolean;
  error?: string;
  onRoleChange: (role: LoginRole) => void;
  onEmailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}

export const FindPasswordForm = ({
  role,
  email,
  name,
  phone,
  isFormValid,
  isSubmitting,
  error,
  onRoleChange,
  onEmailChange,
  onNameChange,
  onPhoneChange,
  onSubmit,
}: FindPasswordFormProps) => (
  <>
    <Link
      href="/login"
      className="mb-5 flex items-center gap-2 text-xs font-medium text-theme-secondary hover:text-theme-primary"
    >
      <Image
        src="/icons/LeftAngleBracketIcon.svg"
        alt="Pairing"
        width={32}
        height={32}
        className="h-auto w-auto"
      />
      로그인으로 돌아가기
    </Link>

    <div className="mb-6">
      <h1 className="text-xl font-bold text-theme-primary">비밀번호 찾기</h1>
      <p className="mt-2 text-sm font-medium text-theme-secondary">
        가입 시 등록한 정보를 입력해 주세요. 회원 정보가 확인되면 가입한
        이메일로 인증 링크를 보내드립니다.
      </p>
    </div>

    {/* 같은 이메일로 클라이언트/프리랜서 계정을 각각 가질 수 있어서 역할을 반드시 같이 보내야 함 */}
    <div className="mb-6 grid grid-cols-2 rounded-md border border-theme bg-surface p-1">
      <button
        type="button"
        onClick={() => onRoleChange("CLIENT")}
        className={`h-9 rounded-md text-sm font-semibold ${
          role === "CLIENT"
            ? "bg-brand text-white"
            : "text-theme-secondary hover:bg-surface-subtle"
        }`}
      >
        클라이언트
      </button>

      <button
        type="button"
        onClick={() => onRoleChange("FREELANCER")}
        className={`h-9 rounded-md text-sm font-semibold ${
          role === "FREELANCER"
            ? "bg-brand text-white"
            : "text-theme-secondary hover:bg-surface-subtle"
        }`}
      >
        프리랜서
      </button>
    </div>

    <form className="space-y-5" onSubmit={onSubmit}>
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-semibold text-brand"
        >
          이메일 <span className="text-blue-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="이메일을 입력해 주세요."
          className="h-11 w-full rounded-md border border-theme px-4 text-sm text-theme-primary outline-none placeholder:text-theme-muted focus:border-brand"
        />
      </div>

      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-semibold text-brand"
        >
          이름 <span className="text-blue-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="이름을 입력해 주세요."
          className="h-11 w-full rounded-md border border-theme px-4 text-sm text-theme-primary outline-none placeholder:text-theme-muted focus:border-brand"
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="mb-2 block text-sm font-semibold text-brand"
        >
          전화번호 <span className="text-blue-500">*</span>
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(event) => onPhoneChange(event.target.value)}
          placeholder="010-0000-0000"
          maxLength={13}
          className="h-11 w-full rounded-md border border-theme px-4 text-sm text-theme-primary outline-none placeholder:text-theme-muted focus:border-brand"
        />
      </div>

      {error ? (
        <p className="text-xs font-medium text-red-500">{error}</p>
      ) : null}

      <div className="flex gap-3">
        <Link
          href="/login"
          className="flex h-11 flex-1 items-center justify-center rounded-md border border-theme text-sm font-semibold text-gray-600 hover:bg-surface-subtle"
        >
          취소
        </Link>
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="h-11 flex-1 rounded-md bg-brand text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:bg-gray-300 enabled:hover:bg-brand"
        >
          {isSubmitting ? "요청 중..." : "인증 링크 받기"}
        </button>
      </div>
    </form>

    <p className="mt-6 text-center text-xs font-medium text-theme-muted">
      소셜 계정으로 가입한 회원은 카카오 또는 Google 로그인을 이용해 주세요.
    </p>
  </>
);
