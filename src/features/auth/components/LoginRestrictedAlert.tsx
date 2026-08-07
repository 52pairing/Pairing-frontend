interface LoginRestrictedAlertProps {
  /** 재시도 가능 시각 문자열 (예: "2026. 7. 31. 14:30") */
  retryAfter: string;
}

/** 비정상 로그인 시도 반복으로 접근이 일시 제한됐을 때 로그인 폼 상단에 표시 */
export const LoginRestrictedAlert = ({
  retryAfter,
}: LoginRestrictedAlertProps) => (
  <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3">
    <p className="text-sm font-bold text-red-700">
      로그인 시도가 일시적으로 제한되었습니다.
    </p>
    <p className="mt-1 text-xs font-medium text-red-600">
      비정상적인 로그인 시도가 반복되어 일시적으로 접근이 제한되었습니다.
      <br />
      {retryAfter} 이후 다시 시도해 주세요.
    </p>
  </div>
);
