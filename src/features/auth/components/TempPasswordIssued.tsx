// 인증 완료 + 임시 비밀번호 발급 화면

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface TempPasswordIssuedProps {
  /** 백엔드가 발급한 임시 비밀번호. 지금은 화면 확인용 임시값입니다. */
  tempPassword: string;
}

export const TempPasswordIssued = ({
  tempPassword,
}: TempPasswordIssuedProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center text-center">
      <Image src="/icons/CheckIcon-green.svg" alt="" width={24} height={24} />

      <h1 className="mt-5 text-lg font-bold text-[#111827]">
        본인 인증이 완료되었습니다.
      </h1>
      <p className="mt-2 text-sm font-medium text-gray-500">
        임시 비밀번호가 발급되었습니다. 임시 비밀번호로 로그인한 후 새로운
        비밀번호를 등록해 주세요.
      </p>

      <div className="mt-6 flex w-full items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
        <div className="text-left">
          <p className="text-xs text-gray-400">임시 비밀번호</p>
          <p className="mt-1 text-sm font-bold text-[#0b1f3a]">
            {tempPassword}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="text-xs font-semibold text-gray-500 hover:text-gray-900"
        >
          {copied ? "복사됨" : "복사"}
        </button>
      </div>

      <div className="mt-4 w-full rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-left text-xs font-medium text-amber-700">
        임시 비밀번호는 새 비밀번호 등록 전까지만 사용할 수 있습니다.
        <br />
        임시 비밀번호로 로그인하면 새 비밀번호 등록 화면으로 이동합니다.
      </div>

      <Link
        href="/login"
        className="mt-6 flex h-11 w-full items-center justify-center rounded-md bg-[#0b1f3a] text-sm font-bold text-white hover:bg-[#102b50]"
      >
        로그인하러 가기
      </Link>

      {/* 테스트용: 실제로는 임시 비밀번호로 로그인 성공 시 백엔드가 재설정 필요 플래그를 내려줘야 이 화면으로 옵니다 */}
      <Link
        href="/login/findpassword/reset"
        className="mt-3 text-xs font-medium text-gray-400 underline hover:text-gray-600"
      >
        (테스트) 새 비밀번호 등록 화면 보기
      </Link>
    </div>
  );
};
