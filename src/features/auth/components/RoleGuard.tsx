"use client";

import { redirect, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { getCurrentUser } from "@/features/auth/services/currentUser";
import type { LoginRole } from "@/features/auth/types";
import { ApiException } from "@/lib/api";

interface RoleGuardProps {
  children: ReactNode;
}

type Outcome = "allowed" | "forbidden" | "login" | "error";

// 특정 경로(pathname)에 대해 확정된 접근 판단
interface Resolved {
  path: string;
  outcome: Outcome;
}

const getRequiredRole = (pathname: string): LoginRole | null => {
  if (pathname === "/client" || pathname.startsWith("/client/")) {
    return "CLIENT";
  }

  if (pathname === "/freelancer" || pathname.startsWith("/freelancer/")) {
    return "FREELANCER";
  }

  return null;
};

export function RoleGuard({ children }: RoleGuardProps) {
  const pathname = usePathname();
  const requiredRole = getRequiredRole(pathname);
  const [resolved, setResolved] = useState<Resolved | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!requiredRole) return;

    let cancelled = false;

    getCurrentUser()
      .then((user) => {
        if (cancelled) return;

        setResolved({
          path: pathname,
          outcome: user.role === requiredRole ? "allowed" : "forbidden",
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;

        if (error instanceof ApiException && error.status === 401) {
          setResolved({ path: pathname, outcome: "login" });
          return;
        }

        setResolved({ path: pathname, outcome: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, requiredRole, retryCount]);

  const retry = useCallback(() => {
    setResolved(null);
    setRetryCount((count) => count + 1);
  }, []);

  if (!requiredRole) {
    return children;
  }

  // 경로 전환 직후 이전 경로의 판단이 남아 있을 수 있으므로,
  // 현재 경로에 대해 확정된 판단만 신뢰한다. 그 외에는 확인 중으로 취급한다.
  const outcome = resolved?.path === pathname ? resolved.outcome : null;

  // 리다이렉트는 effect가 아니라 렌더 시점에서 next/navigation의 redirect로 처리한다.
  // 소프트 내비게이션 중에도 라우터 트랜지션에 묻히지 않고 확정적으로 이동한다.
  if (outcome === "forbidden") {
    redirect("/forbidden");
  }

  if (outcome === "login") {
    redirect(`/login?returnUrl=${encodeURIComponent(pathname)}`);
  }

  if (outcome === "error") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-4 text-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            로그인 정보를 확인할 수 없습니다
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            잠시 후 다시 시도해 주세요.
          </p>
        </div>

        <button
          type="button"
          onClick={retry}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          다시 시도
        </button>
      </main>
    );
  }

  if (outcome === "allowed") {
    return children;
  }

  return (
    <div
      role="status"
      className="flex min-h-screen items-center justify-center px-4 text-sm text-gray-500"
    >
      접근 권한을 확인하고 있습니다.
    </div>
  );
}
