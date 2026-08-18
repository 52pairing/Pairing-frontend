import { apiCall } from "@/lib/api";
import type { SignupOption } from "@/features/auth/types/signupApiTypes";

/**
 * 정적 메타(/api/v1/meta/*)는 세션 동안 값이 바뀌지 않으므로 최초 조회 결과(프로미스)를
 * 캐시해, 회원가입 위저드·마이페이지 결제수단 화면을 오갈 때마다 반복 호출되는 것을 막는다.
 * 실패 시 캐시를 비워 재시도 가능(freelancerResume.ts와 동일 패턴).
 */
const cacheOnce = <T>(fetcher: () => Promise<T>): (() => Promise<T>) => {
  let cached: Promise<T> | null = null;
  return () => {
    if (!cached) {
      cached = fetcher().catch((error) => {
        cached = null;
        throw error;
      });
    }
    return cached;
  };
};

// 회원가입 기업 정보에서 사용할 사업 분야 목록을 가져옵니다.
export const getBusinessFields = cacheOnce(() =>
  apiCall<SignupOption[]>("/api/v1/meta/business-fields"),
);

// 회원가입 기업 정보에서 사용할 직원 수 목록을 가져옵니다.
export const getEmployeeCounts = cacheOnce(() =>
  apiCall<SignupOption[]>("/api/v1/meta/employee-counts"),
);

// 계좌 정보에서 사용할 은행 목록을 가져옵니다.
export const getBanks = cacheOnce(() =>
  apiCall<SignupOption[]>("/api/v1/meta/banks"),
);

// 카드 등록에서 서버 enum 코드와 표시 이름을 가져옵니다.
export const getCardCompanies = cacheOnce(() =>
  apiCall<SignupOption[]>("/api/v1/meta/card-companies"),
);
