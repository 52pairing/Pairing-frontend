"use client";

import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { AccountLockedAlert } from "@/features/auth/components/AccountLockedAlert";
import { LoginRestrictedAlert } from "@/features/auth/components/LoginRestrictedAlert";
import { UnlockAccountModal } from "@/features/auth/components/UnlockAccountModal";
import { useSocialLoginStart } from "@/features/auth/hooks/useSocialLoginStart";
import { login } from "@/features/auth/services/login";
import { LoginRole } from "@/features/auth/types";
import { useToast } from "@/features/common/hooks/useToast";
import { ApiException } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type LoginAlert =
  | { type: "locked" }
  | { type: "restricted"; message: string }
  | null;

// 로그인 후 이동할 역할별 기본 페이지. returnUrl이 없을 때만 사용.
const ROLE_HOME_PATH: Record<LoginRole, string> = {
  CLIENT: "/client",
  FREELANCER: "/freelancer",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const toast = useToast();

  useEffect(() => {
    if (searchParams.get("passwordChanged") === "true") {
      toast.success("비밀번호가 변경되었습니다. 새 비밀번호로 다시 로그인해 주세요.");
    }
  }, [searchParams, toast]);

  const [role, setRole] = useState<LoginRole>("CLIENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [alert, setAlert] = useState<LoginAlert>(null);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const {
    start: startSocialLogin,
    loadingProvider: socialLoadingProvider,
    error: socialError,
  } = useSocialLoginStart(returnUrl);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFormError("");
    setAlert(null);

    try {
      const result = await login({ email, password, role });

      if (result.tempPassword) {
        router.push("/login/findpassword/reset");
        return;
      }

      router.push(returnUrl || ROLE_HOME_PATH[role]);
    } catch (error) {
      if (error instanceof ApiException) {
        if (error.errorCode === "AU_002") {
          setAlert({ type: "locked" });
        } else if (error.errorCode === "AU_014") {
          setAlert({ type: "restricted", message: error.message });
        } else {
          setFormError(error.message);
        }
      } else {
        setFormError(
          "로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <AuthHeader />

      <main className="flex min-h-[calc(100vh-60px)] items-center justify-center px-5 py-16">
        <section className="w-full max-w-[440px] rounded-lg border border-theme bg-surface px-8 py-9 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-theme-primary">로그인</h1>
            <p className="mt-2 text-sm font-medium text-theme-secondary">
              서비스 이용을 위해 로그인해 주세요.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-md border border-theme bg-surface p-1">
            <button
              type="button"
              onClick={() => setRole("CLIENT")}
              className={`h-9 rounded-md text-sm font-semibold ${
                role === "CLIENT"
                  ? "bg-brand text-white"
                  : "text-theme-secondary hover:bg-surface-subtle"
              }`}
            >
              클라이언트
            </button>

            <button
              type="button"
              onClick={() => setRole("FREELANCER")}
              className={`h-9 rounded-md text-sm font-semibold ${
                role === "FREELANCER"
                  ? "bg-brand text-white"
                  : "text-theme-secondary hover:bg-surface-subtle"
              }`}
            >
              프리랜서
            </button>
          </div>

          {alert?.type === "locked" ? (
            <AccountLockedAlert
              onVerifyEmail={() => setUnlockModalOpen(true)}
            />
          ) : null}

          {alert?.type === "restricted" ? (
            <LoginRestrictedAlert message={alert.message} />
          ) : null}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-brand"
              >
                이메일 <span className="text-blue-500">*</span>
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="이메일 주소를 입력해 주세요."
                className="h-11 w-full rounded-md border border-theme px-4 text-sm text-theme-primary outline-none placeholder:text-theme-muted focus:border-brand"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-brand"
              >
                비밀번호 <span className="text-blue-500">*</span>
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="비밀번호를 입력해 주세요."
                  className="h-11 w-full rounded-md border border-theme px-4 pr-12 text-sm text-theme-primary outline-none placeholder:text-theme-muted focus:border-brand"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-theme-muted hover:text-theme-secondary"
                >
                  {showPassword ? "숨김" : "보기"}
                </button>
              </div>
            </div>

            {formError ? (
              <p className="text-xs font-medium text-red-500">{formError}</p>
            ) : null}

            <div className="flex justify-end gap-3 text-xs font-medium text-theme-secondary">
              <Link href="/login/findemail" className="hover:text-theme-primary">
                아이디 찾기
              </Link>

              <span className="text-theme-muted">|</span>

              <Link href="/login/findpassword" className="hover:text-theme-primary">
                비밀번호 찾기
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full rounded-md bg-brand text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:bg-gray-300 enabled:hover:bg-brand"
            >
              {isSubmitting
                ? "로그인 중..."
                : role === "CLIENT"
                  ? "클라이언트 로그인"
                  : "프리랜서 로그인"}
            </button>
          </form>

          {role === "FREELANCER" ? (
            <>
              <div className="mt-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs font-medium text-theme-muted">
                  또는 소셜 계정으로 로그인
                </span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <div className="mt-4 flex justify-center gap-4">
                <button
                  type="button"
                  aria-label="카카오 로그인"
                  onClick={() => startSocialLogin("kakao")}
                  disabled={socialLoadingProvider !== null}
                  className="flex h-11 w-11 items-center justify-center rounded-full hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
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
                  onClick={() => startSocialLogin("google")}
                  disabled={socialLoadingProvider !== null}
                  className="flex h-11 w-11 items-center justify-center rounded-full hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
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
              {socialLoadingProvider ? (
                <p className="mt-3 text-center text-xs text-theme-muted">
                  {socialLoadingProvider === "kakao" ? "카카오" : "구글"}
                  로그인 페이지로 이동 중입니다.
                </p>
              ) : null}
              {socialError ? (
                <p className="mt-3 text-center text-xs text-red-500">
                  {socialError}
                </p>
              ) : null}
            </>
          ) : null}

          <p className="mt-6 text-center text-xs font-medium text-theme-secondary">
            아직 회원이 아니신가요?{" "}
            <Link href="/signup" className="font-bold text-brand">
              회원가입
            </Link>
          </p>
        </section>
      </main>

      <UnlockAccountModal
        open={unlockModalOpen}
        email={email}
        role={role}
        onClose={() => setUnlockModalOpen(false)}
        onUnlocked={() => {
          setUnlockModalOpen(false);
          setAlert(null);
          toast.success("계정 잠금이 해제되었습니다. 다시 로그인해 주세요.");
        }}
      />
    </div>
  );
}
