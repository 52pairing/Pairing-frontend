// 로그인/계정 찾기 등 인증 페이지 헤더

import Link from "next/link";
import { ThemeLogo } from "@/features/common/theme/ThemeLogo";

/** 로그인/회원가입/계정 찾기 등 인증 플로우 페이지 전용 헤더 */
export const AuthHeader = () => (
  <header className="h-[60px] border-b border-theme bg-surface">
    <div className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-between px-8">
      <Link href="/" aria-label="Pairing 홈">
        <ThemeLogo priority />
      </Link>
    </div>
  </header>
);
