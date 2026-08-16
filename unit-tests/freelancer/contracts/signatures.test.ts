import { areBothPartiesSigned } from "@/features/contract/utils/signatures";

import { contractDetail } from "./fixtures";

describe("areBothPartiesSigned", () => {
  it("한쪽만 서명한 경우 false를 반환한다", () => {
    expect(areBothPartiesSigned(contractDetail.signatures)).toBe(false);
  });

  it("클라이언트와 프리랜서가 모두 서명한 경우 true를 반환한다", () => {
    const signatures = contractDetail.signatures.map((signature) => ({
      ...signature,
      status: "SIGNED" as const,
    }));

    expect(areBothPartiesSigned(signatures)).toBe(true);
  });
});
