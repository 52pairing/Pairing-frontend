"use client";

import Link from "next/link";
import { useState } from "react";

import { Modal } from "@/features/common/components/Modal";
import { FreelancerMyPageLayout } from "./FreelancerMyPageLayout";

const CONFIRMATION_TEXT = "탈퇴하겠습니다";
const CANCELLATION_NOTICES = [
  "탈퇴 후 1년 동안 관리 목적에 따라 개인정보가 보관됩니다.",
  "완료된 프로젝트 내역과 작성된 리뷰는 삭제되지 않습니다.",
  "탈퇴한 계정은 복구하기 어려우니 신중하게 선택해 주세요.",
  "탈퇴 후 동일 이메일로 재가입은 30일 이후 가능합니다.",
] as const;

// 탈퇴 가능 여부 API가 연결되면 서버 응답으로 교체합니다.
const ACCOUNT_BLOCKERS: { label: string; href: string }[] = [];

export function FreelancerAccountCancellation() {
  const [agreed, setAgreed] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [open, setOpen] = useState(false);
  const canCancel = ACCOUNT_BLOCKERS.length === 0;
  const canSubmit = canCancel && agreed && confirmation === CONFIRMATION_TEXT;

  return (
    <FreelancerMyPageLayout activeMenu="cancel">
      <section className="rounded-xl border border-theme bg-surface px-5 py-6 sm:px-8 sm:py-7">
        <h2 className="text-[16px] font-bold text-theme-danger">회원 탈퇴</h2>
        {!canCancel ? (
          <BlockedCancellation blockers={ACCOUNT_BLOCKERS} />
        ) : (
          <CancellationForm
            agreed={agreed}
            confirmation={confirmation}
            canSubmit={canSubmit}
            onAgreedChange={setAgreed}
            onConfirmationChange={setConfirmation}
            onSubmit={() => setOpen(true)}
          />
        )}
      </section>
      <Modal open={open} onClose={() => setOpen(false)} size="md" labelledBy="freelancer-cancel-ready-title" describedBy="freelancer-cancel-ready-description">
        <h2 id="freelancer-cancel-ready-title" className="text-[20px] font-extrabold tracking-[-0.02em]">회원 탈퇴 API 연동이 필요합니다</h2>
        <p id="freelancer-cancel-ready-description" className="mt-4 text-[13px] font-semibold leading-6 text-theme-secondary">현재는 디자인과 입력 검증만 구현되어 계정이 실제로 삭제되지 않았습니다. 탈퇴 API가 확정되면 이 단계에서 요청 후 로그아웃 처리합니다.</p>
        <button type="button" onClick={() => setOpen(false)} className="mt-7 h-11 w-full rounded-md bg-brand text-[13px] font-bold text-white hover:bg-brand-hover">확인</button>
      </Modal>
    </FreelancerMyPageLayout>
  );
}

function CancellationForm({ agreed, confirmation, canSubmit, onAgreedChange, onConfirmationChange, onSubmit }: { agreed: boolean; confirmation: string; canSubmit: boolean; onAgreedChange: (value: boolean) => void; onConfirmationChange: (value: string) => void; onSubmit: () => void }) {
  return <div className="mt-6">
    <div className="rounded-xl border border-red-200 bg-danger-surface px-5 py-5"><h3 className="text-[13px] font-bold text-theme-danger">탈퇴 전 반드시 확인해 주세요.</h3><ul className="mt-3 space-y-2.5 text-[12px] font-semibold leading-5 text-theme-secondary">{CANCELLATION_NOTICES.map((notice) => <li key={notice} className="flex gap-2"><span className="text-theme-danger" aria-hidden="true">•</span><span>{notice}</span></li>)}</ul></div>
    <label className="mt-6 flex cursor-pointer items-start gap-3"><input type="checkbox" checked={agreed} onChange={(event) => onAgreedChange(event.target.checked)} className="mt-0.5 h-4 w-4 accent-red-600" /><span className="text-[12px] font-semibold leading-5 text-theme-secondary">위 안내 사항을 모두 확인했으며, 탈퇴로 인한 데이터 처리에 동의합니다.</span></label>
    {agreed ? <div className="mt-7"><label htmlFor="freelancer-cancel-confirmation" className="text-[12px] font-semibold text-theme-muted">탈퇴를 계속하려면 아래에 <strong className="text-theme-danger">“{CONFIRMATION_TEXT}”</strong>를 입력해 주세요.</label><input id="freelancer-cancel-confirmation" value={confirmation} onChange={(event) => onConfirmationChange(event.target.value)} autoComplete="off" placeholder={CONFIRMATION_TEXT} className="mt-2 h-11 w-full rounded-md border border-theme bg-surface px-4 text-[13px] font-semibold outline-none placeholder:text-theme-muted focus:border-theme-danger" /></div> : null}
    <button type="button" onClick={onSubmit} disabled={!canSubmit} className="mt-5 h-11 rounded-md border border-red-400 px-5 text-[13px] font-bold text-theme-danger transition hover:bg-danger-surface disabled:cursor-not-allowed disabled:border-red-200 disabled:text-red-300">회원 탈퇴</button>
  </div>;
}

function BlockedCancellation({ blockers }: { blockers: { label: string; href: string }[] }) {
  return <div className="mt-6"><div className="rounded-xl border border-red-200 bg-danger-surface px-5 py-5"><h3 className="text-[13px] font-bold text-theme-danger">현재 탈퇴할 수 없는 상태입니다.</h3><ul className="mt-3 space-y-2 text-[12px] font-semibold text-theme-secondary">{blockers.map((blocker) => <li key={blocker.label}>• {blocker.label} <Link href={blocker.href} className="ml-1 text-blue-600 underline">확인하기</Link></li>)}</ul></div><button type="button" disabled className="mt-5 h-11 rounded-md border border-red-200 px-5 text-[13px] font-bold text-red-300">회원 탈퇴 신청</button></div>;
}
