import type { CurrentUserResponse } from "@/features/auth/types";
import { apiCall } from "@/lib/api";

const CURRENT_USER_CACHE_MS = 5_000;

let cachedUser: CurrentUserResponse | null = null;
let cachedAt = 0;
let currentUserRequest: Promise<CurrentUserResponse> | null = null;
let cacheGeneration = 0;

// 같은 화면 진입 과정에서 인증 가드와 헤더가 확인한 사용자 정보를 공유합니다.
export const getCachedCurrentUser = () =>
  cachedUser && Date.now() - cachedAt < CURRENT_USER_CACHE_MS ? cachedUser : null;

// 서버 렌더가 조회한 사용자(initialUser)를 클라이언트 모듈 캐시에 시드합니다.
// 하드 진입 시 가드·헤더가 같은 정보를 /auth/me로 다시 조회하지 않도록 하기 위함입니다.
// 이미 유효한 캐시가 있으면(더 최신일 수 있으므로) 덮지 않습니다.
export const seedCurrentUser = (user: CurrentUserResponse) => {
  if (getCachedCurrentUser()) return;
  cachedUser = user;
  cachedAt = Date.now();
};

// 로그아웃·회원 탈퇴 직후 이전 로그인 사용자가 잠시 다시 노출되지 않도록
// 클라이언트 메모리에 보관한 사용자와 진행 중 요청을 초기화합니다.
export const clearCurrentUserCache = () => {
  cacheGeneration += 1;
  cachedUser = null;
  cachedAt = 0;
  currentUserRequest = null;
};

// 인증 쿠키를 기준으로 현재 로그인한 사용자 정보를 가져옵니다.
// 동시에 호출되면 한 요청을 공유해 가드·헤더·본문의 완료 시점이 어긋나지 않게 합니다.
export const getCurrentUser = () => {
  const cached = getCachedCurrentUser();
  if (cached) return Promise.resolve(cached);
  if (currentUserRequest) return currentUserRequest;

  const requestGeneration = cacheGeneration;
  currentUserRequest = apiCall<CurrentUserResponse>("/api/v1/auth/me")
    .then((user) => {
      if (requestGeneration === cacheGeneration) {
        cachedUser = user;
        cachedAt = Date.now();
      }
      return user;
    })
    .finally(() => {
      currentUserRequest = null;
    });

  return currentUserRequest;
};
