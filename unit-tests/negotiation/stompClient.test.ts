import { reportStompError } from "@/features/negotiation/stomp/client";

describe("reportStompError", () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it.each(["Session closed.", " session closed "])(
    "정상 세션 종료 메시지 '%s'는 오류로 출력하지 않는다",
    (message) => {
      reportStompError(message);
      expect(errorSpy).not.toHaveBeenCalled();
    },
  );

  it("실제 브로커 오류는 원래대로 출력한다", () => {
    reportStompError("Access denied");
    expect(errorSpy).toHaveBeenCalledWith("[STOMP] broker error", "Access denied");
  });

  it("메시지가 없는 오류도 진단 가능한 기본 문구를 출력한다", () => {
    reportStompError();
    expect(errorSpy).toHaveBeenCalledWith("[STOMP] broker error", "Unknown broker error");
  });
});
