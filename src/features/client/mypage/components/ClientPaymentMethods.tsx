"use client";

import { useEffect, useState } from "react";

import { ProfileUpdateVerificationModal } from "@/features/auth/components/ProfileUpdateVerificationModal";
import {
  digitsOnly,
  isValidAccountNo,
  isValidCardNumber,
} from "@/features/auth/components/CardAccountFields";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useSignupOptions } from "@/features/auth/hooks/useSignupOptions";
import { getBanks, getCardCompanies } from "@/features/auth/services/signupMeta";
import { ApiException } from "@/lib/api";
import { ClientMyPageLayout } from "@/features/client/mypage/components/ClientMyPageLayout";
import { useToast } from "@/features/common/hooks/useToast";
import {
  getMyPaymentMethods,
  updateMyBankAccount,
  updateMyCard,
} from "@/features/payment/services/settlementPayment";

type EditTarget = "card" | "account" | null;

interface PaymentSummaryState {
  cardDisplayName: string;
  cardBrand: string;
  cardCompany: string;
  cardLast4: string;
  cardHolder: string;
  accountDisplayName: string;
  bankName: string;
  accountLast4: string;
  accountHolder: string;
}

const EMPTY_PAYMENT: PaymentSummaryState = {
  cardDisplayName: "등록된 카드 없음",
  cardBrand: "",
  cardCompany: "",
  cardLast4: "",
  cardHolder: "",
  accountDisplayName: "등록된 계좌 없음",
  bankName: "",
  accountLast4: "",
  accountHolder: "",
};

export function ClientPaymentMethods() {
  const toast = useToast();
  const user = useCurrentUser();
  const [verified, setVerified] = useState(false);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [pendingEditTarget, setPendingEditTarget] = useState<EditTarget>(null);
  const [payment, setPayment] = useState(EMPTY_PAYMENT);
  const [editTarget, setEditTarget] = useState<EditTarget>(null);

  useEffect(() => {
    let cancelled = false;
    getMyPaymentMethods()
      .then((methods) => {
        if (cancelled) return;
        const card = methods.find((method) => method.methodType === "CARD");
        const account = methods.find((method) => method.methodType === "BANK_ACCOUNT");
        setPayment((current) => ({
          ...current,
          cardDisplayName: card?.displayName ?? current.cardDisplayName,
          cardBrand: card?.cardBrand ?? current.cardBrand,
          cardCompany: card?.cardCompany ?? current.cardCompany,
          cardLast4: card?.cardLast4 ?? current.cardLast4,
          cardHolder: card?.cardHolder ?? current.cardHolder,
          accountDisplayName: account?.displayName ?? current.accountDisplayName,
          bankName: account?.bankName ?? current.bankName,
          accountLast4: account?.accountLast4 ?? current.accountLast4,
          accountHolder: account?.accountHolder ?? current.accountHolder,
        }));
      })
      .catch(() => toast.error("결제수단을 불러오지 못했습니다."));
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const requestEdit = (target: Exclude<EditTarget, null>) => {
    if (verified) {
      setEditTarget(target);
      return;
    }
    setPendingEditTarget(target);
    setVerificationOpen(true);
  };

  return (
    <ClientMyPageLayout activeMenu="payment-methods">
      <PaymentSection title="결제수단">
        <PaymentSummary label={payment.cardDisplayName} onEdit={() => requestEdit("card")} />
      </PaymentSection>
      <PaymentSection title="계좌 관리" className="mt-4">
        <PaymentSummary label={payment.bankName && payment.accountLast4 ? `${payment.bankName} ****${payment.accountLast4}` : "등록된 계좌 없음"} sublabel={payment.accountHolder} onEdit={() => requestEdit("account")} />
      </PaymentSection>
      {editTarget === "card" ? (
        <CardEdit
          payment={payment}
          onCancel={() => setEditTarget(null)}
          onSave={async (brand, number, holder) => {
            let saved;
            try {
              saved = await updateMyCard({ cardBrand: brand, cardNumber: number, cardHolder: holder });
            } catch (error) {
              if (error instanceof ApiException && error.errorCode === "AU_006") {
                setVerified(false);
                setVerificationOpen(true);
                return;
              }
              throw error;
            }
            setPayment((current) => ({
              ...current,
              cardDisplayName: saved.displayName,
              cardBrand: saved.cardBrand ?? brand,
              cardCompany: saved.cardCompany ?? brand,
              cardLast4: saved.cardLast4 ?? number.slice(-4),
              cardHolder: saved.cardHolder ?? holder,
            }));
            setEditTarget(null);
            toast.success("카드 정보가 저장되었습니다.");
          }}
        />
      ) : null}
      {editTarget === "account" ? (
        <AccountEdit
          payment={payment}
          onCancel={() => setEditTarget(null)}
          onSave={async (bankCode, number, holder) => {
            let saved;
            try {
              saved = await updateMyBankAccount({ bankCode, accountNo: number, accountHolder: holder });
            } catch (error) {
              if (error instanceof ApiException && error.errorCode === "AU_006") {
                setVerified(false);
                setVerificationOpen(true);
                return;
              }
              throw error;
            }
            setPayment((current) => ({
              ...current,
              accountDisplayName: saved.displayName,
              bankName: saved.bankName ?? bankCode,
              accountLast4: saved.accountLast4 ?? number.slice(-4),
              accountHolder: saved.accountHolder ?? holder,
            }));
            setEditTarget(null);
            toast.success("계좌 정보가 저장되었습니다.");
          }}
        />
      ) : null}
      {user?.email ? <ProfileUpdateVerificationModal open={verificationOpen} email={user.email} purpose="PAYMENT_METHOD" title="결제수단 본인 인증" description="카드 또는 계좌를 수정하려면 이메일 인증이 필요합니다." onClose={() => { setVerificationOpen(false); setPendingEditTarget(null); }} onVerified={() => { setVerified(true); setVerificationOpen(false); if (pendingEditTarget) setEditTarget(pendingEditTarget); setPendingEditTarget(null); }} /> : null}
    </ClientMyPageLayout>
  );
}

function PaymentSection({ title, className = "", children }: { title: string; className?: string; children: React.ReactNode }) {
  return <section className={`${className} rounded-xl border border-theme bg-surface px-5 py-6 sm:px-8`}><h2 className="text-[16px] font-bold">{title}</h2><div className="mt-5">{children}</div></section>;
}

function PaymentSummary({ label, sublabel, onEdit }: { label: string; sublabel?: string; onEdit: () => void }) {
  return <div className="flex min-h-[54px] items-center justify-between gap-4 rounded-lg border border-brand px-4 py-3"><div className="min-w-0"><p className="truncate text-[13px] font-bold text-theme-primary">{label}</p>{sublabel ? <p className="mt-1 text-[11px] font-semibold text-theme-muted">{sublabel}</p> : null}</div><button type="button" onClick={onEdit} className="shrink-0 text-[12px] font-bold text-brand hover:underline">수정</button></div>;
}

function CardEdit({ payment, onCancel, onSave }: { payment: PaymentSummaryState; onCancel: () => void; onSave: (brand: string, number: string, holder: string) => Promise<void> }) {
  const [brand, setBrand] = useState(payment.cardCompany);
  const [number, setNumber] = useState("");
  const [holder, setHolder] = useState(payment.cardHolder);
  const [saving, setSaving] = useState(false);
  const { options, isLoading, isError, retry } = useSignupOptions(getCardCompanies);
  const valid = brand.trim() !== "" && isValidCardNumber(number) && holder.trim() !== "";
  const save = async () => {
    setSaving(true);
    try { await onSave(brand, digitsOnly(number), holder); } finally { setSaving(false); }
  };
  return <EditCard title="카드 수정" onCancel={onCancel}><EditField label="카드사"><select value={brand} onChange={(event) => setBrand(event.target.value)} disabled={isLoading || isError} className="payment-input"><option value="">{isLoading ? "카드사 목록을 불러오는 중..." : "카드사를 선택해 주세요."}</option>{options.map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}</select>{isError ? <RetryButton onClick={retry} label="카드사 목록 다시 불러오기" /> : null}</EditField><EditField label="카드 번호"><input value={number} inputMode="numeric" autoComplete="cc-number" maxLength={19} onChange={(event) => setNumber(formatCardNumber(event.target.value))} placeholder="카드 번호를 입력해 주세요" className="payment-input" /></EditField><EditField label="소유자"><input value={holder} onChange={(event) => setHolder(event.target.value)} autoComplete="cc-name" className="payment-input" /></EditField><SaveButton disabled={!valid || saving} onClick={() => void save()} label={saving ? "저장 중..." : "수정하기"} /></EditCard>;
}

function AccountEdit({ payment, onCancel, onSave }: { payment: PaymentSummaryState; onCancel: () => void; onSave: (bankCode: string, number: string, holder: string) => Promise<void> }) {
  const [bank, setBank] = useState("");
  const [number, setNumber] = useState("");
  const [holder, setHolder] = useState(payment.accountHolder);
  const [saving, setSaving] = useState(false);
  const { options, isLoading, isError, retry } = useSignupOptions(getBanks);
  const valid = bank !== "" && isValidAccountNo(number) && holder.trim() !== "";
  const save = async () => {
    setSaving(true);
    try { await onSave(bank, digitsOnly(number), holder); } finally { setSaving(false); }
  };
  return <EditCard title="계좌 수정" onCancel={onCancel}><EditField label="은행"><select value={bank} onChange={(event) => setBank(event.target.value)} disabled={isLoading || isError} className="payment-input"><option value="">{isLoading ? "은행 목록을 불러오는 중..." : "은행을 선택해 주세요."}</option>{options.map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}</select>{isError ? <RetryButton onClick={retry} label="은행 목록 다시 불러오기" /> : null}</EditField><EditField label="계좌 번호"><input value={number} inputMode="numeric" maxLength={14} onChange={(event) => setNumber(event.target.value.replace(/\D/g, ""))} placeholder="'-' 없이 숫자만 입력해 주세요" className="payment-input" /></EditField><EditField label="예금주"><input value={holder} onChange={(event) => setHolder(event.target.value)} className="payment-input" /></EditField><SaveButton disabled={!valid || saving} onClick={() => void save()} label={saving ? "저장 중..." : "수정하기"} /></EditCard>;
}

function EditCard({ title, onCancel, children }: { title: string; onCancel: () => void; children: React.ReactNode }) {
  return <section className="mt-4 rounded-xl border border-theme bg-surface px-5 py-6 sm:px-8"><div className="flex items-center justify-between"><h2 className="text-[16px] font-bold">{title}</h2><button type="button" onClick={onCancel} className="text-[12px] font-semibold text-theme-muted hover:text-theme-secondary">취소</button></div><div className="mx-auto mt-6 max-w-[680px] space-y-4">{children}</div><style jsx global>{`.payment-input{height:44px;width:100%;border:1px solid var(--border);border-radius:6px;background:var(--surface);padding:0 14px;color:var(--text-primary);font-size:13px;font-weight:600;outline:none}.payment-input:hover,.payment-input:focus{border-color:var(--brand)}.payment-input::placeholder{color:var(--text-muted)}`}</style></section>;
}

function EditField({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-[12px] font-semibold text-theme-muted">{label} <span className="text-theme-danger">*</span></span>{children}</label>; }
function SaveButton({ disabled, onClick, label }: { disabled: boolean; onClick: () => void; label: string }) { return <div className="flex justify-end pt-1"><button type="button" disabled={disabled} onClick={onClick} className="h-11 min-w-[180px] rounded-md bg-brand px-6 text-[13px] font-bold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-theme-muted">{label}</button></div>; }
function RetryButton({ onClick, label }: { onClick: () => void; label: string }) { return <button type="button" onClick={onClick} className="mt-2 text-[11px] font-semibold text-theme-danger underline">{label}</button>; }
function formatCardNumber(value: string) { return value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1-"); }
