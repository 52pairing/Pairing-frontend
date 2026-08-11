interface AccountLockedAlertProps {
  onVerifyEmail: () => void;
}

/** 비밀번호 5회 이상 오입력으로 계정이 잠겼을 때 로그인 폼 상단에 표시 */
export const AccountLockedAlert = ({
  onVerifyEmail,
}: AccountLockedAlertProps) => (
  <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
    <p className="text-sm font-bold text-amber-800">
      계정이 일시적으로 잠겼습니다.
    </p>
    <p className="mt-1 text-xs font-medium text-amber-700">
      비밀번호를 5회 이상 잘못 입력했습니다. 이메일 인증 후 로그인을 계속할 수
      있습니다.
    </p>
    <button
      type="button"
      onClick={onVerifyEmail}
      className="mt-3 h-8 rounded-md border border-amber-300 bg-surface px-3 text-xs font-semibold text-amber-800 hover:bg-amber-100"
    >
      이메일 인증하기
    </button>
  </div>
);
