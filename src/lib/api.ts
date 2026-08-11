// 환경변수에 설정된 백엔드 API 기본 주소
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// API 성공 응답 형식
interface ApiSuccessBody<T> {
  code: string;
  message: string;
  data: T;
}

// API 실패 응답 형식
interface ApiErrorBody {
  errorCode: string;
  message: string;
  status: number;
  traceId: string;
}

// API 요청 실패 시 사용하는 공통 에러 객체
export class ApiException extends Error {
  constructor(
    public readonly errorCode: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export type AuthSessionEndReason = "expired" | "duplicate";
export const AUTH_SESSION_END_EVENT = "auth:session-end";

let refreshRequest: Promise<void> | null = null;

const notifySessionEnd = (reason: AuthSessionEndReason) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<AuthSessionEndReason>(AUTH_SESSION_END_EVENT, {
        detail: reason,
      }),
    );
  }
};

const requestRefresh = async () => {
  if (!refreshRequest) {
    refreshRequest = (async () => {
      const response = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) return;

      const error = (await response.json()) as ApiErrorBody;
      notifySessionEnd(error.errorCode === "AU_015" ? "duplicate" : "expired");
      throw new ApiException(error.errorCode, error.message, response.status);
    })().finally(() => {
      refreshRequest = null;
    });
  }

  return refreshRequest;
};

/**
 * 공통 API 클라이언트
 * - 쿠키 기반 인증 요청 처리 (credentials: "include")
 * - 성공 응답에서 data 추출
 * - 실패 응답을 ApiException으로 변환
 */
export async function apiCall<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const isFormData = init.body instanceof FormData;

  // 공통 API 주소와 요청 옵션을 적용하여 서버 요청
  const request = () =>
    fetch(`${API_BASE}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        ...(!isFormData ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });

  let res = await request();
  let body = await res.json();

  if (!res.ok && (body as ApiErrorBody).errorCode === "GLOBAL_009") {
    await requestRefresh();
    res = await request();
    body = await res.json();
  }

  // 요청 성공 시 실제 데이터만 반환
  if (res.ok) {
    return (body as ApiSuccessBody<T>).data;
  }

  // 요청 실패 시 백엔드 에러 정보를 공통 예외로 변환
  const error = body as ApiErrorBody;

  if (error.errorCode === "GLOBAL_010") notifySessionEnd("expired");
  if (error.errorCode === "GLOBAL_011") notifySessionEnd("duplicate");

  throw new ApiException(
    error.errorCode,
    error.message,
    res.status,
  );
}

export async function apiBlob(path: string): Promise<Blob> {
  const request = () =>
    fetch(`${API_BASE}${path}`, {
      credentials: "include",
    });

  let response = await request();

  if (!response.ok) {
    let error = (await response.json()) as ApiErrorBody;

    if (error.errorCode === "GLOBAL_009") {
      await requestRefresh();
      response = await request();
      if (response.ok) return response.blob();
      error = (await response.json()) as ApiErrorBody;
    }

    if (error.errorCode === "GLOBAL_010") notifySessionEnd("expired");
    if (error.errorCode === "GLOBAL_011") notifySessionEnd("duplicate");
    throw new ApiException(error.errorCode, error.message, response.status);
  }

  return response.blob();
}
