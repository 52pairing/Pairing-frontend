import type {
  ConditionType,
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

/** 마지노선 입력 라벨. 단가·기간은 역할에 따라 최소/최대 의미가 반대다. */
export const floorFieldLabel = (
  type: ConditionType,
  viewerRole: ViewerRole,
): string => {
  const isFreelancer = viewerRole === "FREELANCER";
  switch (type) {
    case "AMOUNT":
      return isFreelancer
        ? "최소 단가 (이 금액 미만은 거절)"
        : "최대 단가 (이 금액 초과는 거절)";
    case "PERIOD":
      return isFreelancer ? "최소 기간" : "최대 기간";
    case "WORK_STYLE":
      return "허용 가능한 근무 방식";
    case "WORK_FORM":
      return "허용 가능한 근무 형태";
    case "START_DATE":
      return "희망 시작일";
    default:
      return conditionLabel(type);
  }
};

/** Record<code,label> → 정렬 유지된 옵션 배열 */
export const toOptions = (
  map: Record<string, string>,
): Array<{ code: string; label: string }> =>
  Object.entries(map).map(([code, label]) => ({ code, label }));

/** 숫자로 비교 가능한 조건 값만 뽑는다(AMOUNT=원, PERIOD="N …"의 앞 숫자). */
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
  return null;
};

/**
 * 수락한 조건 중 "내 마지노선을 넘는" 첫 조건을 찾는다(표시용).
 * 프리랜서 하한: 제안 < 내 마지노선 / 클라 상한: 제안 > 내 마지노선.
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
    const breaks = viewerRole === "FREELANCER" ? proposed < floor : proposed > floor;
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
  const isFreelancer = viewerRole === "FREELANCER";
  const floorLabel = isFreelancer ? `최소 ${floor}` : `최대 ${floor}`;
  const direction = isFreelancer ? "낮습니다" : "높습니다";
  return `이 제안(${proposed})은 회원님의 마지노선(${floorLabel})보다 ${direction}. 그래도 수락하시겠어요?`;
};
