import { apiCall } from "@/lib/api";
import {
  createMatchingRequests,
  getCandidateProfile,
  getMatchingSettings,
  getReceivedMatchingRequests,
  getRecommendedCandidates,
  getSentMatchingRequests,
  rejectRecommendedCandidate,
  requestRerecommendation,
  updateMatchingSettings,
} from "@/features/matching/services/matching";

jest.mock("@/lib/api", () => ({ apiCall: jest.fn() }));

const mockedApiCall = jest.mocked(apiCall);

afterEach(() => jest.clearAllMocks());

it("getRecommendedCandidates는 포지션의 추천 후보를 조회한다", async () => {
  mockedApiCall.mockResolvedValue({});
  await getRecommendedCandidates(7);
  expect(mockedApiCall).toHaveBeenCalledWith("/api/v1/matchings/positions/7/candidates");
});

it("rejectRecommendedCandidate는 후보를 거절 처리한다", async () => {
  mockedApiCall.mockResolvedValue({});
  await rejectRecommendedCandidate(3);
  expect(mockedApiCall).toHaveBeenCalledWith(
    "/api/v1/matchings/candidates/3/rejection",
    { method: "POST" },
  );
});

it("getCandidateProfile은 후보 상세 프로필을 조회한다", async () => {
  mockedApiCall.mockResolvedValue({});
  await getCandidateProfile(3);
  expect(mockedApiCall).toHaveBeenCalledWith("/api/v1/matchings/candidates/3/profile");
});

it("createMatchingRequests는 선택한 후보로 매칭 요청을 생성한다", async () => {
  mockedApiCall.mockResolvedValue([]);
  await createMatchingRequests({ positionId: 7, candidateIds: [1, 2] });
  expect(mockedApiCall).toHaveBeenCalledWith("/api/v1/matchings/requests", {
    method: "POST",
    body: JSON.stringify({ positionId: 7, candidateIds: [1, 2] }),
  });
});

it("requestRerecommendation은 포지션에 재추천을 요청한다", async () => {
  mockedApiCall.mockResolvedValue(null);
  await requestRerecommendation(7, { type: "PAID", quantity: 2 });
  expect(mockedApiCall).toHaveBeenCalledWith(
    "/api/v1/matchings/positions/7/rerecommendations",
    { method: "POST", body: JSON.stringify({ type: "PAID", quantity: 2 }) },
  );
});

it("getSentMatchingRequests는 기본 page·size를 채워 조회한다", async () => {
  mockedApiCall.mockResolvedValue({});
  await getSentMatchingRequests({ positionId: 7 });
  expect(mockedApiCall).toHaveBeenCalledWith(
    "/api/v1/matchings/requests?positionId=7&page=0&size=10",
  );
});

it("getReceivedMatchingRequests는 기본 tab을 ALL로 채워 조회한다", async () => {
  mockedApiCall.mockResolvedValue({});
  await getReceivedMatchingRequests();
  expect(mockedApiCall).toHaveBeenCalledWith(
    "/api/v1/matchings/requests/received?tab=ALL&page=0&size=10",
  );
});

it("getMatchingSettings/updateMatchingSettings는 내 매칭 설정을 조회·수정한다", async () => {
  mockedApiCall.mockResolvedValue({});
  await getMatchingSettings();
  expect(mockedApiCall).toHaveBeenCalledWith("/api/v1/freelancers/me/matching-settings");

  await updateMatchingSettings({ aiMatchingAgreed: false, matchingPaused: true });
  expect(mockedApiCall).toHaveBeenCalledWith(
    "/api/v1/freelancers/me/matching-settings",
    {
      method: "PUT",
      body: JSON.stringify({ aiMatchingAgreed: false, matchingPaused: true }),
    },
  );
});
