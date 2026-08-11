import { ClientMyPageSidebar, type ClientMyPageActiveMenu } from "@/features/client/components/ClientMyPageSidebar";

interface ClientMyPagePlaceholderProps {
  activeMenu: ClientMyPageActiveMenu;
  title: string;
  description: string;
  isCancel?: boolean;
}

export function ClientMyPagePlaceholder({
  activeMenu,
  title,
  description,
  isCancel = false,
}: ClientMyPagePlaceholderProps) {
  return (
    <main className="min-h-screen bg-surface-subtle px-4 py-7 text-theme-primary sm:px-5">
      <div className="mx-auto w-full max-w-[1200px]">
        <h1 className="text-[24px] font-extrabold tracking-[-0.04em]">마이페이지</h1>
        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start">
          <ClientMyPageSidebar activeMenu={activeMenu} />
          <section className="flex min-h-[280px] min-w-0 flex-1 flex-col items-center justify-center rounded-xl border border-theme bg-surface px-5 text-center">
            <h2 className={`text-[18px] font-bold ${isCancel ? "text-theme-danger" : "text-theme-primary"}`}>{title}</h2>
            <p className="mt-3 text-[12px] font-semibold text-theme-muted">{description}</p>
          </section>
        </div>
      </div>
    </main>
  );
}
