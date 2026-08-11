// 새 비밀번호 등록 완료 화면

import Image from "next/image";
import Link from "next/link";

export const NewPasswordDone = () => (
  <div className="flex flex-col items-center text-center">
    <Image src="/icons/CheckIcon-green.svg" alt="" width={24} height={24} />

    <h1 className="mt-5 text-lg font-bold text-theme-primary">
      새 비밀번호가 등록되었습니다.
    </h1>
    <p className="mt-2 text-sm font-medium text-theme-secondary">
      변경한 비밀번호로 다시 로그인해 주세요.
    </p>

    <Link
      href="/login"
      className="mt-6 flex h-11 w-full items-center justify-center rounded-md bg-brand text-sm font-bold text-white hover:bg-brand"
    >
      로그인하러 가기
    </Link>
  </div>
);
