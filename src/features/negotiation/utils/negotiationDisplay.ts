import type {
  ConditionType,
  FloorDirection,
  NegotiationCondition,
} from "@/features/negotiation/types/negotiation";
import {
  conditionLabel,
  formatConditionValue,
  type WorkConditionLabels,
} from "@/features/negotiation/utils/conditionFormat";

/**
 * 협상 화면의 순수 표시·판정 로직.
 * NegotiationChatFlow 에서 분리해 단위 테스트가 가능하도록 한다(렌더링/상태 없음).
 */

export type ViewerRole = "CLIENT" | "FREELANCER";

/** 조건별 승인/거절 결정 */
export type Decision = "accept" | "reject";

/** 타결(AGREED) 조건들을 "라벨 값 · 라벨 값" 요약 문자열로 만든다. */
export const buildAgreedSummary = (
  conditions: NegotiationCondition[],
  labels: WorkConditionLabels,
): string => {
  const parts = conditions
    .filter((condition) => condition.status === "AGREED")
    .map((condition) => {
      const value = formatConditionValue(condition.type, condition.agreedValue, labels);
      const label = conditionLabel(condition.type);
      return value ? `${label} ${value}` : label;
    });
  return parts.length > 0 ? parts.join(" · ") : "모든 조건에 합의했습니다.";
};

/** 내 관점에서 "상대 희망값". 프리랜서면 클라 값, 클라면 프리랜서 값. */
export const opponentValue = (
  condition: NegotiationCondition,
  viewerRole: ViewerRole,
): string | null =>
  viewerRole === "CLIENT" ? condition.freelancerValue : condition.clientValue;

/** 서버 방향을 우선하고, 미배포 응답은 기존 비교 방식과 역할로 폴백한다. */
export const resolveFloorDirection = (
  condition: NegotiationCondition,
  viewerRole: ViewerRole,
): FloorDirection => {
  if (condition.floorDirection) return condition.floorDirection;
  if (condition.floorComparison === "CHOICE") return "CHOICE";
  if (condition.floorComparison === "NONE") return "NONE";
  if (condition.type === "WORK_STYLE" || condition.type === "WORK_FORM") return "CHOICE";
  if (condition.type === "SCOPE" || condition.type === "OTHER") return "NONE";
  return viewerRole === "CLIENT" ? "MAX" : "MIN";
};

/** 마지노선 입력 라벨. 서버가 내려준 방향을 기준으로 의미를 설명한다. */
export const floorFieldLabel = (
  condition: NegotiationCondition,
  viewerRole: ViewerRole,
): string => {
  const direction = resolveFloorDirection(condition, viewerRole);
  switch (condition.type) {
    case "AMOUNT":
      return direction === "MIN"
        ? "최소 단가 (이 금액 미만은 거절)"
        : "최대 단가 (이 금액 초과는 거절)";
    case "PERIOD":
      return direction === "MIN" ? "최소 기간" : "최대 기간";
    case "WORK_STYLE":
      return "허용 가능한 근무 방식";
    case "WORK_FORM":
      return "허용 가능한 근무 형태";
    case "START_DATE":
      return direction === "MAX"
        ? "가장 늦은 시작일 (이 날짜까지 시작)"
        : "가장 이른 시작일";
    default:
      return conditionLabel(condition.type);
  }
};

/** 마지노선 값 앞에 붙는 방향 표시. */
export const floorValuePrefix = (
  condition: NegotiationCondition,
  viewerRole: ViewerRole,
): string => {
  const direction = resolveFloorDirection(condition, viewerRole);
  if (direction === "MAX") return "최대 ";
  if (direction === "MIN") return "최소 ";
  return "";
};

/** 마지노선 안내 문구. NONE은 별도 기준이 없으므로 표시하지 않는다. */
export const floorRequirementText = (
  condition: NegotiationCondition,
  viewerRole: ViewerRole,
  labels: WorkConditionLabels,
): string | null => {
  const value = formatConditionValue(condition.type, condition.myFloor, labels);
  if (!value) return null;
  const direction = resolveFloorDirection(condition, viewerRole);
  if (direction === "NONE") return null;
  if (direction === "CHOICE") return `${value}을(를) 허용해야 합니다.`;
  if (direction === "MIN") return `${value} 이상이어야 합니다.`;
  if (condition.type === "START_DATE") return `늦어도 ${value}까지 시작해야 합니다.`;
  return `${value} 이하여야 합니다.`;
};

/** Record<code,label> → 정렬 유지된 옵션 배열 */
export const toOptions = (
  map: Record<string, string>,
): Array<{ code: string; label: string }> =>
  Object.entries(map).map(([code, label]) => ({ code, label }));

/** 크기 비교 가능한 조건 값을 뽑는다. */
export const numericValue = (
  type: ConditionType,
  value: string | null,
): number | null => {
  if (value == null || value === "") return null;
  if (type === "AMOUNT") {
    const won = Number(value);
    return Number.isFinite(won) ? won : null;
  }
  if (type === "PERIOD") {
    const amount = Number.parseInt(value, 10);
    return Number.isFinite(amount) ? amount : null;
  }
  if (type === "START_DATE") {
    const timestamp = Date.parse(`${value}T00:00:00Z`);
    return Number.isFinite(timestamp) ? timestamp : null;
  }
  return null;
};

/**
 * 수락한 조건 중 "내 마지노선을 넘는" 첫 조건을 찾는다(표시용).
 * 서버 방향이 MIN이면 제안 < 마지노선, MAX이면 제안 > 마지노선이다.
 */
export const findFloorViolation = (
  pending: NegotiationCondition[],
  decisions: Record<number, Decision>,
  viewerRole: ViewerRole,
): NegotiationCondition | null => {
  for (const condition of pending) {
    if (decisions[condition.conditionId] !== "accept") continue;
    const proposed = numericValue(condition.type, condition.proposedValue);
    const floor = numericValue(condition.type, condition.myFloor);
    if (proposed == null || floor == null) continue;
    const direction = resolveFloorDirection(condition, viewerRole);
    const breaks = direction === "MIN"
      ? proposed < floor
      : direction === "MAX"
        ? proposed > floor
        : false;
    if (breaks) return condition;
  }
  return null;
};

/** 마지노선 밖 수락 확인 모달 문구. */
export const buildBelowFloorMessage = (
  violation: NegotiationCondition | null,
  viewerRole: ViewerRole,
  labels: WorkConditionLabels,
): string => {
  if (!violation) {
    return "이 제안은 회원님의 마지노선을 넘습니다. 그래도 수락하시겠어요?";
  }
  const proposed = formatConditionValue(violation.type, violation.proposedValue, labels);
  const floor = formatConditionValue(violation.type, violation.myFloor, labels);
  const direction = resolveFloorDirection(violation, viewerRole);
  const floorLabel = direction === "MIN" ? `최소 ${floor}` : `최대 ${floor}`;
  const comparison = direction === "MIN" ? "낮습니다" : "높습니다";
  return `이 제안(${proposed})은 회원님의 마지노선(${floorLabel})보다 ${comparison}. 그래도 수락하시겠어요?`;
};
