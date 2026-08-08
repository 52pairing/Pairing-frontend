import { apiCall } from "@/lib/api";
import { FindEmailRequest, FindEmailResponseData } from "../types";

export const findEmail = (payload: FindEmailRequest) =>
  apiCall<FindEmailResponseData>("/api/v1/auth/find-email", {
    method: "POST",
    body: JSON.stringify(payload),
  });