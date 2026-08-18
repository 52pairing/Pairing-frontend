// 재로그인 후 그대로 복귀하면 위험한 화면(결제, 서명, 비밀번호, 탈퇴 등).
// 세션 만료로 로그인을 다시 거친 뒤에는 이 경로들로 되돌리지 않고 역할 홈으로 보낸다.
const SENSITIVE_PATH_PATTERNS: RegExp[] = [
  /^\/(client|freelancer)\/mypage\/payment-methods(\/|$)/,
  /^\/(client|freelancer)\/mypage\/payments(\/|$)/,
  /^\/(client|freelancer)\/mypage\/password(\/|$)/,
  /^\/(client|freelancer)\/mypage\/cancel(\/|$)/,
  /^\/(client|freelancer)\/mypage\/settings(\/|$)/,
  /^\/client\/mypage\/company(\/|$)/,
  /^\/client\/payments\/complete(\/|$)/,
  /^\/freelancer\/payments\/upfront\/complete(\/|$)/,
  /\/success-fee\/complete(\/|$)/,
  /\/contracts\/[^/]+\/sign(\/|$)/,
];

export const isSensitiveReturnPath = (pathname: string): boolean =>
  SENSITIVE_PATH_PATTERNS.some((pattern) => pattern.test(pathname));

// 로그인 화면으로 보낼 때 붙일 경로. 보안 민감 경로는 returnUrl 자체를 붙이지 않는다.
export const buildLoginRedirectPath = (pathname: string): string =>
  isSensitiveReturnPath(pathname)
    ? "/login"
    : `/login?returnUrl=${encodeURIComponent(pathname)}`;

// 로그인 완료 후 이동할 목적지를 계산한다.
// 앱 내부 경로가 아니거나 보안 민감 경로면 fallback으로 대체한다.
export const resolveSafeReturnUrl = (
  returnUrl: string | null | undefined,
  fallback: string,
): string => {
  if (!returnUrl || !returnUrl.startsWith("/") || returnUrl.startsWith("//")) {
    return fallback;
  }

  return isSensitiveReturnPath(returnUrl) ? fallback : returnUrl;
};
