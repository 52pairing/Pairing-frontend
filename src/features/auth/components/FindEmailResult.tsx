// 이메일 확인 결과 화면

import Image from "next/image";
import Link from "next/link";
import { FindEmailAccount } from "../types";

interface FindEmailResultProps {
  accounts: FindEmailAccount[];
}

const ROLE_LABEL: Record<FindEmailAccount["role"], string> = {
  CLIENT: "클라이언트",
  FREELANCER: "프리랜서",
};

export const FindEmailResult = ({ accounts }: FindEmailResultProps) => (
  <div className="flex flex-col items-center text-center">
    <CheckCircleIcon />

    <h1 className="mt-5 text-lg font-bold text-theme-primary">
      입력하신 정보와 일치하는 이메일입니다.
    </h1>

    <div className="mt-6 w-full space-y-2">
      {accounts.map((account) => (
        <div
          key={account.role}
          className="rounded-md border border-theme bg-surface-subtle px-4 py-3 text-left"
        >
          <p className="text-xs text-theme-muted">
            {ROLE_LABEL[account.role]} 계정
          </p>
          <p className="mt-1 text-sm font-bold text-brand">
            {account.maskedEmail}
          </p>
        </div>
      ))}
    </div>

    <Link
      href="/login"
      className="mt-6 flex h-11 w-full items-center justify-center rounded-md bg-brand text-sm font-bold text-white hover:bg-brand"
    >
      로그인하러 가기
    </Link>

    <Link
      href="/login/findpassword"
      className="mt-3 flex h-11 w-full items-center justify-center rounded-md border border-theme text-sm font-semibold text-gray-600 hover:bg-surface-subtle"
    >
      비밀번호 찾기
    </Link>
  </div>
);

const CheckCircleIcon = () => (
  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
    <Image
      src="/icons/EmailIcon-green.svg"
      alt=""
      width={36}
      height={36}
      className="h-7 w-7"
    />
  </span>
);
