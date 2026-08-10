"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getProject } from "@/features/client/projects/services/projectRegistration";
import type { ProjectResponse } from "@/features/client/projects/services/projectRegistration";
import { PaymentComplete } from "@/features/payment/components/PaymentComplete";

const PROJECT_STATUS_LABEL: Record<string, string> = {
  MATCHING: "모집 중",
};

export function ProjectPaymentComplete() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = Number(searchParams.get("projectId"));
  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!Number.isInteger(projectId) || projectId <= 0) {
      Promise.resolve().then(() =>
        setErrorMessage("결제한 프로젝트 정보를 확인할 수 없습니다."),
      );
      return;
    }

    let cancelled = false;
    getProject(projectId)
      .then((response) => {
        if (!cancelled) setProject(response);
      })
      .catch((error) => {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "프로젝트 상태를 불러오지 못했습니다.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (errorMessage) {
    return (
      <main className="flex min-h-[calc(100dvh-60px)] items-center justify-center bg-[#f7f8fa] px-5">
        <section className="w-full max-w-[540px] rounded-[18px] border border-[#dce2e8] bg-white px-10 py-10 text-center">
          <h1 className="text-xl font-extrabold text-[#111827]">결제는 완료되었습니다.</h1>
          <p className="mt-4 text-sm text-[#b42318]">{errorMessage}</p>
          <button type="button" onClick={() => router.push("/client/projects?tab=MATCHING")} className="mt-7 h-[48px] rounded-[10px] bg-[#17365d] px-7 text-sm font-bold text-white">내 프로젝트 보기</button>
        </section>
      </main>
    );
  }

  if (!project) {
    return <div className="flex min-h-[60vh] items-center justify-center text-sm text-[#667085]">프로젝트 상태를 확인하고 있습니다.</div>;
  }

  return (
    <PaymentComplete
      title="결제가 완료되었습니다"
      status={`프로젝트 상태: ${PROJECT_STATUS_LABEL[project.status] ?? project.status}`}
      description={<>이제 프로젝트에 적합한 프리랜서를 찾아보세요.</>}
      homeHref="/client"
      detailHref="/client/projects?tab=MATCHING"
      detailLabel="내 프로젝트 보기"
    />
  );
}
