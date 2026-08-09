import Image from "next/image";
import Link from "next/link";
import { HeaderShell } from "./HeaderShell";
import { ProfileMenu } from "./ProfileMenu";

const freelancerNavItems = [
  { label: "내 프로젝트", href: "/freelancer/projects" },
  { label: "계약 관리", href: "/freelancer/contracts" },
];

interface FreelancerHeaderProps {
  name?: string;
  chatCount?: number;
  noticeCount?: number;
}

// 프리랜서 로그인 사용자에게 보여주는 Header
export function FreelancerHeader({
  name = "프리랜서",
  chatCount = 0,
  noticeCount = 0,
}: FreelancerHeaderProps) {
  return (
    <HeaderShell
      nav={freelancerNavItems.map((item) => (
        <Link key={item.href} href={item.href} className="hover:text-slate-950">
          {item.label}
        </Link>
      ))}
      actions={
        <>
          <HeaderIconButton
            href="/chat"
            iconSrc="/icons/chat.svg"
            label="채팅"
            count={chatCount}
          />
          <HeaderIconButton
            href="/notifications"
            iconSrc="/icons/notice.svg"
            label="알림"
            count={noticeCount}
          />
          <ProfileMenu label={name} myPageHref="/freelancer/mypage" />
        </>
      }
    />
  );
}

interface HeaderIconButtonProps {
  href: string;
  iconSrc: string;
  label: string;
  count: number;
}

function HeaderIconButton({ href, iconSrc, label, count }: HeaderIconButtonProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="relative flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50"
    >
      <Image src={iconSrc} alt="" width={18} height={18} />
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
