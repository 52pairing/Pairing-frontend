import type { ReactNode } from "react";

interface ProfileRegistrationShellProps {
  step: 1 | 2;
  title: string;
  description: string;
  children: ReactNode;
}

export function ProfileRegistrationShell({ step, title, description, children }: ProfileRegistrationShellProps) {
  return (
    <main className="min-h-screen bg-surface-subtle px-4 py-10 text-theme-primary sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-[660px]">
        <h1 className="text-[24px] font-extrabold leading-tight tracking-[-0.04em] sm:text-[27px]">{title}</h1>
        <p className="mt-2 text-[11px] font-semibold text-theme-secondary">{description}</p>
        <div className="mt-7 flex items-center text-[10px] font-bold">
          <div className={`flex items-center gap-2 ${step === 1 ? "text-brand" : "text-theme-success"}`}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-brand-contrast ${step === 1 ? "bg-brand" : "bg-emerald-500"}`}>
              {step === 1 ? "1" : "✓"}
            </span>
            기본 프로필
          </div>
          <div className="mx-3 h-px flex-1 bg-theme sm:mx-4" />
          <div className={step === 2 ? "text-brand" : "text-theme-muted"}>
            <span className={`mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-brand-contrast ${step === 2 ? "bg-brand" : "bg-surface-muted text-theme-muted"}`}>2</span>
            이력서 <span className="font-medium text-theme-muted">/ 2단계</span>
          </div>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}

export function FormCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[10px] border border-theme bg-surface p-5 sm:p-6 ${className}`}>{children}</section>;
}

export const fieldClassName = "mt-2 h-10 w-full rounded-md border border-theme bg-surface px-3 text-[12px] font-semibold text-theme-primary outline-none placeholder:text-theme-muted hover:border-brand hover:outline-2 hover:outline-brand focus:border-brand focus:outline-2 focus:outline-brand";
export const labelClassName = "text-[12px] font-bold text-theme-primary";
