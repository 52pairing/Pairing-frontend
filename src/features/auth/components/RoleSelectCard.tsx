"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { useSocialLoginStart } from "@/features/auth/hooks/useSocialLoginStart";
import type { SocialProvider } from "@/features/auth/types";

type SignupMethod = "email" | SocialProvider;

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

/** 회원가입 방법을 이메일·카카오·구글 중에서 직접 선택하는 역할 카드입니다. */
export const RoleSelectCard = ({
  href,
  title,
  description,
  icon,
  iconBgClassName,
  methods,
}: RoleSelectCardProps) => {
  const { start, loadingProvider, error } =
    useSocialLoginStart("/freelancer");

  return (
    <article className="flex w-full flex-col items-center rounded-lg border border-theme bg-surface px-8 py-10 text-center">
      <span
        className={`flex h-16 w-16 items-center justify-center rounded-full ${iconBgClassName}`}
      >
        {icon}
      </span>

      <h2 className="mt-5 text-lg font-bold text-theme-primary">{title}</h2>
      <p className="mt-2 text-sm text-theme-secondary">{description}</p>

      <div className="mt-6 flex items-center justify-center gap-4">
        {methods.map((method) =>
          method === "email" ? (
            <Link
              key={method}
              href={href}
              aria-label={`${METHOD_LABEL[method]}로 ${title} 가입`}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-brand transition hover:brightness-110"
            >
              <Image
                src="/icons/EmailIcon-white.svg"
                alt=""
                width={22}
                height={22}
                aria-hidden="true"
              />
            </Link>
          ) : (
            <button
              key={method}
              type="button"
              onClick={() => start(method)}
              disabled={loadingProvider !== null}
              aria-label={`${METHOD_LABEL[method]}로 프리랜서 가입`}
              className="flex h-12 w-12 items-center justify-center rounded-full transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Image
                src={
                  method === "kakao"
                    ? "/icons/KakaoIcon.svg"
                    : "/icons/GoogleIcon.svg"
                }
                alt=""
                width={46}
                height={46}
                aria-hidden="true"
              />
            </button>
          ),
        )}
      </div>

      <p className="mt-3 text-xs text-theme-muted">
        {loadingProvider
          ? `${METHOD_LABEL[loadingProvider]} 인증 화면으로 이동 중입니다.`
          : "가입 방법을 선택해 주세요."}
      </p>
      {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
    </article>
  );
};
