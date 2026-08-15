// 아이디 찾기 입력 폼

"use client";

import Image from "next/image";
import Link from "next/link";

interface FindEmailFormProps {
  name: string;
  phone: string;
  isFormValid: boolean;
  isSubmitting: boolean;
  error?: string;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}

export const FindEmailForm = ({
  name,
  phone,
  isFormValid,
  isSubmitting,
  error,
  onNameChange,
  onPhoneChange,
  onSubmit,
}: FindEmailFormProps) => (
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
      <h1 className="text-xl font-bold text-theme-primary">아이디 찾기</h1>
      <p className="mt-2 text-sm font-medium text-theme-secondary">
        가입 시 등록한 이름과 전화번호를 입력해 주세요.
      </p>
    </div>

    <form className="space-y-5" onSubmit={onSubmit}>
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

      <button
        type="submit"
        disabled={!isFormValid || isSubmitting}
        className="h-11 w-full rounded-md bg-brand text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:bg-gray-300 enabled:hover:bg-brand"
      >
        {isSubmitting ? "확인 중..." : "아이디 찾기"}
      </button>
    </form>
  </>
);
