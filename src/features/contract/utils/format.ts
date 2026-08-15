/**
 * 계약 파트 공용 표시 포매터.
 * 기존에 카드/상세/완료 모달마다 흩어져 있던 동일 로직을 한 곳으로 모은다.
 */

/**
 * 계약 날짜 표시용. `YYYY-MM-DD`(또는 datetime) → `YYYY.MM.DD`.
 * datetime 문자열이 와도 앞 10자리만 사용하며, 값이 없으면 `-`.
 */
export const formatContractDate = (value?: string | null) =>
  value ? value.slice(0, 10).replaceAll("-", ".") : "-";

/** 금액 표시용. 예: `1,200,000원`. */
export const formatKrw = (value: number) => `${value.toLocaleString("ko-KR")}원`;

/** 월 단위 금액 표시용. 값이 없으면 `-`. 예: `월 1,200,000원`. */
export const formatMonthlyAmount = (value?: number | null) =>
  value == null ? "-" : `월 ${formatKrw(value)}`;
