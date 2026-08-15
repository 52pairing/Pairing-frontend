"use client";

import { useRef, useState } from "react";

import type { DuplicateCheckResponse } from "@/features/auth/types/signupApiTypes";
import { ApiException } from "@/lib/api";

export type DuplicateCheckStatus =
  | "idle"
  | "checking"
  | "available"
  | "duplicated"
  | "error";

type DuplicateChecker = (value: string) => Promise<DuplicateCheckResponse>;

// 중복 확인의 로딩·성공·실패 상태를 여러 입력 필드에서 함께 사용합니다.
export const useDuplicateCheck = (
  checker: DuplicateChecker,
  initialCheckedValue?: string,
) => {
  const [status, setStatus] = useState<DuplicateCheckStatus>(
    initialCheckedValue ? "available" : "idle",
  );
  const [checkedValue, setCheckedValue] = useState(initialCheckedValue ?? "");
  const [errorMessage, setErrorMessage] = useState("");
  const requestIdRef = useRef(0);

  const reset = () => {
    requestIdRef.current += 1;
    setStatus("idle");
    setCheckedValue("");
    setErrorMessage("");
  };

  const check = async (value: string) => {
    const requestId = ++requestIdRef.current;
    setStatus("checking");
    setErrorMessage("");

    try {
      const result = await checker(value);
      if (requestId !== requestIdRef.current) return false;

      setCheckedValue(value);
      setStatus(result.duplicated ? "duplicated" : "available");
      return !result.duplicated;
    } catch (error) {
      if (requestId !== requestIdRef.current) return false;

      setStatus("error");
      setErrorMessage(
        error instanceof ApiException
          ? error.message
          : "중복 확인 중 문제가 발생했습니다.",
      );
      return false;
    }
  };

  const isAvailable = (value: string) =>
    status === "available" && checkedValue === value;

  return { status, errorMessage, check, reset, isAvailable };
};
