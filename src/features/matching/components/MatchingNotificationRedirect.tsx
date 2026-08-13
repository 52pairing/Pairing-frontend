"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { getMatchingRequestDetail } from "@/features/matching/services/matching";

export function MatchingNotificationRedirect() {
  const params = useParams<{ requestId: string }>();
  const router = useRouter();
  const user = useCurrentUser();
  const [error, setError] = useState("");
  const requestId = Number(params.requestId);
  const invalidRequestId = !Number.isInteger(requestId);

  useEffect(() => {
    if (!user) return;
    if (invalidRequestId) return;
    if (user.role === "FREELANCER") { router.replace(`/freelancer/projects/${requestId}`); return; }
    void getMatchingRequestDetail(requestId)
      .then((request) => router.replace(`/client/projects/${request.projectId}/requests/${requestId}`))
      .catch((cause) => setError(cause instanceof Error ? cause.message : "매칭 요청을 불러오지 못했습니다."));
  }, [invalidRequestId, requestId, router, user]);

  const message = invalidRequestId ? "올바르지 않은 매칭 요청입니다." : error;
  return <main className="flex min-h-screen items-center justify-center bg-surface-subtle px-5 text-center"><div>{message ? <><p role="alert" className="text-[12px] font-semibold text-theme-danger">{message}</p><Link href={user?.role === "FREELANCER" ? "/freelancer/projects" : "/client/projects"} className="mt-4 inline-flex rounded-lg bg-brand px-4 py-2 text-[11px] font-bold text-white">목록으로 이동</Link></> : <p className="text-[12px] font-semibold text-theme-muted">매칭 요청으로 이동하고 있습니다.</p>}</div></main>;
}
