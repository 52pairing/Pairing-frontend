import Link from "next/link";

export const CLIENT_MY_PAGE_MENU = [
  { label: "기본 정보", value: "profile", href: "/client/mypage/profile" },
  { label: "기업 정보", value: "company", href: "/client/mypage/company" },
  { label: "리뷰 관리", value: "reviews", href: "/client/mypage/reviews" },
  { label: "결제수단", value: "payment-methods", href: "/client/mypage/payment-methods" },
  { label: "결제 내역", value: "payments", href: "/client/mypage/payments" },
] as const;

export type ClientMyPageMenu = (typeof CLIENT_MY_PAGE_MENU)[number]["value"];
export type ClientMyPageActiveMenu = ClientMyPageMenu | "cancel";

interface ClientMyPageSidebarProps {
  activeMenu: ClientMyPageActiveMenu;
}

export function ClientMyPageSidebar({ activeMenu }: ClientMyPageSidebarProps) {
  return (
    <aside className="w-full shrink-0 rounded-xl border border-theme bg-surface py-2 sm:w-[215px]">
      <nav aria-label="클라이언트 마이페이지 메뉴">
        <ul>
          {CLIENT_MY_PAGE_MENU.map((menu) => {
            const isActive = menu.value === activeMenu;

            return (
              <li key={menu.value}>
                <Link
                  href={menu.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex h-12 items-center px-5 text-[13px] font-semibold transition-colors ${
                    isActive
                      ? "bg-[#edf2f7] text-brand"
                      : "text-theme-secondary hover:bg-surface-subtle hover:text-theme-secondary"
                  }`}
                >
                  {menu.label}
                </Link>
              </li>
            );
          })}
          <li>
            <Link
              href="/client/mypage/cancel"
              aria-current={activeMenu === "cancel" ? "page" : undefined}
              className={`flex h-12 items-center px-5 text-[13px] font-semibold text-theme-danger transition-colors hover:bg-danger-surface ${activeMenu === "cancel" ? "bg-danger-surface" : ""}`}
            >
              회원 탈퇴
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
