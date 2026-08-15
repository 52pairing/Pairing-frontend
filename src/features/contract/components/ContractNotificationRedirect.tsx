"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { getAllClientContracts } from "@/features/contract/services/clientContracts";

/**
 * 계약 알림(`CONTRACT_CREATED`/`CONTRACT_SIGNED`)의 linkUrl은 `/contracts/{contractId}`로 오지만
 * 실제 화면은 역할별로 나뉘어 있다(프리랜서 `/freelancer/contracts/{contractId}`,
 * 클라이언트 `/client/projects/{projectId}/contracts/{contractId}`).
 * 클라이언트 상세 경로에 필요한 projectId는 계약 상세 응답에 없어 계약 목록에서 찾는다.
 */
export function ContractNotificationRedirect() {
  const params = useParams<{ contractId: string }>();
  const router = useRouter();
  const user = useCurrentUser();
  const [error, setError] = useState("");
  const contractId = Number(params.contractId);
  const invalidContractId = !Number.isInteger(contractId);

  useEffect(() => {
    if (!user) return;
    if (invalidContractId) return;

    if (user.role === "FREELANCER") {
      router.replace(`/freelancer/contracts/${contractId}`);
      return;
    }

    getAllClientContracts()
      .then((contracts) => {
        const matched = contracts.find((contract) => contract.contractId === contractId);
        if (matched) {
          router.replace(`/client/projects/${matched.projectId}/contracts/${contractId}`);
          return;
        }
        router.replace("/client/contracts");
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "계약 정보를 불러오지 못했습니다."));
  }, [contractId, invalidContractId, router, user]);

  const message = invalidContractId ? "올바르지 않은 계약입니다." : error;
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-subtle px-5 text-center">
      <div>
        {message ? (
          <>
            <p role="alert" className="text-[12px] font-semibold text-theme-danger">
              {message}
            </p>
            <Link
              href={user?.role === "FREELANCER" ? "/freelancer/contracts" : "/client/contracts"}
              className="mt-4 inline-flex rounded-lg bg-brand px-4 py-2 text-[11px] font-bold text-white"
            >
              계약 목록으로 이동
            </Link>
          </>
        ) : (
          <p className="text-[12px] font-semibold text-theme-muted">계약 상세로 이동하고 있습니다.</p>
        )}
      </div>
    </main>
  );
}
