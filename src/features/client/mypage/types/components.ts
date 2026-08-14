import type { ClientMyPageActiveMenu } from "@/features/client/types/components";

export type PaymentFilter = "전체" | "착수금 수수료" | "성공보수 수수료";

export interface ClientMyPagePlaceholderProps {
  activeMenu: ClientMyPageActiveMenu;
  title: string;
  description: string;
  isCancel?: boolean;
}
