// 비밀번호 찾기 - 잘못된 접근(토큰 없음) 또는 링크 만료(AU_027) 공통 화면

import Link from "next/link";

interface ResetPasswordInvalidProps {
  message: string;
}

export const ResetPasswordInvalid = ({
  message,
}: ResetPasswordInvalidProps) => (
  <div className="flex flex-col items-center text-center">
    <h1 className="text-lg font-bold text-[#111827]">
      링크를 사용할 수 없습니다.
    </h1>
    <p className="mt-2 text-sm font-medium text-gray-500">{message}</p>

    <Link
      href="/login/findpassword"
      className="mt-6 flex h-11 w-full items-center justify-center rounded-md bg-[#0b1f3a] text-sm font-bold text-white hover:bg-[#102b50]"
    >
      비밀번호 찾기 다시 시도하기
    </Link>
  </div>
);
