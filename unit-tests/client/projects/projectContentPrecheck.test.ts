import {
  hasElaborationDetail,
  runProjectContentPrecheck,
} from "@/features/client/projects/utils/projectContentPrecheck";

describe("runProjectContentPrecheck", () => {
  test("필수 주요 업무와 선택 상세 범위 누락을 서로 다른 참고 안내로 반환한다", () => {
    const result = runProjectContentPrecheck({});

    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "missing-mainTask", field: "mainTask" }),
        expect.objectContaining({
          id: "missing-detailScope",
          field: "detailScope",
          description: expect.stringContaining("등록에는 영향이 없습니다"),
        }),
      ]),
    );
  });

  test("짧은 입력은 확정 오류가 아닌 보완 질문으로 안내한다", () => {
    const result = runProjectContentPrecheck({
      mainTask: "로그인 구현",
      detailScope: "소셜 로그인",
    });

    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "short-mainTask", kind: "short" }),
        expect.objectContaining({ id: "short-detailScope", kind: "short" }),
      ]),
    );
  });

  test("반복 문장과 마스킹된 개인정보 후보를 함께 반환한다", () => {
    const result = runProjectContentPrecheck({
      mainTask: "관리자 회원 목록 화면을 구현하고 연락은 dev@example.com으로 받습니다.",
      detailScope: "관리자 회원 목록 화면을 구현하고 연락은 dev@example.com으로 받습니다.",
    });

    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "repetition-both", kind: "repetition" }),
        expect.objectContaining({
          kind: "privacy",
          maskedValue: "de***@example.com",
        }),
      ]),
    );
    expect(JSON.stringify(result)).not.toContain("dev@example.com");
  });

  test("현재 상황과 기타 전달사항 칸의 개인정보도 탐지한다", () => {
    const result = runProjectContentPrecheck({
      currentSituation: "자세한 문의는 010-1234-5678 로 연락 주세요.",
      mainTask: "관리자 페이지와 결제 연동을 개발합니다.",
      detailScope: "",
      extraNote: "정산 계좌 국민 123-456-789012 참고 바랍니다.",
    });

    const privacy = result.findings.filter((finding) => finding.kind === "privacy");
    expect(privacy.some((finding) => finding.field === "currentSituation")).toBe(true);
    expect(privacy.some((finding) => finding.field === "extraNote")).toBe(true);
    expect(JSON.stringify(result)).not.toContain("010-1234-5678");
  });

  test("짧은 상세 범위는 짧음 안내만 표시하고 구체화 안내를 중복하지 않는다", () => {
    const result = runProjectContentPrecheck({
      mainTask: "주문과 결제 API를 설계하고 구현합니다.",
      detailScope: "소셜 로그인",
    });

    const detailFindings = result.findings.filter(
      (finding) => finding.field === "detailScope",
    );
    expect(detailFindings.some((finding) => finding.kind === "short")).toBe(true);
    expect(detailFindings.some((finding) => finding.kind === "elaboration")).toBe(
      false,
    );
  });

  test("상세 범위에 테스트·제외 범위·역할 분담이 있으면 구체화 안내를 생략한다", () => {
    const result = runProjectContentPrecheck({
      mainTask: "주문과 결제 API를 개발하고 안정적인 오류 처리를 구현합니다.",
      detailScope:
        "주문 생성·취소·환불 API와 단위 테스트를 담당하며 결제사 연동과 배포는 내부 팀이 담당합니다.",
    });

    expect(hasElaborationDetail("테스트와 배포는 내부 팀이 담당합니다.")).toBe(true);
    expect(result.findings.some((finding) => finding.kind === "elaboration")).toBe(false);
    expect(result.findings.some((finding) => finding.kind === "repetition")).toBe(false);
  });
});
