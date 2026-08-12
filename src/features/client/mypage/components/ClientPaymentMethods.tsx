"use client";

import { useEffect, useState } from "react";

import { useToast } from "@/features/common/hooks/useToast";
import { ClientMyPageLayout } from "@/features/client/mypage/components/ClientMyPageLayout";
import { getMyPaymentMethods } from "@/features/payment/services/settlementPayment";

type EditTarget = "card" | "account" | null;

interface PaymentSummaryState {
  cardBrand: string;
  cardLast4: string;
  cardHolder: string;
  bankName: string;
  accountLast4: string;
  accountHolder: string;
}

const FALLBACK_PAYMENT: PaymentSummaryState = { cardBrand: "신한카드", cardLast4: "1234", cardHolder: "홍길동", bankName: "신한은행", accountLast4: "4567", accountHolder: "김개발" };

export function ClientPaymentMethods() {
  const toast = useToast();
  const [payment, setPayment] = useState(FALLBACK_PAYMENT);
  const [editTarget, setEditTarget] = useState<EditTarget>(null);

  useEffect(() => {
    let cancelled = false;
    getMyPaymentMethods().then((methods) => {
      if (cancelled) return;
      const card = methods.find((method) => method.methodType === "CARD");
      const account = methods.find((method) => method.methodType === "BANK_ACCOUNT");
      if (!card && !account) return;
      setPayment((current) => ({ ...current, cardBrand: card?.cardBrand ?? current.cardBrand, cardLast4: card?.cardLast4 ?? current.cardLast4, cardHolder: card?.cardHolder ?? current.cardHolder, bankName: account?.bankName ?? current.bankName, accountLast4: account?.accountLast4 ?? current.accountLast4, accountHolder: account?.accountHolder ?? current.accountHolder }));
    }).catch(() => {
      // 조회 실패 시 디자인 확인용 기본 상태를 유지합니다.
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <ClientMyPageLayout activeMenu="payment-methods">
      <PaymentSection title="결제수단"><PaymentSummary label={`${payment.cardBrand} · ${payment.cardLast4}`} onEdit={() => setEditTarget("card")} /></PaymentSection>
      <PaymentSection title="계좌 관리" className="mt-4"><PaymentSummary label={`${payment.bankName} ****-****-****-${payment.accountLast4}`} sublabel={payment.accountHolder} onEdit={() => setEditTarget("account")} /></PaymentSection>
      {editTarget === "card" ? <CardEdit payment={payment} onCancel={() => setEditTarget(null)} onSave={(next) => { setPayment((current) => ({ ...current, ...next })); setEditTarget(null); toast.success("카드 정보가 화면에 임시 반영되었습니다."); }} /> : null}
      {editTarget === "account" ? <AccountEdit payment={payment} onCancel={() => setEditTarget(null)} onSave={(next) => { setPayment((current) => ({ ...current, ...next })); setEditTarget(null); toast.success("계좌 정보가 화면에 임시 반영되었습니다."); }} /> : null}
    </ClientMyPageLayout>
  );
}

function PaymentSection({ title, className = "", children }: { title: string; className?: string; children: React.ReactNode }) { return <section className={`${className} rounded-xl border border-theme bg-surface px-5 py-6 sm:px-8`}><h2 className="text-[16px] font-bold">{title}</h2><div className="mt-5">{children}</div></section>; }

function PaymentSummary({ label, sublabel, onEdit }: { label: string; sublabel?: string; onEdit: () => void }) {
  return <div className="flex min-h-[54px] items-center justify-between gap-4 rounded-lg border border-brand px-4 py-3"><div className="min-w-0"><p className="truncate text-[13px] font-bold text-theme-primary">{label}</p>{sublabel ? <p className="mt-1 text-[11px] font-semibold text-theme-muted">{sublabel}</p> : null}</div><button type="button" onClick={onEdit} className="shrink-0 text-[12px] font-bold text-brand hover:underline">수정</button></div>;
}

function CardEdit({ payment, onCancel, onSave }: { payment: PaymentSummaryState; onCancel: () => void; onSave: (next: Partial<PaymentSummaryState>) => void }) {
  const [brand, setBrand] = useState(payment.cardBrand);
  const [number, setNumber] = useState("");
  const [holder, setHolder] = useState(payment.cardHolder);
  const valid = brand.trim() !== "" && number.replace(/\D/g, "").length >= 12 && holder.trim() !== "";
  return <EditCard title="카드 수정" onCancel={onCancel}><EditField label="카드사"><input value={brand} onChange={(event) => setBrand(event.target.value)} className="payment-input" /></EditField><EditField label="카드 번호"><input value={number} inputMode="numeric" autoComplete="cc-number" onChange={(event) => setNumber(formatCardNumber(event.target.value))} placeholder="카드 번호를 입력해 주세요" className="payment-input" /></EditField><EditField label="소유자"><input value={holder} onChange={(event) => setHolder(event.target.value)} autoComplete="cc-name" className="payment-input" /></EditField><SaveButton disabled={!valid} onClick={() => onSave({ cardBrand: brand, cardLast4: number.replace(/\D/g, "").slice(-4), cardHolder: holder })} /></EditCard>;
}

function AccountEdit({ payment, onCancel, onSave }: { payment: PaymentSummaryState; onCancel: () => void; onSave: (next: Partial<PaymentSummaryState>) => void }) {
  const [bank, setBank] = useState(payment.bankName);
  const [number, setNumber] = useState("");
  const [holder, setHolder] = useState(payment.accountHolder);
  const valid = bank.trim() !== "" && number.replace(/\D/g, "").length >= 8 && holder.trim() !== "";
  return <EditCard title="계좌 수정" onCancel={onCancel}><EditField label="은행"><input value={bank} onChange={(event) => setBank(event.target.value)} className="payment-input" /></EditField><EditField label="계좌 번호"><input value={number} inputMode="numeric" onChange={(event) => setNumber(event.target.value.replace(/\D/g, ""))} placeholder="'-' 없이 숫자만 입력해 주세요" className="payment-input" /></EditField><EditField label="예금주"><input value={holder} onChange={(event) => setHolder(event.target.value)} className="payment-input" /></EditField><SaveButton disabled={!valid} onClick={() => onSave({ bankName: bank, accountLast4: number.slice(-4), accountHolder: holder })} /></EditCard>;
}

function EditCard({ title, onCancel, children }: { title: string; onCancel: () => void; children: React.ReactNode }) {
  return <section className="mt-4 rounded-xl border border-theme bg-surface px-5 py-6 sm:px-8"><div className="flex items-center justify-between"><h2 className="text-[16px] font-bold">{title}</h2><button type="button" onClick={onCancel} className="text-[12px] font-semibold text-theme-muted hover:text-theme-secondary">취소</button></div><div className="mx-auto mt-6 max-w-[680px] space-y-4">{children}</div><p className="mt-16 rounded-lg bg-surface-subtle px-4 py-3 text-[11px] font-semibold leading-5 text-theme-muted">결제 정보는 화면이나 브라우저 저장소에 보관하지 않습니다. 실제 저장은 결제수단 수정 API 연동 후 제공됩니다.</p><style jsx global>{`.payment-input{height:44px;width:100%;border:1px solid var(--border);border-radius:6px;background:var(--surface);padding:0 14px;color:var(--text-primary);font-size:13px;font-weight:600;outline:none}.payment-input:focus{border-color:var(--brand)}.payment-input::placeholder{color:var(--text-muted)}`}</style></section>;
}

function EditField({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-[12px] font-semibold text-theme-muted">{label} <span className="text-theme-danger">*</span></span>{children}</label>; }
function SaveButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) { return <div className="flex justify-end pt-1"><button type="button" disabled={disabled} onClick={onClick} className="h-11 min-w-[180px] rounded-md bg-brand px-6 text-[13px] font-bold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-theme-muted">수정하기</button></div>; }
function formatCardNumber(value: string) { return value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1-"); }
