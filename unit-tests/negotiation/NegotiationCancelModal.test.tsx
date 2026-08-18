import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { NegotiationCancelModal } from "@/features/negotiation/components/NegotiationCancelModal";

afterEach(() => jest.clearAllMocks());

it("클라이언트에게는 재추천 제외·유료 리롤 안내를 보여준다", () => {
  render(
    <NegotiationCancelModal viewerRole="CLIENT" onClose={jest.fn()} onConfirm={jest.fn()} />,
  );

  expect(
    screen.getByText("• 이 프리랜서는 동일 프로젝트의 재추천 대상에서 제외됩니다."),
  ).toBeInTheDocument();
  expect(screen.queryByText("• 포기하면 되돌릴 수 없습니다.")).not.toBeInTheDocument();
});

it("프리랜서에게는 되돌릴 수 없다는 안내를 보여주고, 확인 시 onConfirm을 호출한다", async () => {
  const onConfirm = jest.fn();
  const user = userEvent.setup();

  render(
    <NegotiationCancelModal viewerRole="FREELANCER" onClose={jest.fn()} onConfirm={onConfirm} />,
  );

  expect(screen.getByText("• 포기하면 되돌릴 수 없습니다.")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "협상 포기" }));

  expect(onConfirm).toHaveBeenCalledTimes(1);
});

it("취소를 누르면 onClose를 호출한다", async () => {
  const onClose = jest.fn();
  const user = userEvent.setup();

  render(
    <NegotiationCancelModal viewerRole="CLIENT" onClose={onClose} onConfirm={jest.fn()} />,
  );

  await user.click(screen.getByRole("button", { name: "취소" }));

  expect(onClose).toHaveBeenCalledTimes(1);
});
