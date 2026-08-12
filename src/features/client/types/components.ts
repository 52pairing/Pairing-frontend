export type ClientMyPageMenu =
  | "profile"
  | "company"
  | "reviews"
  | "payment-methods"
  | "payments"
  | "password";

export type ClientMyPageActiveMenu = ClientMyPageMenu | "cancel";

export interface ClientMyPageSidebarProps {
  activeMenu: ClientMyPageActiveMenu;
}
