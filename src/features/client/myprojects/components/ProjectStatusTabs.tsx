export const PROJECT_STATUS_TABS = [
  "등록 완료",
  "매칭 중",
  "진행 중",
  "완료 대기",
  "종료",
  "취소",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUS_TABS)[number];

export interface ProjectStatusTabsProps {
  activeStatus: ProjectStatus;
  onStatusChange: (status: ProjectStatus) => void;
}

export function ProjectStatusTabs({
  activeStatus,
  onStatusChange,
}: ProjectStatusTabsProps) {
  return (
    <div className="mt-7 border-b border-[#e5e9ef]">
      <div className="flex h-[48px] items-end gap-2">
        {PROJECT_STATUS_TABS.map((status) => {
          const isActive = status === activeStatus;

          return (
            <button
              key={status}
              type="button"
              onClick={() => onStatusChange(status)}
              className={`relative flex h-full min-w-[82px] cursor-pointer items-center justify-center px-2 text-[13px] font-semibold transition ${
                isActive
                  ? "text-[#122d50]"
                  : "text-[#9aa4b2] hover:text-[#667085]"
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
