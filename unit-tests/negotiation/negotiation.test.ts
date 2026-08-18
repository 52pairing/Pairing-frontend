import { apiCall } from "@/lib/api";
import {
  acceptFinalOffer,
  getMyNegotiations,
  getNegotiation,
  getNegotiationMessages,
  giveUpNegotiation,
  markNegotiationRead,
  startNegotiation,
  submitAnswers,
  updateFloors,
} from "@/features/negotiation/services/negotiation";

jest.mock("@/lib/api", () => ({ apiCall: jest.fn() }));

const mockedApiCall = jest.mocked(apiCall);

afterEach(() => jest.clearAllMocks());

it("getNegotiation/getNegotiationMessages는 협상 상세와 메시지를 조회한다", async () => {
  mockedApiCall.mockResolvedValue({});
  await getNegotiation(1);
  expect(mockedApiCall).toHaveBeenCalledWith("/api/v1/negotiations/1");

  await getNegotiationMessages(1);
  expect(mockedApiCall).toHaveBeenCalledWith("/api/v1/negotiations/1/messages");
});

it("startNegotiation은 조건과 함께 협상 시작을 요청한다", async () => {
  mockedApiCall.mockResolvedValue({});
  const body = { conditions: [{ conditionType: "AMOUNT" as const, value: "5000000" }] };

  await startNegotiation(1, body);

  expect(mockedApiCall).toHaveBeenCalledWith("/api/v1/negotiations/1/start", {
    method: "POST",
    body: JSON.stringify(body),
  });
});

it("submitAnswers는 라운드 응답을 제출한다", async () => {
  mockedApiCall.mockResolvedValue({});
  const body = { roundNo: 1, answers: [{ conditionId: 1, accepted: true }] };

  await submitAnswers(1, body);

  expect(mockedApiCall).toHaveBeenCalledWith("/api/v1/negotiations/1/answers", {
    method: "POST",
    body: JSON.stringify(body),
  });
});

it("updateFloors는 PATCH로 마지노선을 수정한다", async () => {
  mockedApiCall.mockResolvedValue({});
  const body = { conditions: [{ conditionType: "AMOUNT" as const, value: "5000000" }] };

  await updateFloors(1, body);

  expect(mockedApiCall).toHaveBeenCalledWith("/api/v1/negotiations/1/floors", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
});

it("giveUpNegotiation/acceptFinalOffer/markNegotiationRead는 각 액션 엔드포인트를 호출한다", async () => {
  mockedApiCall.mockResolvedValue({});
  await giveUpNegotiation(1, { reason: "일정 불일치" });
  expect(mockedApiCall).toHaveBeenCalledWith("/api/v1/negotiations/1/give-up", {
    method: "POST",
    body: JSON.stringify({ reason: "일정 불일치" }),
  });

  await acceptFinalOffer(1);
  expect(mockedApiCall).toHaveBeenCalledWith(
    "/api/v1/negotiations/1/final-offer/accept",
    { method: "POST" },
  );

  await markNegotiationRead(1);
  expect(mockedApiCall).toHaveBeenCalledWith("/api/v1/negotiations/1/read", {
    method: "POST",
  });
});

describe("getMyNegotiations", () => {
  it("배열 응답이면 그대로 반환한다", async () => {
    mockedApiCall.mockResolvedValue([{ negotiationId: 1 }]);

    const result = await getMyNegotiations(7);

    expect(mockedApiCall).toHaveBeenCalledWith("/api/v1/negotiations/mine?projectId=7");
    expect(result).toEqual([{ negotiationId: 1 }]);
  });

  it("페이지 객체 응답이면 content를 반환한다", async () => {
    mockedApiCall.mockResolvedValue({ content: [{ negotiationId: 2 }] });

    const result = await getMyNegotiations(7);

    expect(result).toEqual([{ negotiationId: 2 }]);
  });

  it("content가 없는 페이지 객체면 빈 배열을 반환한다", async () => {
    mockedApiCall.mockResolvedValue({});

    const result = await getMyNegotiations(7);

    expect(result).toEqual([]);
  });
});
