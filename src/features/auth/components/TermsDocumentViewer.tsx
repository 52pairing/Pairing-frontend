"use client";

import { useEffect, useState } from "react";

import { getTermsDocuments } from "@/features/auth/services/termsDocuments";
import type { LoginRole } from "@/features/auth/types";
import type { SignupTermsItem } from "@/features/auth/types/signupApiTypes";
import { ApiException } from "@/lib/api";

interface TermsDocumentViewerProps {
  role: LoginRole;
  policyOnly?: boolean;
}

export function TermsDocumentViewer({ role, policyOnly = false }: TermsDocumentViewerProps) {
  const [documents, setDocuments] = useState<SignupTermsItem[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getTermsDocuments(role)
      .then((result) => {
        if (!cancelled) setDocuments(result);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError instanceof ApiException ? loadError.message : "약관 문서를 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [role]);

  const visibleDocuments = documents.filter((document) =>
    policyOnly ? document.type === "POLICY" : document.type === "AGREEMENT",
  );

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-5 py-12">
      <div className="mx-auto max-w-[900px] rounded-xl border border-gray-200 bg-white px-6 py-8 sm:px-10">
        <h1 className="text-2xl font-bold text-[#172033]">
          {policyOnly ? "개인정보 처리방침" : `${role === "CLIENT" ? "클라이언트" : "프리랜서"} 이용약관`}
        </h1>
        {isLoading ? <p className="mt-6 text-sm text-gray-500">문서를 불러오는 중입니다...</p> : null}
        {error ? <p className="mt-6 text-sm text-red-500">{error}</p> : null}
        {!isLoading && !error && visibleDocuments.length === 0 ? (
          <p className="mt-6 text-sm text-gray-500">표시할 문서가 없습니다.</p>
        ) : null}
        <div className="mt-8 space-y-10">
          {visibleDocuments.map((document) => (
            <article key={document.termsId}>
              <div className="flex flex-wrap items-end justify-between gap-2 border-b border-gray-200 pb-3">
                <h2 className="text-lg font-bold text-[#172033]">{document.title}</h2>
                <span className="text-xs text-gray-400">{document.version}</span>
              </div>
              <div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-gray-700">
                {document.content}
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
