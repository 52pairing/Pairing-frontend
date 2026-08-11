"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { DuplicateLoginModal } from "@/features/auth/components/OtherDeviceLoginModal";
import { SessionExpiredModal } from "@/features/auth/components/LoginSessionExpiredModal";
import { getCurrentUser } from "@/features/auth/services/currentUser";
import {
  AUTH_SESSION_END_EVENT,
  ApiException,
  type AuthSessionEndReason,
} from "@/lib/api";

const PROTECTED_PREFIXES = ["/client", "/freelancer", "/chat", "/notifications"];
const PASSWORD_RESET_PATH = "/login/findpassword/reset";

export function AuthSessionGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const [sessionEndReason, setSessionEndReason] =
    useState<AuthSessionEndReason | null>(null);

  useEffect(() => {
    const handleSessionEnd = (event: Event) => {
      setSessionEndReason((event as CustomEvent<AuthSessionEndReason>).detail);
    };
    window.addEventListener(AUTH_SESSION_END_EVENT, handleSessionEnd);
    return () => window.removeEventListener(AUTH_SESSION_END_EVENT, handleSessionEnd);
  }, []);

  useEffect(() => {
    if (pathname === PASSWORD_RESET_PATH) return;
    const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

    let cancelled = false;
    getCurrentUser()
      .then((user) => {
        if (cancelled) return;
        if (user.tempPassword) {
          router.replace(PASSWORD_RESET_PATH);
          return;
        }
        const rolePrefix = user.role === "CLIENT" ? "/client" : "/freelancer";
        if (
          (pathname.startsWith("/client") || pathname.startsWith("/freelancer")) &&
          !pathname.startsWith(rolePrefix)
        ) {
          router.replace(rolePrefix);
        }
      })
      .catch((error) => {
        if (cancelled) return;
        if (error instanceof ApiException && error.errorCode === "GLOBAL_011") {
          setSessionEndReason("duplicate");
        } else if (isProtected) {
          router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  const goToLogin = () => {
    setSessionEndReason(null);
    window.location.replace("/login");
  };

  return (
    <>
      <DuplicateLoginModal
        open={sessionEndReason === "duplicate"}
        onConfirm={goToLogin}
      />
      <SessionExpiredModal
        open={sessionEndReason === "expired"}
        onConfirm={goToLogin}
      />
    </>
  );
}
