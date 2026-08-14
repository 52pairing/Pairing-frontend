import type { CurrentUserResponse } from "@/features/auth/types";
import { apiCall } from "@/lib/api";

const CURRENT_USER_CACHE_MS = 5_000;

let cachedUser: CurrentUserResponse | null = null;
let cachedAt = 0;
let currentUserRequest: Promise<CurrentUserResponse> | null = null;

// 같은 화면 진입 과정에서 인증 가드와 헤더가 확인한 사용자 정보를 공유합니다.
export const getCachedCurrentUser = () =>
  cachedUser && Date.now() - cachedAt < CURRENT_USER_CACHE_MS ? cachedUser : null;

// 인증 쿠키를 기준으로 현재 로그인한 사용자 정보를 가져옵니다.
// 동시에 호출되면 한 요청을 공유해 가드·헤더·본문의 완료 시점이 어긋나지 않게 합니다.
export const getCurrentUser = () => {
  const cached = getCachedCurrentUser();
  if (cached) return Promise.resolve(cached);
  if (currentUserRequest) return currentUserRequest;

  currentUserRequest = apiCall<CurrentUserResponse>("/api/v1/auth/me")
    .then((user) => {
      cachedUser = user;
      cachedAt = Date.now();
      return user;
    })
    .finally(() => {
      currentUserRequest = null;
    });

  return currentUserRequest;
};
