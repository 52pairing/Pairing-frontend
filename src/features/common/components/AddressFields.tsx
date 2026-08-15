"use client";

import Script from "next/script";
import { useState } from "react";

import type { AddressParts } from "@/features/common/types/address";

interface DaumPostcodeResult {
  sido: string;
  sigungu: string;
  roadAddress: string;
  zonecode: string;
}

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeResult) => void;
      }) => { open: () => void };
    };
  }
}

interface AddressFieldsProps {
  value: AddressParts;
  onChange: (value: AddressParts) => void;
  label?: string;
}

const inputClass =
  "h-11 w-full rounded-md border border-theme bg-surface px-4 text-sm text-theme-primary outline-none placeholder:text-theme-muted focus:border-brand";

export function AddressFields({
  value,
  onChange,
  label = "주소",
}: AddressFieldsProps) {
  const [scriptReady, setScriptReady] = useState(
    () => typeof window !== "undefined" && !!window.daum?.Postcode,
  );

  const openPostcode = () => {
    if (!window.daum?.Postcode) return;

    new window.daum.Postcode({
      oncomplete: (data) => {
        // 위젯 값 중 서버 계약에 필요한 다섯 필드만 골라 저장합니다.
        onChange({
          sido: data.sido,
          sigungu: data.sigungu,
          roadAddress: data.roadAddress,
          addressDetail: "",
          zipCode: data.zonecode,
        });
      },
    }).open();
  };

  return (
    <fieldset>
      <Script
        src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <legend className="mb-2 text-sm font-semibold text-theme-secondary">
        {label} <span className="text-brand">*</span>
      </legend>
      <div className="flex gap-2">
        <input
          value={value.roadAddress}
          readOnly
          placeholder="주소 찾기 버튼을 눌러 주세요."
          className={`${inputClass} min-w-0 bg-surface-subtle`}
        />
        <button
          type="button"
          onClick={openPostcode}
          disabled={!scriptReady}
          className="h-11 shrink-0 rounded-md border border-brand px-4 text-sm font-bold text-brand disabled:cursor-not-allowed disabled:opacity-50"
        >
          주소 찾기
        </button>
      </div>
      <input
        value={value.addressDetail}
        onChange={(event) =>
          onChange({ ...value, addressDetail: event.target.value })
        }
        maxLength={255}
        placeholder="상세주소를 입력해 주세요."
        aria-label={`${label} 상세주소`}
        className={`${inputClass} mt-2`}
      />
    </fieldset>
  );
}
