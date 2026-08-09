import type {
  PendingSocialSignup,
  SocialProvider,
} from "@/features/auth/types/socialAuthTypes";

const PROVIDER_KEY = "pairing.social.provider";
const RETURN_URL_KEY = "pairing.social.returnUrl";

// OAuth 이동 중에도 필요한 비민감 정보만 현재 탭에 보관합니다.
export const saveSocialLoginAttempt = (
  provider: SocialProvider,
  returnUrl: string,
) => {
  window.sessionStorage.setItem(PROVIDER_KEY, provider);
  window.sessionStorage.setItem(RETURN_URL_KEY, returnUrl);
};

export const getSocialLoginAttempt = () => {
  const provider = window.sessionStorage.getItem(PROVIDER_KEY);
  const returnUrl = window.sessionStorage.getItem(RETURN_URL_KEY);

  if (provider !== "kakao" && provider !== "google") return null;
  const validProvider: SocialProvider = provider;
  return { provider: validProvider, returnUrl };
};

export const clearSocialLoginAttempt = () => {
  window.sessionStorage.removeItem(PROVIDER_KEY);
  window.sessionStorage.removeItem(RETURN_URL_KEY);
};

// 가입 티켓은 URL이나 브라우저 저장소에 남기지 않고 화면 이동 동안만 보관합니다.
let pendingSocialSignup: PendingSocialSignup | null = null;

export const savePendingSocialSignup = (signup: PendingSocialSignup) => {
  pendingSocialSignup = signup;
};

export const getPendingSocialSignup = () => pendingSocialSignup;

export const clearPendingSocialSignup = () => {
  pendingSocialSignup = null;
};
