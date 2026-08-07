// 이메일 확인 결과 화면

import Image from "next/image";
import Link from "next/link";

interface FindEmailResultProps {
  // 백엔드가 마스킹까지 처리해서 내려주는 값
  maskedEmail: string;
}

export const FindEmailResult = ({ maskedEmail }: FindEmailResultProps) => (
  <>
    <div className="flex flex-col items-center text-center">
      <CheckCircleIcon />

      <h1 className="mt-5 text-lg font-bold text-[#111827]">
        입력하신 정보와 일치하는 이메일입니다.
      </h1>

      <div className="mt-6 w-full rounded-md border border-gray-200 bg-gray-50 py-3 text-center text-sm font-bold text-[#0b1f3a]">
        {maskedEmail}
      </div>

      <Link
        href="/login"
        className="mt-6 flex h-11 w-full items-center justify-center rounded-md bg-[#0b1f3a] text-sm font-bold text-white hover:bg-[#102b50]"
      >
        로그인하러 가기
      </Link>

      <Link
        href="/login/findpassword"
        className="mt-3 flex h-11 w-full items-center justify-center rounded-md border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
      >
        비밀번호 찾기
      </Link>
    </div>
  </>
);

const CheckCircleIcon = () => (
  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
    <Image
      src="/icons/EmailIcon-green.svg"
      alt="EmailIcon"
      width={36}
      height={36}
      className="h-7 w-7"
    />
  </span>
);
