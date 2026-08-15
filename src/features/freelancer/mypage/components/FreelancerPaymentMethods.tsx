"use client";

import { CreditCard } from "lucide-react";
import { useEffect, useState } from "react";

import { ProfileUpdateVerificationModal } from "@/features/auth/components/ProfileUpdateVerificationModal";
import { digitsOnly, isValidAccountNo, isValidCardNumber } from "@/features/auth/components/CardAccountFields";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useSignupOptions } from "@/features/auth/hooks/useSignupOptions";
import { getBanks, getCardCompanies } from "@/features/auth/services/signupMeta";
import { ApiException } from "@/lib/api";
import { useToast } from "@/features/common/hooks/useToast";
import { getMyPaymentMethods, updateMyBankAccount, updateMyCard } from "@/features/payment/services/settlementPayment";
import { FreelancerMyPageLayout } from "./FreelancerMyPageLayout";

type EditTarget = "card" | "account" | null;
type PaymentState = { cardBrand: string; cardCompany: string; cardLast4: string; cardHolder: string; bankName: string; accountLast4: string; accountHolder: string };

const EMPTY_PAYMENT: PaymentState = { cardBrand: "등록된 카드 없음", cardCompany: "", cardLast4: "", cardHolder: "", bankName: "등록된 계좌 없음", accountLast4: "", accountHolder: "" };
const inputClassName = "h-11 w-full rounded-md border border-theme bg-surface px-4 text-[12px] font-semibold outline-none placeholder:text-theme-muted hover:border-brand focus:border-brand";

export function FreelancerPaymentMethods() {
  const toast = useToast();
  const user = useCurrentUser();
  const [verified, setVerified] = useState(false);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [pendingEditTarget, setPendingEditTarget] = useState<EditTarget>(null);
  const [payment, setPayment] = useState(EMPTY_PAYMENT);
  const [editTarget, setEditTarget] = useState<EditTarget>(null);

  useEffect(() => {
    let cancelled = false;
    getMyPaymentMethods().then((methods) => {
      if (cancelled) return;
      const card = methods.find((method) => method.methodType === "CARD");
      const account = methods.find((method) => method.methodType === "BANK_ACCOUNT");
      setPayment((current) => ({ ...current, cardBrand: card?.cardBrand ?? current.cardBrand, cardCompany: card?.cardCompany ?? current.cardCompany, cardLast4: card?.cardLast4 ?? current.cardLast4, cardHolder: card?.cardHolder ?? current.cardHolder, bankName: account?.bankName ?? current.bankName, accountLast4: account?.accountLast4 ?? current.accountLast4, accountHolder: account?.accountHolder ?? current.accountHolder }));
    }).catch(() => toast.error("결제수단을 불러오지 못했습니다."));
    return () => { cancelled = true; };
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
    <FreelancerMyPageLayout activeMenu="payment-methods">
      <PaymentCard title="결제수단">
        <Summary icon={<CreditCard size={17} />} label={payment.cardLast4 ? `${payment.cardBrand} · ${payment.cardLast4}` : payment.cardBrand} onEdit={() => requestEdit("card")} />
      </PaymentCard>
      <PaymentCard title="계좌 관리" className="mt-4">
        <Summary label={payment.accountLast4 ? `${payment.bankName} ****${payment.accountLast4}` : payment.bankName} sublabel={payment.accountHolder} onEdit={() => requestEdit("account")} />
      </PaymentCard>
      {editTarget === "card" ? <CardForm payment={payment} onCancel={() => setEditTarget(null)} onSave={async (brand, number, holder) => { try { const saved = await updateMyCard({ cardBrand: brand, cardNumber: number, cardHolder: holder }); setPayment((current) => ({ ...current, cardBrand: saved.cardBrand ?? current.cardBrand, cardCompany: saved.cardCompany ?? brand, cardLast4: saved.cardLast4 ?? number.slice(-4), cardHolder: saved.cardHolder ?? holder })); setEditTarget(null); toast.success("카드 정보가 저장되었습니다."); } catch (error) { if (error instanceof ApiException && error.errorCode === "AU_006") { setVerified(false); setVerificationOpen(true); return; } throw error; } }} /> : null}
      {editTarget === "account" ? <AccountForm payment={payment} onCancel={() => setEditTarget(null)} onSave={async (bankCode, number, holder) => { try { const saved = await updateMyBankAccount({ bankCode, accountNo: number, accountHolder: holder }); setPayment((current) => ({ ...current, bankName: saved.bankName ?? bankCode, accountLast4: saved.accountLast4 ?? number.slice(-4), accountHolder: saved.accountHolder ?? holder })); setEditTarget(null); toast.success("계좌 정보가 저장되었습니다."); } catch (error) { if (error instanceof ApiException && error.errorCode === "AU_006") { setVerified(false); setVerificationOpen(true); return; } throw error; } }} /> : null}
      {user?.email ? <ProfileUpdateVerificationModal open={verificationOpen} email={user.email} purpose="PAYMENT_METHOD" title="결제수단 본인 인증" description="카드 또는 계좌를 수정하려면 이메일 인증이 필요합니다." onClose={() => { setVerificationOpen(false); setPendingEditTarget(null); }} onVerified={() => { setVerified(true); setVerificationOpen(false); if (pendingEditTarget) setEditTarget(pendingEditTarget); setPendingEditTarget(null); }} /> : null}
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
  return <section className="mt-4 rounded-xl border border-theme bg-surface px-5 py-6 sm:px-7"><div className="flex items-center justify-between"><h2 className="text-[15px] font-extrabold">{title}</h2><button type="button" onClick={onCancel} className="text-[11px] font-semibold text-theme-muted hover:text-brand">취소</button></div><div className="mx-auto mt-6 max-w-[650px] space-y-4">{children}</div><p className="mt-16 rounded-lg border border-theme bg-surface-subtle px-4 py-3 text-[10px] font-semibold leading-5 text-theme-muted">결제 정보는 PCI-DSS 보안 기준에 따라 암호화 저장되며, 페어링 수수료 자동 결제에만 사용됩니다.</p></section>;
}

function CardForm({ payment, onCancel, onSave }: { payment: PaymentState; onCancel: () => void; onSave: (brand: string, number: string, holder: string) => Promise<void> }) {
  const [brand, setBrand] = useState(payment.cardCompany);
  const [number, setNumber] = useState("");
  const [holder, setHolder] = useState(payment.cardHolder);
  const { options, isLoading, isError, retry } = useSignupOptions(getCardCompanies);
  const valid = brand.trim() && isValidCardNumber(number) && holder.trim();
  return <EditPanel title="카드 수정" onCancel={onCancel}><EditField label="카드사"><select value={brand} onChange={(event) => setBrand(event.target.value)} disabled={isLoading || isError} className={inputClassName}><option value="">{isLoading ? "카드사 목록을 불러오는 중..." : "카드사를 선택해 주세요."}</option>{options.map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}</select>{isError ? <RetryButton onClick={retry} label="카드사 목록 다시 불러오기" /> : null}</EditField><EditField label="카드 번호"><input value={number} onChange={(event) => setNumber(formatCardNumber(event.target.value))} inputMode="numeric" autoComplete="cc-number" maxLength={19} placeholder="카드 번호를 입력해 주세요" className={inputClassName} /></EditField><EditField label="소유자"><input value={holder} onChange={(event) => setHolder(event.target.value)} autoComplete="cc-name" className={inputClassName} /></EditField><SubmitButton disabled={!valid} onClick={() => void onSave(brand, digitsOnly(number), holder)} /></EditPanel>;
}

function AccountForm({ payment, onCancel, onSave }: { payment: PaymentState; onCancel: () => void; onSave: (bankCode: string, number: string, holder: string) => Promise<void> }) {
  const [bank, setBank] = useState("");
  const [number, setNumber] = useState("");
  const [holder, setHolder] = useState(payment.accountHolder);
  const { options, isLoading, isError, retry } = useSignupOptions(getBanks);
  const valid = bank.trim() && isValidAccountNo(number) && holder.trim();
  return <EditPanel title="계좌 수정" onCancel={onCancel}><EditField label="은행"><select value={bank} onChange={(event) => setBank(event.target.value)} disabled={isLoading || isError} className={inputClassName}><option value="">{isLoading ? "은행 목록을 불러오는 중..." : "은행을 선택해 주세요."}</option>{options.map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}</select>{isError ? <RetryButton onClick={retry} label="은행 목록 다시 불러오기" /> : null}</EditField><EditField label="계좌 번호"><input value={number} onChange={(event) => setNumber(event.target.value.replace(/\D/g, ""))} inputMode="numeric" maxLength={14} placeholder="'-' 없이 숫자만 입력해 주세요" className={inputClassName} /></EditField><EditField label="예금주"><input value={holder} onChange={(event) => setHolder(event.target.value)} className={inputClassName} /></EditField><SubmitButton disabled={!valid} onClick={() => void onSave(bank, digitsOnly(number), holder)} /></EditPanel>;
}

function EditField({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-[10px] font-semibold text-theme-muted">{label} <span className="text-theme-danger">*</span></span>{children}</label>; }
function SubmitButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) { return <div className="flex justify-end pt-1"><button type="button" disabled={disabled} onClick={onClick} className="h-11 min-w-40 rounded-md bg-brand px-6 text-[12px] font-bold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-theme-muted">수정하기</button></div>; }
function RetryButton({ onClick, label }: { onClick: () => void; label: string }) { return <button type="button" onClick={onClick} className="mt-2 text-[11px] font-semibold text-theme-danger underline">{label}</button>; }
function formatCardNumber(value: string) { return value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1-"); }
