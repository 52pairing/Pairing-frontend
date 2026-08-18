import {
  conditionLabel,
  formatConditionValue,
  manwonToWonString,
  proposalByLabel,
  senderLabel,
  toLabelMap,
  wonToManwon,
  type WorkConditionLabels,
} from "@/features/negotiation/utils/conditionFormat";

const labels: WorkConditionLabels = {
  workStyles: { REMOTE: "원격" },
  workForms: { FULL_TIME: "상주" },
  periodUnits: { MONTH: "개월" },
};

describe("conditionLabel / senderLabel", () => {
  it("알려진 코드는 라벨로, 모르는 코드는 원문으로 변환한다", () => {
    expect(conditionLabel("AMOUNT")).toBe("단가(월)");
    expect(conditionLabel("UNKNOWN")).toBe("UNKNOWN");
    expect(senderLabel("CLIENT_AGENT")).toBe("클라이언트 AI");
    expect(senderLabel("UNKNOWN")).toBe("UNKNOWN");
  });
});

describe("proposalByLabel", () => {
  it("값이 없으면 -, *_AGENT면 AI, 그 외엔 사람이 읽는 라벨을 반환한다", () => {
    expect(proposalByLabel(null)).toBe("-");
    expect(proposalByLabel(undefined)).toBe("-");
    expect(proposalByLabel("FREELANCER_AGENT")).toBe("AI");
    expect(proposalByLabel("CLIENT")).toBe("클라이언트");
  });
});

describe("wonToManwon / manwonToWonString", () => {
  it("원과 만원을 서로 변환한다", () => {
    expect(wonToManwon(5_500_000)).toBe(550);
    expect(manwonToWonString("550")).toBe("5500000");
  });

  it("숫자가 아닌 만원 입력은 빈 문자열을 반환한다", () => {
    expect(manwonToWonString("abc")).toBe("");
  });
});

describe("toLabelMap", () => {
  it("옵션 배열을 코드→라벨 맵으로 바꾸고, null/undefined는 빈 맵으로 처리한다", () => {
    expect(toLabelMap([{ code: "A", label: "에이" }])).toEqual({ A: "에이" });
    expect(toLabelMap(null)).toEqual({});
    expect(toLabelMap(undefined)).toEqual({});
  });
});

describe("formatConditionValue", () => {
  it("값이 없으면 빈 문자열을 반환한다", () => {
    expect(formatConditionValue("AMOUNT", null)).toBe("");
    expect(formatConditionValue("AMOUNT", "")).toBe("");
  });

  it("AMOUNT는 원을 만원 단위 문자열로 변환한다", () => {
    expect(formatConditionValue("AMOUNT", "5000000")).toBe("500만 원");
  });

  it("PERIOD는 단위 라벨을 붙인다", () => {
    expect(formatConditionValue("PERIOD", "4 MONTH", labels)).toBe("4개월");
  });

  it("START_DATE는 하이픈을 점으로 바꾼다", () => {
    expect(formatConditionValue("START_DATE", "2026-09-01")).toBe("2026.09.01");
  });

  it("WORK_STYLE/WORK_FORM은 라벨을 찾고, 없으면 원문을 반환한다", () => {
    expect(formatConditionValue("WORK_STYLE", "REMOTE", labels)).toBe("원격");
    expect(formatConditionValue("WORK_FORM", "PART_TIME", labels)).toBe("PART_TIME");
  });

  it("그 외 타입(SCOPE 등)은 값을 그대로 반환한다", () => {
    expect(formatConditionValue("SCOPE", "백엔드 API 개발")).toBe("백엔드 API 개발");
  });
});
