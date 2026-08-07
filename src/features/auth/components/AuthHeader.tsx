// 로그인/계정 찾기 등 인증 페이지 헤더

import Image from "next/image";
import Link from "next/link";

/** 로그인/회원가입/계정 찾기 등 인증 플로우 페이지 전용 헤더 */
export const AuthHeader = () => (
  <header className="h-[60px] border-b border-gray-200 bg-white">
    <div className="mx-auto flex h-full max-w-[1440px] items-center px-8">
      <Link href="/" aria-label="Pairing 홈">
        <Image
          src="/images/Pairing_Logo.png"
          alt="Pairing"
          width={110}
          height={32}
          priority
          className="h-8 w-auto object-contain"
        />
      </Link>
    </div>
  </header>
);
