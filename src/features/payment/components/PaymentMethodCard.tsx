import type { PaymentMethod } from "@/features/payment/types/payment";

interface PaymentMethodCardProps {
  method: PaymentMethod;
  selected: boolean;
  onSelect: () => void;
}

export function PaymentMethodCard({
  method,
  selected,
  onSelect,
}: PaymentMethodCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full cursor-pointer rounded-[11px] border px-4 py-3.5 text-left transition ${
        selected
          ? "border-brand bg-[#eef3f8]"
          : "border-theme bg-surface hover:bg-surface-subtle"
      }`}
    >
      <span className="block text-[13px] font-bold text-theme-primary">
        {method.issuer}
      </span>
      <span className="mt-1 block text-[11px] font-semibold text-theme-muted">
        {method.maskedNumber}
      </span>
    </button>
  );
}
