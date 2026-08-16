import type { NegotiationCondition } from "@/features/negotiation/types/negotiation";
import { EMPTY_WORK_CONDITION_LABELS } from "@/features/negotiation/utils/conditionFormat";
import {
  buildAgreedSummary,
  buildBelowFloorMessage,
  findFloorViolation,
  floorFieldLabel,
  floorRequirementText,
  floorValuePrefix,
  numericValue,
  opponentValue,
  resolveFloorDirection,
  toOptions,
} from "@/features/negotiation/utils/negotiationDisplay";

const cond = (over: Partial<NegotiationCondition>): NegotiationCondition => ({
  conditionId: 1,
  type: "AMOUNT",
  clientValue: null,
  freelancerValue: null,
  proposedValue: null,
  reason: null,
  agreedValue: null,
  status: "PENDING",
  roundCount: 0,
  myFloor: null,
  ...over,
});

describe("numericValue", () => {
  it("AMOUNT 는 원 숫자로, PERIOD 는 앞 정수로 파싱한다", () => {
    expect(numericValue("AMOUNT", "5000000")).toBe(5_000_000);
    expect(numericValue("PERIOD", "6 MONTH")).toBe(6);
    expect(numericValue("START_DATE", "2026-10-21")).toBe(Date.parse("2026-10-21T00:00:00Z"));
  });

  it("비교 불가 타입·빈값은 null 을 반환한다", () => {
    expect(numericValue("WORK_STYLE", "REMOTE")).toBeNull();
    expect(numericValue("AMOUNT", null)).toBeNull();
    expect(numericValue("AMOUNT", "")).toBeNull();
  });
});

describe("findFloorViolation (마지노선 밖 수락 판정)", () => {
  it("프리랜서: 제안이 내 최소 마지노선보다 낮으면 위반으로 잡는다", () => {
    const c = cond({
      conditionId: 10,
      type: "AMOUNT",
      proposedValue: "4000000",
      myFloor: "5000000",
    });
    const result = findFloorViolation([c], { 10: "accept" }, "FREELANCER");
    expect(result?.conditionId).toBe(10);
  });

  it("클라이언트: 제안이 내 최대 마지노선보다 높으면 위반으로 잡는다", () => {
    const c = cond({
      conditionId: 11,
      type: "AMOUNT",
      proposedValue: "6000000",
      myFloor: "5000000",
    });
    const result = findFloorViolation([c], { 11: "accept" }, "CLIENT");
    expect(result?.conditionId).toBe(11);
  });

  it("거절(reject)한 조건은 위반 판정에서 제외한다", () => {
    const c = cond({
      conditionId: 12,
      type: "AMOUNT",
      proposedValue: "4000000",
      myFloor: "5000000",
    });
    expect(findFloorViolation([c], { 12: "reject" }, "FREELANCER")).toBeNull();
  });

  it("마지노선 안쪽 제안은 위반이 아니다", () => {
    const c = cond({
      conditionId: 13,
      type: "AMOUNT",
      proposedValue: "6000000",
      myFloor: "5000000",
    });
    expect(findFloorViolation([c], { 13: "accept" }, "FREELANCER")).toBeNull();
  });

  it("프리랜서 시작일도 floorDirection MAX이면 늦은 제안을 위반으로 잡는다", () => {
    const c = cond({
      conditionId: 14,
      type: "START_DATE",
      proposedValue: "2026-10-22",
      myFloor: "2026-10-21",
      floorDirection: "MAX",
    });
    expect(findFloorViolation([c], { 14: "accept" }, "FREELANCER")).toBe(c);
  });
});

describe("buildBelowFloorMessage", () => {
  it("프리랜서 위반은 '낮습니다', 클라 위반은 '높습니다' 로 안내한다", () => {
    const c = cond({ type: "AMOUNT", proposedValue: "4000000", myFloor: "5000000" });
    expect(
      buildBelowFloorMessage(c, "FREELANCER", EMPTY_WORK_CONDITION_LABELS),
    ).toContain("낮습니다");
    expect(
      buildBelowFloorMessage(c, "CLIENT", EMPTY_WORK_CONDITION_LABELS),
    ).toContain("높습니다");
  });

  it("프리랜서라도 floorDirection MAX이면 최대·높습니다로 안내한다", () => {
    const c = cond({
      type: "START_DATE",
      proposedValue: "2026-10-22",
      myFloor: "2026-10-21",
      floorDirection: "MAX",
    });
    const message = buildBelowFloorMessage(c, "FREELANCER", EMPTY_WORK_CONDITION_LABELS);
    expect(message).toContain("최대 2026.10.21");
    expect(message).toContain("높습니다");
  });

  it("위반 조건이 없으면 일반 문구를 반환한다", () => {
    expect(
      buildBelowFloorMessage(null, "FREELANCER", EMPTY_WORK_CONDITION_LABELS),
    ).toBe("이 제안은 회원님의 마지노선을 넘습니다. 그래도 수락하시겠어요?");
  });
});

describe("buildAgreedSummary", () => {
  it("합의된 조건이 없으면 기본 문구를 반환한다", () => {
    expect(
      buildAgreedSummary([cond({ status: "PENDING" })], EMPTY_WORK_CONDITION_LABELS),
    ).toBe("모든 조건에 합의했습니다.");
  });

  it("AGREED 조건만 요약에 포함한다", () => {
    const summary = buildAgreedSummary(
      [
        cond({ conditionId: 1, type: "AMOUNT", status: "AGREED", agreedValue: "5000000" }),
        cond({ conditionId: 2, type: "PERIOD", status: "PENDING", agreedValue: "6 MONTH" }),
      ],
      EMPTY_WORK_CONDITION_LABELS,
    );
    expect(summary).not.toBe("모든 조건에 합의했습니다.");
  });
});

describe("floorFieldLabel / opponentValue / toOptions", () => {
  it("단가 마지노선 라벨은 역할에 따라 최소/최대가 반대다", () => {
    const c = cond({ type: "AMOUNT" });
    expect(floorFieldLabel(c, "FREELANCER")).toContain("최소");
    expect(floorFieldLabel(c, "CLIENT")).toContain("최대");
  });

  it("서버 방향을 역할 추론보다 우선하고 미응답은 기존 로직으로 폴백한다", () => {
    const startDate = cond({ type: "START_DATE", floorDirection: "MAX" });
    expect(resolveFloorDirection(startDate, "FREELANCER")).toBe("MAX");
    expect(floorFieldLabel(startDate, "FREELANCER")).toBe("가장 늦은 시작일 (이 날짜까지 시작)");
    expect(floorValuePrefix(startDate, "FREELANCER")).toBe("최대 ");

    expect(resolveFloorDirection(cond({ type: "AMOUNT" }), "FREELANCER")).toBe("MIN");
    expect(resolveFloorDirection(cond({ type: "AMOUNT" }), "CLIENT")).toBe("MAX");
    expect(resolveFloorDirection(cond({ type: "WORK_STYLE", floorComparison: "CHOICE" }), "CLIENT")).toBe("CHOICE");
    expect(resolveFloorDirection(cond({ type: "SCOPE", floorComparison: "NONE" }), "CLIENT")).toBe("NONE");
  });

  it("방향과 조건 종류에 맞는 마지노선 안내 문구를 만든다", () => {
    expect(floorRequirementText(
      cond({ type: "START_DATE", myFloor: "2026-10-21", floorDirection: "MAX" }),
      "FREELANCER",
      EMPTY_WORK_CONDITION_LABELS,
    )).toBe("늦어도 2026.10.21까지 시작해야 합니다.");
    expect(floorRequirementText(
      cond({ type: "AMOUNT", myFloor: "5000000", floorDirection: "MIN" }),
      "FREELANCER",
      EMPTY_WORK_CONDITION_LABELS,
    )).toContain("이상이어야 합니다");
    expect(floorRequirementText(
      cond({ type: "WORK_STYLE", myFloor: "REMOTE", floorDirection: "CHOICE" }),
      "CLIENT",
      EMPTY_WORK_CONDITION_LABELS,
    )).toBe("REMOTE을(를) 허용해야 합니다.");
    expect(floorRequirementText(
      cond({ type: "SCOPE", myFloor: "범위", floorDirection: "NONE" }),
      "CLIENT",
      EMPTY_WORK_CONDITION_LABELS,
    )).toBeNull();
  });

  it("상대 희망값은 내 역할의 반대쪽 값이다", () => {
    const c = cond({ clientValue: "C", freelancerValue: "F" });
    expect(opponentValue(c, "CLIENT")).toBe("F");
    expect(opponentValue(c, "FREELANCER")).toBe("C");
  });

  it("toOptions 는 코드→라벨 맵을 배열로 변환한다", () => {
    expect(toOptions({ REMOTE: "재택" })).toEqual([{ code: "REMOTE", label: "재택" }]);
  });
});
