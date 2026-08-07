// 아이디 찾기 입력 폼

"use client";

import Image from "next/image";
import Link from "next/link";

interface FindEmailFormProps {
  name: string;
  phone: string;
  isFormValid: boolean;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}

export const FindEmailForm = ({
  name,
  phone,
  isFormValid,
  onNameChange,
  onPhoneChange,
  onSubmit,
}: FindEmailFormProps) => (
  <>
    <Link
      href="/login"
      className="mb-5 flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-900"
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
      <h1 className="text-xl font-bold text-[#111827]">아이디 찾기</h1>
      <p className="mt-2 text-sm font-medium text-gray-500">
        가입 시 등록한 이름과 전화번호를 입력해 주세요.
      </p>
    </div>

    <form className="space-y-5" onSubmit={onSubmit}>
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-semibold text-[#0b1f3a]"
        >
          이름 <span className="text-blue-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="이름을 입력해 주세요."
          className="h-11 w-full rounded-md border border-gray-200 px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#0b1f3a]"
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="mb-2 block text-sm font-semibold text-[#0b1f3a]"
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
          className="h-11 w-full rounded-md border border-gray-200 px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#0b1f3a]"
        />
      </div>

      <button
        type="submit"
        disabled={!isFormValid}
        className="h-11 w-full rounded-md bg-[#0b1f3a] text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:bg-gray-300 enabled:hover:bg-[#102b50]"
      >
        아이디 찾기
      </button>
    </form>
  </>
);
