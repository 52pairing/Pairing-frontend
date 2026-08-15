export const FREELANCER_PROJECT_STATUS_TABS = [
  "전체",
  "검토 중",
  "협상 중",
  "종료됨",
] as const;

export type FreelancerProjectStatus =
  (typeof FREELANCER_PROJECT_STATUS_TABS)[number];

interface FreelancerProjectStatusTabsProps {
  activeStatus: FreelancerProjectStatus;
  onStatusChange: (status: FreelancerProjectStatus) => void;
}

export function FreelancerProjectStatusTabs({
  activeStatus,
  onStatusChange,
}: FreelancerProjectStatusTabsProps) {
  return (
    <div className="mt-4 border-b border-theme">
      <div className="flex h-[44px] items-end gap-2 sm:gap-5">
        {FREELANCER_PROJECT_STATUS_TABS.map((status) => {
          const isActive = activeStatus === status;

          return (
            <button
              key={status}
              type="button"
              onClick={() => onStatusChange(status)}
              aria-pressed={isActive}
              className={`relative flex h-full min-w-[54px] cursor-pointer items-center justify-center px-2 text-[12px] font-semibold transition-colors ${
                isActive
                  ? "text-[#122d50]"
                  : "text-[#7d8899] hover:text-theme-secondary"
              }`}
            >
              {status}
              {isActive ? (
                <span className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-[#15365d]" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
