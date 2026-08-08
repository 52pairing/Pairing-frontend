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
  // 공통 API 주소와 요청 옵션을 적용하여 서버 요청
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  // 백엔드 응답 JSON 변환
  const body = await res.json();

  // 요청 성공 시 실제 데이터만 반환
  if (res.ok) {
    return (body as ApiSuccessBody<T>).data;
  }

  // 요청 실패 시 백엔드 에러 정보를 공통 예외로 변환
  const error = body as ApiErrorBody;

  throw new ApiException(
    error.errorCode,
    error.message,
    res.status,
  );
}