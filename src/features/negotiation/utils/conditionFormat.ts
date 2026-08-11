/**
 * 협상 조건/발신자 표시·값 변환 유틸 (백엔드 확정 계약 기준)
 *
 * - 조건 값은 전부 문자열. 금액(AMOUNT)만 원↔만원 변환이 필요하다.
 * - 라벨은 응답에 오지 않으므로 프론트에서 코드→라벨 매핑한다.
 */

import type {
  ConditionType,
  SenderType,
} from "@/features/negotiation/types/negotiation";

// 조건 종류 라벨. AMOUNT 는 월 단가지만 화면 관례상 "단가(월)"로 표기.
// (조건 "종류" 라벨은 협상 도메인 고유 개념이라 여기서 관리. 조건 "값" 라벨은 meta API 사용)
const CONDITION_LABEL: Record<ConditionType, string> = {
  AMOUNT: "단가(월)",
  PERIOD: "기간",
  START_DATE: "시작일",
  WORK_STYLE: "근무 방식",
  WORK_FORM: "근무 형태",
  SCOPE: "업무 범위",
  OTHER: "기타",
};

/**
 * 근무조건 값 라벨(코드→라벨). GET /api/v1/meta/work-conditions 응답을 코드맵으로 변환한 것.
 * WORK_STYLE / WORK_FORM 값과 PERIOD 단위 라벨을 여기서 해결한다(하드코딩 금지).
 */
export interface WorkConditionLabels {
  workStyles: Record<string, string>;
  workForms: Record<string, string>;
  periodUnits: Record<string, string>;
}

export const EMPTY_WORK_CONDITION_LABELS: WorkConditionLabels = {
  workStyles: {},
  workForms: {},
  periodUnits: {},
};

/** {code,label}[] → { [code]: label } */
export const toLabelMap = (
  options: Array<{ code: string; label: string }> | null | undefined,
): Record<string, string> => {
  const map: Record<string, string> = {};
  (options ?? []).forEach((option) => {
    map[option.code] = option.label;
  });
  return map;
};

// 발신자 라벨
const SENDER_LABEL: Record<SenderType, string> = {
  CLIENT_AGENT: "클라이언트 AI",
  FREELANCER_AGENT: "프리랜서 AI",
  CLIENT: "클라이언트",
  FREELANCER: "프리랜서",
  SYSTEM: "시스템",
};

/** 조건 종류 라벨 (알 수 없는 코드는 원문) */
export const conditionLabel = (type: ConditionType | string): string =>
  CONDITION_LABEL[type as ConditionType] ?? type;

/** 발신자 라벨. AI 대리인은 화면에서 뭉쳐 "AI"로 표기하고 싶으면 senderShortLabel 사용 */
export const senderLabel = (senderType: SenderType | string): string =>
  SENDER_LABEL[senderType as SenderType] ?? senderType;

/** 마지막 제안 주체 표시용: *_AGENT 는 "AI"로 뭉침 */
export const proposalByLabel = (by: SenderType | string | null | undefined): string => {
  if (!by) return "-";
  if (by.endsWith("_AGENT")) return "AI";
  return SENDER_LABEL[by as SenderType] ?? by;
};

/** 원 → 만원 (표시용). 정수 만원으로 내림 */
export const wonToManwon = (won: number): number => Math.floor(won / 10_000);

/** 만원(문자열 입력) → 원 문자열 (서버 전송용) */
export const manwonToWonString = (manwon: string): string => {
  const numeric = Number(manwon);
  if (Number.isNaN(numeric)) return "";
  return String(Math.round(numeric * 10_000));
};

/**
 * 조건 값 표시 문자열. 근무조건 값 라벨은 meta 기반 labels 로 해결(없으면 코드 원문).
 * - AMOUNT: 원 → "350만 원"
 * - PERIOD: "4 MONTH" → "4개월"(단위 라벨은 meta periodUnits)
 * - START_DATE: "2026-09-01" → "2026.09.01"
 * - WORK_STYLE / WORK_FORM: meta workStyles / workForms 라벨
 * - 그 외(SCOPE/OTHER): 원문
 */
export const formatConditionValue = (
  type: ConditionType | string,
  value: string | null | undefined,
  labels: WorkConditionLabels = EMPTY_WORK_CONDITION_LABELS,
): string => {
  if (value == null || value === "") return "";

  switch (type) {
    case "AMOUNT": {
      const won = Number(value);
      return Number.isNaN(won) ? value : `${wonToManwon(won).toLocaleString()}만 원`;
    }
    case "PERIOD": {
      // "4 MONTH" → "4개월"
      const [amount, unit] = value.split(" ");
      const unitLabel = unit ? (labels.periodUnits[unit] ?? unit) : "";
      return `${amount}${unitLabel}`;
    }
    case "START_DATE":
      return value.replace(/-/g, ".");
    case "WORK_STYLE":
      return labels.workStyles[value] ?? value;
    case "WORK_FORM":
      return labels.workForms[value] ?? value;
    default:
      return value;
  }
};
