"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getCurrentUser } from "@/features/auth/services/currentUser";

export default function ForbiddenPage() {
  const [homePath, setHomePath] = useState("/");

  useEffect(() => {
    let cancelled = false;

    getCurrentUser()
      .then((user) => {
        if (cancelled) return;

        setHomePath(user.role === "CLIENT" ? "/client" : "/freelancer");
      })
      .catch(() => {
        if (!cancelled) setHomePath("/login");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <p className="text-6xl font-bold text-gray-900">403</p>

      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          접근 권한이 없습니다
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          현재 계정으로 이용할 수 없는 페이지입니다.
          <br />
          계정 유형에 맞는 홈으로 이동해 주세요.
        </p>
      </div>

      <Link
        href={homePath}
        className="mt-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
      >
        내 홈으로
      </Link>
    </main>
  );
}
