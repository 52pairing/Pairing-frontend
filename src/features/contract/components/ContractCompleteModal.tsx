"use client";

type ContractCompleteModalProps = {
  onBackToProject: () => void;
  onDownload: () => void;
  backLabel?: string;
};

export function ContractCompleteModal({ onBackToProject, onDownload, backLabel = "프로젝트로 돌아가기" }: ContractCompleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/45 px-4">
      <section role="dialog" aria-modal="true" aria-labelledby="contract-complete-title" className="w-full max-w-[520px] rounded-[18px] bg-white px-10 py-10 shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
        <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full border border-[#86efac] bg-[#f0fdf4] text-[32px] font-bold text-[#16a34a]">✓</div>
        <h2 id="contract-complete-title" className="mt-7 text-center text-[24px] font-extrabold tracking-[-0.04em] text-[#172033]">계약서가 체결되었습니다.</h2>
        <p className="mt-4 text-center text-[15px] font-semibold text-[#667085]">전자 계약이 완료되었습니다.</p>
        <p className="mt-1 text-center text-[14px] font-semibold text-[#98a2b3]">계약 번호 CNT-2026-00127</p>

        <dl className="mt-8 space-y-3 rounded-[12px] bg-[#f7f8fa] px-6 py-5 text-[14px]">
          <CompleteRow label="프로젝트" value="프론트엔드 서비스 개발" />
          <CompleteRow label="프리랜서" value="김프리" />
          <CompleteRow label="계약 기간" value="2026.08.20 ~ 2027.02.19" />
          <CompleteRow label="급여" value="월 500만원" />
          <CompleteRow label="지급 방식" value="월별 지급" />
        </dl>

        <div className="mt-7 grid grid-cols-2 gap-3">
          <button type="button" onClick={onBackToProject} className="h-12 cursor-pointer rounded-[9px] border border-[#e1e6ed] bg-white text-[14px] font-semibold text-[#667085] transition hover:bg-[#f8fafc]">{backLabel}</button>
          <button type="button" onClick={onDownload} className="h-12 cursor-pointer rounded-[9px] bg-[#102846] text-[14px] font-bold text-white transition hover:bg-[#0c2039]">계약서 다운로드</button>
        </div>
      </section>
    </div>
  );
}

function CompleteRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4"><dt className="font-semibold text-[#98a2b3]">{label}</dt><dd className="text-right font-bold text-[#172033]">{value}</dd></div>;
}
