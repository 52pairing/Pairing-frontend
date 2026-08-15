// 비밀번호 찾기 - 2단계 인증 링크 발송 완료

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const RESEND_COOLDOWN_SECONDS = 180;

interface FindPasswordSentProps {
  // 서버가 실제 발송 여부를 확인해주지 않아 사용자가 입력한 값을 그대로 참고용으로 표시
  email: string;
  onResend: () => void;
}

export const FindPasswordSent = ({
  email,
  onResend,
}: FindPasswordSentProps) => {
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  // 재발송도 별도 엔드포인트 없이 같은 요청을 다시 보내는 것
  const handleResend = () => {
    if (secondsLeft > 0) return;
    onResend();
    setSecondsLeft(RESEND_COOLDOWN_SECONDS);
  };

  return (
    <div className="flex flex-col items-center text-center">
      <MailIcon />

      <h1 className="mt-5 text-lg font-bold text-theme-primary">
        인증 링크를 보냈습니다.
      </h1>
      {/* 입력값이 실제로 일치하는지는 서버가 알려주지 않아 확정 문구를 쓰지 않음 */}
      <p className="mt-2 text-sm font-medium text-theme-secondary">
        입력하신 정보가 일치하면 가입한 이메일로 인증 링크를 보내드렸습니다.
        메일함을 확인해 주세요.
      </p>

      <div className="mt-6 w-full rounded-md border border-theme bg-surface-subtle px-4 py-3">
        <p className="text-xs text-theme-muted">입력하신 이메일</p>
        <p className="mt-1 text-sm font-bold text-brand">{email}</p>
      </div>

      <ul className="mt-5 list-disc space-y-1 pl-4 text-left text-xs text-theme-secondary">
        <li>
          이메일의 인증 링크를 클릭하면 본인 인증이 완료되고 임시 비밀번호가
          발급됩니다.
        </li>
        <li>이메일이 보이지 않는 경우 스팸 메일함을 확인해 주세요.</li>
        {/* 링크 유효시간 3분 (문서 7-3절 기준) */}
        <li>인증 링크는 발송 후 3분 동안 유효합니다.</li>
      </ul>

      <button
        type="button"
        onClick={handleResend}
        disabled={secondsLeft > 0}
        className="mt-6 h-11 w-full rounded-md border border-theme text-sm font-semibold text-theme-muted disabled:cursor-not-allowed enabled:text-theme-secondary enabled:hover:bg-surface-subtle"
      >
        {secondsLeft > 0
          ? `이메일 다시 보내기 (${secondsLeft}s)`
          : "이메일 다시 보내기"}
      </button>

      <Link
        href="/login"
        className="mt-4 text-xs font-medium text-theme-secondary hover:text-theme-primary"
      >
        로그인으로 돌아가기
      </Link>
    </div>
  );
};

// 발송 완료 화면 상단 봉투 아이콘
const MailIcon = () => (
  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-7 w-7 text-blue-500"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  </span>
);
