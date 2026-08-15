// 비밀번호 찾기 - 3단계, 이메일 링크로 진입한 화면
// 버튼을 눌러야만 인증을 확인합니다 (자동 호출 시 메일 미리보기 등으로 토큰이 먼저 소모될 수 있음)

interface ResetPasswordConfirmProps {
  isLoading: boolean;
  error?: string;
  onConfirm: () => void;
}

export const ResetPasswordConfirm = ({
  isLoading,
  error,
  onConfirm,
}: ResetPasswordConfirmProps) => (
  <div className="flex flex-col items-center text-center">
    <h1 className="text-lg font-bold text-theme-primary">
      비밀번호 재설정을 계속하시겠어요?
    </h1>
    <p className="mt-2 text-sm font-medium text-theme-secondary">
      아래 버튼을 누르면 본인 확인이 완료되고, 임시 비밀번호가 메일로
      발송됩니다.
    </p>

    {error ? (
      <p className="mt-4 text-xs font-medium text-red-500">{error}</p>
    ) : null}

    <button
      type="button"
      onClick={onConfirm}
      disabled={isLoading}
      className="mt-6 h-11 w-full rounded-md bg-brand text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:bg-gray-300 enabled:hover:bg-brand"
    >
      {isLoading ? "확인 중..." : "임시 비밀번호 받기"}
    </button>
  </div>
);
