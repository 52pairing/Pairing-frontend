import type { FreelancerMyPageActiveMenu } from "@/features/freelancer/components/FreelancerMyPageSidebar";
import { FreelancerMyPageLayout } from "./FreelancerMyPageLayout";

interface FreelancerMyPagePlaceholderProps {
  activeMenu: FreelancerMyPageActiveMenu;
  title: string;
  description: string;
  isCancel?: boolean;
}

export function FreelancerMyPagePlaceholder({ activeMenu, title, description, isCancel = false }: FreelancerMyPagePlaceholderProps) {
  return (
    <FreelancerMyPageLayout activeMenu={activeMenu}>
      <section className="flex min-h-[360px] min-w-0 flex-col items-center justify-center rounded-xl border border-theme bg-surface px-5 py-10 text-center sm:px-7">
        <span className={`flex h-12 w-12 items-center justify-center rounded-full ${isCancel ? "bg-danger-surface text-theme-danger" : "bg-surface-muted text-brand"}`} aria-hidden="true">
          {isCancel ? "!" : "·"}
        </span>
        <h2 className={`mt-5 text-[18px] font-bold ${isCancel ? "text-theme-danger" : "text-theme-primary"}`}>{title}</h2>
        <p className="mt-3 max-w-[420px] break-words text-[12px] font-semibold leading-5 text-theme-muted">{description}</p>
      </section>
    </FreelancerMyPageLayout>
  );
}
