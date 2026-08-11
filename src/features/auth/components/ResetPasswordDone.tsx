// 비밀번호 찾기 - 인증 확인 완료 (임시 비밀번호는 메일로만 발송됨)

import Image from "next/image";
import Link from "next/link";

export const ResetPasswordDone = () => (
  <div className="flex flex-col items-center text-center">
    <Image src="/icons/CheckIcon-green.svg" alt="" width={24} height={24} />

    <h1 className="mt-5 text-lg font-bold text-theme-primary">
      임시 비밀번호를 메일로 보냈습니다.
    </h1>
    <p className="mt-2 text-sm font-medium text-theme-secondary">
      메일함에서 임시 비밀번호를 확인하고 로그인해 주세요.
    </p>

    <Link
      href="/login"
      className="mt-6 flex h-11 w-full items-center justify-center rounded-md bg-brand text-sm font-bold text-white hover:bg-brand"
    >
      로그인하러 가기
    </Link>
  </div>
);
