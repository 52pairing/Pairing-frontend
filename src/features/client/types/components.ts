export type ClientMyPageMenu =
  | "profile"
  | "reviews"
  | "payment-methods"
  | "payments"
  | "settings"
  | "password";

export type ClientMyPageActiveMenu = ClientMyPageMenu | "cancel";

export interface ClientMyPageSidebarProps {
  activeMenu: ClientMyPageActiveMenu;
}
