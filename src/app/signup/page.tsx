// 회원가입 랜딩 · 역할 선택
import Image from "next/image";
import Link from "next/link";

import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { RoleSelectCard } from "@/features/auth/components/RoleSelectCard";

export default function SignupPage() {
  return (
    <div className="min-h-screen">
      <AuthHeader />

      <main className="flex min-h-[calc(100vh-60px)] flex-col items-center px-5 py-16">
        <div className="mb-10 text-center">
          <h1 className="text-xl font-bold text-theme-primary">
            어떤 유형으로 가입하시겠어요?
          </h1>
          <p className="mt-2 text-sm font-medium text-theme-secondary">
            가입 유형에 따라 이용할 수 있는 서비스가 달라집니다.
          </p>
        </div>

        <div className="grid w-full max-w-[720px] gap-5 sm:grid-cols-2">
          <RoleSelectCard
            href="/signup/client"
            title="클라이언트"
            description="프로젝트를 등록하고 개발자를 찾는 회원"
            icon={
              <Image
                src="/icons/ClientIcon.svg"
                alt=""
                width={28}
                height={28}
                aria-hidden="true"
              />
            }
            iconBgClassName="bg-surface-muted"
            methods={["email"]}
          />

          <RoleSelectCard
            href="/signup/freelancer"
            title="프리랜서"
            description="프로젝트를 찾고 참여하는 개인 회원"
            icon={
              <Image
                src="/icons/FreelanerIcon.svg"
                alt=""
                width={28}
                height={28}
                aria-hidden="true"
              />
            }
            iconBgClassName="bg-[#F0F4FF]"
            methods={["email", "kakao", "google"]}
          />
        </div>

        <p className="mt-8 text-center text-xs font-medium text-theme-secondary">
          이미 회원이신가요?{" "}
          <Link href="/login" className="font-bold text-brand">
            로그인
          </Link>
        </p>
      </main>
    </div>
  );
}
