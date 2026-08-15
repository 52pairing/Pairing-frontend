import {
  isValidAccountNo,
  isValidCardNumber,
} from "@/features/auth/components/CardAccountFields";

describe("카드·계좌번호 자릿수 검증", () => {
  it.each([
    "1234-5678-1234-5678",
    "1234 5678 1234 5678",
    "1234567812345678",
  ])("16자리 카드번호 형식 %s를 허용한다", (value) => {
    expect(isValidCardNumber(value)).toBe(true);
  });

  it.each(["123456789012345", "12345678901234567"])(
    "15자리와 17자리 카드번호 %s를 거부한다",
    (value) => {
      expect(isValidCardNumber(value)).toBe(false);
    },
  );

  it.each(["123-456-7890", "12345678901234"])(
    "10~14자리 계좌번호 %s를 허용한다",
    (value) => {
      expect(isValidAccountNo(value)).toBe(true);
    },
  );

  it.each(["123456789", "123456789012345"])(
    "9자리와 15자리 계좌번호 %s를 거부한다",
    (value) => {
      expect(isValidAccountNo(value)).toBe(false);
    },
  );
});
