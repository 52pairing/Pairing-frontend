import { act, renderHook, waitFor } from "@testing-library/react";

import { getChatUnreadCount } from "@/features/chat/services/chatRooms";
import { useUnreadChatCount } from "@/features/chat/hooks/useUnreadChatCount";

jest.mock("@/features/chat/services/chatRooms", () => ({
  getChatUnreadCount: jest.fn(),
}));

const mockGetChatUnreadCount = jest.mocked(getChatUnreadCount);

describe("useUnreadChatCount", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test("accountId가 있으면 진입 시 안읽은 총합을 조회한다", async () => {
    mockGetChatUnreadCount.mockResolvedValue({ unreadCount: 3 });

    const { result } = renderHook(() => useUnreadChatCount(7));

    await waitFor(() => expect(result.current).toBe(3));
    expect(mockGetChatUnreadCount).toHaveBeenCalledTimes(1);
  });

  test("accountId가 없으면 조회하지 않고 0을 유지한다", () => {
    const { result } = renderHook(() => useUnreadChatCount(undefined));

    expect(result.current).toBe(0);
    expect(mockGetChatUnreadCount).not.toHaveBeenCalled();
  });

  test("폴링 주기마다 안읽은 총합을 재조회한다", async () => {
    jest.useFakeTimers();
    mockGetChatUnreadCount.mockResolvedValue({ unreadCount: 1 });

    renderHook(() => useUnreadChatCount(7));
    expect(mockGetChatUnreadCount).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(20_000);
    });
    expect(mockGetChatUnreadCount).toHaveBeenCalledTimes(2);
  });

  test("조회 실패 시 직전 값을 유지한다", async () => {
    mockGetChatUnreadCount.mockResolvedValueOnce({ unreadCount: 5 });
    const { result } = renderHook(() => useUnreadChatCount(7));
    await waitFor(() => expect(result.current).toBe(5));

    mockGetChatUnreadCount.mockRejectedValueOnce(new Error("network"));
    act(() => {
      window.dispatchEvent(new Event("focus"));
    });

    await waitFor(() => expect(mockGetChatUnreadCount).toHaveBeenCalledTimes(2));
    expect(result.current).toBe(5);
  });
});
