import { apiCall } from "@/lib/api";
import type { ClientMyPageResponse, ClientProfileUpdateRequest } from "@/features/client/mypage/types/profile";

export const getClientProfile = () =>
  apiCall<ClientMyPageResponse>("/api/v1/clients/me").then((profile) => ({
    ...profile,
    logoUrl: profile.logoUrl ?? null,
    phone: profile.phone ?? null,
    address: profile.address ?? null,
    addressParts: profile.addressParts ?? null,
    ratingAverage: profile.ratingAverage ?? null,
    reviewCount: profile.reviewCount ?? 0,
  }));

export const updateClientProfile = (payload: ClientProfileUpdateRequest) =>
  apiCall<ClientMyPageResponse>("/api/v1/clients/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  }).then((profile) => ({
    ...profile,
    address: profile.address ?? null,
    addressParts: profile.addressParts ?? null,
  }));

export const uploadCompanyLogo = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiCall<{ fileId: number }>("/api/v1/files?purpose=COMPANY_LOGO", {
    method: "POST",
    body: formData,
  });
};

export const deleteCompanyLogoFile = (fileId: number) =>
  apiCall<null>(`/api/v1/files/${fileId}`, { method: "DELETE" });
