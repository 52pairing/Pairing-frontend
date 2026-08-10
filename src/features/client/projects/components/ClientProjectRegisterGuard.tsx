"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { getCurrentUser } from "@/features/auth/services/currentUser";

interface ClientProjectRegisterGuardProps {
  children: ReactNode;
}

export function ClientProjectRegisterGuard({
  children,
}: ClientProjectRegisterGuardProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getCurrentUser()
      .then((user) => {
        if (cancelled) return;

        if (user.role === "CLIENT") {
          setIsClient(true);
          return;
        }

        router.replace("/freelancer");
      })
      .catch(() => {
        if (!cancelled) router.replace("/login");
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!isClient) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-[#667085]">
        접근 권한을 확인하고 있습니다.
      </div>
    );
  }

  return children;
}
