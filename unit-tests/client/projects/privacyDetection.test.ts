import { detectPrivacyCandidates } from "@/features/client/projects/utils/privacyDetection";

describe("detectPrivacyCandidates", () => {
  test("이메일과 전화번호를 탐지하고 원문을 노출하지 않게 마스킹한다", () => {
    const result = detectPrivacyCandidates(
      "mainTask",
      "담당자 dev.person@example.com, 연락처 010-1234-5678",
    );

    expect(result).toEqual([
      { type: "email", field: "mainTask", maskedValue: "de***@example.com" },
      { type: "phone", field: "mainTask", maskedValue: "010-****-5678" },
    ]);
    expect(JSON.stringify(result)).not.toContain("dev.person@example.com");
    expect(JSON.stringify(result)).not.toContain("010-1234-5678");
  });

  test("문맥이 있는 계좌번호 후보를 제한적으로 탐지한다", () => {
    const result = detectPrivacyCandidates(
      "detailScope",
      "정산 계좌번호 123-456-789012를 설명에서 제거해 주세요.",
    );

    expect(result).toContainEqual({
      type: "account",
      field: "detailScope",
      maskedValue: "****-****-9012",
    });
  });

  test("날짜, 금액, 버전과 오류 코드는 계좌번호로 탐지하지 않는다", () => {
    const result = detectPrivacyCandidates(
      "detailScope",
      "2026-09-01 배포, 예산 50,000,000원, Node 24.1.0, 오류 코드 500을 처리합니다.",
    );

    expect(result).toEqual([]);
  });

  test("주민등록번호 후보를 탐지하고 원문 없이 전부 마스킹한다", () => {
    const result = detectPrivacyCandidates(
      "detailScope",
      "본인 확인용 주민번호 900101-1234567 첨부 바랍니다.",
    );

    expect(result).toContainEqual({
      type: "rrn",
      field: "detailScope",
      maskedValue: "******-*******",
    });
    expect(JSON.stringify(result)).not.toContain("900101");
    expect(JSON.stringify(result)).not.toContain("1234567");
  });

  test("생년월일이 유효하지 않은 13자리 숫자는 주민등록번호로 오분류하지 않는다", () => {
    // 3521234567890 → 앞 6자리 352123(월 52)이 날짜가 아니므로 주민번호 아님
    const result = detectPrivacyCandidates(
      "mainTask",
      "정산 번호 3521234567890 송금 바랍니다.",
    );

    expect(result.some((candidate) => candidate.type === "rrn")).toBe(false);
  });
});
