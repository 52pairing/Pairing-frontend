"use client";

import { CreditCard } from "lucide-react";
import { useEffect, useState } from "react";

import { useToast } from "@/features/common/hooks/useToast";
import { getMyPaymentMethods } from "@/features/payment/services/settlementPayment";
import { FreelancerMyPageLayout } from "./FreelancerMyPageLayout";

type EditTarget = "card" | "account" | null;
type PaymentState = { cardBrand: string; cardLast4: string; cardHolder: string; bankName: string; accountLast4: string; accountHolder: string };

const FALLBACK_PAYMENT: PaymentState = { cardBrand: "신한카드", cardLast4: "1234", cardHolder: "홍길동", bankName: "신한은행", accountLast4: "4362", accountHolder: "김개발" };
const inputClassName = "h-11 w-full rounded-md border border-theme bg-surface px-4 text-[12px] font-semibold outline-none placeholder:text-theme-muted hover:border-brand focus:border-brand";

export function FreelancerPaymentMethods() {
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
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  const save = (next: Partial<PaymentState>, message: string) => {
    setPayment((current) => ({ ...current, ...next }));
    setEditTarget(null);
    toast.success(message);
  };

  return (
    <FreelancerMyPageLayout activeMenu="payment-methods">
      <PaymentCard title="결제수단">
        <Summary icon={<CreditCard size={17} />} label={`${payment.cardBrand} · ${payment.cardLast4}`} onEdit={() => setEditTarget("card")} />
      </PaymentCard>
      <PaymentCard title="계좌 관리" className="mt-4">
        <Summary label={`${payment.bankName} ****-****-****-${payment.accountLast4}`} sublabel={payment.accountHolder} onEdit={() => setEditTarget("account")} />
      </PaymentCard>
      {editTarget === "card" ? <CardForm payment={payment} onCancel={() => setEditTarget(null)} onSave={(next) => save(next, "카드 정보가 화면에 반영되었습니다.")} /> : null}
      {editTarget === "account" ? <AccountForm payment={payment} onCancel={() => setEditTarget(null)} onSave={(next) => save(next, "계좌 정보가 화면에 반영되었습니다.")} /> : null}
    </FreelancerMyPageLayout>
  );
}

function PaymentCard({ title, className = "", children }: { title: string; className?: string; children: React.ReactNode }) {
  return <section className={`${className} rounded-xl border border-theme bg-surface px-5 py-6 sm:px-7`}><h2 className="text-[15px] font-extrabold">{title}</h2><div className="mt-5">{children}</div></section>;
}

function Summary({ icon, label, sublabel, onEdit }: { icon?: React.ReactNode; label: string; sublabel?: string; onEdit: () => void }) {
  return <div className="flex min-h-14 items-center justify-between gap-4 rounded-lg border border-brand px-4 py-3"><div className="flex min-w-0 items-center gap-3">{icon ? <span className="shrink-0 text-brand">{icon}</span> : null}<div className="min-w-0"><p className="truncate text-[12px] font-bold">{label}</p>{sublabel ? <p className="mt-1 text-[10px] font-semibold text-theme-muted">{sublabel}</p> : null}</div></div><button type="button" onClick={onEdit} className="shrink-0 text-[11px] font-bold text-brand hover:underline">수정</button></div>;
}

function EditPanel({ title, onCancel, children }: { title: string; onCancel: () => void; children: React.ReactNode }) {
  return <section className="mt-4 rounded-xl border border-theme bg-surface px-5 py-6 sm:px-7"><div className="flex items-center justify-between"><h2 className="text-[15px] font-extrabold">{title}</h2><button type="button" onClick={onCancel} className="text-[11px] font-semibold text-theme-muted hover:text-brand">취소</button></div><div className="mx-auto mt-6 max-w-[650px] space-y-4">{children}</div><p className="mt-16 rounded-lg border border-theme bg-surface-subtle px-4 py-3 text-[10px] font-semibold leading-5 text-theme-muted">결제 정보는 PCI-DSS 보안 기준에 따라 암호화 저장되며, 페어링 수수료 자동 결제에만 사용됩니다.<br />최대 3개의 카드를 등록할 수 있습니다.</p></section>;
}

function CardForm({ payment, onCancel, onSave }: { payment: PaymentState; onCancel: () => void; onSave: (next: Partial<PaymentState>) => void }) {
  const [brand, setBrand] = useState(payment.cardBrand);
  const [number, setNumber] = useState("");
  const [holder, setHolder] = useState(payment.cardHolder);
  const valid = brand.trim() && number.replace(/\D/g, "").length === 16 && holder.trim();
  return <EditPanel title="카드 수정" onCancel={onCancel}><EditField label="카드사"><input value={brand} onChange={(event) => setBrand(event.target.value)} className={inputClassName} /></EditField><EditField label="카드 번호"><input value={number} onChange={(event) => setNumber(formatCardNumber(event.target.value))} inputMode="numeric" autoComplete="cc-number" placeholder="카드 번호를 입력해 주세요" className={inputClassName} /></EditField><EditField label="소유자"><input value={holder} onChange={(event) => setHolder(event.target.value)} autoComplete="cc-name" className={inputClassName} /></EditField><SubmitButton disabled={!valid} onClick={() => onSave({ cardBrand: brand, cardLast4: number.slice(-4), cardHolder: holder })} /></EditPanel>;
}

function AccountForm({ payment, onCancel, onSave }: { payment: PaymentState; onCancel: () => void; onSave: (next: Partial<PaymentState>) => void }) {
  const [bank, setBank] = useState(payment.bankName);
  const [number, setNumber] = useState("");
  const [holder, setHolder] = useState(payment.accountHolder);
  const valid = bank.trim() && number.length >= 8 && holder.trim();
  return <EditPanel title="계좌 수정" onCancel={onCancel}><EditField label="은행"><input value={bank} onChange={(event) => setBank(event.target.value)} className={inputClassName} /></EditField><EditField label="계좌 번호"><input value={number} onChange={(event) => setNumber(event.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="'-' 없이 숫자만 입력해 주세요" className={inputClassName} /></EditField><EditField label="예금주"><input value={holder} onChange={(event) => setHolder(event.target.value)} className={inputClassName} /></EditField><SubmitButton disabled={!valid} onClick={() => onSave({ bankName: bank, accountLast4: number.slice(-4), accountHolder: holder })} /></EditPanel>;
}

function EditField({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-[10px] font-semibold text-theme-muted">{label} <span className="text-theme-danger">*</span></span>{children}</label>; }
function SubmitButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) { return <div className="flex justify-end pt-1"><button type="button" disabled={disabled} onClick={onClick} className="h-11 min-w-40 rounded-md bg-brand px-6 text-[12px] font-bold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-theme-muted">수정하기</button></div>; }
function formatCardNumber(value: string) { return value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1-"); }
