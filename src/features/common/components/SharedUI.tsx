/**
 * 프리랜서·클라이언트 "메인" 페이지와 "등급 안내" 페이지에서
 * 공통으로 반복되던 UI 조각을 모아 둔 파일입니다.
 *
 * - 각 페이지에 복붙되어 있던 동일한 아이콘/행 컴포넌트를 여기로 통합

 * 상호작용이 없는 순수 표시용이므로 서버 컴포넌트로 둡니다("use client" 미사용).
 */

/* 등급 안내 페이지 공통*/

export function BenefitRow({
  label,
  value,
  iconColor,
  valueColor = "#111827",
}: {
  label: string;
  value: string;
  /** 왼쪽 체크 아이콘 색 */
  iconColor: string;
  /** 오른쪽 값 텍스트 색 (기본 진회색) */
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-2">
        <CheckCircleIcon color={iconColor} />

        <span className="text-[11px] text-theme-secondary">{label}</span>
      </div>

      <span
        className="shrink-0 text-right text-[11px] font-bold"
        style={{ color: valueColor }}
      >
        {value}
      </span>
    </div>
  );
}

/* 메인 페이지 공통 */

/** HOW IT WORKS 단계 카드 사이에 놓는 화살표 (데스크톱에서만 표시) */
export function StepArrow() {
  return (
    <div className="hidden items-center justify-center text-theme-muted md:flex">
      <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden="true">
        <path
          d="M1 1L7 7L1 13"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/** 메인 페이지 혜택 목록에 쓰는 작은 원형 체크 아이콘 */
export function StepCheckIcon({
  color = "#35B77A",
  size = 10,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="5" cy="5" r="4" stroke={color} strokeWidth="1" />

      <path
        d="M3.2 5.1L4.4 6.3L6.9 3.8"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/*  공통 아이콘 */

/** "메인으로" 등에 쓰는 왼쪽 방향 화살표 */
export function ChevronLeftIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8.5 3.5L5 7L8.5 10.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** "다음" 등에 쓰는 오른쪽 방향 화살표 */
export function ChevronRightIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 3.5L8.5 7L5 10.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 원형 체크 아이콘 (등급 혜택/수수료 기준 등) */
export function CheckCircleIcon({
  color,
  size = 14,
}: {
  color: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="7" cy="7" r="5.5" stroke={color} strokeWidth="1" />

      <path
        d="M4.5 7L6.2 8.7L9.6 5.3"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 하단 안내 문구 앞의 정보(i) 아이콘 */
export function InfoIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 15 15"
      fill="none"
      aria-hidden="true"
      className="mt-[1px] shrink-0"
    >
      <circle cx="7.5" cy="7.5" r="5.5" stroke="#344054" strokeWidth="1" />

      <path d="M7.5 6.5V10" stroke="#344054" strokeWidth="1" strokeLinecap="round" />

      <circle cx="7.5" cy="4.6" r=".7" fill="#344054" />
    </svg>
  );
}
