// 카드/계좌 등록 스텝
// 클라이언트/프리랜서 일반/프리랜서 소셜 3개 플로우가 동일하게 재사용합니다.
// 카드사(cardBrand)는 별도 meta 엔드포인트가 없어 자유 입력으로 받습니다.
"use client";

import { useSignupOptions } from "@/features/auth/hooks/useSignupOptions";
import { getBanks } from "@/features/auth/services/signupMeta";

export interface CardAccountValues {
  cardNumber: string;
  cardBrand: string;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
}

interface CardAccountFieldsProps {
  values: CardAccountValues;
  onChange: (partial: Partial<CardAccountValues>) => void;
}

export const CardAccountFields = ({
  values,
  onChange,
}: CardAccountFieldsProps) => {
  const {
    options: bankOptions,
    isLoading,
    isError,
    retry,
  } = useSignupOptions(getBanks);

  return (
    <div className="space-y-8">
      <p className="rounded-md bg-surface-subtle px-4 py-3 text-xs text-theme-secondary">
        등록한 결제 수단은 착수금 및 성공보수 수수료 결제에 사용됩니다. 카드
        정보는 안전하게 암호화되어 처리됩니다.
      </p>

      <section>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-theme-secondary">
              카드사 <span className="text-[#356DF3]">*</span>
            </label>
            <input
              type="text"
              value={values.cardBrand}
              onChange={(e) => onChange({ cardBrand: e.target.value })}
              placeholder="예) 신한카드"
              className="h-11 w-full rounded-md border border-theme px-4 text-sm text-theme-primary outline-none placeholder:text-theme-muted focus:border-brand"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-theme-secondary">
              카드번호 <span className="text-[#356DF3]">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={values.cardNumber}
              onChange={(e) =>
                onChange({ cardNumber: e.target.value.replace(/[^\d-]/g, "") })
              }
              placeholder="1234-1234-1234-1234"
              className="h-11 w-full rounded-md border border-theme px-4 text-sm text-theme-primary outline-none placeholder:text-theme-muted focus:border-brand"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-bold text-theme-primary">계좌 등록</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-theme-secondary">
              은행 <span className="text-[#356DF3]">*</span>
            </label>
            <select
              value={values.bankCode}
              onChange={(e) => onChange({ bankCode: e.target.value })}
              disabled={isLoading || isError}
              className="h-11 w-full rounded-md border border-theme px-3 text-sm text-theme-primary outline-none focus:border-brand disabled:cursor-not-allowed disabled:text-theme-muted"
            >
              <option value="" disabled>
                {isLoading ? "은행 목록을 불러오는 중..." : "은행 선택"}
              </option>
              {bankOptions.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.label}
                </option>
              ))}
            </select>
            {isError ? (
              <div className="mt-2 flex items-center gap-2 text-xs text-red-500">
                <span>은행 목록을 불러오지 못했습니다.</span>
                <button
                  type="button"
                  onClick={retry}
                  className="font-semibold underline"
                >
                  다시 시도
                </button>
              </div>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-theme-secondary">
              계좌번호 <span className="text-[#356DF3]">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={values.accountNumber}
              onChange={(e) =>
                onChange({ accountNumber: e.target.value.replace(/\D/g, "") })
              }
              placeholder="'-' 없이 숫자만 입력해 주세요."
              className="h-11 w-full rounded-md border border-theme px-4 text-sm text-theme-primary outline-none placeholder:text-theme-muted focus:border-brand"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-theme-secondary">
              예금주 <span className="text-[#356DF3]">*</span>
            </label>
            <input
              type="text"
              value={values.accountHolder}
              onChange={(e) => onChange({ accountHolder: e.target.value })}
              placeholder="예금주 입력"
              className="h-11 w-full rounded-md border border-theme px-4 text-sm text-theme-primary outline-none placeholder:text-theme-muted focus:border-brand"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export const isCardAccountValid = (values: CardAccountValues) =>
  values.cardBrand.length > 0 &&
  values.cardNumber.length > 0 &&
  values.bankCode.length > 0 &&
  values.accountNumber.length > 0 &&
  values.accountHolder.length > 0;
