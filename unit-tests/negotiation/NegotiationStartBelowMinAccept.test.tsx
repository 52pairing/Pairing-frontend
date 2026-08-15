import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { NegotiationChatFlow } from "@/features/negotiation/components/NegotiationChatFlow";
import { EMPTY_WORK_CONDITION_LABELS } from "@/features/negotiation/utils/conditionFormat";
import type {
  NegotiationCondition,
  NegotiationDetail,
} from "@/features/negotiation/types/negotiation";

// 처음 마지노선 입력(start) 화면이 뜨는 최소 조합: IN_PROGRESS · totalRound 0 · myFloor 없음.
const amountCondition: NegotiationCondition = {
  conditionId: 1,
  type: "AMOUNT",
  clientValue: "4000000",
  freelancerValue: null,
  proposedValue: null,
  reason: null,
  agreedValue: null,
  status: "PENDING",
  roundCount: 0,
  myFloor: null,
  floorComparison: "RANGE",
  compromiseValue: null,
};

const setupDetail: NegotiationDetail = {
  negotiationId: 34,
  projectId: 1,
  projectTitle: "테스트 프로젝트",
  positionId: 1,
  counterpartName: "클라이언트",
  viewerRole: "FREELANCER",
  waitingForMe: false,
  status: "IN_PROGRESS",
  totalRound: 0,
  maxRound: 15,
  agreedAmount: null,
  chatRoomId: null,
  aiOutAt: null,
  finalApprovalRequired: false,
  conditions: [amountCondition],
  endReason: null,
};

const baseProps = {
  detail: setupDetail,
  messages: [],
  labels: EMPTY_WORK_CONDITION_LABELS,
  onSubmitAnswers: jest.fn().mockResolvedValue({ floorViolation: false }),
  onUpdateFloor: jest.fn().mockResolvedValue({ ok: true }),
  onRetryAgent: jest.fn(),
  onAcceptFinalOffer: jest.fn(),
  onGiveUp: jest.fn(),
  isSubmitting: false,
};

describe("처음 마지노선 등록 최소가 하한 (NG_012 → 경고 후 허용)", () => {
  test("NG_012 응답이면 확인 모달을 띄우고 [그래도 시작] 시 AMOUNT만 belowMinAccept=true로 재제출한다", async () => {
    const user = userEvent.setup();
    const onStart = jest
      .fn()
      .mockResolvedValueOnce({ belowMinAccept: true })
      .mockResolvedValueOnce({ belowMinAccept: false });

    render(<NegotiationChatFlow {...baseProps} onStart={onStart} />);

    await user.type(screen.getByPlaceholderText("예: 480"), "420");
    await user.click(screen.getByRole("button", { name: "협상 시작" }));

    // 1차: 플래그 없이 제출
    expect(onStart).toHaveBeenNthCalledWith(1, [
      { conditionType: "AMOUNT", value: "4200000" },
    ]);

    // 확인 모달의 [그래도 시작]
    const confirmButton = await screen.findByRole("button", { name: "그래도 시작" });
    await user.click(confirmButton);

    // 2차: AMOUNT에만 belowMinAccept=true 로 재제출
    expect(onStart).toHaveBeenNthCalledWith(2, [
      { conditionType: "AMOUNT", value: "4200000", belowMinAccept: true },
    ]);
  });

  test("[취소]하면 재제출하지 않고 입력값을 유지한다", async () => {
    const user = userEvent.setup();
    const onStart = jest.fn().mockResolvedValue({ belowMinAccept: true });

    render(<NegotiationChatFlow {...baseProps} onStart={onStart} />);

    await user.type(screen.getByPlaceholderText("예: 480"), "420");
    await user.click(screen.getByRole("button", { name: "협상 시작" }));

    const cancelButton = await screen.findByRole("button", { name: "취소" });
    await user.click(cancelButton);

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(screen.getByPlaceholderText("예: 480")).toHaveValue(420);
  });
});
