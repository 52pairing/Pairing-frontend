"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useToast } from "@/features/common/hooks/useToast";
import { ClientMyPageLayout } from "@/features/client/mypage/components/ClientMyPageLayout";

interface CompanyForm {
  businessField: string;
  companyName: string;
  employeeCount: string;
  address: string;
}

const INITIAL_COMPANY: CompanyForm = {
  businessField: "IT/소프트웨어",
  companyName: "주식회사 오이랩",
  employeeCount: "50-100명",
  address: "서울특별시 강남구 테헤란로 123 10층",
};

export function ClientCompanyInfo() {
  const user = useCurrentUser();
  const toast = useToast();
  const [company, setCompany] = useState(INITIAL_COMPANY);
  const [draft, setDraft] = useState(INITIAL_COMPANY);
  const [isEditing, setIsEditing] = useState(false);
  const patchDraft = (key: keyof CompanyForm, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const isValid = Object.values(draft).every((value) => value.trim() !== "");

  const handleSave = () => {
    if (!isValid) return;
    setCompany(draft);
    setIsEditing(false);
    toast.success("기업 정보가 화면에 임시 반영되었습니다.");
  };

  return (
    <ClientMyPageLayout activeMenu="profile">
      <section className="min-h-[345px] rounded-xl border border-theme bg-surface px-5 py-6 sm:px-8 sm:py-7">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[16px] font-bold">
            기업 정보
          </h2>
          {isEditing ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setDraft(company);
                  setIsEditing(false);
                }}
                className="h-9 rounded-md border border-theme px-4 text-[12px] font-bold text-theme-secondary transition hover:bg-surface-subtle"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!isValid}
                className="h-9 rounded-md bg-brand px-4 text-[12px] font-bold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-theme-muted"
              >
                저장
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDraft(company);
                setIsEditing(true);
              }}
              className="h-9 rounded-md border border-brand px-4 text-[12px] font-bold text-brand transition hover:bg-surface-subtle"
            >
              수정
            </button>
          )}
        </div>
        {isEditing ? (
          <CompanyEditForm
            draft={draft}
            userName={user?.name}
            userEmail={user?.email}
            onChange={patchDraft}
          />
        ) : (
          <CompanyDetails company={company} userName={user?.name} />
        )}
      </section>
    </ClientMyPageLayout>
  );
}

function CompanyDetails({
  company,
  userName,
}: {
  company: CompanyForm;
  userName?: string;
}) {
  return (
    <dl className="mt-9 grid gap-x-16 gap-y-8 sm:grid-cols-2">
      <Info label="회사명" value={company.companyName} />
      <Info label="사업자등록 번호" value="123-45-67890" />
      <Info label="사업 분야" value={company.businessField} />
      <Info label="직원 수" value={company.employeeCount} />
      <Info label="담당자명" value={userName ?? "불러오는 중"} />
      <Info label="회사 주소" value={company.address} />
    </dl>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[12px] font-semibold text-theme-muted">{label}</dt>
      <dd className="mt-2 text-[14px] font-bold text-theme-primary">{value}</dd>
    </div>
  );
}

function CompanyEditForm({
  draft,
  userName,
  userEmail,
  onChange,
}: {
  draft: CompanyForm;
  userName?: string;
  userEmail?: string;
  onChange: (key: keyof CompanyForm, value: string) => void;
}) {
  const inputClass =
    "h-11 w-full rounded-md border border-theme bg-surface px-4 text-[13px] font-semibold text-theme-primary outline-none transition placeholder:text-theme-muted hover:border-brand focus:border-brand";
  const readOnlyClass = `${inputClass} bg-surface-subtle text-theme-muted`;
  return (
    <div className="mt-7 grid gap-x-4 gap-y-4 sm:grid-cols-2">
      <Field label="회사명">
        <input
          value={draft.companyName}
          maxLength={50}
          onChange={(event) => onChange("companyName", event.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="사업 분야"><SelectField value={draft.businessField} onChange={(value) => onChange("businessField", value)} options={["IT/소프트웨어", "디자인/콘텐츠", "마케팅/광고", "금융/핀테크", "기타"]} inputClass={inputClass} /></Field>
      <Field label="사업자등록 번호">
        <input value="123-45-67890" readOnly className={readOnlyClass} />
      </Field>
      <Field label="직원 수"><SelectField value={draft.employeeCount} onChange={(value) => onChange("employeeCount", value)} options={["1-9명", "10-49명", "50-100명", "101-300명", "301명 이상"]} inputClass={inputClass} /></Field>
      <Field label="담당자명">
        <input
          value={userName ?? "불러오는 중"}
          readOnly
          className={readOnlyClass}
        />
      </Field>
      <Field label="업무 이메일">
        <input
          value={userEmail ?? "불러오는 중"}
          readOnly
          className={readOnlyClass}
        />
      </Field>
      <div className="sm:col-span-2">
        <Field label="회사 주소">
          <input
            value={draft.address}
            maxLength={255}
            onChange={(event) => onChange("address", event.target.value)}
            className={inputClass}
          />
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-semibold text-theme-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

function SelectField({ value, onChange, options, inputClass }: { value: string; onChange: (value: string) => void; options: string[]; inputClass: string }) {
  return (
    <div className="relative">
      <select value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClass} appearance-none pr-10`}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
      <Image src="/icons/ChevronDownIcon.svg" alt="" width={12} height={12} aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
    </div>
  );
}
