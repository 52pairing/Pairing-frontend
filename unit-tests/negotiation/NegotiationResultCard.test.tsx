import { render, screen } from "@testing-library/react";

import { NegotiationResultCard } from "@/features/negotiation/components/NegotiationResultCard";

it("타결(complete)이면 합의 안내와 summary를 보여준다", () => {
  render(<NegotiationResultCard result="complete" summary="월 500만 원에 합의했습니다." />);

  expect(screen.getByText("모든 조건에 합의했습니다")).toBeInTheDocument();
  expect(screen.getByText("월 500만 원에 합의했습니다.")).toBeInTheDocument();
});

it("결렬(failed)이고 summary가 없으면 기본 안내 문구를 보여준다", () => {
  render(<NegotiationResultCard result="failed" />);

  expect(screen.getByText("협상이 성립되지 않았어요")).toBeInTheDocument();
  expect(
    screen.getByText("15회 소진 또는 협상 포기로 종료되었습니다."),
  ).toBeInTheDocument();
});

it("결렬 사유는 HTML로 해석하지 않고 텍스트로만 표시한다", () => {
  render(
    <NegotiationResultCard
      result="failed"
      summary="<script>alert('x')</script> 사유"
    />,
  );

  expect(
    screen.getByText("<script>alert('x')</script> 사유"),
  ).toBeInTheDocument();
  expect(document.querySelector("script")).not.toBeInTheDocument();
});

it("actionSlot이 있으면 함께 표시한다", () => {
  render(
    <NegotiationResultCard result="complete" actionSlot={<button>채팅으로 이어가기</button>} />,
  );

  expect(screen.getByRole("button", { name: "채팅으로 이어가기" })).toBeInTheDocument();
});
