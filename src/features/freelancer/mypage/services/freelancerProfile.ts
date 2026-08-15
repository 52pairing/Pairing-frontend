import { apiCall } from "@/lib/api";
import type { FreelancerMyPageResponse, FreelancerProfileUpdateRequest } from "@/features/freelancer/mypage/types/profile";

export const getFreelancerProfile = () =>
  apiCall<FreelancerMyPageResponse>("/api/v1/freelancers/me").then((profile) => ({
    ...profile,
    phone: profile.phone ?? null,
    birthDate: profile.birthDate ?? null,
    address: profile.address ?? null,
    addressParts: profile.addressParts ?? null,
    profileImageUrl: profile.profileImageUrl ?? null,
    ratingAverage: profile.ratingAverage ?? null,
    reviewCount: profile.reviewCount ?? 0,
  }));

export const updateFreelancerProfile = (payload: FreelancerProfileUpdateRequest) =>
  apiCall<FreelancerMyPageResponse>("/api/v1/freelancers/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  }).then((profile) => ({
    ...profile,
    address: profile.address ?? null,
    addressParts: profile.addressParts ?? null,
  }));
