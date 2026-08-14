"use client";

import { useEffect, useState } from "react";

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
  cardLast4: "",
  cardHolder: "",
  accountDisplayName: "등록된 계좌 없음",
  bankName: "",
  accountLast4: "",
  accountHolder: "",
};

export function ClientPaymentMethods() {
  const toast = useToast();
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

  return (
    <ClientMyPageLayout activeMenu="payment-methods">
      <PaymentSection title="결제수단">
        <PaymentSummary label={payment.cardDisplayName} onEdit={() => setEditTarget("card")} />
      </PaymentSection>
      <PaymentSection title="계좌 관리" className="mt-4">
        <PaymentSummary label={payment.accountDisplayName} sublabel={payment.accountHolder} onEdit={() => setEditTarget("account")} />
      </PaymentSection>
      {editTarget === "card" ? (
        <CardEdit
          payment={payment}
          onCancel={() => setEditTarget(null)}
          onSave={async (brand, number, holder) => {
            const saved = await updateMyCard({ cardBrand: brand, cardNumber: number, cardHolder: holder });
            setPayment((current) => ({
              ...current,
              cardDisplayName: saved.displayName,
              cardBrand: saved.cardBrand ?? brand,
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
            const saved = await updateMyBankAccount({ bankCode, accountNo: number, accountHolder: holder });
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
  const [brand, setBrand] = useState(payment.cardBrand);
  const [number, setNumber] = useState("");
  const [holder, setHolder] = useState(payment.cardHolder);
  const [saving, setSaving] = useState(false);
  const valid = brand.trim() !== "" && number.replace(/\D/g, "").length >= 12 && holder.trim() !== "";
  const save = async () => {
    setSaving(true);
    try { await onSave(brand, number.replace(/\D/g, ""), holder); } finally { setSaving(false); }
  };
  return <EditCard title="카드 수정" onCancel={onCancel}><EditField label="카드사"><input value={brand} onChange={(event) => setBrand(event.target.value)} className="payment-input" /></EditField><EditField label="카드 번호"><input value={number} inputMode="numeric" autoComplete="cc-number" onChange={(event) => setNumber(formatCardNumber(event.target.value))} placeholder="카드 번호를 입력해 주세요" className="payment-input" /></EditField><EditField label="소유자"><input value={holder} onChange={(event) => setHolder(event.target.value)} autoComplete="cc-name" className="payment-input" /></EditField><SaveButton disabled={!valid || saving} onClick={() => void save()} label={saving ? "저장 중..." : "수정하기"} /></EditCard>;
}

function AccountEdit({ payment, onCancel, onSave }: { payment: PaymentSummaryState; onCancel: () => void; onSave: (bankCode: string, number: string, holder: string) => Promise<void> }) {
  const [bank, setBank] = useState("SHINHAN");
  const [number, setNumber] = useState("");
  const [holder, setHolder] = useState(payment.accountHolder);
  const [saving, setSaving] = useState(false);
  const valid = number.length >= 8 && holder.trim() !== "";
  const save = async () => {
    setSaving(true);
    try { await onSave(bank, number, holder); } finally { setSaving(false); }
  };
  return <EditCard title="계좌 수정" onCancel={onCancel}><EditField label="은행"><select value={bank} onChange={(event) => setBank(event.target.value)} className="payment-input"><option value="SHINHAN">신한은행</option><option value="KOOKMIN">국민은행</option><option value="WOORI">우리은행</option><option value="HANA">하나은행</option></select></EditField><EditField label="계좌 번호"><input value={number} inputMode="numeric" onChange={(event) => setNumber(event.target.value.replace(/\D/g, ""))} placeholder="'-' 없이 숫자만 입력해 주세요" className="payment-input" /></EditField><EditField label="예금주"><input value={holder} onChange={(event) => setHolder(event.target.value)} className="payment-input" /></EditField><SaveButton disabled={!valid || saving} onClick={() => void save()} label={saving ? "저장 중..." : "수정하기"} /></EditCard>;
}

function EditCard({ title, onCancel, children }: { title: string; onCancel: () => void; children: React.ReactNode }) {
  return <section className="mt-4 rounded-xl border border-theme bg-surface px-5 py-6 sm:px-8"><div className="flex items-center justify-between"><h2 className="text-[16px] font-bold">{title}</h2><button type="button" onClick={onCancel} className="text-[12px] font-semibold text-theme-muted hover:text-theme-secondary">취소</button></div><div className="mx-auto mt-6 max-w-[680px] space-y-4">{children}</div><style jsx global>{`.payment-input{height:44px;width:100%;border:1px solid var(--border);border-radius:6px;background:var(--surface);padding:0 14px;color:var(--text-primary);font-size:13px;font-weight:600;outline:none}.payment-input:hover,.payment-input:focus{border-color:var(--brand)}.payment-input::placeholder{color:var(--text-muted)}`}</style></section>;
}

function EditField({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-[12px] font-semibold text-theme-muted">{label} <span className="text-theme-danger">*</span></span>{children}</label>; }
function SaveButton({ disabled, onClick, label }: { disabled: boolean; onClick: () => void; label: string }) { return <div className="flex justify-end pt-1"><button type="button" disabled={disabled} onClick={onClick} className="h-11 min-w-[180px] rounded-md bg-brand px-6 text-[13px] font-bold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-theme-muted">{label}</button></div>; }
function formatCardNumber(value: string) { return value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1-"); }
