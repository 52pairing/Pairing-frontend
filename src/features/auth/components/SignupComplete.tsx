import Image from "next/image";
import Link from "next/link";

interface SignupCompleteProps {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}

/** 회원가입 완료 화면 (역할별로 문구/링크만 다르게 주입) */
export const SignupComplete = ({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: SignupCompleteProps) => (
  <div className="flex flex-col items-center text-center">
    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ECFDF3]">
      <Image
        src="/icons/CheckIcon-green.svg"
        alt=""
        width={24}
        height={24}
        aria-hidden="true"
      />
    </span>

    <h1 className="mt-5 text-lg font-bold text-[#111827]">{title}</h1>
    <p className="mt-2 text-sm font-medium text-gray-500">{description}</p>

    <div className="mt-8 flex w-full flex-col gap-3">
      <Link
        href={primaryHref}
        className="flex h-11 w-full items-center justify-center rounded-md bg-[#142B4A] text-sm font-bold text-white hover:bg-[#0f2138]"
      >
        {primaryLabel}
      </Link>
      <Link
        href={secondaryHref}
        className="flex h-11 w-full items-center justify-center rounded-md border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
      >
        {secondaryLabel}
      </Link>
    </div>
  </div>
);
