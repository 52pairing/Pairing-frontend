import Link from "next/link";

export const FREELANCER_MY_PAGE_MENU = [
  { label: "기본 정보", value: "profile", href: "/freelancer/mypage/profile" },
  { label: "내 이력서", value: "resume", href: "/freelancer/mypage/resume" },
  { label: "리뷰 관리", value: "reviews", href: "/freelancer/mypage/reviews" },
  { label: "결제수단", value: "payment-methods", href: "/freelancer/mypage/payment-methods" },
  { label: "결제 내역", value: "payments", href: "/freelancer/mypage/payments" },
] as const;

export type FreelancerMyPageMenu = (typeof FREELANCER_MY_PAGE_MENU)[number]["value"];
export type FreelancerMyPageActiveMenu = FreelancerMyPageMenu | "cancel";

interface FreelancerMyPageSidebarProps {
  activeMenu: FreelancerMyPageActiveMenu;
}

export function FreelancerMyPageSidebar({ activeMenu }: FreelancerMyPageSidebarProps) {
  return (
    <aside className="w-full shrink-0 rounded-xl border border-[#dde3ea] bg-white py-2 sm:w-[215px]">
      <nav aria-label="프리랜서 마이페이지 메뉴">
        <ul>
          {FREELANCER_MY_PAGE_MENU.map((menu) => {
            const isActive = menu.value === activeMenu;
            return (
              <li key={menu.value}>
                <Link
                  href={menu.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex h-12 items-center px-5 text-[13px] font-semibold transition-colors ${
                    isActive
                      ? "bg-[#edf2f7] text-[#17365d]"
                      : "text-[#667085] hover:bg-[#f8fafc] hover:text-[#344054]"
                  }`}
                >
                  {menu.label}
                </Link>
              </li>
            );
          })}
          <li>
            <Link
              href="/freelancer/mypage/cancel"
              aria-current={activeMenu === "cancel" ? "page" : undefined}
              className={`flex h-12 items-center px-5 text-[13px] font-semibold text-[#f04438] transition-colors hover:bg-[#fff5f4] ${activeMenu === "cancel" ? "bg-[#fff5f4]" : ""}`}
            >
              회원 탈퇴
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
