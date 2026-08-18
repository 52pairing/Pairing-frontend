import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ProjectRejectModals } from "@/features/freelancer/myprojects/components/ProjectRejectModals";

afterEach(() => jest.clearAllMocks());

it("사유와 함께 확인하면 onConfirm을 호출하고 완료 모달을 보여준다", async () => {
  const onConfirm = jest.fn().mockResolvedValue(undefined);
  const onClose = jest.fn();
  const user = userEvent.setup();

  render(
    <ProjectRejectModals
      open
      projectTitle="B2B 주문 관리 서비스"
      onClose={onClose}
      onConfirm={onConfirm}
    />,
  );

  await user.type(
    screen.getByLabelText("거절 사유 (선택)"),
    "일정이 맞지 않습니다.",
  );
  await user.click(screen.getByRole("button", { name: "거절" }));

  expect(onConfirm).toHaveBeenCalledWith("일정이 맞지 않습니다.");
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(
    await screen.findByText("거절이 완료되었습니다."),
  ).toBeInTheDocument();
});

it("확인 처리가 실패하면 완료 모달을 띄우지 않고 제출 상태를 되돌린다", async () => {
  const onConfirm = jest.fn().mockRejectedValue(new Error("네트워크 오류"));
  const user = userEvent.setup();

  render(
    <ProjectRejectModals
      open
      projectTitle="B2B 주문 관리 서비스"
      onClose={jest.fn()}
      onConfirm={onConfirm}
    />,
  );

  await user.click(screen.getByRole("button", { name: "거절" }));

  expect(await screen.findByRole("button", { name: "거절" })).toBeEnabled();
  expect(screen.queryByText("거절이 완료되었습니다.")).not.toBeInTheDocument();
});
