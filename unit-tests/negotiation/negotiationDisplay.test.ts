import type { NegotiationCondition } from "@/features/negotiation/types/negotiation";
import { EMPTY_WORK_CONDITION_LABELS } from "@/features/negotiation/utils/conditionFormat";
import {
  buildAgreedSummary,
  buildBelowFloorMessage,
  findFloorViolation,
  floorFieldLabel,
  numericValue,
  opponentValue,
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
    expect(floorFieldLabel("AMOUNT", "FREELANCER")).toContain("최소");
    expect(floorFieldLabel("AMOUNT", "CLIENT")).toContain("최대");
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
