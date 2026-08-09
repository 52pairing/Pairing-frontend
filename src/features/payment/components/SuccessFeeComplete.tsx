"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export function SuccessFeeComplete() {
  const params = useParams<{ projectId: string }>();

  return (
    <main className="flex min-h-[calc(100dvh-60px)] items-center justify-center bg-[#f7f8fa] px-5 text-[#172033]">
      <section className="w-full max-w-[520px] py-10 text-center">
        <div className="mx-auto flex h-[64px] w-[64px] items-center justify-center rounded-full border border-[#86efac] bg-[#dcfce7] text-[30px] font-bold text-[#16a34a]">✓</div>

        <h1 className="mt-7 text-[23px] font-extrabold tracking-[-0.04em]">결제가 완료되었습니다</h1>
        <p className="mt-4 text-[14px] font-semibold text-[#667085]">성공보수 결제가 완료되었습니다.</p>
        <p className="mt-2 text-[13px] font-medium text-[#667085]">결제가 정상적으로 처리되었으며, 프로젝트 진행이 완료되었습니다.</p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href={`/client/projects/${params.projectId}?tab=progress&completed=true`} className="flex h-[46px] min-w-[170px] cursor-pointer items-center justify-center rounded-[9px] border border-[#dce2e8] bg-white px-5 text-[13px] font-semibold text-[#667085] transition hover:bg-[#f8fafc]">프로젝트로 돌아가기</Link>
          <button type="button" className="h-[46px] min-w-[138px] cursor-pointer rounded-[9px] bg-[#102846] px-5 text-[13px] font-bold text-white transition hover:bg-[#0c2039]">리뷰 작성하기</button>
        </div>
      </section>
    </main>
  );
}
