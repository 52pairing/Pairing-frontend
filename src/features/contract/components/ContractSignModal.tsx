"use client";

type ContractSignModalProps = {
  onCancel: () => void;
  onConfirm: () => void;
  projectName?: string;
  company?: string;
  roleName?: string;
};

export function ContractSignModal({
  onCancel,
  onConfirm,
  projectName = "AI 추천 엔진 개발",
  company = "카카오",
  roleName = "AI · ML 엔지니어",
}: ContractSignModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/45 px-4"
      role="presentation"
      onMouseDown={onCancel}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="contract-sign-title"
        className="w-full max-w-[390px] rounded-[16px] bg-surface px-6 py-6 shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-[#d8e2ef] bg-[#f1f6fc] text-[20px] text-[#163760]">✎</div>
        <h2 id="contract-sign-title" className="mt-4 text-center text-[17px] font-bold text-theme-primary">계약서에 서명하시겠습니까?</h2>
        <p className="mt-2 text-center text-[13px] font-semibold text-theme-secondary">{projectName}</p>
        <p className="mt-1 text-center text-[12px] text-theme-secondary">{company} · {roleName}</p>

        <div className="mt-5 rounded-[8px] border border-[#cbd9e8] bg-[#edf4fb] px-4 py-3 text-[12px] font-medium leading-5 text-theme-secondary">
          서명은 전자 서명으로 처리되며 법적 효력이 있습니다.<br />계약 내용에 동의하시면 서명을 완료해 주세요.
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button type="button" onClick={onCancel} className="h-11 cursor-pointer rounded-[8px] border border-[#e3e7ed] bg-surface text-[13px] font-semibold text-theme-secondary transition hover:bg-surface-subtle">취소</button>
          <button type="button" onClick={onConfirm} className="h-11 cursor-pointer rounded-[8px] bg-brand text-[13px] font-bold text-white transition hover:bg-brand">서명 하러가기</button>
        </div>
      </section>
    </div>
  );
}
