import { apiCall } from "@/lib/api";
import type {
  LoginRequest,
  LoginResponseData,
} from "@/features/auth/types";

export const login = (payload: LoginRequest) =>
  apiCall<LoginResponseData>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
