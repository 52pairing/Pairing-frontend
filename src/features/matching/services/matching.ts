import { apiCall } from "@/lib/api";
import type {
  CandidateListResponse,
  MatchingRequestCreateRequest,
  MatchingRequestResponse,
  MatchingSettingsRequest,
  MatchingSettingsResponse,
  PageResponse,
  ReceivedMatchingRequestParams,
  RerecommendRequest,
  SentMatchingRequestParams,
} from "@/features/matching/types/matching";

const MATCHING_BASE = "/api/v1/matchings";

export const getRecommendedCandidates = (positionId: number) =>
  apiCall<CandidateListResponse>(
    `${MATCHING_BASE}/positions/${positionId}/candidates`,
  );

export const rejectRecommendedCandidate = (candidateId: number) =>
  apiCall<CandidateListResponse>(
    `${MATCHING_BASE}/candidates/${candidateId}/rejection`,
    { method: "POST" },
  );

export const createMatchingRequests = (
  request: MatchingRequestCreateRequest,
) =>
  apiCall<MatchingRequestResponse[]>(`${MATCHING_BASE}/requests`, {
    method: "POST",
    body: JSON.stringify(request),
  });

const toQuery = (params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => { if (value !== undefined) query.set(key, String(value)); });
  return query.toString();
};

export const requestRerecommendation = (positionId: number, request: RerecommendRequest) =>
  apiCall<null>(`${MATCHING_BASE}/positions/${positionId}/rerecommendations`, { method: "POST", body: JSON.stringify(request) });

export const getSentMatchingRequests = (params: SentMatchingRequestParams = {}) =>
  apiCall<PageResponse<MatchingRequestResponse>>(`${MATCHING_BASE}/requests?${toQuery({ ...params, page: params.page ?? 0, size: params.size ?? 10 })}`);

export const getReceivedMatchingRequests = (params: ReceivedMatchingRequestParams = {}) =>
  apiCall<PageResponse<MatchingRequestResponse>>(`${MATCHING_BASE}/requests/received?${toQuery({ tab: params.tab ?? "ALL", page: params.page ?? 0, size: params.size ?? 10 })}`);

export const getMatchingRequestDetail = (requestId: number) => apiCall<MatchingRequestResponse>(`${MATCHING_BASE}/requests/${requestId}`);
export const acceptMatchingRequest = (requestId: number) => apiCall<MatchingRequestResponse>(`${MATCHING_BASE}/requests/${requestId}/acceptance`, { method: "POST" });
export const rejectMatchingRequest = (requestId: number, reason?: string) => apiCall<MatchingRequestResponse>(`${MATCHING_BASE}/requests/${requestId}/rejection`, { method: "POST", body: JSON.stringify(reason?.trim() ? { reason: reason.trim() } : {}) });
export const getMatchingSettings = () => apiCall<MatchingSettingsResponse>("/api/v1/freelancers/me/matching-settings");
export const updateMatchingSettings = (request: MatchingSettingsRequest) => apiCall<MatchingSettingsResponse>("/api/v1/freelancers/me/matching-settings", { method: "PUT", body: JSON.stringify(request) });
