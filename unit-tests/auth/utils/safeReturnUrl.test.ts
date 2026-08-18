import {
  buildLoginRedirectPath,
  isSensitiveReturnPath,
  resolveSafeReturnUrl,
} from "@/features/auth/utils/safeReturnUrl";

describe("isSensitiveReturnPath", () => {
  it.each([
    "/client/mypage/payment-methods",
    "/freelancer/mypage/payment-methods",
    "/client/mypage/payments",
    "/freelancer/mypage/payments",
    "/client/mypage/password",
    "/freelancer/mypage/password",
    "/client/mypage/cancel",
    "/freelancer/mypage/cancel",
    "/client/mypage/settings",
    "/freelancer/mypage/settings",
    "/client/mypage/company",
    "/client/payments/complete",
    "/freelancer/payments/upfront/complete",
    "/client/projects/123/success-fee/complete",
    "/freelancer/contracts/456/success-fee/complete",
    "/client/projects/123/contracts/456/sign",
    "/freelancer/contracts/456/sign",
  ])("%s는 보안 민감 경로로 판단한다", (path) => {
    expect(isSensitiveReturnPath(path)).toBe(true);
  });

  it.each(["/client", "/freelancer/mypage", "/client/mypage/profile", "/chat", "/notifications"])(
    "%s는 보안 민감 경로가 아니다",
    (path) => {
      expect(isSensitiveReturnPath(path)).toBe(false);
    },
  );
});

describe("buildLoginRedirectPath", () => {
  it("일반 경로는 returnUrl을 붙인다", () => {
    expect(buildLoginRedirectPath("/freelancer/mypage")).toBe(
      `/login?returnUrl=${encodeURIComponent("/freelancer/mypage")}`,
    );
  });

  it("보안 민감 경로는 returnUrl 없이 로그인 경로만 반환한다", () => {
    expect(buildLoginRedirectPath("/client/mypage/cancel")).toBe("/login");
  });
});

describe("resolveSafeReturnUrl", () => {
  it("returnUrl이 없으면 fallback을 반환한다", () => {
    expect(resolveSafeReturnUrl(null, "/client")).toBe("/client");
    expect(resolveSafeReturnUrl(undefined, "/client")).toBe("/client");
  });

  it("외부 주소면 fallback을 반환한다", () => {
    expect(resolveSafeReturnUrl("//evil.example.com", "/client")).toBe("/client");
    expect(resolveSafeReturnUrl("https://evil.example.com", "/client")).toBe("/client");
  });

  it("보안 민감 경로면 fallback을 반환한다", () => {
    expect(resolveSafeReturnUrl("/freelancer/mypage/payment-methods", "/freelancer")).toBe(
      "/freelancer",
    );
  });

  it("안전한 앱 내부 경로면 그대로 사용한다", () => {
    expect(resolveSafeReturnUrl("/client/projects", "/client")).toBe("/client/projects");
  });
});
