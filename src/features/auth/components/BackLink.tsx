// ~ 돌아가기 공용 링크/버튼

import Image from "next/image";
import Link from "next/link";

interface BackLinkProps {
  label: string;
  // 다른 페이지로 이동할 때
  href: string;
  // 같은 페이지 안에서 이전 단계로만 돌아갈 때
  onClick: () => void;
}

// 인증 플로우 화면 상단의 "‹ ~로 돌아가기"
export const BackLink = ({ label, href, onClick }: BackLinkProps) => {
  const className =
    "mb-5 inline-flex items-center gap-1 text-xs font-medium text-theme-secondary hover:text-theme-primary";

  const content = (
    <>
      <Image
        src="/icons/LeftAngleBracketIcon.svg"
        alt=""
        width={14}
        height={14}
        aria-hidden="true"
      />
      {label}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
};
