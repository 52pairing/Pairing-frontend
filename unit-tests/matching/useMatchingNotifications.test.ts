import { renderHook } from "@testing-library/react";
import type { IMessage } from "@stomp/stompjs";

import { useMatchingNotifications } from "@/features/matching/stomp/useMatchingNotifications";
import { subscribeTopic } from "@/features/negotiation/stomp/client";

jest.mock("@/features/negotiation/stomp/client", () => ({ subscribeTopic: jest.fn() }));

const mockedSubscribe = jest.mocked(subscribeTopic);

afterEach(() => jest.clearAllMocks());

it("accountId가 있으면 해당 사용자 알림 토픽을 구독하고, 언마운트 시 구독을 해제한다", () => {
  const unsubscribe = jest.fn();
  mockedSubscribe.mockReturnValue(unsubscribe);

  const { unmount } = renderHook(() => useMatchingNotifications(7, jest.fn()));

  expect(mockedSubscribe).toHaveBeenCalledWith(
    "/topic/users/7/notifications",
    expect.any(Function),
  );

  unmount();
  expect(unsubscribe).toHaveBeenCalledTimes(1);
});

it("accountId가 없으면 구독하지 않는다", () => {
  renderHook(() => useMatchingNotifications(undefined, jest.fn()));

  expect(mockedSubscribe).not.toHaveBeenCalled();
});

it("수신 메시지를 파싱해 콜백에 전달하고, 파싱에 실패하면 무시한다", () => {
  const onNotification = jest.fn();
  mockedSubscribe.mockReturnValue(jest.fn());
  renderHook(() => useMatchingNotifications(7, onNotification));
  const handler = mockedSubscribe.mock.calls[0][1];

  handler({ body: JSON.stringify({ type: "MATCHING_RECOMMENDED", linkUrl: "/x" }) } as IMessage);
  expect(onNotification).toHaveBeenCalledWith({ type: "MATCHING_RECOMMENDED", linkUrl: "/x" });

  expect(() => handler({ body: "not-json" } as IMessage)).not.toThrow();
  expect(onNotification).toHaveBeenCalledTimes(1);
});
