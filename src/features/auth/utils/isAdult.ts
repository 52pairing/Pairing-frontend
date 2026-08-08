// 생년월일로 만 18세 이상 여부를 계산. SSR 하이드레이션 불일치를 피하기 위해
// `today`를 항상 인자로 받고 내부에서 Date.now()/new Date()를 호출하지 않습니다.

import { MIN_SIGNUP_AGE } from "@/features/auth/constants/signupPolicy";

export const isAtLeast18 = (birthDate: Date, today: Date): boolean => {
  const minAgeDate = new Date(
    today.getFullYear() - MIN_SIGNUP_AGE,
    today.getMonth(),
    today.getDate(),
  );

  return birthDate.getTime() <= minAgeDate.getTime();
};
