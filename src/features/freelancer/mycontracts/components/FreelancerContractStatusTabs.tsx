export const FREELANCER_CONTRACT_STATUS_TABS = [
  "전체",
  "서명 대기",
  "진행 중",
  "정산 대기",
  "완료",
] as const;

export type FreelancerContractStatus =
  (typeof FREELANCER_CONTRACT_STATUS_TABS)[number];

interface FreelancerContractStatusTabsProps {
  activeStatus: FreelancerContractStatus;
  onStatusChange: (status: FreelancerContractStatus) => void;
}

export function FreelancerContractStatusTabs({
  activeStatus,
  onStatusChange,
}: FreelancerContractStatusTabsProps) {
  return (
    <div className="mt-4 border-b border-theme">
      <div className="flex h-[44px] items-end gap-1 sm:gap-5">
        {FREELANCER_CONTRACT_STATUS_TABS.map((status) => {
          const isActive = status === activeStatus;

          return (
            <button
              key={status}
              type="button"
              aria-pressed={isActive}
              onClick={() => onStatusChange(status)}
              className={`relative flex h-full min-w-0 flex-1 cursor-pointer items-center justify-center whitespace-nowrap px-1 text-[11px] font-semibold transition-colors sm:min-w-[62px] sm:flex-none sm:px-2 sm:text-[12px] ${
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
