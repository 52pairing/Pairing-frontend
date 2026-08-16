import type { ReactNode } from "react";
import { fieldClassName, labelClassName } from "./ProfileRegistrationShell";

export function ResumeSaveStatus({ notice }: { notice: string }) {
  return notice ? (
    <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-[10px] font-semibold leading-5 text-blue-700">
      {notice}
    </p>
  ) : null;
}

export function CardTitle({
  children,
  optional = false,
}: {
  children: ReactNode;
  optional?: boolean;
}) {
  return (
    <h2 className={labelClassName}>
      {children}
      {optional ? (
        <span className="ml-1 text-[10px] font-medium text-theme-muted">
          (선택)
        </span>
      ) : (
        <span className="ml-1 text-theme-danger">*</span>
      )}
    </h2>
  );
}

export const compactInputClassName =
  "h-9 min-w-0 rounded-md border border-theme bg-surface px-2.5 text-[10px] font-semibold text-theme-primary outline-none placeholder:text-theme-muted hover:border-brand hover:outline-2 hover:outline-brand focus:border-brand focus:outline-2 focus:outline-brand disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-theme-secondary disabled:hover:border-theme disabled:hover:outline-0";

export function CompactField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid min-w-0 gap-1.5 text-[9px] font-semibold text-theme-muted">
      {label}
      {children}
    </label>
  );
}

export function ConditionChoice({
  title,
  valueCode,
  options,
  onChange,
}: {
  title: string;
  valueCode: string;
  options: { code: string; label: string }[];
  onChange: (code: string) => void;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-theme-secondary">
        {title}
        <span className="ml-1 text-theme-danger">*</span>
      </p>
      <div className="mt-2 flex gap-2">
        {options.map((option) => (
          <button
            key={option.code}
            type="button"
            onClick={() => onChange(option.code)}
            className={`flex-1 rounded-md border px-2 py-2 text-[10px] font-bold ${valueCode === option.code ? "border-brand bg-surface-muted text-brand" : "border-theme"}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function YearMonthSelect({
  label,
  year,
  month,
  onChange,
}: {
  label: string;
  year: string;
  month: string;
  onChange: (year: string, month: string) => void;
}) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 60 }, (_, index) =>
    String(currentYear - index),
  );
  const months = Array.from({ length: 12 }, (_, index) =>
    String(index + 1).padStart(2, "0"),
  );
  return (
    <span className="flex items-center gap-1">
      <select
        aria-label={`${label} 연도`}
        value={year}
        onChange={(event) => onChange(event.target.value, month)}
        className="h-9 min-w-[64px] rounded-md border border-theme bg-surface px-2 text-[10px] font-semibold text-theme-primary outline-none hover:border-brand hover:outline-2 hover:outline-brand focus:border-brand focus:outline-2 focus:outline-brand"
      >
        <option value="">연도</option>
        {years.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <select
        aria-label={`${label} 월`}
        value={month}
        onChange={(event) => onChange(year, event.target.value)}
        className="h-9 min-w-[56px] rounded-md border border-theme bg-surface px-2 text-[10px] font-semibold text-theme-primary outline-none hover:border-brand hover:outline-2 hover:outline-brand focus:border-brand focus:outline-2 focus:outline-brand"
      >
        <option value="">월</option>
        {months.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </span>
  );
}

export function EntryBox({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 rounded-lg border border-theme bg-surface p-4">
      {children}
    </div>
  );
}
export function AddButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 h-10 w-full rounded-md border border-dashed border-theme-strong text-[11px] font-bold text-theme-secondary hover:border-brand hover:text-brand"
    >
      {children}
    </button>
  );
}
export function AgreementCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[11px] font-semibold text-theme-secondary">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="accent-[var(--brand)]"
      />
      {label}
    </label>
  );
}
export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p
      data-form-error="true"
      className="mt-2 text-[10px] font-bold text-theme-danger"
    >
      {children}
    </p>
  );
}
export function Field({
  label,
  value,
  onChange,
  error = false,
  type = "text",
  placeholder,
  inputMode,
  readOnly = false,
  maxLength,
}: {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
  type?: string;
  placeholder?: string;
  inputMode?: "numeric";
  readOnly?: boolean;
  maxLength?: number;
}) {
  return (
    <label className="block text-[11px] font-semibold text-theme-secondary">
      {label}
      <input
        className={`${fieldClassName} ${readOnly ? "cursor-not-allowed bg-surface-muted text-theme-muted" : ""} ${error ? "border-red-500" : ""}`}
        type={type}
        inputMode={inputMode}
        readOnly={readOnly}
        maxLength={maxLength}
        value={value}
        onChange={
          onChange ? (event) => onChange(event.target.value) : undefined
        }
        placeholder={placeholder}
      />
      {error ? (
        <span
          data-form-error="true"
          className="mt-1 block text-[10px] font-bold text-theme-danger"
        >
          필수 정보를 입력해 주세요.
        </span>
      ) : null}
    </label>
  );
}
export function scrollToFirstError(form: HTMLFormElement | null) {
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const error = form?.querySelector<HTMLElement>(
        '[data-form-error="true"]',
      );
      const section = error?.closest("section");
      if (!error || !section) return;
      section.scrollIntoView({ behavior: "smooth", block: "center" });
      section
        .querySelector<HTMLElement>(
          "input:not(:disabled), select:not(:disabled), textarea:not(:disabled), button",
        )
        ?.focus({ preventScroll: true });
    }),
  );
}
