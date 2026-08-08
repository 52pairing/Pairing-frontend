import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type SignupMethod = "email" | "kakao" | "google";

interface RoleSelectCardProps {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  iconBgClassName: string;
  methods: SignupMethod[];
}

const METHOD_LABEL: Record<SignupMethod, string> = {
  email: "이메일",
  kakao: "카카오",
  google: "구글",
};

/** 회원가입 랜딩의 역할 선택 카드 (클릭 시 해당 역할의 첫 스텝으로 이동) */
export const RoleSelectCard = ({
  href,
  title,
  description,
  icon,
  iconBgClassName,
  methods,
}: RoleSelectCardProps) => (
  <Link
    href={href}
    className="flex w-full flex-col items-center rounded-lg border border-gray-200 bg-white px-8 py-10 text-center transition hover:border-[#356DF3] hover:shadow-sm"
  >
    <span
      className={`flex h-16 w-16 items-center justify-center rounded-full ${iconBgClassName}`}
    >
      {icon}
    </span>

    <h2 className="mt-5 text-lg font-bold text-[#111827]">{title}</h2>
    <p className="mt-2 text-sm text-gray-500">{description}</p>

    <div className="mt-6 flex items-center gap-3">
      {methods.map((method) => (
        <span
          key={method}
          className="flex items-center justify-center"
          aria-label={`${METHOD_LABEL[method]} 가입`}
        >
          {method === "kakao" ? (
            <Image
              src="/icons/KakaoIcon.svg"
              alt=""
              width={32}
              height={32}
              aria-hidden="true"
            />
          ) : method === "google" ? (
            <Image
              src="/icons/GoogleIcon.svg"
              alt=""
              width={32}
              height={32}
              aria-hidden="true"
            />
          ) : (
            // 이메일만 공통 남색(#142B4A) 원형 배경 위에 기존 이메일 아이콘 사용
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#142B4A]">
              <Image
                src="/icons/EmailIcon-white.svg"
                alt=""
                width={18}
                height={18}
                aria-hidden="true"
              />
            </span>
          )}
        </span>
      ))}
    </div>
  </Link>
);
