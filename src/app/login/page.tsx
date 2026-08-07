"use client";

import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { DuplicateLoginModal } from "@/features/auth/components/OtherDeviceLoginModal";
import { SessionExpiredModal } from "@/features/auth/components/LoginSessionExpiredModal";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type LoginRole = "client" | "freelancer";

export default function LoginPage() {
  const [role, setRole] = useState<LoginRole>("client");
  const [showPassword, setShowPassword] = useState(false);

  // TODO: 모달 확인용 임시 상태 — 확인 끝나면 아래 두 줄과 테스트 버튼, 모달 렌더링 부분을 지워주세요.
  const [showDuplicateLogin, setShowDuplicateLogin] = useState(false);
  const [showSessionExpired, setShowSessionExpired] = useState(false);

  return (
    <div className="min-h-screen">
      {/* TODO: 모달 확인용 임시 버튼 */}
      <div className="fixed top-4 right-4 z-40 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setShowDuplicateLogin(true)}
          className="rounded-md bg-[#0b1f3a] px-3 py-2 text-xs font-semibold text-white shadow"
        >
          중복 로그인 모달
        </button>
        <button
          type="button"
          onClick={() => setShowSessionExpired(true)}
          className="rounded-md bg-[#0b1f3a] px-3 py-2 text-xs font-semibold text-white shadow"
        >
          세션 만료 모달
        </button>
      </div>

      <DuplicateLoginModal
        open={showDuplicateLogin}
        onConfirm={() => setShowDuplicateLogin(false)}
      />
      <SessionExpiredModal
        open={showSessionExpired}
        onConfirm={() => setShowSessionExpired(false)}
      />

      <AuthHeader />

      {/* 아이디 찾기 */}
      <main className="flex min-h-[calc(100vh-60px)] items-center justify-center px-5 py-16">
        <section className="w-full max-w-[440px] rounded-lg border border-gray-200 bg-white px-8 py-9 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-[#111827]">로그인</h1>

            <p className="mt-2 text-sm font-medium text-gray-500">
              서비스 이용을 위해 로그인해 주세요.
            </p>
          </div>

          {/* 사용자 유형 선택 탭 */}
          <div className="mb-6 grid grid-cols-2 rounded-md border border-gray-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setRole("client")}
              className={`h-9 rounded-md text-sm font-semibold ${
                role === "client"
                  ? "bg-[#0b1f3a] text-white"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              클라이언트
            </button>

            <button
              type="button"
              onClick={() => setRole("freelancer")}
              className={`h-9 rounded-md text-sm font-semibold ${
                role === "freelancer"
                  ? "bg-[#0b1f3a] text-white"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              프리랜서
            </button>
          </div>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
            }}
          >
            {/* 이메일 */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[#0b1f3a]"
              >
                이메일 <span className="text-blue-500">*</span>
              </label>

              <input
                id="email"
                type="email"
                placeholder="이메일 주소를 입력해 주세요."
                className="h-11 w-full rounded-md border border-gray-200 px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#0b1f3a]"
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-[#0b1f3a]"
              >
                비밀번호 <span className="text-blue-500">*</span>
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호를 입력해 주세요."
                  className="h-11 w-full rounded-md border border-gray-200 px-4 pr-12 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#0b1f3a]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-700"
                >
                  {showPassword ? "숨김" : "보기"}
                </button>
              </div>
            </div>

            {/* 계정 정보 찾기 */}
            <div className="flex justify-end gap-3 text-xs font-medium text-gray-500">
              <Link href="/login/findemail" className="hover:text-gray-900">
                아이디 찾기
              </Link>

              <span className="text-gray-300">|</span>

              <Link href="/login/findpassword" className="hover:text-gray-900">
                비밀번호 찾기
              </Link>
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              className="h-11 w-full rounded-md bg-[#0b1f3a] text-sm font-bold text-white hover:bg-[#102b50]"
            >
              {role === "client" ? "클라이언트 로그인" : "프리랜서 로그인"}
            </button>
          </form>

          {/* 프리랜서만 소셜 로그인 노출 */}
          {role === "freelancer" ? (
            <>
              <div className="mt-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200" />

                <span className="text-xs font-medium text-gray-400">
                  또는 소셜 계정으로 로그인
                </span>

                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <div className="mt-4 flex justify-center gap-4">
                <button
                  type="button"
                  aria-label="카카오 로그인"
                  className="flex h-11 w-11 items-center justify-center rounded-full hover:brightness-95"
                >
                  <Image
                    src="/icons/KakaoIcon.svg"
                    alt=""
                    width={46}
                    height={46}
                    aria-hidden="true"
                  />
                </button>

                <button
                  type="button"
                  aria-label="구글 로그인"
                  className="flex h-11 w-11 items-center justify-center rounded-full hover:brightness-95"
                >
                  <Image
                    src="/icons/GoogleIcon.svg"
                    alt=""
                    width={46}
                    height={46}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </>
          ) : null}

          {/* 회원가입 */}
          <p className="mt-6 text-center text-xs font-medium text-gray-500">
            아직 회원이 아니신가요?{" "}
            <Link href="/signup" className="font-bold text-[#0b1f3a]">
              회원가입
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
