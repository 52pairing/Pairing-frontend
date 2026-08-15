export interface TabItem<T extends string> {
  tab: T;
  label: string;
  count?: number;
}

interface ContractTabBarProps<T extends string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
  variant: "client" | "freelancer";
}

// 두 화면의 레이아웃 차이(가로 스크롤 vs 모바일 균등폭)를 variant로 흡수한다.
// 활성 색상/밑줄/카운트 배지 렌더 로직은 공통이다.
const VARIANT = {
  client: {
    outer: "mt-7",
    row: "flex h-12 items-end gap-2 overflow-x-auto overflow-y-hidden",
    button: "relative flex h-full min-w-[94px] shrink-0 items-center justify-center px-3 text-[13px] font-semibold",
    badge: "ml-1.5",
    underline: "absolute bottom-0 left-0 h-0.5 w-full bg-brand",
  },
  freelancer: {
    outer: "mt-4",
    row: "flex h-[44px] items-end gap-1 sm:gap-5",
    button: "relative flex h-full min-w-0 flex-1 cursor-pointer items-center justify-center whitespace-nowrap px-1 text-[11px] font-semibold transition-colors sm:min-w-[62px] sm:flex-none sm:px-2 sm:text-[12px]",
    badge: "ml-1",
    underline: "absolute bottom-[-1px] left-0 h-[2px] w-full bg-brand",
  },
} as const;

export function ContractTabBar<T extends string>({ tabs, activeTab, onChange, variant }: ContractTabBarProps<T>) {
  const v = VARIANT[variant];
  return (
    <div className={`${v.outer} border-b border-theme`}>
      <div className={v.row}>
        {tabs.map(({ tab, label, count }) => {
          const active = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(tab)}
              className={`${v.button} ${active ? "text-brand" : "text-theme-muted hover:text-theme-secondary"}`}
            >
              {label}
              {count != null && count > 0 ? <span className={`${v.badge} rounded-full bg-brand px-1.5 py-0.5 text-[9px] font-bold text-white`}>{count}</span> : null}
              {active ? <span className={v.underline} /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
