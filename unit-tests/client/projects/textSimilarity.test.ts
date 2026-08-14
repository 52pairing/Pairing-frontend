import {
  calculateTextOverlap,
  isLikelyRepeatedText,
} from "@/features/client/projects/utils/textSimilarity";

describe("project content text similarity", () => {
  test("공백과 문장부호만 다른 동일 문장을 반복으로 판단한다", () => {
    expect(
      isLikelyRepeatedText(
        "주문 API를 개발합니다.",
        "주문 API를  개발합니다!",
      ),
    ).toBe(true);
  });

  test("거의 복사한 문장은 높은 중복률을 반환한다", () => {
    expect(
      calculateTextOverlap(
        "관리자 회원 목록 화면을 구현합니다",
        "관리자 회원 목록 화면을 구현합니다.",
      ),
    ).toBe(1);
  });

  test("새로운 범위 정보가 충분히 추가된 상세 설명은 반복으로 보지 않는다", () => {
    expect(
      isLikelyRepeatedText(
        "주문과 결제 API를 개발합니다.",
        "주문 생성·취소·환불 API와 단위 테스트를 담당하며 결제사 연동과 배포는 내부 팀이 담당합니다.",
      ),
    ).toBe(false);
  });

  test("짧고 애매한 입력은 반복 경고를 만들지 않는다", () => {
    expect(isLikelyRepeatedText("개발", "개발!")) .toBe(false);
  });
});
