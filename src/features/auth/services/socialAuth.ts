import type {
  SocialAuthorizeResponse,
  SocialCallbackRequest,
  SocialCallbackResponse,
  SocialProvider,
} from "@/features/auth/types/socialAuthTypes";
import { apiCall } from "@/lib/api";

// 카카오·구글 인증 화면으로 이동할 URL을 백엔드에서 받습니다.
export const getSocialAuthorizeUrl = (
  provider: SocialProvider,
  returnUrl: string,
) => {
  const query = new URLSearchParams({ returnUrl });

  return apiCall<SocialAuthorizeResponse>(
    `/api/v1/auth/social/${provider}/authorize?${query}`,
  );
};

// 공급자 콜백의 code와 state를 백엔드에 전달합니다.
export const completeSocialLogin = (
  provider: SocialProvider,
  payload: SocialCallbackRequest,
) =>
  apiCall<SocialCallbackResponse>(
    `/api/v1/auth/social/${provider}/callback`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
