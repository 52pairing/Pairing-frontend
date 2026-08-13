import { act, renderHook } from "@testing-library/react";

import { useChatMessages } from "@/features/chat/stomp/useChatMessages";
import { subscribeTopic } from "@/features/negotiation/stomp/client";
import { broadcastMessage } from "./fixtures";

jest.mock("@/features/negotiation/stomp/client", () => ({
  subscribeTopic: jest.fn(),
}));

const mockSubscribeTopic = jest.mocked(subscribeTopic);

describe("useChatMessages", () => {
  test("채팅방 토픽을 구독하고 언마운트 시 구독을 해제한다", () => {
    const unsubscribe = jest.fn();
    const onMessage = jest.fn();
    mockSubscribeTopic.mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useChatMessages(11, onMessage));
    const subscriber = mockSubscribeTopic.mock.calls[0][1];

    act(() => subscriber({ body: JSON.stringify(broadcastMessage) } as Parameters<typeof subscriber>[0]));
    expect(mockSubscribeTopic).toHaveBeenCalledWith("/topic/chat-rooms/11", expect.any(Function));
    expect(onMessage).toHaveBeenCalledWith(broadcastMessage);

    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  test("채팅방이 없으면 구독하지 않고 잘못된 broadcast는 무시한다", () => {
    const onMessage = jest.fn();
    const { rerender } = renderHook(({ roomId }) => useChatMessages(roomId, onMessage), {
      initialProps: { roomId: null as number | null },
    });
    expect(mockSubscribeTopic).not.toHaveBeenCalled();

    rerender({ roomId: 11 });
    const subscriber = mockSubscribeTopic.mock.calls[0][1];
    expect(() => subscriber({ body: "not-json" } as Parameters<typeof subscriber>[0])).not.toThrow();
    expect(onMessage).not.toHaveBeenCalled();
  });

  test("재렌더링 후 최신 메시지 핸들러를 사용한다", () => {
    const firstHandler = jest.fn();
    const nextHandler = jest.fn();
    const { rerender } = renderHook(({ handler }) => useChatMessages(11, handler), {
      initialProps: { handler: firstHandler },
    });
    const subscriber = mockSubscribeTopic.mock.calls[0][1];

    rerender({ handler: nextHandler });
    act(() => subscriber({ body: JSON.stringify(broadcastMessage) } as Parameters<typeof subscriber>[0]));

    expect(firstHandler).not.toHaveBeenCalled();
    expect(nextHandler).toHaveBeenCalledWith(broadcastMessage);
    expect(mockSubscribeTopic).toHaveBeenCalledTimes(1);
  });
});
